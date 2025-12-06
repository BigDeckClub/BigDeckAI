/**
 * Card Synergy Database
 * Maps cards to their synergies, combos, and anti-synergies
 */

/**
 * Synergy categories
 */
export const synergyCategories = {
  COMBO: 'combo',
  ENGINE: 'engine',
  TRIBAL: 'tribal',
  KEYWORD: 'keyword',
  COLOR_SPECIFIC: 'color_specific',
  COUNTERS: 'counters',
  TOKENS: 'tokens',
  GRAVEYARD: 'graveyard',
  ETB: 'etb',
  SACRIFICE: 'sacrifice',
  PLANESWALKERS: 'planeswalkers',
  ARTIFACTS: 'artifacts',
  ENCHANTMENTS: 'enchantments',
  LANDFALL: 'landfall',
  SPELLSLINGER: 'spellslinger',
};

/**
 * Card synergy database
 * Maps card names to their synergies and interactions
 */
export const synergies = {
  'Doubling Season': {
    categories: [synergyCategories.PLANESWALKERS, synergyCategories.COUNTERS, synergyCategories.TOKENS],
    synergiesWith: [
      'Planeswalkers (any)',
      'Hardened Scales',
      'Parallel Lives',
      'Anointed Procession',
      '+1/+1 counter cards',
      'Token generators',
    ],
    antiSynergy: ['Solemnity'],
    powerMultiplier: 1.5,
    description: 'Doubles tokens and counters, including planeswalker loyalty',
  },

  'Thassa\'s Oracle': {
    categories: [synergyCategories.COMBO],
    synergiesWith: [
      'Demonic Consultation',
      'Tainted Pact',
      'Leveler',
      'Paradigm Shift',
    ],
    combos: [
      { cards: ['Demonic Consultation'], type: 'infinite', description: 'Exile entire library, win with Oracle' },
      { cards: ['Tainted Pact'], type: 'infinite', description: 'Exile entire library, win with Oracle' },
    ],
    powerMultiplier: 2.0,
    description: 'Wins the game with an empty library',
  },

  'Demonic Consultation': {
    categories: [synergyCategories.COMBO],
    synergiesWith: [
      'Thassa\'s Oracle',
      'Laboratory Maniac',
      'Jace, Wielder of Mysteries',
    ],
    combos: [
      { cards: ['Thassa\'s Oracle'], type: 'infinite', description: 'Name a card not in deck, exile library, win' },
    ],
    powerMultiplier: 1.8,
    description: 'Can exile entire library for combo wins',
  },

  'Isochron Scepter': {
    categories: [synergyCategories.COMBO, synergyCategories.ENGINE],
    synergiesWith: [
      'Dramatic Reversal',
      'Counterspell',
      'Swan Song',
      'Enlightened Tutor',
      'Any instant with CMC 2 or less',
    ],
    combos: [
      { 
        cards: ['Dramatic Reversal', 'mana rocks'], 
        type: 'infinite', 
        description: 'Infinite mana and storm count with 2+ mana from artifacts/creatures' 
      },
    ],
    powerMultiplier: 1.7,
    description: 'Repeatable instant casting',
  },

  'Rhystic Study': {
    categories: [synergyCategories.ENGINE],
    synergiesWith: [
      'Smothering Tithe',
      'Mystic Remora',
      'Any card draw matters effects',
    ],
    powerMultiplier: 1.4,
    description: 'Powerful card advantage engine',
  },

  'Smothering Tithe': {
    categories: [synergyCategories.ENGINE],
    synergiesWith: [
      'Wheel effects',
      'Windfall',
      'Wheel of Fortune',
      'Teferi\'s Puzzle Box',
    ],
    powerMultiplier: 1.5,
    description: 'Explosive treasure generation with wheels',
  },

  'Craterhoof Behemoth': {
    categories: [synergyCategories.TOKENS],
    synergiesWith: [
      'Token generators',
      'Avenger of Zendikar',
      'Natural Order',
      'Chord of Calling',
    ],
    powerMultiplier: 1.6,
    description: 'Game-ending with go-wide strategies',
  },

  'Phyrexian Altar': {
    categories: [synergyCategories.COMBO, synergyCategories.SACRIFICE],
    synergiesWith: [
      'Gravecrawler',
      'Blood Artist',
      'Zulaport Cutthroat',
      'Pitiless Plunderer',
    ],
    combos: [
      { cards: ['Gravecrawler', 'any zombie'], type: 'infinite', description: 'Infinite mana, ETB, death triggers' },
    ],
    powerMultiplier: 1.7,
    description: 'Converts creatures to mana for combos',
  },

  'Blood Artist': {
    categories: [synergyCategories.SACRIFICE, synergyCategories.COMBO],
    synergiesWith: [
      'Zulaport Cutthroat',
      'Phyrexian Altar',
      'Grave Pact',
      'Dictate of Erebos',
      'Sacrifice outlets',
    ],
    powerMultiplier: 1.3,
    description: 'Drains life from creature deaths',
  },

  'Panharmonicon': {
    categories: [synergyCategories.ETB, synergyCategories.ENGINE],
    synergiesWith: [
      'ETB creatures',
      'Mulldrifter',
      'Solemn Simulacrum',
      'Ephemerate',
    ],
    powerMultiplier: 1.5,
    description: 'Doubles ETB triggers for massive value',
  },

  'Animate Dead': {
    categories: [synergyCategories.GRAVEYARD, synergyCategories.COMBO],
    synergiesWith: [
      'Worldgorger Dragon',
      'Entomb',
      'Buried Alive',
      'Big creatures',
    ],
    combos: [
      { cards: ['Worldgorger Dragon'], type: 'infinite', description: 'Infinite mana and ETB triggers' },
    ],
    powerMultiplier: 1.6,
    description: 'Cheap reanimation',
  },

  'Worldgorger Dragon': {
    categories: [synergyCategories.GRAVEYARD, synergyCategories.COMBO],
    synergiesWith: [
      'Animate Dead',
      'Dance of the Dead',
      'Necromancy',
    ],
    combos: [
      { cards: ['Animate Dead'], type: 'infinite', description: 'Infinite mana, must have outlet' },
    ],
    powerMultiplier: 1.8,
    description: 'Goes infinite with reanimation spells',
  },

  'Aetherflux Reservoir': {
    categories: [synergyCategories.COMBO, synergyCategories.SPELLSLINGER],
    synergiesWith: [
      'Storm spells',
      'Bolas\'s Citadel',
      'Sensei\'s Divining Top',
      'Ad Nauseam',
    ],
    powerMultiplier: 1.5,
    description: 'Life gain and storm win condition',
  },

  "Atraxa, Praetors' Voice": {
    categories: [synergyCategories.COUNTERS, synergyCategories.PLANESWALKERS],
    synergiesWith: [
      'Planeswalkers',
      'Doubling Season',
      '+1/+1 counter cards',
      'Proliferate effects',
    ],
    powerMultiplier: 1.4,
    description: 'Proliferates all counters',
  },

  'Urza, Lord High Artificer': {
    categories: [synergyCategories.ARTIFACTS, synergyCategories.COMBO],
    synergiesWith: [
      'Mana rocks',
      'Artifacts',
      'Polymorph effects',
      'Winter Orb',
    ],
    powerMultiplier: 1.7,
    description: 'Artifact synergies and asymmetric mana',
  },

  'Deadeye Navigator': {
    categories: [synergyCategories.ETB, synergyCategories.COMBO],
    synergiesWith: [
      'Peregrine Drake',
      'Palinchron',
      'ETB creatures',
      'Cloud of Faeries',
    ],
    combos: [
      { cards: ['Peregrine Drake'], type: 'infinite', description: 'Infinite mana and blinks' },
      { cards: ['Palinchron'], type: 'infinite', description: 'Infinite mana and blinks' },
    ],
    powerMultiplier: 1.6,
    description: 'Repeatable blink for ETB abuse',
  },

  'Gitrog Monster, The': {
    categories: [synergyCategories.LANDFALL, synergyCategories.GRAVEYARD],
    synergiesWith: [
      'Crucible of Worlds',
      'Dakmor Salvage',
      'Fetch lands',
      'Azusa, Lost but Seeking',
    ],
    combos: [
      { cards: ['Dakmor Salvage'], type: 'infinite', description: 'Infinite draw with discard outlet' },
    ],
    powerMultiplier: 1.6,
    description: 'Landfall and graveyard synergies',
  },

  'Cyclonic Rift': {
    categories: [synergyCategories.ENGINE],
    synergiesWith: [
      'Any deck',
    ],
    powerMultiplier: 1.5,
    description: 'One-sided board wipe',
  },

  'Sol Ring': {
    categories: [synergyCategories.ENGINE],
    synergiesWith: [
      'Any deck',
    ],
    powerMultiplier: 1.4,
    description: 'Fast mana staple',
  },

  'Mana Crypt': {
    categories: [synergyCategories.ENGINE],
    synergiesWith: [
      'Any deck',
    ],
    powerMultiplier: 1.5,
    description: 'Explosive fast mana',
  },
};

/**
 * Get all synergies for a specific card
 * @param {string} cardName - Name of the card
 * @returns {Object|null} Synergy data for the card
 */
export function getSynergiesFor(cardName) {
  const normalized = cardName.trim();
  return synergies[normalized] || null;
}

/**
 * Find all synergy pairs in a decklist
 * @param {Array} decklist - Array of card objects with name property
 * @returns {Array} Array of synergy pairs found
 */
export function findSynergyPairs(decklist) {
  const pairs = [];
  const cardNames = decklist.map(card => card.name);
  
  for (const card of decklist) {
    const cardSynergies = getSynergiesFor(card.name);
    if (!cardSynergies) continue;
    
    // Check for synergies in deck
    for (const synergyCard of cardSynergies.synergiesWith || []) {
      // Handle wildcard synergies like "any planeswalker"
      if (synergyCard.includes('any') || synergyCard.includes('(any)')) {
        continue; // Skip wildcards for now
      }
      
      if (cardNames.includes(synergyCard)) {
        pairs.push({
          card1: card.name,
          card2: synergyCard,
          categories: cardSynergies.categories,
          description: cardSynergies.description,
        });
      }
    }
    
    // Check for combos
    if (cardSynergies.combos) {
      for (const combo of cardSynergies.combos) {
        const hasAllPieces = combo.cards.every(piece => 
          piece === 'mana rocks' || // Special case
          cardNames.some(name => name.includes(piece))
        );
        
        if (hasAllPieces) {
          pairs.push({
            card1: card.name,
            card2: combo.cards.join(' + '),
            categories: ['COMBO'],
            description: combo.description,
            type: combo.type,
          });
        }
      }
    }
  }
  
  return pairs;
}

/**
 * Suggest cards that synergize with current deck
 * @param {Array} decklist - Array of card objects
 * @param {number} count - Number of suggestions to return
 * @returns {Array} Array of suggested cards with reasons
 */
export function suggestSynergyCards(decklist, count = 10) {
  const suggestions = new Map();
  const existingCards = new Set(decklist.map(card => card.name));
  
  // Analyze deck for synergy opportunities
  for (const card of decklist) {
    const cardSynergies = getSynergiesFor(card.name);
    if (!cardSynergies) continue;
    
    // Add synergy suggestions
    for (const synergyCard of cardSynergies.synergiesWith || []) {
      // Skip wildcards and cards already in deck
      if (synergyCard.includes('any') || synergyCard.includes('(any)')) continue;
      if (existingCards.has(synergyCard)) continue;
      
      if (!suggestions.has(synergyCard)) {
        suggestions.set(synergyCard, {
          card: synergyCard,
          reasons: [],
          categories: new Set(),
          score: 0,
        });
      }
      
      const suggestion = suggestions.get(synergyCard);
      suggestion.reasons.push(`Synergizes with ${card.name}`);
      cardSynergies.categories?.forEach(cat => suggestion.categories.add(cat));
      suggestion.score += cardSynergies.powerMultiplier || 1.0;
    }
  }
  
  // Convert to array and sort by score
  const sorted = Array.from(suggestions.values())
    .map(s => ({
      ...s,
      categories: Array.from(s.categories),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, count);
  
  return sorted;
}

/**
 * Calculate overall synergy score for a deck
 * @param {Array} decklist - Array of card objects
 * @returns {Object} Synergy score and analysis
 */
export function calculateSynergyScore(decklist) {
  const pairs = findSynergyPairs(decklist);
  const uniqueCards = decklist.length;
  
  // Count synergies by category
  const categoryCount = {};
  for (const pair of pairs) {
    for (const category of pair.categories || []) {
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    }
  }
  
  // Calculate score (pairs per card, weighted)
  const rawScore = pairs.length / Math.max(uniqueCards, 1);
  const normalizedScore = Math.min(10, Math.round(rawScore * 20)); // Scale to 1-10
  
  return {
    score: normalizedScore,
    totalPairs: pairs.length,
    uniqueCards,
    categoryBreakdown: categoryCount,
    rating: normalizedScore >= 8 ? 'Excellent' :
            normalizedScore >= 6 ? 'Good' :
            normalizedScore >= 4 ? 'Moderate' : 'Low',
    analysis: `Found ${pairs.length} synergy pairs across ${uniqueCards} cards`,
  };
}

/**
 * Get synergy categories present in deck
 * @param {Array} decklist - Array of card objects
 * @returns {Array} Array of synergy categories with counts
 */
export function getDeckSynergyCategories(decklist) {
  const categories = new Map();
  
  for (const card of decklist) {
    const cardSynergies = getSynergiesFor(card.name);
    if (!cardSynergies?.categories) continue;
    
    for (const category of cardSynergies.categories) {
      const count = categories.get(category) || 0;
      categories.set(category, count + 1);
    }
  }
  
  return Array.from(categories.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Find infinite combos in deck
 * @param {Array} decklist - Array of card objects
 * @returns {Array} Array of infinite combos found
 */
export function findInfiniteCombos(decklist) {
  const combos = [];
  const cardNames = decklist.map(card => card.name);
  
  for (const card of decklist) {
    const cardSynergies = getSynergiesFor(card.name);
    if (!cardSynergies?.combos) continue;
    
    for (const combo of cardSynergies.combos) {
      if (combo.type !== 'infinite') continue;
      
      const hasAllPieces = combo.cards.every(piece => 
        piece === 'mana rocks' || 
        cardNames.some(name => name.toLowerCase().includes(piece.toLowerCase()))
      );
      
      if (hasAllPieces) {
        combos.push({
          mainCard: card.name,
          pieces: combo.cards,
          description: combo.description,
          categories: cardSynergies.categories,
        });
      }
    }
  }
  
  return combos;
}

export default {
  synergies,
  synergyCategories,
  getSynergiesFor,
  findSynergyPairs,
  suggestSynergyCards,
  calculateSynergyScore,
  getDeckSynergyCategories,
  findInfiniteCombos,
};
