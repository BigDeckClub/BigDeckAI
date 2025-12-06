/**
 * Deck Analysis Module
 * Analyzes card draw, ramp, and other deck ratios
 */

/**
 * Ideal ratios by archetype
 */
export const idealRatios = {
  aggro: {
    ramp: 8,
    draw: 8,
    interaction: 6,
    threats: 35,
    lands: 35,
  },
  midrange: {
    ramp: 10,
    draw: 10,
    interaction: 10,
    threats: 30,
    lands: 37,
  },
  control: {
    ramp: 12,
    draw: 12,
    interaction: 15,
    threats: 20,
    lands: 38,
  },
  combo: {
    ramp: 12,
    draw: 15,
    interaction: 8,
    threats: 25,
    lands: 36,
  },
  tribal: {
    ramp: 8,
    draw: 10,
    interaction: 8,
    threats: 35,
    lands: 36,
  },
  voltron: {
    ramp: 8,
    draw: 10,
    interaction: 8,
    threats: 35,
    lands: 36,
  },
};

/**
 * Known card draw spells
 */
const cardDrawSpells = [
  'Rhystic Study', 'Mystic Remora', 'Esper Sentinel', 'Phyrexian Arena',
  'Necropotence', 'Sylvan Library', 'Wheel of Fortune', 'Windfall',
  'Harmonize', 'Sign in Blood', 'Night\'s Whisper', 'Read the Bones',
  'Ponder', 'Preordain', 'Brainstorm', 'Fact or Fiction',
  'Blue Sun\'s Zenith', 'Pull from Tomorrow', 'Stroke of Genius',
  'Rishkar\'s Expertise', 'Return of the Wildspeaker', 'Shamanic Revelation',
  'Skullclamp', 'Consecrated Sphinx', 'The One Ring', 'Bident of Thassa',
];

/**
 * Known ramp spells
 */
const rampSpells = [
  'Sol Ring', 'Arcane Signet', 'Rampant Growth', 'Cultivate',
  'Kodama\'s Reach', 'Three Visits', 'Nature\'s Lore', 'Farseek',
  'Sakura-Tribe Elder', 'Wood Elves', 'Farhaven Elf', 'Solemn Simulacrum',
  'Mana Crypt', 'Mana Vault', 'Chrome Mox', 'Mox Diamond',
  'Llanowar Elves', 'Birds of Paradise', 'Elvish Mystic', 'Noble Hierarch',
  'Signets', 'Talismans', 'Fellwar Stone', 'Mind Stone',
  'Worn Powerstone', 'Thran Dynamo', 'Gilded Lotus',
];

/**
 * Analyze card advantage sources in a deck
 * @param {Array} decklist - Array of card objects
 * @returns {Object} Card advantage analysis
 */
export function analyzeCardAdvantage(decklist) {
  if (!Array.isArray(decklist)) {
    return {
      count: 0,
      cards: [],
      quality: 'none',
      rating: 0,
    };
  }

  const cardDrawCards = [];
  const impulseDrawCards = [];
  const recursionCards = [];

  for (const card of decklist) {
    const name = card.name?.toLowerCase() || '';
    const text = card.oracle_text?.toLowerCase() || '';

    // Identify card draw
    if (cardDrawSpells.some(spell => name.includes(spell.toLowerCase())) ||
        (text.includes('draw') && (text.includes('card') || text.includes('cards')))) {
      cardDrawCards.push({
        name: card.name,
        type: card.type,
        quality: cardDrawSpells.some(s => name.includes(s.toLowerCase())) ? 'high' : 'medium',
      });
    }

    // Identify impulse draw (exile and play)
    if (text.includes('exile') && (text.includes('may play') || text.includes('may cast'))) {
      impulseDrawCards.push({
        name: card.name,
        type: card.type,
        quality: 'medium',
      });
    }

    // Identify recursion
    if ((text.includes('return') || text.includes('reanimate')) && 
        (text.includes('graveyard') || text.includes('from your graveyard'))) {
      recursionCards.push({
        name: card.name,
        type: card.type,
        quality: 'medium',
      });
    }
  }

  const totalCount = cardDrawCards.length + impulseDrawCards.length + recursionCards.length;
  const quality = 
    totalCount >= 12 ? 'excellent' :
    totalCount >= 10 ? 'good' :
    totalCount >= 8 ? 'adequate' :
    totalCount >= 5 ? 'low' : 'insufficient';

  const rating = Math.min(10, Math.round(totalCount * 0.8));

  return {
    count: totalCount,
    cardDraw: cardDrawCards.length,
    impulseDraw: impulseDrawCards.length,
    recursion: recursionCards.length,
    cards: {
      cardDraw: cardDrawCards,
      impulseDraw: impulseDrawCards,
      recursion: recursionCards,
    },
    quality,
    rating,
    percentage: parseFloat((totalCount / decklist.length * 100).toFixed(1)),
  };
}

/**
 * Analyze ramp package in a deck
 * @param {Array} decklist - Array of card objects
 * @returns {Object} Ramp analysis
 */
export function analyzeRampPackage(decklist) {
  if (!Array.isArray(decklist)) {
    return {
      count: 0,
      cards: [],
      quality: 'none',
      rating: 0,
    };
  }

  const manaRocks = [];
  const manaDorks = [];
  const landRamp = [];
  const costReducers = [];

  for (const card of decklist) {
    const name = card.name?.toLowerCase() || '';
    const type = card.type?.toLowerCase() || '';
    const text = card.oracle_text?.toLowerCase() || '';

    // Identify mana rocks
    if ((type.includes('artifact') && text.includes('add')) ||
        rampSpells.some(spell => name.includes(spell.toLowerCase())) && type.includes('artifact')) {
      manaRocks.push({
        name: card.name,
        cmc: card.cmc,
        quality: card.cmc <= 2 ? 'high' : 'medium',
      });
    }

    // Identify mana dorks
    if (type.includes('creature') && text.includes('add') && text.includes('mana')) {
      manaDorks.push({
        name: card.name,
        cmc: card.cmc,
        quality: card.cmc === 1 ? 'high' : 'medium',
      });
    }

    // Identify land ramp
    if ((text.includes('search') && text.includes('land')) ||
        (text.includes('put') && text.includes('land') && text.includes('battlefield'))) {
      landRamp.push({
        name: card.name,
        cmc: card.cmc,
        quality: card.cmc <= 3 ? 'high' : 'medium',
      });
    }

    // Identify cost reducers
    if (text.includes('cost') && (text.includes('less') || text.includes('reduce'))) {
      costReducers.push({
        name: card.name,
        type: card.type,
        quality: 'medium',
      });
    }
  }

  const totalCount = manaRocks.length + manaDorks.length + landRamp.length + costReducers.length;
  const quality = 
    totalCount >= 12 ? 'excellent' :
    totalCount >= 10 ? 'good' :
    totalCount >= 8 ? 'adequate' :
    totalCount >= 5 ? 'low' : 'insufficient';

  const rating = Math.min(10, Math.round(totalCount * 0.8));

  return {
    count: totalCount,
    manaRocks: manaRocks.length,
    manaDorks: manaDorks.length,
    landRamp: landRamp.length,
    costReducers: costReducers.length,
    cards: {
      manaRocks,
      manaDorks,
      landRamp,
      costReducers,
    },
    quality,
    rating,
    percentage: parseFloat((totalCount / decklist.length * 100).toFixed(1)),
  };
}

/**
 * Get ideal ratios for an archetype and colors
 * @param {string} archetype - Deck archetype
 * @param {Array} colors - Color identity
 * @returns {Object} Recommended ratios
 */
export function getIdealRatios(archetype, colors = []) {
  const baseRatios = idealRatios[archetype] || idealRatios.midrange;
  
  // Return a new object with adjustments applied functionally
  return {
    ...baseRatios,
    // Green decks benefit from additional ramp sources
    ramp: colors.includes('G')
      ? Math.min(baseRatios.ramp + 2, 15)
      : baseRatios.ramp,
    // Blue decks need more card draw
    draw: colors.includes('U')
      ? Math.min(baseRatios.draw + 2, 18)
      : baseRatios.draw,
    // Azorius colors get extra interaction
    interaction: (colors.includes('W') && colors.includes('U'))
      ? Math.min(baseRatios.interaction + 2, 18)
      : baseRatios.interaction,
  };
}

/**
 * Suggest improvements to deck ratios
 * @param {Array} decklist - Array of card objects
 * @param {string} archetype - Deck archetype
 * @param {Array} colors - Color identity
 * @returns {Object} Ratio improvement suggestions
 */
export function suggestRatioImprovements(decklist, archetype = 'midrange', colors = []) {
  const drawAnalysis = analyzeCardAdvantage(decklist);
  const rampAnalysis = analyzeRampPackage(decklist);
  const idealRatio = getIdealRatios(archetype, colors);

  const suggestions = [];

  // Check card draw
  if (drawAnalysis.count < idealRatio.draw) {
    const deficit = idealRatio.draw - drawAnalysis.count;
    suggestions.push({
      category: 'Card Draw',
      issue: `Only ${drawAnalysis.count} card draw sources (recommended: ${idealRatio.draw})`,
      recommendation: `Add ${deficit} more card draw sources`,
      severity: deficit >= 5 ? 'high' : deficit >= 3 ? 'medium' : 'low',
      examples: colors.includes('U') 
        ? ['Rhystic Study', 'Mystic Remora', 'Fact or Fiction']
        : colors.includes('G')
        ? ['Harmonize', 'Beast Whisperer', 'Return of the Wildspeaker']
        : colors.includes('B')
        ? ['Necropotence', 'Phyrexian Arena', 'Night\'s Whisper']
        : ['Skullclamp', 'Esper Sentinel', 'Mentor of the Meek'],
    });
  }

  // Check ramp
  if (rampAnalysis.count < idealRatio.ramp) {
    const deficit = idealRatio.ramp - rampAnalysis.count;
    suggestions.push({
      category: 'Ramp',
      issue: `Only ${rampAnalysis.count} ramp sources (recommended: ${idealRatio.ramp})`,
      recommendation: `Add ${deficit} more ramp sources`,
      severity: deficit >= 5 ? 'high' : deficit >= 3 ? 'medium' : 'low',
      examples: colors.includes('G')
        ? ['Cultivate', 'Nature\'s Lore', 'Three Visits']
        : ['Sol Ring', 'Arcane Signet', 'Mind Stone'],
    });
  }

  // Check if too much
  if (drawAnalysis.count > idealRatio.draw + 5) {
    suggestions.push({
      category: 'Card Draw',
      issue: `Too many card draw sources (${drawAnalysis.count})`,
      recommendation: 'Consider cutting some card draw for other categories',
      severity: 'low',
    });
  }

  if (rampAnalysis.count > idealRatio.ramp + 5) {
    suggestions.push({
      category: 'Ramp',
      issue: `Too much ramp (${rampAnalysis.count})`,
      recommendation: 'Consider cutting some ramp for threats',
      severity: 'low',
    });
  }

  return {
    archetype,
    colors,
    idealRatios: idealRatio,
    current: {
      draw: drawAnalysis.count,
      ramp: rampAnalysis.count,
    },
    suggestions,
    overallRating: Math.min(10, Math.round((drawAnalysis.rating + rampAnalysis.rating) / 2)),
  };
}

/**
 * Comprehensive deck balance analysis
 * @param {Array} decklist - Array of card objects
 * @param {string} archetype - Deck archetype
 * @returns {Object} Complete deck balance analysis
 */
export function analyzeDeckBalance(decklist, archetype = 'midrange') {
  const draw = analyzeCardAdvantage(decklist);
  const ramp = analyzeRampPackage(decklist);

  // Count lands
  const lands = decklist.filter(card => card.type?.includes('Land')).length;

  // Count creatures
  const creatures = decklist.filter(card => card.type?.includes('Creature')).length;

  // Count instants and sorceries
  const instants = decklist.filter(card => card.type?.includes('Instant')).length;
  const sorceries = decklist.filter(card => card.type?.includes('Sorcery')).length;

  return {
    deckSize: decklist.length,
    lands,
    creatures,
    instants,
    sorceries,
    cardDraw: draw,
    ramp,
    balance: {
      landsPercentage: parseFloat((lands / decklist.length * 100).toFixed(1)),
      creaturesPercentage: parseFloat((creatures / decklist.length * 100).toFixed(1)),
      spellsPercentage: parseFloat(((instants + sorceries) / decklist.length * 100).toFixed(1)),
    },
    overallRating: Math.round((draw.rating + ramp.rating) / 2),
  };
}

export default {
  idealRatios,
  analyzeCardAdvantage,
  analyzeRampPackage,
  getIdealRatios,
  suggestRatioImprovements,
  analyzeDeckBalance,
};
