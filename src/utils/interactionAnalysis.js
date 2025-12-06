/**
 * Interaction Analysis Module
 * Evaluates removal, counterspells, and protection in Commander decks
 */

/**
 * Interaction categories with targets and examples
 */
export const interactionCategories = {
  spotRemoval: {
    target: 8,
    name: 'Spot Removal',
    description: 'Single-target removal for creatures and other permanents',
    examples: [
      'Swords to Plowshares',
      'Path to Exile',
      'Beast Within',
      'Generous Gift',
      'Chaos Warp',
      'Murder',
      'Terminate',
      'Anguished Unmaking',
    ],
  },
  boardWipes: {
    target: 3,
    name: 'Board Wipes',
    description: 'Mass removal effects',
    examples: [
      'Wrath of God',
      'Damnation',
      'Cyclonic Rift',
      'Toxic Deluge',
      'Blasphemous Act',
      'Austere Command',
      'Vanquish the Horde',
    ],
  },
  counterspells: {
    target: 5,
    name: 'Counterspells',
    description: 'Counter target spell or ability',
    examples: [
      'Counterspell',
      'Swan Song',
      'Arcane Denial',
      'Negate',
      'Fierce Guardianship',
      'Force of Will',
      'Pact of Negation',
    ],
  },
  protection: {
    target: 4,
    name: 'Protection',
    description: 'Protect your board from removal',
    examples: [
      'Heroic Intervention',
      'Teferi\'s Protection',
      'Boros Charm',
      'Deflecting Swat',
      'Flawless Maneuver',
      'Wrap in Vigor',
    ],
  },
  graveyardHate: {
    target: 2,
    name: 'Graveyard Hate',
    description: 'Exile or disable graveyards',
    examples: [
      'Rest in Peace',
      'Bojuka Bog',
      'Scavenging Ooze',
      'Tormod\'s Crypt',
      'Soul-Guide Lantern',
      'Grafdigger\'s Cage',
    ],
  },
  artifactEnchantmentRemoval: {
    target: 3,
    name: 'Artifact/Enchantment Removal',
    description: 'Remove artifacts and enchantments',
    examples: [
      'Nature\'s Claim',
      'Disenchant',
      'Assassin\'s Trophy',
      'Abrupt Decay',
      'Reclamation Sage',
      'Caustic Caterpillar',
    ],
  },
};

/**
 * Known spot removal spells
 */
const spotRemovalSpells = [
  'Swords to Plowshares', 'Path to Exile', 'Beast Within', 'Generous Gift',
  'Chaos Warp', 'Murder', 'Terminate', 'Anguished Unmaking',
  'Assassin\'s Trophy', 'Abrupt Decay', 'Vindicate', 'Utter End',
  'Hero\'s Downfall', 'Grasp of Fate', 'Oblation',
];

/**
 * Known board wipes
 */
const boardWipes = [
  'Wrath of God', 'Damnation', 'Cyclonic Rift', 'Toxic Deluge',
  'Blasphemous Act', 'Austere Command', 'Vanquish the Horde',
  'Day of Judgment', 'Supreme Verdict', 'Merciless Eviction',
  'Devastation Tide', 'Flood of Tears', 'Curse of the Swine',
];

/**
 * Known counterspells
 */
const counterspells = [
  'Counterspell', 'Swan Song', 'Arcane Denial', 'Negate',
  'Fierce Guardianship', 'Force of Will', 'Pact of Negation',
  'Mana Drain', 'Force of Negation', 'Dispel', 'Flusterstorm',
  'Dovin\'s Veto', 'An Offer You Can\'t Refuse', 'Spell Pierce',
];

/**
 * Known protection spells
 */
const protectionSpells = [
  'Heroic Intervention', 'Teferi\'s Protection', 'Boros Charm',
  'Deflecting Swat', 'Flawless Maneuver', 'Wrap in Vigor',
  'Guardian Augmenter', 'Veil of Summer', 'Autumn\'s Veil',
];

/**
 * Known graveyard hate
 */
const graveyardHate = [
  'Rest in Peace', 'Bojuka Bog', 'Scavenging Ooze',
  'Tormod\'s Crypt', 'Soul-Guide Lantern', 'Grafdigger\'s Cage',
  'Relic of Progenitus', 'Nihil Spellbomb', 'Ground Seal',
];

/**
 * Analyze interaction in a deck
 * @param {Array} decklist - Array of card objects
 * @returns {Object} Interaction analysis
 */
export function analyzeInteraction(decklist) {
  if (!Array.isArray(decklist)) {
    return {
      total: 0,
      breakdown: {},
      quality: 'none',
      rating: 0,
    };
  }

  const breakdown = {
    spotRemoval: [],
    boardWipes: [],
    counterspells: [],
    protection: [],
    graveyardHate: [],
    artifactEnchantmentRemoval: [],
  };

  for (const card of decklist) {
    const name = card.name?.toLowerCase() || '';
    const text = card.oracle_text?.toLowerCase() || '';
    const type = card.type?.toLowerCase() || '';

    // Spot removal
    if (spotRemovalSpells.some(spell => name.includes(spell.toLowerCase())) ||
        ((text.includes('destroy') || text.includes('exile')) && 
         text.includes('target') && 
         !text.includes('destroy all') && !text.includes('exile all'))) {
      breakdown.spotRemoval.push({
        name: card.name,
        cmc: card.cmc,
        quality: card.cmc <= 2 ? 'high' : 'medium',
      });
    }

    // Board wipes
    if (boardWipes.some(wipe => name.includes(wipe.toLowerCase())) ||
        ((text.includes('destroy all') || text.includes('exile all')) && 
         text.includes('creature'))) {
      breakdown.boardWipes.push({
        name: card.name,
        cmc: card.cmc,
        quality: card.cmc <= 4 ? 'high' : 'medium',
      });
    }

    // Counterspells
    if (counterspells.some(counter => name.includes(counter.toLowerCase())) ||
        (type.includes('instant') && text.includes('counter target'))) {
      breakdown.counterspells.push({
        name: card.name,
        cmc: card.cmc,
        quality: card.cmc <= 2 ? 'high' : 'medium',
      });
    }

    // Protection
    if (protectionSpells.some(prot => name.includes(prot.toLowerCase())) ||
        (text.includes('indestructible') && text.includes('you control')) ||
        (text.includes('hexproof') && text.includes('you control'))) {
      breakdown.protection.push({
        name: card.name,
        cmc: card.cmc,
        quality: card.cmc <= 2 ? 'high' : 'medium',
      });
    }

    // Graveyard hate
    if (graveyardHate.some(hate => name.includes(hate.toLowerCase())) ||
        (text.includes('exile') && text.includes('graveyard'))) {
      breakdown.graveyardHate.push({
        name: card.name,
        cmc: card.cmc,
        quality: 'medium',
      });
    }

    // Artifact/enchantment removal
    if ((text.includes('destroy') || text.includes('exile')) &&
        (text.includes('artifact') || text.includes('enchantment')) &&
        text.includes('target')) {
      breakdown.artifactEnchantmentRemoval.push({
        name: card.name,
        cmc: card.cmc,
        quality: card.cmc <= 2 ? 'high' : 'medium',
      });
    }
  }

  const total = Object.values(breakdown).reduce((sum, arr) => sum + arr.length, 0);

  return {
    total,
    breakdown: {
      spotRemoval: breakdown.spotRemoval.length,
      boardWipes: breakdown.boardWipes.length,
      counterspells: breakdown.counterspells.length,
      protection: breakdown.protection.length,
      graveyardHate: breakdown.graveyardHate.length,
      artifactEnchantmentRemoval: breakdown.artifactEnchantmentRemoval.length,
    },
    cards: breakdown,
    percentage: parseFloat((total / decklist.length * 100).toFixed(1)),
  };
}

/**
 * Score interaction package quality
 * @param {Array} decklist - Array of card objects
 * @returns {Object} Interaction score
 */
export function scoreInteractionPackage(decklist) {
  const analysis = analyzeInteraction(decklist);
  
  let score = 0;
  let maxScore = 0;

  // Score each category
  for (const [category, data] of Object.entries(interactionCategories)) {
    const actual = analysis.breakdown[category] || 0;
    const target = data.target;
    
    // Score based on how close to target
    const categoryScore = Math.min(actual / target, 1.5) * 10; // Max 15 points if exceeding target
    score += categoryScore;
    maxScore += 10;
  }

  const normalizedScore = Math.min(10, Math.round((score / maxScore) * 10));

  return {
    score: normalizedScore,
    total: analysis.total,
    rating: normalizedScore >= 8 ? 'excellent' :
            normalizedScore >= 6 ? 'good' :
            normalizedScore >= 4 ? 'adequate' : 'insufficient',
    breakdown: analysis.breakdown,
  };
}

/**
 * Identify interaction gaps
 * @param {Array} decklist - Array of card objects
 * @param {Array} colors - Color identity
 * @returns {Array} Missing interaction types
 */
export function identifyInteractionGaps(decklist, colors = []) {
  const analysis = analyzeInteraction(decklist);
  const gaps = [];

  for (const [category, data] of Object.entries(interactionCategories)) {
    const actual = analysis.breakdown[category] || 0;
    const target = data.target;

    if (actual < target) {
      const deficit = target - actual;
      gaps.push({
        category,
        name: data.name,
        current: actual,
        target,
        deficit,
        severity: deficit >= 3 ? 'high' : deficit >= 2 ? 'medium' : 'low',
        description: data.description,
      });
    }
  }

  return gaps.sort((a, b) => b.deficit - a.deficit);
}

/**
 * Suggest interaction to add
 * @param {Array} decklist - Array of card objects
 * @param {Array} colors - Color identity
 * @param {string} budget - Budget tier
 * @returns {Array} Interaction suggestions
 */
export function suggestInteraction(decklist, colors = [], budget = 'moderate') {
  const gaps = identifyInteractionGaps(decklist, colors);
  const suggestions = [];

  for (const gap of gaps) {
    const category = gap.category;
    let examples = [];

    // Suggest based on color identity
    if (category === 'spotRemoval') {
      if (colors.includes('W')) {
        examples.push('Swords to Plowshares', 'Path to Exile', 'Generous Gift');
      }
      if (colors.includes('G')) {
        examples.push('Beast Within', 'Generous Gift');
      }
      if (colors.includes('B')) {
        examples.push('Murder', 'Hero\'s Downfall', 'Deadly Rollick');
      }
      if (colors.includes('R')) {
        examples.push('Chaos Warp', 'Abrade');
      }
    }

    if (category === 'boardWipes') {
      if (colors.includes('W')) {
        examples.push('Wrath of God', 'Austere Command', 'Vanquish the Horde');
      }
      if (colors.includes('B')) {
        examples.push('Damnation', 'Toxic Deluge', 'Crux of Fate');
      }
      if (colors.includes('U')) {
        examples.push('Cyclonic Rift', 'Flood of Tears');
      }
      if (colors.includes('R')) {
        examples.push('Blasphemous Act', 'Chain Reaction');
      }
    }

    if (category === 'counterspells') {
      if (colors.includes('U')) {
        examples.push('Counterspell', 'Swan Song', 'Arcane Denial', 'Negate');
      }
    }

    if (category === 'protection') {
      if (colors.includes('G')) {
        examples.push('Heroic Intervention', 'Wrap in Vigor');
      }
      if (colors.includes('W')) {
        examples.push('Teferi\'s Protection', 'Boros Charm', 'Flawless Maneuver');
      }
    }

    if (category === 'graveyardHate') {
      examples.push('Bojuka Bog', 'Tormod\'s Crypt', 'Soul-Guide Lantern');
      if (colors.includes('W')) {
        examples.push('Rest in Peace');
      }
      if (colors.includes('G')) {
        examples.push('Scavenging Ooze');
      }
    }

    if (examples.length > 0) {
      suggestions.push({
        category: gap.name,
        deficit: gap.deficit,
        severity: gap.severity,
        suggestions: examples.slice(0, 3),
        reason: `Need ${gap.deficit} more ${gap.name.toLowerCase()}`,
      });
    }
  }

  return suggestions.slice(0, 5);
}

/**
 * Evaluate removal quality/efficiency
 * @param {Array} decklist - Array of card objects
 * @returns {Object} Removal quality assessment
 */
export function evaluateRemovalQuality(decklist) {
  const analysis = analyzeInteraction(decklist);
  
  // Analyze spot removal efficiency
  const spotRemoval = analysis.cards.spotRemoval || [];
  const avgSpotRemovalCMC = spotRemoval.length > 0
    ? spotRemoval.reduce((sum, card) => sum + card.cmc, 0) / spotRemoval.length
    : 0;
  
  const efficientSpotRemoval = spotRemoval.filter(card => card.cmc <= 2).length;
  
  // Analyze board wipe efficiency
  const boardWipes = analysis.cards.boardWipes || [];
  const avgBoardWipeCMC = boardWipes.length > 0
    ? boardWipes.reduce((sum, card) => sum + card.cmc, 0) / boardWipes.length
    : 0;
  
  const efficientBoardWipes = boardWipes.filter(card => card.cmc <= 4).length;

  // Analyze counterspells
  const counterspells = analysis.cards.counterspells || [];
  const avgCounterCMC = counterspells.length > 0
    ? counterspells.reduce((sum, card) => sum + card.cmc, 0) / counterspells.length
    : 0;
  
  const efficientCounters = counterspells.filter(card => card.cmc <= 2).length;

  const overallEfficiency = 
    (efficientSpotRemoval + efficientBoardWipes + efficientCounters) /
    Math.max(spotRemoval.length + boardWipes.length + counterspells.length, 1);

  return {
    spotRemoval: {
      count: spotRemoval.length,
      avgCMC: parseFloat(avgSpotRemovalCMC.toFixed(2)),
      efficient: efficientSpotRemoval,
      quality: avgSpotRemovalCMC <= 2.5 ? 'excellent' : avgSpotRemovalCMC <= 3.5 ? 'good' : 'poor',
    },
    boardWipes: {
      count: boardWipes.length,
      avgCMC: parseFloat(avgBoardWipeCMC.toFixed(2)),
      efficient: efficientBoardWipes,
      quality: avgBoardWipeCMC <= 4 ? 'excellent' : avgBoardWipeCMC <= 5 ? 'good' : 'poor',
    },
    counterspells: {
      count: counterspells.length,
      avgCMC: parseFloat(avgCounterCMC.toFixed(2)),
      efficient: efficientCounters,
      quality: avgCounterCMC <= 2 ? 'excellent' : avgCounterCMC <= 3 ? 'good' : 'poor',
    },
    overallEfficiency: parseFloat((overallEfficiency * 100).toFixed(1)),
    rating: overallEfficiency >= 0.6 ? 'excellent' :
            overallEfficiency >= 0.4 ? 'good' :
            overallEfficiency >= 0.2 ? 'adequate' : 'poor',
  };
}

/**
 * Get comprehensive interaction report
 * @param {Array} decklist - Array of card objects
 * @param {Array} colors - Color identity
 * @returns {Object} Complete interaction analysis
 */
export function getInteractionReport(decklist, colors = []) {
  const analysis = analyzeInteraction(decklist);
  const score = scoreInteractionPackage(decklist);
  const gaps = identifyInteractionGaps(decklist, colors);
  const quality = evaluateRemovalQuality(decklist);
  const suggestions = suggestInteraction(decklist, colors);

  return {
    summary: {
      total: analysis.total,
      score: score.score,
      rating: score.rating,
    },
    breakdown: analysis.breakdown,
    quality,
    gaps,
    suggestions,
  };
}

export default {
  interactionCategories,
  analyzeInteraction,
  scoreInteractionPackage,
  identifyInteractionGaps,
  suggestInteraction,
  evaluateRemovalQuality,
  getInteractionReport,
};
