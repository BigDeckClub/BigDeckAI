/**
 * UI Messages and Status Text
 * Fun, themed messages for the BigDeck AI interface
 */

// AI Display Name
export const aiName = "Big Deck Daddy";

export const statusMessages = {
  // When AI is processing
  thinking: "Pondering my orbs...",
  
  // Alternative thinking messages (can randomize)
  thinkingAlternatives: [
    "Pondering my orbs...",
    "Consulting the multiverse...",
    "Shuffling through possibilities...",
    "Tapping my mana...",
    "Reading the cards...",
    "Scrying the future...",
    "Searching the library...",
    "Drawing some cards...",
    "Resolving the stack...",
  ],
  
  // Tool execution messages
  toolExecution: {
    search_scryfall: "Searching Scryfall...",
    get_card_price: "Checking card prices...",
    search_inventory: "Searching your collection...",
    move_card: "Moving cards...",
    add_card_to_inventory: "Adding to inventory...",
    remove_card_from_inventory: "Removing from inventory...",
    create_deck: "Creating deck...",
    add_card_to_deck: "Adding card to deck...",
    remove_card_from_deck: "Removing card from deck...",
    get_decks: "Fetching your decks...",
    delete_deck: "Deleting deck...",
    record_sale: "Recording sale...",
    get_sales: "Fetching sales history...",
    validate_deck: "Validating deck legality...",
    analyze_moxfield_profile: "Analyzing Moxfield profile...",
    analyze_mtggoldfish_profile: "Analyzing MTGGoldfish profile...",
  },
  
  // Success/Error messages
  success: "Done!",
  error: "Something went wrong...",
  
  // Welcome message
  welcome: "Welcome! I'm Big Deck Daddy, your Commander deck building expert. How can I help you today?",
  
  // Empty state messages
  emptyInventory: "Your inventory is empty. Add some cards to get started!",
  noDecks: "You haven't created any decks yet. Want me to help you build one?",
};

/**
 * Get a random thinking message
 */
export function getRandomThinkingMessage() {
  const messages = statusMessages.thinkingAlternatives;
  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Get tool-specific status message
 */
export function getToolStatusMessage(toolName) {
  return statusMessages.toolExecution[toolName] || statusMessages.thinking;
}

export default statusMessages;
