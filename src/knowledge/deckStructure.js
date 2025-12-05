/**
 * Commander Deck Structure Guidelines
 * Recommended card type ratios and deck composition
 */

export const deckStructure = {
  // Total deck size
  totalCards: 100,

  // Recommended land count by strategy
  lands: {
    aggressive: { min: 35, max: 37, optimal: 36 },
    midrange: { min: 36, max: 38, optimal: 37 },
    control: { min: 37, max: 39, optimal: 38 },
    combo: { min: 34, max: 37, optimal: 35 },
  },

  // Mana ramp sources
  ramp: {
    min: 10,
    optimal: 12,
    max: 15,
    types: [
      'Mana rocks (Sol Ring, signets, talismans)',
      'Ramp spells (Cultivate, Kodama\'s Reach, Nature\'s Lore)',
      'Mana dorks (Llanowar Elves, Birds of Paradise)',
      'Land ramp (Rampant Growth, Farseek)',
    ],
    cmc: 'Prefer 2-3 CMC ramp',
  },

  // Card draw and card advantage
  cardDraw: {
    min: 10,
    optimal: 12,
    max: 15,
    types: [
      'Draw spells (Night\'s Whisper, Harmonize)',
      'Draw engines (Rhystic Study, Mystic Remora)',
      'Repeatable draw (Phyrexian Arena, Esper Sentinel)',
      'Wheel effects (Windfall, Wheel of Fortune)',
    ],
    note: 'Commander games go long - card advantage is crucial',
  },

  // Removal and interaction
  removal: {
    min: 10,
    optimal: 12,
    max: 15,
    singleTarget: {
      count: '6-8',
      examples: [
        'Path to Exile',
        'Swords to Plowshares',
        'Beast Within',
        'Assassin\'s Trophy',
        'Chaos Warp',
      ],
    },
    boardWipes: {
      count: '3-5',
      examples: [
        'Wrath of God',
        'Blasphemous Act',
        'Cyclonic Rift',
        'Toxic Deluge',
      ],
    },
    versatile: [
      'Generous Gift',
      'Anguished Unmaking',
      'Vindicate',
    ],
  },

  // Strategy-specific slots
  strategySlots: {
    description: 'Cards that directly advance your game plan',
    count: '25-35',
    examples: {
      tribal: 'Creature type synergies, lords',
      combo: 'Combo pieces, tutors',
      voltron: 'Equipment, auras, protection',
      control: 'Counterspells, taxes',
      aggro: 'Anthem effects, haste enablers',
    },
  },

  // Utility and flex slots
  utility: {
    count: '5-10',
    types: [
      'Recursion (Eternal Witness, Regrowth)',
      'Graveyard hate (Rest in Peace, Bojuka Bog)',
      'Artifact/Enchantment removal',
      'Tutors (varies by power level)',
    ],
  },

  // Win conditions
  winConditions: {
    count: '3-5',
    types: [
      'Primary win con (aligned with strategy)',
      'Backup win cons (1-2)',
      'Incidental threats',
    ],
    note: 'Should be resilient and not rely on single cards',
  },

  // The 8x8 Theory
  eightByEight: {
    description: 'Popular deck building framework',
    structure: {
      lands: 36,
      commander: 1,
      categories: 8, // 8 categories of 8 cards each
      cardsPerCategory: 8,
    },
    categories: [
      'Ramp',
      'Card Draw',
      'Single Target Removal',
      'Board Wipes',
      'Threats/Win Conditions',
      'Synergy Pieces',
      'Protection',
      'Recursion/Utility',
    ],
    note: 'Flexible framework, adjust based on strategy',
  },

  // Mana curve guidelines
  manaCurve: {
    cmc1: { min: 2, max: 5, note: 'Efficiency and turn 1 plays' },
    cmc2: { min: 8, max: 15, note: 'Ramp and early plays' },
    cmc3: { min: 10, max: 15, note: 'Peak of curve for most decks' },
    cmc4: { min: 8, max: 12, note: 'Impactful plays' },
    cmc5: { min: 5, max: 10, note: 'Strong threats' },
    cmc6plus: { min: 5, max: 10, note: 'Finishers and bombs' },
    avgCMC: {
      aggressive: '2.5-3.0',
      midrange: '3.0-3.5',
      control: '3.5-4.0',
      combo: '2.5-3.5',
    },
  },

  // Color distribution in mana base
  manaBase: {
    monoColor: {
      basics: '25-30',
      utility: '6-11',
      colorless: '1-3',
    },
    twoColor: {
      basics: '15-20',
      duals: '8-12',
      utility: '5-8',
      colorless: '2-4',
      fetchlands: 'Recommended',
    },
    threeColor: {
      basics: '8-12',
      duals: '10-15',
      trilands: '3-5',
      utility: '3-5',
      colorless: '2-4',
      fetchlands: 'Essential',
    },
    fourPlusColor: {
      basics: '3-6',
      duals: '12-18',
      fetchlands: 'Essential',
      colorless: '2-4',
      rainbowLands: 'Recommended',
    },
  },
};

/**
 * Get recommended deck structure for a strategy
 * @param {string} strategy - Deck strategy/archetype
 * @returns {Object} Recommended structure
 */
export function getStructureForStrategy(strategy) {
  const strategyKey = strategy.toLowerCase();
  
  let landCount = deckStructure.lands.midrange.optimal;
  let avgCMC = '3.0-3.5';
  
  if (deckStructure.lands[strategyKey]) {
    landCount = deckStructure.lands[strategyKey].optimal;
  }
  
  if (deckStructure.manaCurve.avgCMC[strategyKey]) {
    avgCMC = deckStructure.manaCurve.avgCMC[strategyKey];
  }
  
  return {
    lands: landCount,
    ramp: deckStructure.ramp.optimal,
    cardDraw: deckStructure.cardDraw.optimal,
    removal: deckStructure.removal.optimal,
    avgCMC,
    strategySlots: 30,
    utility: 7,
  };
}

/**
 * Validate deck structure
 * @param {Array} deck - Deck list
 * @returns {Object} Validation results with warnings
 */
export function validateDeckStructure(deck) {
  const warnings = [];
  const stats = {
    totalCards: deck.length,
    lands: 0,
    creatures: 0,
    instants: 0,
    sorceries: 0,
    enchantments: 0,
    artifacts: 0,
    planeswalkers: 0,
  };

  // Count card types
  deck.forEach(card => {
    if (card.type_line) {
      if (card.type_line.includes('Land')) stats.lands++;
      if (card.type_line.includes('Creature')) stats.creatures++;
      if (card.type_line.includes('Instant')) stats.instants++;
      if (card.type_line.includes('Sorcery')) stats.sorceries++;
      if (card.type_line.includes('Enchantment')) stats.enchantments++;
      if (card.type_line.includes('Artifact')) stats.artifacts++;
      if (card.type_line.includes('Planeswalker')) stats.planeswalkers++;
    }
  });

  // Check deck size
  if (stats.totalCards !== deckStructure.totalCards) {
    warnings.push(`Deck must be exactly ${deckStructure.totalCards} cards (currently ${stats.totalCards})`);
  }

  // Check land count
  if (stats.lands < 34) {
    warnings.push(`Low land count (${stats.lands}). Recommended: 35-38`);
  } else if (stats.lands > 40) {
    warnings.push(`High land count (${stats.lands}). Recommended: 35-38`);
  }

  return {
    valid: warnings.length === 0,
    warnings,
    stats,
  };
}

export default deckStructure;
