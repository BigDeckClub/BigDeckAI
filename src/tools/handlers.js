/**
 * Tool Handlers
 * Implementation of tool functions that work with the schemas
 */

import { store } from '../data/store.js';
import { scryfall } from '../integrations/scryfall.js';

/**
 * Add card to inventory
 */
export async function addCardToInventory({ cardName, quantity = 1, folder = 'Unsorted' }) {
  // Lookup card from Scryfall
  let cardData;
  try {
    cardData = await scryfall.getCard(cardName);
  } catch (e) {
    // Try search if exact match fails
    try {
      const results = await scryfall.searchCards(cardName);
      cardData = results?.data?.[0];
    } catch (e2) {
      // Ignore search errors
    }
  }
  
  if (!cardData) {
    return { success: false, message: `Card "${cardName}" not found on Scryfall` };
  }

  return store.addCard('default', {
    name: cardData.name,
    quantity,
    folder,
    manaCost: cardData.mana_cost,
    type: cardData.type_line,
    colors: cardData.colors || [],
    colorIdentity: cardData.color_identity || [],
    price: cardData.prices?.usd,
    scryfallId: cardData.id
  });
}

/**
 * Remove card from inventory
 */
export async function removeCardFromInventory({ cardName, quantity = 1 }) {
  return store.removeCard('default', cardName, quantity);
}

/**
 * Move card to folder
 */
export async function moveCard({ cardName, targetFolder, quantity = null }) {
  return store.moveCard('default', cardName, targetFolder, quantity);
}

/**
 * Search inventory
 */
export async function searchInventory({ query }) {
  if (query.toLowerCase() === 'all' || query === '') {
    const cards = store.getInventory('default');
    if (!cards.length) return { message: 'Inventory is empty' };
    return {
      count: cards.length,
      totalCards: cards.reduce((sum, c) => sum + (c.quantity || 1), 0),
      cards: cards.map(c => ({
        name: c.name,
        quantity: c.quantity,
        type: c.type,
        folder: c.folder
      }))
    };
  }

  const results = store.searchInventory('default', query);
  if (!results.length) return { message: `No cards matching "${query}"` };
  return { count: results.length, cards: results };
}

/**
 * Create deck
 */
export async function createDeck({ name, commander = null, format = 'commander' }) {
  return store.createDeck('default', { name, commander, format });
}

/**
 * Add card to deck
 */
export async function addCardToDeck({ deckName, cardName, quantity = 1 }) {
  // Lookup card from Scryfall
  let cardData;
  try {
    cardData = await scryfall.getCard(cardName);
  } catch (e) {
    try {
      const results = await scryfall.searchCards(cardName);
      cardData = results?.data?.[0];
    } catch (e2) {
      // Ignore
    }
  }
  
  if (!cardData) {
    return { success: false, message: `Card "${cardName}" not found on Scryfall` };
  }

  // Get deck to check format and existing cards
  const decks = store.getDecks('default');
  const deck = decks.find(d => d.name.toLowerCase() === deckName.toLowerCase());
  
  if (deck && deck.format === 'commander') {
    // CHECK FOR DUPLICATES (Commander singleton rule)
    const cardNameLower = cardData.name.toLowerCase();
    const existingCard = deck.cards?.find(c => 
      (typeof c === 'string' ? c : c.name || '').toLowerCase() === cardNameLower
    );
    
    // Allow basic lands, reject other duplicates
    const basicLands = ['plains', 'island', 'swamp', 'mountain', 'forest', 'wastes'];
    if (existingCard && !basicLands.includes(cardNameLower)) {
      return { 
        success: false, 
        message: `Cannot add ${cardData.name} - already in deck (Commander is singleton format)` 
      };
    }
    
    // Only add 1 copy for Commander (except basic lands)
    quantity = basicLands.includes(cardNameLower) ? quantity : 1;
  }

  return store.addCardToDeck('default', deckName, {
    name: cardData.name,
    quantity,
    manaCost: cardData.mana_cost,
    type: cardData.type_line
  });
}

/**
 * Remove card from deck
 */
export async function removeCardFromDeck({ deckName, cardName, quantity = 1 }) {
  return store.removeCardFromDeck('default', deckName, cardName, quantity);
}

/**
 * Get decks
 */
export async function getDecks({ deckName = 'all' }) {
  if (!deckName || deckName.toLowerCase() === 'all') {
    const decks = store.getDecks('default');
    if (!decks.length) return { message: 'No decks found' };
    return {
      count: decks.length,
      decks: decks.map(d => ({
        name: d.name,
        commander: d.commander,
        format: d.format,
        cardCount: d.cards?.length || 0
      }))
    };
  }

  const deck = store.getDeck('default', deckName);
  if (!deck) return { success: false, message: `Deck "${deckName}" not found` };
  return deck;
}

/**
 * Delete deck
 */
export async function deleteDeck({ deckName }) {
  return store.deleteDeck('default', deckName);
}

/**
 * Record sale
 */
export async function recordSale({ cardName, price, quantity = 1 }) {
  return store.recordSale('default', { cardName, price, quantity });
}

/**
 * Get sales history
 */
export async function getSales() {
  const sales = store.getSales('default');
  if (!sales.length) return { message: 'No sales recorded' };
  
  const totalRevenue = sales.reduce((sum, s) => sum + s.price, 0);
  return {
    count: sales.length,
    totalRevenue: totalRevenue.toFixed(2),
    sales: sales.map(s => ({
      cardName: s.cardName,
      quantity: s.quantity,
      price: s.price,
      soldAt: s.soldAt
    }))
  };
}

/**
 * Handler map for easy lookup
 */
export const toolHandlers = {
  add_card_to_inventory: addCardToInventory,
  remove_card_from_inventory: removeCardFromInventory,
  move_card: moveCard,
  search_inventory: searchInventory,
  create_deck: createDeck,
  add_card_to_deck: addCardToDeck,
  remove_card_from_deck: removeCardFromDeck,
  get_decks: getDecks,
  delete_deck: deleteDeck,
  record_sale: recordSale,
  get_sales: getSales
};

/**
 * Execute a tool by name
 */
export async function executeTool(toolName, args) {
  const handler = toolHandlers[toolName];
  if (!handler) {
    throw new Error(`Unknown tool: ${toolName}`);
  }
  return handler(args);
}

export default toolHandlers;
