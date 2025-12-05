/**
 * Recommendation Engine
 * Enhanced recommendations using profile analysis and learning data
 */

class RecommendationEngine {
  constructor() {
    this.userHistory = [];
  }

  /**
   * Add user's deck to history
   * @param {Object} deck - Deck object with commander, strategy, etc.
   */
  addToHistory(deck) {
    this.userHistory.push({
      ...deck,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Analyze user's build history
   * @returns {Object} Historical patterns
   */
  analyzeHistory() {
    const commanders = {};
    const strategies = {};
    const colors = {};
    
    this.userHistory.forEach(deck => {
      // Count commanders
      if (deck.commander) {
        commanders[deck.commander] = (commanders[deck.commander] || 0) + 1;
      }
      
      // Count strategies
      if (deck.strategy) {
        strategies[deck.strategy] = (strategies[deck.strategy] || 0) + 1;
      }
      
      // Count colors
      if (deck.colors) {
        const colorKey = deck.colors.sort().join('');
        colors[colorKey] = (colors[colorKey] || 0) + 1;
      }
    });
    
    return {
      totalDecks: this.userHistory.length,
      commanders,
      strategies,
      colors,
      mostPlayedCommander: this.getMostCommon(commanders),
      favoriteStrategy: this.getMostCommon(strategies),
      favoriteColors: this.getMostCommon(colors),
    };
  }

  /**
   * Get most common item from frequency map
   * @param {Object} frequencyMap - Map of items to counts
   * @returns {string|null} Most common item
   */
  getMostCommon(frequencyMap) {
    const entries = Object.entries(frequencyMap);
    if (entries.length === 0) return null;
    
    return entries.sort((a, b) => b[1] - a[1])[0][0];
  }

  /**
   * Identify recurring staples in user's decks
   * @returns {Array} Common cards across decks
   */
  identifyStaples() {
    const cardFrequency = {};
    
    this.userHistory.forEach(deck => {
      if (deck.cards && Array.isArray(deck.cards)) {
        deck.cards.forEach(card => {
          const name = typeof card === 'string' ? card : card.name;
          cardFrequency[name] = (cardFrequency[name] || 0) + 1;
        });
      }
    });
    
    // Cards that appear in multiple decks are staples
    const staples = Object.entries(cardFrequency)
      .filter(([_, count]) => count > 1)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, appearances: count }));
    
    return staples;
  }

  /**
   * Identify gaps in user's deck building
   * @param {Object} profileAnalysis - Analysis from profile analyzer
   * @returns {Array} Suggestions for unexplored areas
   */
  identifyGaps(profileAnalysis) {
    const gaps = [];
    const history = this.analyzeHistory();
    
    // Check for color gaps
    const allColors = ['W', 'U', 'B', 'R', 'G'];
    const playedColors = new Set();
    
    Object.keys(history.colors || {}).forEach(colorCombo => {
      colorCombo.split('').forEach(c => playedColors.add(c));
    });
    
    const unplayedColors = allColors.filter(c => !playedColors.has(c));
    if (unplayedColors.length > 0) {
      gaps.push({
        type: 'colors',
        description: `Haven't explored: ${unplayedColors.join(', ')}`,
        suggestion: `Try building with ${unplayedColors[0]} (${this.colorName(unplayedColors[0])})`,
      });
    }
    
    // Check for strategy gaps
    const commonStrategies = [
      'aggro', 'control', 'combo', 'midrange', 'tribal',
      'voltron', 'aristocrats', 'tokens', 'spellslinger'
    ];
    
    const playedStrategies = Object.keys(history.strategies || {});
    const unplayedStrategies = commonStrategies.filter(s => !playedStrategies.includes(s));
    
    if (unplayedStrategies.length > 0) {
      gaps.push({
        type: 'strategies',
        description: `Unexplored strategies: ${unplayedStrategies.slice(0, 3).join(', ')}`,
        suggestion: `Consider trying a ${unplayedStrategies[0]} deck`,
      });
    }
    
    return gaps;
  }

  /**
   * Generate personalized recommendations
   * @param {Object} options - Recommendation options
   * @returns {Object} Personalized recommendations
   */
  generateRecommendations(options = {}) {
    const history = this.analyzeHistory();
    const staples = this.identifyStaples();
    const gaps = this.identifyGaps(options.profileAnalysis || {});
    
    const recommendations = {
      buildOnStrengths: [],
      exploreNew: [],
      budgetOptions: [],
      upgrades: [],
    };
    
    // Build on strengths
    if (history.favoriteStrategy) {
      recommendations.buildOnStrengths.push(
        `Continue exploring ${history.favoriteStrategy} - you've built ${history.strategies[history.favoriteStrategy]} decks in this style`
      );
    }
    
    if (history.favoriteColors) {
      recommendations.buildOnStrengths.push(
        `Try new commanders in your favorite colors: ${history.favoriteColors}`
      );
    }
    
    // Explore new areas
    gaps.forEach(gap => {
      recommendations.exploreNew.push(gap.suggestion);
    });
    
    // Upgrade suggestions based on staples
    if (staples.length > 0) {
      recommendations.upgrades.push(
        `You frequently use these cards: ${staples.slice(0, 3).map(s => s.name).join(', ')}`
      );
      recommendations.upgrades.push(
        'Consider acquiring premium versions or finding alternatives'
      );
    }
    
    return recommendations;
  }

  /**
   * Suggest budget substitutions
   * Note: This feature requires pricing data integration (TCGPlayer, CardKingdom, etc.)
   * Currently returns a placeholder structure
   * @param {Array} cardList - List of expensive cards
   * @returns {Object} Placeholder response
   */
  suggestBudgetSubstitutions(cardList) {
    // TODO: Integrate with pricing API to provide real budget alternatives
    return {
      note: 'Budget substitution feature requires pricing data integration',
      suggestion: 'This will be available once TCGPlayer or CardKingdom API integration is added',
      placeholder: cardList.map(card => ({
        original: card,
        needsPricingData: true,
      })),
    };
  }

  /**
   * Suggest new archetype based on history
   * @returns {Object} Archetype suggestion
   */
  suggestNewArchetype() {
    const history = this.analyzeHistory();
    const gaps = this.identifyGaps({});
    
    if (gaps.length > 0) {
      return {
        archetype: gaps[0].suggestion,
        reason: gaps[0].description,
      };
    }
    
    return {
      archetype: 'Try something completely different',
      reason: 'Expand your deck building repertoire',
    };
  }

  /**
   * Get color name
   * @param {string} color - Color letter
   * @returns {string} Color name
   */
  colorName(color) {
    const names = {
      'W': 'White',
      'U': 'Blue',
      'B': 'Black',
      'R': 'Red',
      'G': 'Green',
    };
    return names[color] || color;
  }

  /**
   * Clear user history
   */
  clearHistory() {
    this.userHistory = [];
  }

  /**
   * Export history to JSON
   * @returns {string} JSON string
   */
  exportHistory() {
    return JSON.stringify(this.userHistory, null, 2);
  }

  /**
   * Import history from JSON
   * @param {string} json - JSON string
   */
  importHistory(json) {
    try {
      const data = JSON.parse(json);
      this.userHistory = Array.isArray(data) ? data : [];
    } catch (error) {
      throw new Error(`Failed to import history: ${error.message}`);
    }
  }
}

// Export singleton instance
export const recommendationEngine = new RecommendationEngine();

export default recommendationEngine;
