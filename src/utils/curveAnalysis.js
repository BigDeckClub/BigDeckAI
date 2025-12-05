/**
 * Mana Curve Analysis
 * Analyzes and visualizes the converted mana cost distribution
 */

/**
 * Calculate mana curve from deck list
 * @param {Array} deck - Deck list
 * @returns {Object} Mana curve data
 */
export function calculateManaCurve(deck) {
  const curve = {
    0: 0,
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
    '7+': 0,
  };

  let totalCMC = 0;
  let cardCount = 0;

  deck.forEach(card => {
    // Skip lands in curve calculation
    if (card.type_line?.includes('Land')) {
      return;
    }

    const cmc = card.cmc || 0;
    cardCount++;
    totalCMC += cmc;

    if (cmc >= 7) {
      curve['7+']++;
    } else {
      curve[cmc]++;
    }
  });

  const avgCMC = cardCount > 0 ? (totalCMC / cardCount).toFixed(2) : 0;

  return {
    curve,
    avgCMC: parseFloat(avgCMC),
    totalNonLandCards: cardCount,
  };
}

/**
 * Visualize mana curve as ASCII chart
 * @param {Object} curve - Curve data from calculateManaCurve
 * @returns {string} ASCII visualization
 */
export function visualizeManaCurve(curve) {
  const maxCount = Math.max(...Object.values(curve));
  const scale = 20; // Max bar length

  let output = '\nMana Curve:\n';
  output += '─'.repeat(30) + '\n';

  for (const [cmc, count] of Object.entries(curve)) {
    const barLength = maxCount > 0 ? Math.round((count / maxCount) * scale) : 0;
    const bar = '█'.repeat(barLength);
    output += `${cmc.toString().padStart(3)}: ${bar} ${count}\n`;
  }

  output += '─'.repeat(30) + '\n';

  return output;
}

/**
 * Analyze mana curve and provide recommendations
 * @param {Array} deck - Deck list
 * @param {string} strategy - Deck strategy
 * @returns {Object} Analysis with recommendations
 */
export function analyzeManaCurve(deck, strategy = 'midrange') {
  const { curve, avgCMC, totalNonLandCards } = calculateManaCurve(deck);
  const recommendations = [];
  const warnings = [];

  // Expected average CMC by strategy
  const expectedCMC = {
    aggro: { min: 2.0, max: 3.0, optimal: 2.5 },
    midrange: { min: 3.0, max: 3.5, optimal: 3.2 },
    control: { min: 3.5, max: 4.5, optimal: 4.0 },
    combo: { min: 2.5, max: 3.5, optimal: 3.0 },
  };

  const expected = expectedCMC[strategy] || expectedCMC.midrange;

  // Check average CMC
  if (avgCMC < expected.min) {
    warnings.push(
      `Average CMC (${avgCMC}) is lower than expected for ${strategy} (${expected.min}-${expected.max}). ` +
      `Deck may lack impactful late-game cards.`
    );
  } else if (avgCMC > expected.max) {
    warnings.push(
      `Average CMC (${avgCMC}) is higher than expected for ${strategy} (${expected.min}-${expected.max}). ` +
      `Deck may be too slow.`
    );
  }

  // Check early game (CMC 1-2)
  const earlyGame = curve[1] + curve[2];
  if (strategy === 'aggro' && earlyGame < 15) {
    warnings.push(
      `Aggro deck should have more early plays (1-2 CMC). Currently: ${earlyGame}`
    );
  } else if (earlyGame < 8) {
    recommendations.push(
      `Consider adding more early plays (1-2 CMC) for consistency. Currently: ${earlyGame}`
    );
  }

  // Check mid game (CMC 3-4)
  const midGame = curve[3] + curve[4];
  if (midGame < 15) {
    recommendations.push(
      `Consider more mid-game plays (3-4 CMC). Currently: ${midGame}`
    );
  }

  // Check late game (CMC 6+)
  const lateGame = curve[6] + curve['7+'];
  if (strategy === 'control' && lateGame < 8) {
    recommendations.push(
      `Control decks benefit from more finishers (6+ CMC). Currently: ${lateGame}`
    );
  } else if (lateGame > 15) {
    warnings.push(
      `Many high-cost cards (${lateGame} cards at 6+ CMC). May have consistency issues.`
    );
  }

  // Check for dead zones
  for (let cmc = 1; cmc <= 6; cmc++) {
    if (curve[cmc] === 0) {
      recommendations.push(
        `Gap in curve at ${cmc} CMC. Consider filling this slot for smoother gameplay.`
      );
    }
  }

  return {
    curve,
    avgCMC,
    totalNonLandCards,
    recommendations,
    warnings,
    visualization: visualizeManaCurve(curve),
  };
}

/**
 * Calculate ideal curve for a strategy
 * @param {string} strategy - Deck strategy
 * @param {number} totalCards - Total non-land cards
 * @returns {Object} Ideal curve distribution
 */
export function getIdealCurve(strategy = 'midrange', totalCards = 63) {
  const distributions = {
    aggro: {
      0: 0.02,
      1: 0.08,
      2: 0.20,
      3: 0.22,
      4: 0.20,
      5: 0.15,
      6: 0.08,
      '7+': 0.05,
    },
    midrange: {
      0: 0.02,
      1: 0.05,
      2: 0.18,
      3: 0.22,
      4: 0.20,
      5: 0.15,
      6: 0.10,
      '7+': 0.08,
    },
    control: {
      0: 0.02,
      1: 0.03,
      2: 0.15,
      3: 0.18,
      4: 0.20,
      5: 0.18,
      6: 0.12,
      '7+': 0.12,
    },
    combo: {
      0: 0.03,
      1: 0.08,
      2: 0.20,
      3: 0.22,
      4: 0.18,
      5: 0.15,
      6: 0.08,
      '7+': 0.06,
    },
  };

  const distribution = distributions[strategy] || distributions.midrange;
  const ideal = {};

  for (const [cmc, percentage] of Object.entries(distribution)) {
    ideal[cmc] = Math.round(totalCards * percentage);
  }

  return ideal;
}

/**
 * Compare deck curve to ideal curve
 * @param {Array} deck - Deck list
 * @param {string} strategy - Deck strategy
 * @returns {Object} Comparison data
 */
export function compareCurveToIdeal(deck, strategy = 'midrange') {
  const { curve, avgCMC } = calculateManaCurve(deck);
  const nonLandCount = deck.filter(c => !c.type_line?.includes('Land')).length;
  const ideal = getIdealCurve(strategy, nonLandCount);

  const comparison = {};
  for (const cmc of Object.keys(curve)) {
    comparison[cmc] = {
      actual: curve[cmc],
      ideal: ideal[cmc] || 0,
      difference: curve[cmc] - (ideal[cmc] || 0),
    };
  }

  return {
    comparison,
    avgCMC,
    strategy,
  };
}

/**
 * Get cards by CMC bracket
 * @param {Array} deck - Deck list
 * @param {number} minCMC - Minimum CMC
 * @param {number} maxCMC - Maximum CMC (null for no max)
 * @returns {Array} Filtered cards
 */
export function getCardsByCMC(deck, minCMC, maxCMC = null) {
  return deck.filter(card => {
    if (card.type_line?.includes('Land')) return false;
    
    const cmc = card.cmc || 0;
    if (maxCMC === null) {
      return cmc >= minCMC;
    }
    return cmc >= minCMC && cmc <= maxCMC;
  });
}

export default {
  calculateManaCurve,
  visualizeManaCurve,
  analyzeManaCurve,
  getIdealCurve,
  compareCurveToIdeal,
  getCardsByCMC,
};
