/**
 * Machine Learning-Based Recommendation Module
 * Provides ML-inspired recommendations based on deck similarity
 */

/**
 * Minimum similarity threshold for deck recommendations
 * Only decks with >30% similarity are considered
 */
const MINIMUM_SIMILARITY_THRESHOLD = 0.3;

/**
 * Theme detection thresholds
 * Minimum card counts required to detect specific deck themes
 */
const THEME_THRESHOLDS = {
  tribal: 10,        // Minimum creatures of a tribe to detect tribal theme
  wheels: 3,         // Minimum wheel effects
  tokens: 10,        // Minimum token-related cards
  superfriends: 10,  // Minimum planeswalkers
  counters: 8,       // Minimum counter-related cards
  aristocrats: 8,    // Minimum sacrifice-related cards
};

/**
 * Extract features from a decklist for similarity comparison
 * @param {Array} decklist - Array of card objects
 * @returns {Object} Feature vector representing the deck
 */
export function extractDeckFeatures(decklist) {
  if (!Array.isArray(decklist) || decklist.length === 0) {
    return {
      colorIdentity: [],
      avgCMC: 0,
      cardTypes: {},
      keywords: [],
      themes: [],
      cardFrequency: {},
    };
  }

  // Extract color identity
  const colorIdentity = new Set();
  decklist.forEach(card => {
    if (card.colors) {
      card.colors.forEach(color => colorIdentity.add(color));
    }
  });

  // Calculate average CMC
  const nonLandCards = decklist.filter(card => !card.type?.includes('Land'));
  const avgCMC = nonLandCards.length > 0
    ? nonLandCards.reduce((sum, card) => sum + (card.cmc || 0), 0) / nonLandCards.length
    : 0;

  // Count card types
  const cardTypes = {};
  decklist.forEach(card => {
    const type = card.type || 'Unknown';
    // Extract primary type (Creature, Instant, Sorcery, etc.)
    const primaryType = type.split(/[-—]/)[0].trim().split(' ').pop();
    cardTypes[primaryType] = (cardTypes[primaryType] || 0) + 1;
  });

  // Extract keywords (simplified - would need card oracle text in real implementation)
  const keywords = [];
  decklist.forEach(card => {
    if (card.keywords) {
      keywords.push(...card.keywords);
    }
  });

  // Detect themes based on card names and types
  const themes = detectThemes(decklist);

  // Create card frequency map
  const cardFrequency = {};
  decklist.forEach(card => {
    cardFrequency[card.name] = (cardFrequency[card.name] || 0) + 1;
  });

  return {
    colorIdentity: Array.from(colorIdentity).sort(),
    avgCMC: parseFloat(avgCMC.toFixed(2)),
    cardTypes,
    keywords: [...new Set(keywords)],
    themes,
    cardFrequency,
    deckSize: decklist.length,
  };
}

/**
 * Detect themes in a decklist based on card patterns
 * @private
 * @param {Array} decklist - Array of card objects
 * @returns {Array} Array of detected themes
 */
function detectThemes(decklist) {
  const themes = [];
  const cardNames = decklist.map(card => card.name?.toLowerCase() || '');
  const cardTypes = decklist.map(card => card.type?.toLowerCase() || '');

  // Detect tribal themes
  const tribes = ['elf', 'goblin', 'zombie', 'vampire', 'dragon', 'wizard', 'merfolk', 'soldier'];
  for (const tribe of tribes) {
    const count = cardTypes.filter(type => type.includes(tribe)).length;
    if (count >= THEME_THRESHOLDS.tribal) {
      themes.push(`tribal_${tribe}`);
    }
  }

  // Detect strategy themes
  if (cardNames.filter(name => name.includes('wheel')).length >= THEME_THRESHOLDS.wheels) {
    themes.push('wheels');
  }
  if (cardNames.filter(name => name.includes('token') || name.includes('create')).length >= THEME_THRESHOLDS.tokens) {
    themes.push('tokens');
  }
  if (cardTypes.filter(type => type.includes('planeswalker')).length >= THEME_THRESHOLDS.superfriends) {
    themes.push('superfriends');
  }
  if (cardNames.filter(name => name.includes('counter') || name.includes('+1/+1')).length >= THEME_THRESHOLDS.counters) {
    themes.push('counters');
  }
  if (cardNames.filter(name => name.includes('sacrifice') || name.includes('death')).length >= THEME_THRESHOLDS.aristocrats) {
    themes.push('aristocrats');
  }

  return themes;
}

/**
 * Calculate similarity score between two decks
 * @param {Object} features1 - Feature vector of first deck
 * @param {Object} features2 - Feature vector of second deck
 * @returns {number} Similarity score (0-1, higher is more similar)
 */
export function calculateDeckSimilarity(features1, features2) {
  let score = 0;
  let weights = {
    colorIdentity: 0.25,
    avgCMC: 0.15,
    cardTypes: 0.20,
    themes: 0.25,
    sharedCards: 0.15,
  };

  // Color identity similarity
  const colors1 = new Set(features1.colorIdentity);
  const colors2 = new Set(features2.colorIdentity);
  const colorIntersection = new Set([...colors1].filter(c => colors2.has(c)));
  const colorUnion = new Set([...colors1, ...colors2]);
  const colorSimilarity = colorUnion.size > 0 ? colorIntersection.size / colorUnion.size : 0;
  score += colorSimilarity * weights.colorIdentity;

  // CMC similarity (inverse of difference)
  const cmcDiff = Math.abs(features1.avgCMC - features2.avgCMC);
  const cmcSimilarity = Math.max(0, 1 - (cmcDiff / 5)); // Normalize to 0-1
  score += cmcSimilarity * weights.avgCMC;

  // Card type distribution similarity
  const types1 = features1.cardTypes || {};
  const types2 = features2.cardTypes || {};
  const allTypes = new Set([...Object.keys(types1), ...Object.keys(types2)]);
  let typeScore = 0;
  for (const type of allTypes) {
    const count1 = types1[type] || 0;
    const count2 = types2[type] || 0;
    const maxCount = Math.max(count1, count2);
    if (maxCount > 0) {
      typeScore += Math.min(count1, count2) / maxCount;
    }
  }
  score += (typeScore / allTypes.size) * weights.cardTypes;

  // Theme similarity
  const themes1 = new Set(features1.themes || []);
  const themes2 = new Set(features2.themes || []);
  const themeIntersection = new Set([...themes1].filter(t => themes2.has(t)));
  const themeUnion = new Set([...themes1, ...themes2]);
  const themeSimilarity = themeUnion.size > 0 ? themeIntersection.size / themeUnion.size : 0;
  score += themeSimilarity * weights.themes;

  // Shared cards
  const cards1 = Object.keys(features1.cardFrequency || {});
  const cards2 = Object.keys(features2.cardFrequency || {});
  const sharedCards = cards1.filter(card => cards2.includes(card)).length;
  const totalUniqueCards = new Set([...cards1, ...cards2]).size;
  const cardSimilarity = totalUniqueCards > 0 ? sharedCards / totalUniqueCards : 0;
  score += cardSimilarity * weights.sharedCards;

  return parseFloat(score.toFixed(3));
}

/**
 * Find similar decks from a database of decks
 * @param {Array} targetDeck - The deck to find similar decks for
 * @param {Array} deckDatabase - Array of deck objects with decklist property
 * @param {number} limit - Maximum number of similar decks to return
 * @returns {Array} Array of similar decks with similarity scores
 */
export function findSimilarDecks(targetDeck, deckDatabase, limit = 10) {
  if (!Array.isArray(targetDeck) || !Array.isArray(deckDatabase)) {
    return [];
  }

  const targetFeatures = extractDeckFeatures(targetDeck);

  const similarities = deckDatabase
    .map(deck => {
      const deckFeatures = extractDeckFeatures(deck.decklist || []);
      const similarity = calculateDeckSimilarity(targetFeatures, deckFeatures);
      return {
        deck,
        similarity,
        matchedThemes: deckFeatures.themes.filter(t => targetFeatures.themes.includes(t)),
        colorMatch: JSON.stringify(targetFeatures.colorIdentity) === JSON.stringify(deckFeatures.colorIdentity),
      };
    })
    .filter(item => item.similarity > MINIMUM_SIMILARITY_THRESHOLD) // Only include reasonably similar decks
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);

  return similarities;
}

/**
 * Check if a card is a basic land
 * @private
 * @param {Object} card - Card object
 * @returns {boolean} True if card is a basic land
 */
function isBasicLand(card) {
  return card.type?.includes('Basic Land') || card.type?.includes('Basic Snow Land');
}

/**
 * Recommend cards based on similar decks
 * @param {Array} targetDeck - The deck to make recommendations for
 * @param {Array} deckDatabase - Array of deck objects
 * @param {number} count - Number of recommendations to return
 * @returns {Array} Array of recommended cards with reasons
 */
export function recommendFromSimilarDecks(targetDeck, deckDatabase, count = 10) {
  const similarDecks = findSimilarDecks(targetDeck, deckDatabase, 20);
  const existingCards = new Set(targetDeck.map(card => card.name));
  const recommendations = new Map();

  // Aggregate card frequencies from similar decks
  for (const { deck, similarity } of similarDecks) {
    const decklist = deck.decklist || [];
    for (const card of decklist) {
      if (existingCards.has(card.name)) continue;
      if (isBasicLand(card)) continue; // Skip basic lands

      if (!recommendations.has(card.name)) {
        recommendations.set(card.name, {
          name: card.name,
          type: card.type,
          cmc: card.cmc,
          appearances: 0,
          weightedScore: 0,
          similarDecks: [],
        });
      }

      const rec = recommendations.get(card.name);
      rec.appearances += 1;
      rec.weightedScore += similarity;
      if (rec.similarDecks.length < 3) {
        rec.similarDecks.push({
          name: deck.name,
          commander: deck.commander,
          similarity: similarity.toFixed(2),
        });
      }
    }
  }

  // Sort by weighted score and return top recommendations
  const sorted = Array.from(recommendations.values())
    .map(rec => ({
      ...rec,
      reason: `Found in ${rec.appearances} similar decks (avg similarity: ${(rec.weightedScore / rec.appearances).toFixed(2)})`,
      score: rec.weightedScore,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, count);

  return sorted;
}

/**
 * Train/update recommendation weights based on deck performance
 * This is a simplified version - in production would use actual ML
 * @param {Array} decklists - Array of successful deck objects with performance data
 * @returns {Object} Updated recommendation model
 */
export function trainOnDecklists(decklists) {
  if (!Array.isArray(decklists) || decklists.length === 0) {
    return {
      message: 'No training data provided',
      model: null,
    };
  }

  // Extract features from all decks
  const features = decklists.map(deck => ({
    features: extractDeckFeatures(deck.decklist || []),
    performance: deck.performance || 0,
    wins: deck.wins || 0,
    games: deck.games || 1,
  }));

  // Calculate average performance metrics by theme
  const themePerformance = {};
  for (const item of features) {
    for (const theme of item.features.themes) {
      if (!themePerformance[theme]) {
        themePerformance[theme] = { totalPerformance: 0, count: 0 };
      }
      themePerformance[theme].totalPerformance += item.performance;
      themePerformance[theme].count += 1;
    }
  }

  // Calculate average performance by color combination
  const colorPerformance = {};
  for (const item of features) {
    const colorKey = item.features.colorIdentity.join('');
    if (!colorPerformance[colorKey]) {
      colorPerformance[colorKey] = { totalPerformance: 0, count: 0 };
    }
    colorPerformance[colorKey].totalPerformance += item.performance;
    colorPerformance[colorKey].count += 1;
  }

  // Create performance averages
  const themeAverages = {};
  for (const [theme, data] of Object.entries(themePerformance)) {
    themeAverages[theme] = data.totalPerformance / data.count;
  }

  const colorAverages = {};
  for (const [color, data] of Object.entries(colorPerformance)) {
    colorAverages[color] = data.totalPerformance / data.count;
  }

  return {
    message: `Trained on ${decklists.length} decks`,
    model: {
      themePerformance: themeAverages,
      colorPerformance: colorAverages,
      averageWinRate: features.length > 0
        ? features.reduce((sum, f) => sum + (f.games > 0 ? f.wins / f.games : 0), 0) / features.length
        : 0,
      totalDecks: decklists.length,
    },
  };
}

/**
 * Get card recommendations with performance-based weighting
 * @param {Array} targetDeck - Target deck to recommend for
 * @param {Array} deckDatabase - Database of decks with performance data
 * @param {Object} model - Trained model from trainOnDecklists
 * @param {number} count - Number of recommendations
 * @returns {Array} Weighted recommendations
 */
export function getWeightedRecommendations(targetDeck, deckDatabase, model, count = 10) {
  const baseRecommendations = recommendFromSimilarDecks(targetDeck, deckDatabase, count * 2);
  const targetFeatures = extractDeckFeatures(targetDeck);

  // Apply performance-based weighting
  const weighted = baseRecommendations.map(rec => {
    let performanceBoost = 1.0;

    // Boost based on theme performance
    if (model?.themePerformance) {
      for (const theme of targetFeatures.themes) {
        if (model.themePerformance[theme]) {
          performanceBoost *= (1 + model.themePerformance[theme] / 10);
        }
      }
    }

    // Boost based on color performance
    const colorKey = targetFeatures.colorIdentity.join('');
    if (model?.colorPerformance?.[colorKey]) {
      performanceBoost *= (1 + model.colorPerformance[colorKey] / 10);
    }

    return {
      ...rec,
      adjustedScore: rec.score * performanceBoost,
      performanceBoost: performanceBoost.toFixed(2),
    };
  });

  return weighted
    .sort((a, b) => b.adjustedScore - a.adjustedScore)
    .slice(0, count);
}

export default {
  extractDeckFeatures,
  calculateDeckSimilarity,
  findSimilarDecks,
  recommendFromSimilarDecks,
  trainOnDecklists,
  getWeightedRecommendations,
};
