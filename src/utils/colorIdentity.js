/**
 * Color Identity Utilities
 * Helper functions for working with MTG color identity
 */

/**
 * Color constants
 */
export const COLORS = {
  W: 'White',
  U: 'Blue',
  B: 'Black',
  R: 'Red',
  G: 'Green',
};

export const COLOR_SYMBOLS = ['W', 'U', 'B', 'R', 'G'];

/**
 * Parse color identity from various formats
 * @param {string|Array} colors - Colors in various formats
 * @returns {Array} Sorted array of color symbols
 */
export function parseColorIdentity(colors) {
  if (Array.isArray(colors)) {
    return colors.sort((a, b) => 
      COLOR_SYMBOLS.indexOf(a) - COLOR_SYMBOLS.indexOf(b)
    );
  }

  if (typeof colors === 'string') {
    const found = [];
    for (const symbol of COLOR_SYMBOLS) {
      if (colors.includes(symbol)) {
        found.push(symbol);
      }
    }
    return found;
  }

  return [];
}

/**
 * Get color identity string from array
 * @param {Array} colors - Array of color symbols
 * @returns {string} Color identity string (e.g., 'WUB')
 */
export function getColorIdentityString(colors) {
  return parseColorIdentity(colors).join('');
}

/**
 * Check if a card's color identity is valid for a commander
 * @param {Array|string} cardColors - Card's color identity
 * @param {Array|string} commanderColors - Commander's color identity
 * @returns {boolean} True if valid
 */
export function isValidForCommander(cardColors, commanderColors) {
  const card = parseColorIdentity(cardColors);
  const commander = parseColorIdentity(commanderColors);

  return card.every(color => commander.includes(color));
}

/**
 * Get color combination name
 * @param {string|Array} colors - Color identity
 * @returns {string} Name of color combination
 */
export function getColorCombinationName(colors) {
  const identity = getColorIdentityString(colors);

  const names = {
    '': 'Colorless',
    'W': 'Mono-White',
    'U': 'Mono-Blue',
    'B': 'Mono-Black',
    'R': 'Mono-Red',
    'G': 'Mono-Green',
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
    'WUB': 'Esper',
    'UBR': 'Grixis',
    'BRG': 'Jund',
    'RGW': 'Naya',
    'GWU': 'Bant',
    'WBG': 'Abzan',
    'URW': 'Jeskai',
    'BGU': 'Sultai',
    'RWB': 'Mardu',
    'GUR': 'Temur',
    'WUBR': 'Yore',
    'UBRG': 'Glint',
    'BRGW': 'Dune',
    'RGWU': 'Ink',
    'GWUB': 'Witch',
    'WUBRG': 'Five-Color',
  };

  return names[identity] || identity;
}

/**
 * Calculate color weight in mana costs
 * @param {Array} deck - Deck list with mana costs
 * @returns {Object} Color distribution
 */
export function calculateColorDistribution(deck) {
  const distribution = {
    W: 0,
    U: 0,
    B: 0,
    R: 0,
    G: 0,
    C: 0, // Colorless
  };

  deck.forEach(card => {
    if (card.mana_cost) {
      for (const symbol of COLOR_SYMBOLS) {
        const regex = new RegExp(`\\{${symbol}\\}`, 'g');
        const matches = card.mana_cost.match(regex);
        if (matches) {
          distribution[symbol] += matches.length;
        }
      }
      // Count generic/colorless mana
      const colorlessMatches = card.mana_cost.match(/\{[0-9]+\}/g);
      if (colorlessMatches) {
        distribution.C += colorlessMatches.length;
      }
    }
  });

  return distribution;
}

/**
 * Get recommended mana base colors
 * @param {Object} distribution - Color distribution from calculateColorDistribution
 * @returns {Object} Recommended land counts by color
 */
export function getRecommendedManaBase(distribution) {
  const total = Object.values(distribution).reduce((sum, val) => sum + val, 0);
  const recommendations = {};

  for (const [color, count] of Object.entries(distribution)) {
    if (color !== 'C' && count > 0) {
      const percentage = count / total;
      recommendations[color] = {
        percentage: Math.round(percentage * 100),
        sources: Math.round(percentage * 38), // Assume 38 lands
      };
    }
  }

  return recommendations;
}

/**
 * Validate color identity of a deck
 * @param {Array} deck - Deck list
 * @param {Array|string} commanderColors - Commander's color identity
 * @returns {Object} Validation result
 */
export function validateDeckColorIdentity(deck, commanderColors) {
  const commander = parseColorIdentity(commanderColors);
  const invalid = [];

  deck.forEach(card => {
    if (card.color_identity && card.color_identity.length > 0) {
      if (!isValidForCommander(card.color_identity, commander)) {
        invalid.push({
          name: card.name,
          colors: card.color_identity,
          reason: `Color identity ${card.color_identity.join('')} not valid for commander ${commander.join('')}`,
        });
      }
    }
  });

  return {
    valid: invalid.length === 0,
    invalid,
  };
}

export default {
  COLORS,
  COLOR_SYMBOLS,
  parseColorIdentity,
  getColorIdentityString,
  isValidForCommander,
  getColorCombinationName,
  calculateColorDistribution,
  getRecommendedManaBase,
  validateDeckColorIdentity,
};
