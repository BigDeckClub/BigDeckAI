/**
 * Meta Analysis
 * Analyzes format meta and trends
 */

import { mtggoldfish } from '../integrations/mtggoldfish.js';

class MetaAnalyzer {
  /**
   * Get meta analysis for a format
   * @param {string} format - Format name (e.g., 'commander')
   * @returns {Promise<Object>} Meta analysis
   */
  async analyzeFormat(format = 'commander') {
    try {
      console.log(`Analyzing ${format} meta...`);
      const metaDecks = await mtggoldfish.getMetaDecks(format);
      
      const analysis = {
        format,
        timestamp: new Date().toISOString(),
        totalDecks: metaDecks.length,
        topDecks: metaDecks.slice(0, 10),
        trends: this.identifyTrends(metaDecks),
        summary: this.generateMetaSummary(metaDecks),
      };
      
      return analysis;
    } catch (error) {
      throw new Error(`Failed to analyze meta: ${error.message}`);
    }
  }

  /**
   * Identify trends in meta decks
   * @param {Array} metaDecks - Array of meta deck data
   * @returns {Object} Identified trends
   */
  identifyTrends(metaDecks) {
    const trends = {
      popular: [],
      emerging: [],
      declining: [],
    };
    
    // Top 3 are definitely popular
    if (metaDecks.length >= 3) {
      trends.popular = metaDecks.slice(0, 3).map(d => d.name);
    }
    
    // Decks with lower meta share might be emerging
    const lowShareDecks = metaDecks.filter(d => {
      // Parse meta share, handling formats like "5.2%" or just "5.2"
      const shareStr = String(d.metaShare || '0').replace('%', '').trim();
      const share = parseFloat(shareStr);
      return !isNaN(share) && share > 0 && share < 5;
    });
    
    if (lowShareDecks.length > 0) {
      trends.emerging = lowShareDecks.slice(0, 3).map(d => d.name);
    }
    
    return trends;
  }

  /**
   * Generate meta summary
   * @param {Array} metaDecks - Array of meta deck data
   * @returns {Array} Summary points
   */
  generateMetaSummary(metaDecks) {
    const summary = [];
    
    if (metaDecks.length > 0) {
      summary.push(`Analyzed ${metaDecks.length} meta decks`);
      
      const topDeck = metaDecks[0];
      summary.push(`Most played: ${topDeck.name} (${topDeck.metaShare} of meta)`);
      
      if (metaDecks.length >= 3) {
        summary.push(`Top 3 strategies dominate the format`);
      }
    } else {
      summary.push('Unable to fetch current meta data');
      summary.push('Meta analysis requires web scraping which may be limited');
    }
    
    return summary;
  }

  /**
   * Compare deck to meta
   * @param {Object} deck - User's deck
   * @param {string} format - Format name
   * @returns {Promise<Object>} Comparison results
   */
  async compareDeckToMeta(deck, format = 'commander') {
    const meta = await this.analyzeFormat(format);
    
    const comparison = {
      deck: deck.name || 'User Deck',
      format,
      isMetaDeck: false,
      metaPosition: null,
      suggestions: [],
    };
    
    // Check if deck matches a meta deck
    const matchingDeck = meta.topDecks.find(d => 
      d.name.toLowerCase().includes(deck.commander?.toLowerCase() || '')
    );
    
    if (matchingDeck) {
      comparison.isMetaDeck = true;
      comparison.metaPosition = meta.topDecks.indexOf(matchingDeck) + 1;
      comparison.suggestions.push('This is a popular meta deck!');
      comparison.suggestions.push('Consider tech cards to gain edges in mirror matches');
    } else {
      comparison.suggestions.push('This is an off-meta deck');
      comparison.suggestions.push('Consider meta-specific hate cards or combo protection');
    }
    
    return comparison;
  }

  /**
   * Get format staples from meta
   * @param {string} format - Format name
   * @returns {Promise<Array>} Staple cards
   */
  async getFormatStaples(format = 'commander') {
    // This would analyze top decks and find common cards
    // For now, return a basic structure
    return {
      format,
      staples: [
        'Format staple detection requires detailed deck analysis',
        'This feature would aggregate cards across all meta decks',
      ],
      categories: {
        ramp: [],
        removal: [],
        draw: [],
        interaction: [],
      },
    };
  }

  /**
   * Track meta changes over time
   * @param {string} format - Format name
   * @returns {Object} Historical meta data
   */
  trackMetaChanges(format = 'commander') {
    // This would store and compare meta snapshots over time
    return {
      format,
      note: 'Historical meta tracking requires persistent storage',
      suggestion: 'Run regular meta analysis and store results to track changes',
    };
  }
}

// Export singleton instance
export const metaAnalyzer = new MetaAnalyzer();

export default metaAnalyzer;
