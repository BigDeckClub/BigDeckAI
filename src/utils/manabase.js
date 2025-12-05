/**
 * Mana Base Calculator
 * Calculates and recommends mana base for Commander decks
 */

import { calculateColorDistribution } from './colorIdentity.js';

/**
 * Calculate recommended land count based on deck strategy
 * @param {string} strategy - Deck strategy (aggro, midrange, control, combo)
 * @param {number} avgCMC - Average converted mana cost
 * @returns {number} Recommended land count
 */
export function calculateLandCount(strategy = 'midrange', avgCMC = 3.0) {
  const baseLands = {
    aggro: 35,
    midrange: 37,
    control: 38,
    combo: 35,
  };

  let lands = baseLands[strategy] || 37;

  // Adjust based on average CMC
  if (avgCMC < 2.5) lands -= 1;
  if (avgCMC > 4.0) lands += 1;

  return Math.max(33, Math.min(40, lands));
}

/**
 * Calculate mana sources needed for each color
 * @param {Array} deck - Deck list
 * @param {number} totalLands - Total number of lands
 * @returns {Object} Recommended sources per color
 */
export function calculateColorSources(deck, totalLands = 37) {
  const distribution = calculateColorDistribution(deck);
  const sources = {};

  // Calculate total colored symbols
  const totalColoredSymbols = Object.entries(distribution)
    .filter(([color]) => color !== 'C')
    .reduce((sum, [, count]) => sum + count, 0);

  // Calculate sources needed for each color
  for (const [color, count] of Object.entries(distribution)) {
    if (color !== 'C' && count > 0) {
      const percentage = count / totalColoredSymbols;
      sources[color] = {
        symbols: count,
        percentage: Math.round(percentage * 100),
        minSources: Math.ceil(percentage * totalLands * 0.7), // At least 70% of proportional
        recommendedSources: Math.ceil(percentage * totalLands),
      };
    }
  }

  return sources;
}

/**
 * Generate mana base recommendations
 * @param {Array} deck - Deck list (non-land cards)
 * @param {Array|string} colorIdentity - Commander's color identity
 * @param {Object} options - Options (budget, strategy)
 * @returns {Object} Mana base recommendations
 */
export function generateManaBase(deck, colorIdentity, options = {}) {
  const {
    totalLands = 37,
    budget = 'medium', // low, medium, high
    includeUtility = true,
  } = options;

  const colors = Array.isArray(colorIdentity) ? colorIdentity : colorIdentity.split('');
  const colorCount = colors.length;
  const sources = calculateColorSources(deck, totalLands);

  const recommendations = {
    totalLands,
    basics: {},
    duals: [],
    utility: [],
    colorless: [],
  };

  // Mono-color mana base
  if (colorCount === 1) {
    const color = colors[0];
    recommendations.basics[color] = totalLands - 8;
    recommendations.utility = [
      'Command Tower',
      'Myriad Landscape',
      'Reliquary Tower',
      'Rogue\'s Passage',
    ];
    recommendations.colorless = [
      'War Room',
      'Bonders\' Enclave',
    ];
    return recommendations;
  }

  // Two-color mana base
  if (colorCount === 2) {
    const [color1, color2] = colors;
    const color1Need = sources[color1]?.recommendedSources || Math.floor(totalLands / 2);
    const color2Need = sources[color2]?.recommendedSources || Math.floor(totalLands / 2);

    recommendations.basics[color1] = Math.floor(color1Need * 0.5);
    recommendations.basics[color2] = Math.floor(color2Need * 0.5);

    recommendations.duals = [
      'Command Tower',
      'Path of Ancestry',
      `${getColorPairName(colors)} Guild Gate`,
      `${getColorPairName(colors)} Tap Land`,
    ];

    if (budget === 'high') {
      recommendations.duals.push(
        'Fetchland',
        'Shockland',
        'Original Dual',
      );
    } else if (budget === 'medium') {
      recommendations.duals.push(
        'Checkland',
        'Painland',
        'Filterland',
      );
    }

    if (includeUtility) {
      recommendations.utility = [
        'Reliquary Tower',
        'Rogue\'s Passage',
      ];
    }

    return recommendations;
  }

  // Three+ color mana base
  if (colorCount >= 3) {
    // Fewer basics for multi-color
    const basicsPerColor = Math.floor((totalLands * 0.3) / colorCount);
    colors.forEach(color => {
      recommendations.basics[color] = basicsPerColor;
    });

    recommendations.duals = [
      'Command Tower',
      'Path of Ancestry',
      'Exotic Orchard',
      'Reflecting Pool',
    ];

    if (colorCount === 3) {
      recommendations.duals.push(
        'Triland (Triome or Lairs)',
        'Tri-color Tap Lands',
      );
    }

    // Add fixing lands
    recommendations.duals.push(
      'Evolving Wilds',
      'Terramorphic Expanse',
    );

    if (budget === 'high') {
      recommendations.duals.push(
        'Fetchlands (all relevant)',
        'Shocklands (all relevant)',
        'Rainbow lands (City of Brass, Mana Confluence)',
      );
    } else if (budget === 'medium') {
      recommendations.duals.push(
        'Checklands',
        'Painlands',
        'Battlebond lands',
      );
    }

    if (includeUtility) {
      recommendations.utility = [
        'Reliquary Tower',
      ];
    }

    return recommendations;
  }

  return recommendations;
}

/**
 * Get color pair name for dual lands
 * @param {Array} colors - Two colors
 * @returns {string} Color pair name
 */
function getColorPairName(colors) {
  const pairs = {
    'WU': 'Azorius',
    'UB': 'Dimir',
    'BR': 'Rakdos',
    'RG': 'Gruul',
    'GW': 'Selesnya',
    'WB': 'Orzhov',
    'UR': 'Izzet',
    'BG': 'Golgari',
    'RW': 'Boros',
    'GU': 'Simic',
  };

  const key = colors.sort().join('');
  return pairs[key] || 'Dual';
}

/**
 * Analyze mana curve and recommend adjustments
 * @param {Array} deck - Deck list
 * @returns {Object} Analysis and recommendations
 */
export function analyzeManaRequirements(deck) {
  const distribution = calculateColorDistribution(deck);
  const analysis = {
    colorIntensity: {},
    recommendations: [],
  };

  // Check for color-intensive cards (multiple symbols of same color)
  for (const [color, count] of Object.entries(distribution)) {
    if (color !== 'C') {
      const intensity = count / deck.length;
      analysis.colorIntensity[color] = intensity;

      if (intensity > 0.4) {
        analysis.recommendations.push(
          `High ${color} requirement (${Math.round(intensity * 100)}%). ` +
          `Ensure at least ${Math.ceil(intensity * 40)} ${color} sources.`
        );
      }
    }
  }

  return analysis;
}

/**
 * Calculate total mana sources (including rocks/dorks)
 * @param {Array} deck - Full deck list including lands
 * @returns {Object} Total mana sources by type
 */
export function calculateTotalManaSources(deck) {
  const sources = {
    lands: 0,
    rocks: 0,
    dorks: 0,
    rampSpells: 0,
    total: 0,
  };

  deck.forEach(card => {
    if (!card.type_line) return;

    if (card.type_line.includes('Land')) {
      sources.lands++;
    } else if (card.type_line.includes('Artifact') && 
               (card.oracle_text?.includes('Add') || card.oracle_text?.includes('mana'))) {
      sources.rocks++;
    } else if (card.type_line.includes('Creature') && 
               card.oracle_text?.includes('{T}: Add')) {
      sources.dorks++;
    } else if ((card.type_line.includes('Sorcery') || card.type_line.includes('Instant')) &&
               (card.oracle_text?.includes('Search your library for a land') ||
                card.oracle_text?.includes('search your library for up to two basic land'))) {
      sources.rampSpells++;
    }
  });

  sources.total = sources.lands + sources.rocks + sources.dorks + sources.rampSpells;

  return sources;
}

export default {
  calculateLandCount,
  calculateColorSources,
  generateManaBase,
  analyzeManaRequirements,
  calculateTotalManaSources,
};
