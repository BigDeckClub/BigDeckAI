/**
 * Win Condition Detection Module
 * Identifies and categorizes win conditions in Commander decks
 */

/**
 * Win condition types and examples
 */
export const winConditionTypes = {
  combat: {
    name: 'Combat Damage',
    description: 'Win through creature combat',
    examples: [
      'Craterhoof Behemoth',
      'Triumph of the Hordes',
      'Overwhelming Stampede',
      'Finale of Devastation',
      'Beastmaster Ascension',
      'Overrun',
      'Pathbreaker Ibex',
    ],
  },
  combo: {
    name: 'Infinite Combo',
    description: 'Win through infinite loops',
    examples: [
      'Thassa\'s Oracle + Demonic Consultation',
      'Isochron Scepter + Dramatic Reversal',
      'Kiki-Jiki + Deceiver Exarch',
      'Worldgorger Dragon + Animate Dead',
      'Walking Ballista + Heliod',
    ],
  },
  alternate: {
    name: 'Alternate Win Condition',
    description: 'Win through alternative means',
    examples: [
      'Thassa\'s Oracle',
      'Laboratory Maniac',
      'Jace, Wielder of Mysteries',
      'Approach of the Second Sun',
      'Felidar Sovereign',
      'Test of Endurance',
    ],
  },
  attrition: {
    name: 'Attrition/Drain',
    description: 'Win through gradual life loss',
    examples: [
      'Torment of Hailfire',
      'Exsanguinate',
      'Gray Merchant of Asphodel',
      'Blood Artist',
      'Zulaport Cutthroat',
      'Syr Konrad, the Grim',
      'Rakdos Charm',
    ],
  },
  commander: {
    name: 'Commander Damage',
    description: 'Win through commander combat damage',
    examples: [
      'Voltron strategy',
      'Equipment',
      'Auras',
      'Commander-focused beats',
    ],
  },
  mill: {
    name: 'Mill/Deck Out',
    description: 'Win by milling opponents',
    examples: [
      'Bruvac the Grandiloquent',
      'Maddening Cacophony',
      'Traumatize',
      'Keening Stone',
      'Phenax, God of Deception',
    ],
  },
};

/**
 * Known infinite combo pieces
 */
const comboPieces = {
  'Thassa\'s Oracle': {
    combos: [
      { with: ['Demonic Consultation'], description: 'Exile library, win on ETB' },
      { with: ['Tainted Pact'], description: 'Exile library, win on ETB' },
    ],
    type: 'alternate',
  },
  'Isochron Scepter': {
    combos: [
      { with: ['Dramatic Reversal', 'mana rocks'], description: 'Infinite mana and storm' },
    ],
    type: 'combo',
  },
  'Kiki-Jiki, Mirror Breaker': {
    combos: [
      { with: ['Deceiver Exarch'], description: 'Infinite creature tokens' },
      { with: ['Pestermite'], description: 'Infinite creature tokens' },
      { with: ['Zealous Conscripts'], description: 'Infinite creature tokens' },
    ],
    type: 'combo',
  },
  'Worldgorger Dragon': {
    combos: [
      { with: ['Animate Dead'], description: 'Infinite mana and ETB triggers' },
      { with: ['Dance of the Dead'], description: 'Infinite mana and ETB triggers' },
    ],
    type: 'combo',
  },
  'Walking Ballista': {
    combos: [
      { with: ['Heliod, Sun-Crowned'], description: 'Infinite damage' },
      { with: ['Mikaeus, the Unhallowed'], description: 'Infinite damage with sac outlet' },
    ],
    type: 'combo',
  },
  'Basalt Monolith': {
    combos: [
      { with: ['Rings of Brighthearth'], description: 'Infinite colorless mana' },
    ],
    type: 'combo',
  },
  'Deadeye Navigator': {
    combos: [
      { with: ['Peregrine Drake'], description: 'Infinite mana and blinks' },
      { with: ['Palinchron'], description: 'Infinite mana and blinks' },
    ],
    type: 'combo',
  },
  'Phyrexian Altar': {
    combos: [
      { with: ['Gravecrawler', 'any zombie'], description: 'Infinite mana, death triggers' },
    ],
    type: 'combo',
  },
  'Mikaeus, the Unhallowed': {
    combos: [
      { with: ['Walking Ballista'], description: 'Infinite damage' },
      { with: ['Triskelion'], description: 'Infinite damage' },
    ],
    type: 'combo',
  },
};

/**
 * Combat win condition cards
 */
const combatWincons = [
  'Craterhoof Behemoth',
  'Triumph of the Hordes',
  'Overwhelming Stampede',
  'Finale of Devastation',
  'Beastmaster Ascension',
  'Overrun',
  'Pathbreaker Ibex',
  'End-Raze Forerunners',
  'Coat of Arms',
  'Door of Destinies',
];

/**
 * Alternate win conditions
 */
const alternateWincons = [
  'Thassa\'s Oracle',
  'Laboratory Maniac',
  'Jace, Wielder of Mysteries',
  'Approach of the Second Sun',
  'Felidar Sovereign',
  'Test of Endurance',
  'Mortal Combat',
  'Mayael\'s Aria',
];

/**
 * Attrition/drain cards
 */
const attritionCards = [
  'Torment of Hailfire',
  'Exsanguinate',
  'Gray Merchant of Asphodel',
  'Blood Artist',
  'Zulaport Cutthroat',
  'Syr Konrad, the Grim',
  'Rakdos Charm',
  'Vito, Thorn of the Dusk Rose',
  'Sanguine Bond',
];

/**
 * Detect all win conditions in a deck
 * @param {Array} decklist - Array of card objects
 * @returns {Object} Detected win conditions
 */
export function detectWinConditions(decklist) {
  if (!Array.isArray(decklist)) {
    return {
      found: [],
      count: 0,
      categories: {},
    };
  }

  const found = [];
  const categories = {};

  // Check for combo pieces
  const combos = detectInfiniteCombos(decklist);
  if (combos.length > 0) {
    categories.combo = combos.length;
    combos.forEach(combo => {
      found.push({
        type: 'combo',
        name: combo.description,
        cards: [combo.mainCard, ...combo.pieces],
        description: combo.description,
      });
    });
  }

  // Check for combat wincons
  for (const card of decklist) {
    const name = card.name?.toLowerCase() || '';

    if (combatWincons.some(wincon => name.includes(wincon.toLowerCase()))) {
      found.push({
        type: 'combat',
        name: card.name,
        description: 'Combat damage finisher',
      });
      categories.combat = (categories.combat || 0) + 1;
    }

    if (alternateWincons.some(wincon => name.includes(wincon.toLowerCase()))) {
      found.push({
        type: 'alternate',
        name: card.name,
        description: 'Alternate win condition',
      });
      categories.alternate = (categories.alternate || 0) + 1;
    }

    if (attritionCards.some(drain => name.includes(drain.toLowerCase()))) {
      found.push({
        type: 'attrition',
        name: card.name,
        description: 'Life drain/attrition',
      });
      categories.attrition = (categories.attrition || 0) + 1;
    }
  }

  // Check for voltron indicators (equipment/auras)
  const equipment = decklist.filter(card => 
    card.type?.includes('Equipment') || card.type?.includes('Aura')
  ).length;
  if (equipment >= 10) {
    found.push({
      type: 'commander',
      name: 'Commander Damage (Voltron)',
      description: `${equipment} equipment/auras for voltron strategy`,
    });
    categories.commander = (categories.commander || 0) + 1;
  }

  return {
    found,
    count: found.length,
    categories,
    hasSufficientWincons: found.length >= 3,
  };
}

/**
 * Categorize win conditions by type
 * @param {Array} wincons - Array of win condition objects
 * @returns {Object} Win conditions grouped by type
 */
export function categorizeWinConditions(wincons) {
  const categorized = {};

  for (const wincon of wincons) {
    const type = wincon.type || 'other';
    if (!categorized[type]) {
      categorized[type] = [];
    }
    categorized[type].push(wincon);
  }

  return categorized;
}

/**
 * Assess win condition redundancy
 * @param {Array} decklist - Array of card objects
 * @returns {Object} Redundancy assessment
 */
export function assessWinConRedundancy(decklist) {
  const detected = detectWinConditions(decklist);
  const uniqueTypes = Object.keys(detected.categories).length;

  let assessment = {
    totalWincons: detected.count,
    uniqueTypes,
    hasBackup: detected.count >= 3,
    diversified: uniqueTypes >= 2,
  };

  if (detected.count === 0) {
    assessment.rating = 'critical';
    assessment.message = 'No clear win conditions detected';
    assessment.recommendation = 'Add 3-5 win conditions to close out games';
  } else if (detected.count === 1) {
    assessment.rating = 'poor';
    assessment.message = 'Only one win condition - very vulnerable to disruption';
    assessment.recommendation = 'Add 2-4 backup win conditions';
  } else if (detected.count === 2) {
    assessment.rating = 'adequate';
    assessment.message = 'Minimal win conditions - add more for consistency';
    assessment.recommendation = 'Add 1-2 more win conditions';
  } else if (detected.count >= 3 && uniqueTypes >= 2) {
    assessment.rating = 'good';
    assessment.message = 'Good win condition diversity and redundancy';
    assessment.recommendation = 'Win conditions look solid';
  } else {
    assessment.rating = 'excellent';
    assessment.message = 'Excellent win condition redundancy';
    assessment.recommendation = 'Win conditions are well-covered';
  }

  return {
    ...assessment,
    details: detected,
  };
}

/**
 * Suggest win conditions for a deck
 * @param {Array} decklist - Array of card objects
 * @param {string} archetype - Deck archetype
 * @param {Array} colors - Color identity
 * @returns {Array} Suggested win conditions
 */
export function suggestWinConditions(decklist, archetype = 'midrange', colors = []) {
  const current = detectWinConditions(decklist);
  const suggestions = [];

  // Suggest based on archetype
  if (archetype === 'combo') {
    if (!current.categories.combo) {
      suggestions.push({
        name: 'Thassa\'s Oracle',
        type: 'combo',
        reason: 'Compact combo win condition',
        synergy: ['Demonic Consultation', 'Tainted Pact'],
      });
    }
  }

  if (archetype === 'aggro' || archetype === 'tribal' || archetype === 'tokens') {
    if (!current.categories.combat) {
      suggestions.push({
        name: 'Craterhoof Behemoth',
        type: 'combat',
        reason: 'Ends games with creature armies',
        synergy: ['Token generators', 'Go-wide strategies'],
      });
      if (colors.includes('G')) {
        suggestions.push({
          name: 'Triumph of the Hordes',
          type: 'combat',
          reason: 'Alternate combat finisher with infect',
          synergy: ['Wide boards'],
        });
      }
    }
  }

  if (archetype === 'aristocrats' || colors.includes('B')) {
    if (!current.categories.attrition) {
      suggestions.push({
        name: 'Blood Artist',
        type: 'attrition',
        reason: 'Drains life from death triggers',
        synergy: ['Sacrifice outlets', 'Board wipes'],
      });
      suggestions.push({
        name: 'Exsanguinate',
        type: 'attrition',
        reason: 'Finisher for mana-generating decks',
        synergy: ['Big mana', 'Mana doublers'],
      });
    }
  }

  if (colors.includes('U')) {
    suggestions.push({
      name: 'Thassa\'s Oracle',
      type: 'alternate',
      reason: 'Compact alternate win condition',
      synergy: ['Self-mill', 'Lab Man effects'],
    });
  }

  // General suggestions if lacking wincons
  if (current.count < 3) {
    if (colors.includes('G')) {
      suggestions.push({
        name: 'Finale of Devastation',
        type: 'combat',
        reason: 'Flexible finisher and tutor',
        synergy: ['Creature decks'],
      });
    }
  }

  return suggestions.slice(0, 5);
}

/**
 * Detect infinite combos in the deck
 * @param {Array} decklist - Array of card objects
 * @returns {Array} Detected infinite combos
 */
export function detectInfiniteCombos(decklist) {
  const combos = [];
  const cardNames = decklist.map(card => card.name);

  for (const card of decklist) {
    const comboPiece = comboPieces[card.name];
    if (!comboPiece) continue;

    for (const combo of comboPiece.combos) {
      // Check if all combo pieces are in deck
      const hasAllPieces = combo.with.every(piece => {
        // Handle special cases like "mana rocks"
        if (piece === 'mana rocks') {
          return decklist.some(c => c.type?.includes('Artifact') && 
                                   c.oracle_text?.toLowerCase().includes('add') &&
                                   c.oracle_text?.toLowerCase().includes('mana'));
        }
        if (piece === 'any zombie') {
          return decklist.some(c => c.type?.toLowerCase().includes('zombie'));
        }
        return cardNames.some(name => name.toLowerCase().includes(piece.toLowerCase()));
      });

      if (hasAllPieces) {
        combos.push({
          mainCard: card.name,
          pieces: combo.with,
          description: combo.description,
          type: comboPiece.type,
        });
      }
    }
  }

  return combos;
}

/**
 * Get win condition statistics
 * @param {Array} decklist - Array of card objects
 * @returns {Object} Win condition statistics
 */
export function getWinConditionStats(decklist) {
  const detected = detectWinConditions(decklist);
  const redundancy = assessWinConRedundancy(decklist);

  return {
    totalWincons: detected.count,
    byType: detected.categories,
    redundancy: redundancy.rating,
    diversified: redundancy.diversified,
    recommendation: redundancy.recommendation,
    details: detected.found,
  };
}

export default {
  winConditionTypes,
  detectWinConditions,
  categorizeWinConditions,
  assessWinConRedundancy,
  suggestWinConditions,
  detectInfiniteCombos,
  getWinConditionStats,
};
