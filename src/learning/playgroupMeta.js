/**
 * Playgroup Meta Adaptation Module
 * Learns from game results and adapts recommendations to local meta
 */

/**
 * Default playgroup profile structure
 */
export const defaultPlaygroupProfile = {
  powerLevel: 7,
  commonStrategies: [],
  frequentCommanders: [],
  hatedCards: [],
  preferredGameLength: 'medium', // short, medium, long
  avgTurnsToWin: 8,
  comboFrequency: 'medium', // low, medium, high
  interactionLevel: 'medium', // low, medium, high
  politicsLevel: 'medium', // low, medium, high
};

/**
 * Module-level game history for backwards compatibility
 * Note: This is a singleton that persists across module imports.
 * For isolated state, use createPlaygroupTracker() factory function.
 */
const gameHistory = [];

/**
 * Create a playgroup tracker with isolated state
 * Recommended for applications that need independent tracking instances
 * @returns {Object} Playgroup tracker with instance-specific methods
 */
export function createPlaygroupTracker() {
  const instanceGameHistory = [];
  
  return {
    recordGameResult: (gameData) => recordGameResultInternal(gameData, instanceGameHistory),
    analyzePlaygroupMeta: (games) => analyzePlaygroupMetaInternal(games || instanceGameHistory),
    adaptRecommendations: (recommendations, playgroupProfile) => adaptRecommendations(recommendations, playgroupProfile),
    suggestMetaCounters: (playgroupProfile, count) => suggestMetaCounters(playgroupProfile, count),
    getDeckWinRate: (deckName, games) => getDeckWinRate(deckName, games || instanceGameHistory),
    getGameHistory: () => [...instanceGameHistory],
    clearGameHistory: () => {
      instanceGameHistory.splice(0, instanceGameHistory.length);
      return { message: 'Game history cleared', totalGames: 0 };
    },
  };
}

/**
 * Internal implementation of recordGameResult
 * @private
 */
function recordGameResultInternal(gameData, historyArray) {
  const game = {
    ...gameData,
    timestamp: new Date().toISOString(),
    id: `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  };

  historyArray.push(game);

  return {
    message: 'Game recorded successfully',
    totalGames: historyArray.length,
    gameId: game.id,
  };
}

/**
 * Record a game result for analysis (module-level)
 * @param {Object} gameData - Game result data
 * @param {string} gameData.deckUsed - Deck/commander used
 * @param {string} gameData.result - 'win', 'loss', 'draw'
 * @param {number} gameData.turns - Number of turns the game lasted
 * @param {Array} gameData.opponentCommanders - Commanders faced
 * @param {string} gameData.notes - Additional notes
 * @returns {Object} Updated game history summary
 */
export function recordGameResult(gameData) {
  return recordGameResultInternal(gameData, gameHistory);
}

/**
 * Internal implementation of analyzePlaygroupMeta
 * @private
 */
function analyzePlaygroupMetaInternal(games) {
  if (!Array.isArray(games) || games.length === 0) {
    return {
      message: 'No game history available',
      profile: defaultPlaygroupProfile,
    };
  }

  // Calculate power level (based on game length)
  const avgTurns = games.reduce((sum, g) => sum + (g.turns || 10), 0) / games.length;
  const estimatedPowerLevel = 
    avgTurns <= 5 ? 9 :
    avgTurns <= 7 ? 8 :
    avgTurns <= 10 ? 7 :
    avgTurns <= 12 ? 6 : 5;

  // Find most common opponent commanders
  const commanderCounts = {};
  games.forEach(game => {
    (game.opponentCommanders || []).forEach(commander => {
      commanderCounts[commander] = (commanderCounts[commander] || 0) + 1;
    });
  });
  const frequentCommanders = Object.entries(commanderCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([commander, count]) => ({ commander, appearances: count }));

  // Detect common strategies from notes
  const strategyKeywords = {
    combo: ['combo', 'infinite', 'win con'],
    control: ['counter', 'removal', 'board wipe', 'control'],
    aggro: ['aggro', 'combat', 'attack', 'voltron'],
    stax: ['stax', 'tax', 'lock', 'denial'],
    graveyard: ['graveyard', 'reanimator', 'recursion'],
  };

  const strategyCounts = {};
  games.forEach(game => {
    const notes = (game.notes || '').toLowerCase();
    for (const [strategy, keywords] of Object.entries(strategyKeywords)) {
      if (keywords.some(kw => notes.includes(kw))) {
        strategyCounts[strategy] = (strategyCounts[strategy] || 0) + 1;
      }
    }
  });
  const commonStrategies = Object.entries(strategyCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([strategy]) => strategy);

  // Detect hated cards from notes
  const hatedCardKeywords = [
    'Rhystic Study', 'Smothering Tithe', 'Cyclonic Rift', 
    'Winter Orb', 'Stasis', 'Armageddon'
  ];
  const hatedCards = [];
  games.forEach(game => {
    const notes = (game.notes || '').toLowerCase();
    hatedCardKeywords.forEach(card => {
      if (notes.includes(card.toLowerCase()) && 
          (notes.includes('hate') || notes.includes('annoying') || notes.includes('unfun'))) {
        if (!hatedCards.includes(card)) {
          hatedCards.push(card);
        }
      }
    });
  });

  // Determine game length preference
  const preferredGameLength = 
    avgTurns <= 6 ? 'short' :
    avgTurns <= 12 ? 'medium' : 'long';

  // Detect combo frequency
  const comboGames = games.filter(g => 
    (g.notes || '').toLowerCase().includes('combo')
  ).length;
  const comboFrequency = 
    comboGames / games.length > 0.6 ? 'high' :
    comboGames / games.length > 0.3 ? 'medium' : 'low';

  return {
    profile: {
      powerLevel: estimatedPowerLevel,
      commonStrategies,
      frequentCommanders,
      hatedCards,
      preferredGameLength,
      avgTurnsToWin: parseFloat(avgTurns.toFixed(1)),
      comboFrequency,
      interactionLevel: estimatedPowerLevel >= 7 ? 'high' : 'medium',
      politicsLevel: preferredGameLength === 'long' ? 'high' : 'medium',
    },
    stats: {
      totalGames: games.length,
      avgGameLength: parseFloat(avgTurns.toFixed(1)),
      uniqueCommanders: Object.keys(commanderCounts).length,
    },
  };
}

/**
 * Analyze playgroup meta from game history (module-level)
 * @param {Array} games - Array of game result objects (defaults to all recorded games)
 * @returns {Object} Playgroup meta analysis
 */
export function analyzePlaygroupMeta(games = gameHistory) {
  return analyzePlaygroupMetaInternal(games);
}

/**
 * Adapt card recommendations based on playgroup meta
 * @param {Array} recommendations - Array of card recommendation objects
 * @param {Object} playgroupProfile - Playgroup meta profile
 * @returns {Array} Adjusted recommendations
 */
export function adaptRecommendations(recommendations, playgroupProfile) {
  if (!Array.isArray(recommendations)) {
    return [];
  }

  const profile = { ...defaultPlaygroupProfile, ...playgroupProfile };

  return recommendations.map(rec => {
    let score = rec.score || 1.0;
    let adjustmentReasons = [];

    // Check if card is hated
    if (profile.hatedCards?.some(hated => 
      rec.name?.toLowerCase().includes(hated.toLowerCase())
    )) {
      score *= 0.5;
      adjustmentReasons.push('Card is disliked in your playgroup');
    }

    // Adjust for power level
    const cardPowerLevel = estimateCardPowerLevel(rec.name);
    const powerDiff = Math.abs(cardPowerLevel - profile.powerLevel);
    if (powerDiff <= 1) {
      score *= 1.2;
      adjustmentReasons.push('Matches playgroup power level');
    } else if (powerDiff > 3) {
      score *= 0.8;
      adjustmentReasons.push(`May be ${cardPowerLevel > profile.powerLevel ? 'too strong' : 'too weak'} for your meta`);
    }

    // Adjust for common strategies
    if (rec.categories) {
      const matchesStrategy = profile.commonStrategies?.some(strat => 
        rec.categories.includes(strat)
      );
      if (matchesStrategy) {
        score *= 1.3;
        adjustmentReasons.push('Counters common strategies in your meta');
      }
    }

    // Adjust for combo frequency
    if (profile.comboFrequency === 'high') {
      if (isInteraction(rec.name)) {
        score *= 1.4;
        adjustmentReasons.push('Extra interaction valuable in combo-heavy meta');
      }
    }

    return {
      ...rec,
      adjustedScore: parseFloat(score.toFixed(2)),
      adjustmentReasons,
      metaRelevance: score > rec.score ? 'high' : score < rec.score ? 'low' : 'neutral',
    };
  }).sort((a, b) => b.adjustedScore - a.adjustedScore);
}

/**
 * Suggest cards to counter local meta
 * @param {Object} playgroupProfile - Playgroup meta profile
 * @param {number} count - Number of suggestions
 * @returns {Array} Meta-specific tech cards
 */
export function suggestMetaCounters(playgroupProfile, count = 10) {
  const profile = { ...defaultPlaygroupProfile, ...playgroupProfile };
  const suggestions = [];

  // Suggest interaction based on combo frequency
  if (profile.comboFrequency === 'high') {
    suggestions.push(
      { 
        name: 'Silence', 
        reason: 'Prevents combo turns', 
        category: 'Anti-Combo',
        relevance: 'high',
      },
      { 
        name: 'Grand Abolisher', 
        reason: 'Protects your combo turns', 
        category: 'Anti-Combo',
        relevance: 'high',
      },
      { 
        name: 'Rule of Law', 
        reason: 'Slows down storm and combo', 
        category: 'Stax',
        relevance: 'high',
      },
    );
  }

  // Suggest graveyard hate if common
  if (profile.commonStrategies?.includes('graveyard')) {
    suggestions.push(
      { 
        name: 'Rest in Peace', 
        reason: 'Shuts down graveyard strategies', 
        category: 'Graveyard Hate',
        relevance: 'high',
      },
      { 
        name: 'Bojuka Bog', 
        reason: 'Flexible graveyard hate', 
        category: 'Graveyard Hate',
        relevance: 'high',
      },
      { 
        name: 'Scavenging Ooze', 
        reason: 'Repeatable graveyard hate', 
        category: 'Graveyard Hate',
        relevance: 'medium',
      },
    );
  }

  // Suggest answers to common commanders
  if (profile.frequentCommanders?.length > 0) {
    suggestions.push(
      { 
        name: 'Darksteel Mutation', 
        reason: 'Neutralizes problematic commanders', 
        category: 'Commander Hate',
        relevance: 'high',
      },
      { 
        name: 'Song of the Dryads', 
        reason: 'Removes commander abilities', 
        category: 'Commander Hate',
        relevance: 'high',
      },
    );
  }

  // Suggest fast mana if power level is high
  if (profile.powerLevel >= 8) {
    suggestions.push(
      { 
        name: 'Mana Crypt', 
        reason: 'Keeps pace with high-power meta', 
        category: 'Fast Mana',
        relevance: 'high',
      },
      { 
        name: 'Jeweled Lotus', 
        reason: 'Fast commander deployment', 
        category: 'Fast Mana',
        relevance: 'high',
      },
    );
  }

  // Suggest protection if interaction is high
  if (profile.interactionLevel === 'high') {
    suggestions.push(
      { 
        name: 'Teferi\'s Protection', 
        reason: 'Ultimate protection in high-interaction meta', 
        category: 'Protection',
        relevance: 'high',
      },
      { 
        name: 'Heroic Intervention', 
        reason: 'Protects board from removal', 
        category: 'Protection',
        relevance: 'high',
      },
    );
  }

  // Suggest card draw for long games
  if (profile.preferredGameLength === 'long') {
    suggestions.push(
      { 
        name: 'Rhystic Study', 
        reason: 'Value engine for long games', 
        category: 'Card Draw',
        relevance: 'high',
      },
      { 
        name: 'Mystic Remora', 
        reason: 'Early game draw', 
        category: 'Card Draw',
        relevance: 'medium',
      },
    );
  }

  return suggestions.slice(0, count);
}

/**
 * Get win rate statistics for a specific deck
 * @param {string} deckName - Name of the deck
 * @param {Array} games - Game history (defaults to all games)
 * @returns {Object} Win rate statistics
 */
export function getDeckWinRate(deckName, games = gameHistory) {
  const deckGames = games.filter(g => g.deckUsed === deckName);
  if (deckGames.length === 0) {
    return {
      message: 'No games found for this deck',
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
    };
  }

  const wins = deckGames.filter(g => g.result === 'win').length;
  const losses = deckGames.filter(g => g.result === 'loss').length;

  return {
    deckName,
    gamesPlayed: deckGames.length,
    wins,
    losses,
    winRate: parseFloat((wins / deckGames.length * 100).toFixed(1)),
    avgTurns: parseFloat((deckGames.reduce((sum, g) => sum + (g.turns || 10), 0) / deckGames.length).toFixed(1)),
  };
}

/**
 * Estimate card power level (simplified)
 * @private
 */
function estimateCardPowerLevel(cardName) {
  const name = cardName?.toLowerCase() || '';
  
  // cEDH staples
  if (['mana crypt', 'thassa\'s oracle', 'demonic consultation', 'timetwister'].some(s => name.includes(s))) {
    return 9;
  }
  
  // High power staples
  if (['mana vault', 'force of will', 'cyclonic rift', 'rhystic study'].some(s => name.includes(s))) {
    return 8;
  }
  
  // Solid cards
  if (['sol ring', 'arcane signet', 'command tower'].some(s => name.includes(s))) {
    return 7;
  }
  
  return 6; // Default
}

/**
 * Check if a card is interaction
 * @private
 */
function isInteraction(cardName) {
  const name = cardName?.toLowerCase() || '';
  const interactionKeywords = [
    'counter', 'removal', 'destroy', 'exile', 'bounce', 
    'path', 'swords', 'wrath', 'board wipe'
  ];
  return interactionKeywords.some(kw => name.includes(kw));
}

/**
 * Get game history (for export/analysis)
 * @returns {Array} All recorded games
 */
export function getGameHistory() {
  return [...gameHistory];
}

/**
 * Clear game history (module-level)
 * @returns {Object} Confirmation
 */
export function clearGameHistory() {
  gameHistory.splice(0, gameHistory.length);
  return {
    message: 'Game history cleared',
    totalGames: 0,
  };
}

export default {
  defaultPlaygroupProfile,
  createPlaygroupTracker,
  recordGameResult,
  analyzePlaygroupMeta,
  adaptRecommendations,
  suggestMetaCounters,
  getDeckWinRate,
  getGameHistory,
  clearGameHistory,
};
