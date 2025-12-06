/**
 * Power Level Assessment Module
 * Categorizes decks by power level and provides adjustment suggestions
 */

/**
 * Power level tiers with descriptions
 */
export const powerLevelTiers = {
  casual: {
    range: [1, 3],
    name: 'Casual',
    description: 'Precon-level, theme over optimization',
    characteristics: {
      avgCMC: '3.5-4.5',
      fastMana: '0-2',
      tutors: '0-2',
      interaction: '5-8',
      winTurns: '12+',
      manaBaseQuality: 'low',
    },
  },
  focused: {
    range: [4, 6],
    name: 'Focused',
    description: 'Clear strategy, some optimization, budget considerations',
    characteristics: {
      avgCMC: '3.0-4.0',
      fastMana: '2-5',
      tutors: '2-5',
      interaction: '8-12',
      winTurns: '8-12',
      manaBaseQuality: 'medium',
    },
  },
  optimized: {
    range: [7, 8],
    name: 'Optimized',
    description: 'Strong synergies, efficient mana base, clear win conditions',
    characteristics: {
      avgCMC: '2.5-3.5',
      fastMana: '5-10',
      tutors: '5-10',
      interaction: '12-18',
      winTurns: '5-8',
      manaBaseQuality: 'high',
    },
  },
  cedh: {
    range: [9, 10],
    name: 'cEDH',
    description: 'Competitive, fast combos, optimal card choices',
    characteristics: {
      avgCMC: '1.5-2.5',
      fastMana: '10+',
      tutors: '8+',
      interaction: '15+',
      winTurns: '3-5',
      manaBaseQuality: 'optimal',
    },
  },
};

/**
 * Fast mana cards that significantly increase power level
 */
const fastManaCards = [
  'Sol Ring',
  'Mana Crypt',
  'Mana Vault',
  'Chrome Mox',
  'Mox Diamond',
  'Mox Opal',
  'Lion\'s Eye Diamond',
  'Lotus Petal',
  'Jeweled Lotus',
  'Ancient Tomb',
  'Grim Monolith',
  'Mox Amber',
  'Simian Spirit Guide',
  'Elvish Spirit Guide',
];

/**
 * Tutor cards that increase consistency
 */
const tutorCards = [
  'Demonic Tutor',
  'Vampiric Tutor',
  'Mystical Tutor',
  'Worldly Tutor',
  'Enlightened Tutor',
  'Imperial Seal',
  'Grim Tutor',
  'Diabolic Intent',
  'Survival of the Fittest',
  'Chord of Calling',
  'Green Sun\'s Zenith',
  'Expedition Map',
  'Crop Rotation',
  'Gamble',
  'Personal Tutor',
  'Merchant Scroll',
  'Muddle the Mixture',
  'Fabricate',
  'Whir of Invention',
  'Tainted Pact',
  'Demonic Consultation',
];

/**
 * Interaction cards (removal, counterspells, protection)
 */
const interactionCards = [
  'Counterspell',
  'Force of Will',
  'Force of Negation',
  'Fierce Guardianship',
  'Swan Song',
  'Pact of Negation',
  'Swords to Plowshares',
  'Path to Exile',
  'Beast Within',
  'Generous Gift',
  'Chaos Warp',
  'Cyclonic Rift',
  'Wrath of God',
  'Damnation',
  'Toxic Deluge',
  'Nature\'s Claim',
  'Abrupt Decay',
  'Assassin\'s Trophy',
  'Heroic Intervention',
  'Teferi\'s Protection',
];

/**
 * Premium fetch lands and dual lands
 */
const premiumLands = [
  'Polluted Delta',
  'Flooded Strand',
  'Bloodstained Mire',
  'Wooded Foothills',
  'Windswept Heath',
  'Marsh Flats',
  'Scalding Tarn',
  'Verdant Catacombs',
  'Arid Mesa',
  'Misty Rainforest',
  'Underground Sea',
  'Volcanic Island',
  'Tropical Island',
  'Bayou',
  'Savannah',
  'Scrubland',
  'Taiga',
  'Tundra',
  'Badlands',
  'Plateau',
  'Mana Confluence',
  'City of Brass',
  'Cavern of Souls',
  'Ancient Tomb',
  'Gaea\'s Cradle',
];

/**
 * Known combo pieces for infinite combos
 */
const comboPieces = [
  'Thassa\'s Oracle',
  'Demonic Consultation',
  'Tainted Pact',
  'Laboratory Maniac',
  'Isochron Scepter',
  'Dramatic Reversal',
  'Basalt Monolith',
  'Rings of Brighthearth',
  'Kiki-Jiki, Mirror Breaker',
  'Splinter Twin',
  'Deceiver Exarch',
  'Pestermite',
  'Worldgorger Dragon',
  'Animate Dead',
  'Deadeye Navigator',
];

/**
 * Calculate average CMC of non-land cards
 * @param {Array} decklist - Array of card objects with cmc property
 * @returns {number} Average converted mana cost
 */
export function calculateAverageCMC(decklist) {
  const nonLandCards = decklist.filter(card => !card.type?.includes('Land'));
  if (nonLandCards.length === 0) return 0;
  
  const totalCMC = nonLandCards.reduce((sum, card) => sum + (card.cmc || 0), 0);
  return totalCMC / nonLandCards.length;
}

/**
 * Count cards matching a list of names
 * @param {Array} decklist - Array of card objects
 * @param {Array} cardNames - Array of card names to match
 * @returns {number} Count of matching cards
 */
function countMatchingCards(decklist, cardNames) {
  return decklist.filter(card => 
    cardNames.some(name => card.name?.toLowerCase() === name.toLowerCase())
  ).length;
}

/**
 * Assess mana base quality
 * @param {Array} decklist - Array of card objects
 * @returns {Object} Mana base assessment
 */
function assessManaBase(decklist) {
  const lands = decklist.filter(card => card.type?.includes('Land'));
  const premiumCount = countMatchingCards(lands, premiumLands);
  const totalLands = lands.length;
  
  let quality;
  let score = 0;
  
  if (premiumCount >= 10) {
    quality = 'optimal';
    score = 4;
  } else if (premiumCount >= 5) {
    quality = 'high';
    score = 3;
  } else if (premiumCount >= 2) {
    quality = 'medium';
    score = 2;
  } else {
    quality = 'low';
    score = 1;
  }
  
  return {
    quality,
    score,
    premiumCount,
    totalLands,
    percentage: totalLands > 0 ? (premiumCount / totalLands * 100).toFixed(1) : 0,
  };
}

/**
 * Assess deck's power level with detailed breakdown
 * @param {Array} decklist - Array of card objects with name, type, cmc properties
 * @returns {Object} Power level assessment with score 1-10 and breakdown
 */
export function assessPowerLevel(decklist) {
  if (!Array.isArray(decklist) || decklist.length === 0) {
    return {
      score: 1,
      tier: 'casual',
      confidence: 'low',
      factors: {},
      breakdown: 'Empty or invalid decklist',
    };
  }

  const factors = getPowerLevelFactors(decklist);
  
  // Calculate weighted score
  let score = 0;
  let weights = {
    avgCMC: 2.5,
    fastMana: 2.0,
    tutors: 2.0,
    interaction: 1.5,
    manaBase: 1.5,
    combos: 1.5,
  };
  
  // Average CMC scoring (lower is better)
  const cmcScore = factors.avgCMC <= 2.5 ? 10 :
                   factors.avgCMC <= 3.0 ? 8 :
                   factors.avgCMC <= 3.5 ? 6 :
                   factors.avgCMC <= 4.0 ? 4 : 2;
  score += cmcScore * weights.avgCMC;
  
  // Fast mana scoring
  const fastManaScore = factors.fastManaCount >= 10 ? 10 :
                        factors.fastManaCount >= 5 ? 8 :
                        factors.fastManaCount >= 2 ? 5 : 2;
  score += fastManaScore * weights.fastMana;
  
  // Tutor scoring
  const tutorScore = factors.tutorCount >= 8 ? 10 :
                     factors.tutorCount >= 5 ? 8 :
                     factors.tutorCount >= 2 ? 5 : 2;
  score += tutorScore * weights.tutors;
  
  // Interaction scoring
  const interactionScore = factors.interactionCount >= 15 ? 10 :
                           factors.interactionCount >= 12 ? 8 :
                           factors.interactionCount >= 8 ? 6 : 4;
  score += interactionScore * weights.interaction;
  
  // Mana base scoring
  score += factors.manaBase.score * 2.5 * weights.manaBase;
  
  // Combo scoring
  const comboScore = factors.comboCount >= 3 ? 10 :
                     factors.comboCount >= 2 ? 7 :
                     factors.comboCount >= 1 ? 4 : 2;
  score += comboScore * weights.combos;
  
  // Normalize to 1-10 scale
  const maxScore = Object.values(weights).reduce((a, b) => a + b, 0) * 10;
  const normalizedScore = Math.min(10, Math.max(1, Math.round((score / maxScore) * 10)));
  
  // Determine tier
  let tier = 'casual';
  for (const [key, value] of Object.entries(powerLevelTiers)) {
    if (normalizedScore >= value.range[0] && normalizedScore <= value.range[1]) {
      tier = key;
      break;
    }
  }
  
  return {
    score: normalizedScore,
    tier,
    tierInfo: powerLevelTiers[tier],
    confidence: decklist.length >= 70 ? 'high' : decklist.length >= 40 ? 'medium' : 'low',
    factors,
    breakdown: generateBreakdown(normalizedScore, factors, tier),
  };
}

/**
 * Get detailed power level factors
 * @param {Array} decklist - Array of card objects
 * @returns {Object} Detailed analysis of power level factors
 */
export function getPowerLevelFactors(decklist) {
  const avgCMC = calculateAverageCMC(decklist);
  const fastManaCount = countMatchingCards(decklist, fastManaCards);
  const tutorCount = countMatchingCards(decklist, tutorCards);
  const interactionCount = countMatchingCards(decklist, interactionCards);
  const comboCount = countMatchingCards(decklist, comboPieces);
  const manaBase = assessManaBase(decklist);
  
  return {
    avgCMC: parseFloat(avgCMC.toFixed(2)),
    fastManaCount,
    tutorCount,
    interactionCount,
    comboCount,
    manaBase,
    deckSize: decklist.length,
  };
}

/**
 * Generate human-readable breakdown
 * @private
 */
function generateBreakdown(score, factors, tier) {
  const lines = [
    `Power Level: ${score}/10 (${powerLevelTiers[tier].name})`,
    `\nKey Factors:`,
    `- Average CMC: ${factors.avgCMC} ${factors.avgCMC <= 3.0 ? '(Efficient)' : factors.avgCMC <= 4.0 ? '(Moderate)' : '(High)'}`,
    `- Fast Mana: ${factors.fastManaCount} cards ${factors.fastManaCount >= 5 ? '(High)' : '(Low)'}`,
    `- Tutors: ${factors.tutorCount} cards ${factors.tutorCount >= 5 ? '(High)' : '(Low)'}`,
    `- Interaction: ${factors.interactionCount} cards ${factors.interactionCount >= 12 ? '(High)' : '(Moderate)'}`,
    `- Combo Pieces: ${factors.comboCount} cards`,
    `- Mana Base Quality: ${factors.manaBase.quality} (${factors.manaBase.premiumCount} premium lands)`,
  ];
  
  return lines.join('\n');
}

/**
 * Suggest adjustments to reach target power level
 * @param {Array} decklist - Array of card objects
 * @param {number} targetPowerLevel - Desired power level (1-10)
 * @returns {Object} Suggestions to adjust power level
 */
export function suggestPowerLevelAdjustments(decklist, targetPowerLevel) {
  const current = assessPowerLevel(decklist);
  const currentScore = current.score;
  
  if (currentScore === targetPowerLevel) {
    return {
      message: `Deck is already at power level ${targetPowerLevel}`,
      suggestions: [],
    };
  }
  
  const suggestions = [];
  const direction = targetPowerLevel > currentScore ? 'increase' : 'decrease';
  
  if (direction === 'increase') {
    // Suggestions to increase power level
    if (current.factors.avgCMC > 3.5) {
      suggestions.push({
        category: 'Mana Curve',
        suggestion: 'Lower average CMC by replacing high-cost cards with more efficient options',
        impact: 'Medium',
        examples: ['Replace 6+ CMC cards with 2-4 CMC alternatives'],
      });
    }
    
    if (current.factors.fastManaCount < 5) {
      suggestions.push({
        category: 'Fast Mana',
        suggestion: 'Add more fast mana sources',
        impact: 'High',
        examples: fastManaCards.slice(0, 5),
      });
    }
    
    if (current.factors.tutorCount < 5) {
      suggestions.push({
        category: 'Consistency',
        suggestion: 'Add tutors to increase consistency',
        impact: 'High',
        examples: tutorCards.slice(0, 5),
      });
    }
    
    if (current.factors.interactionCount < 12) {
      suggestions.push({
        category: 'Interaction',
        suggestion: 'Add more removal and counterspells',
        impact: 'Medium',
        examples: interactionCards.slice(0, 5),
      });
    }
    
    if (current.factors.manaBase.score < 3) {
      suggestions.push({
        category: 'Mana Base',
        suggestion: 'Upgrade mana base with fetch lands and dual lands',
        impact: 'Medium',
        examples: ['Fetch lands', 'Shock lands', 'Original dual lands'],
      });
    }
    
    if (current.factors.comboCount < 2 && targetPowerLevel >= 7) {
      suggestions.push({
        category: 'Win Conditions',
        suggestion: 'Add combo pieces for faster wins',
        impact: 'High',
        examples: comboPieces.slice(0, 5),
      });
    }
  } else {
    // Suggestions to decrease power level
    if (current.factors.fastManaCount > 5) {
      suggestions.push({
        category: 'Fast Mana',
        suggestion: 'Remove some fast mana to slow down the deck',
        impact: 'High',
        examples: ['Remove Mana Crypt, Mana Vault, or other fast mana'],
      });
    }
    
    if (current.factors.tutorCount > 5) {
      suggestions.push({
        category: 'Consistency',
        suggestion: 'Replace tutors with card draw to reduce consistency',
        impact: 'Medium',
        examples: ['Replace tutors with card draw spells'],
      });
    }
    
    if (current.factors.comboCount > 2) {
      suggestions.push({
        category: 'Win Conditions',
        suggestion: 'Remove combo pieces, focus on fair win conditions',
        impact: 'High',
        examples: ['Replace infinite combos with creature beatdown'],
      });
    }
    
    if (current.factors.avgCMC < 3.0 && targetPowerLevel <= 5) {
      suggestions.push({
        category: 'Mana Curve',
        suggestion: 'Include more fun high-cost bombs',
        impact: 'Low',
        examples: ['Add big splashy spells that are fun but less efficient'],
      });
    }
  }
  
  return {
    currentScore,
    targetScore: targetPowerLevel,
    direction,
    difference: Math.abs(targetPowerLevel - currentScore),
    suggestions,
    message: `To ${direction} power level from ${currentScore} to ${targetPowerLevel}:`,
  };
}

/**
 * Get recommended power level tier information
 * @param {number} powerLevel - Power level score 1-10
 * @returns {Object} Tier information
 */
export function getPowerLevelTier(powerLevel) {
  for (const [key, value] of Object.entries(powerLevelTiers)) {
    if (powerLevel >= value.range[0] && powerLevel <= value.range[1]) {
      return { ...value, key };
    }
  }
  return powerLevelTiers.casual;
}

export default {
  assessPowerLevel,
  getPowerLevelFactors,
  suggestPowerLevelAdjustments,
  getPowerLevelTier,
  powerLevelTiers,
  calculateAverageCMC,
};
