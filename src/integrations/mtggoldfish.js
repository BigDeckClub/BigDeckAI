/**
 * MTGGoldfish Integration
 * Scrapes MTGGoldfish profile and deck data for meta analysis
 */

class MTGGoldfishAPI {
  constructor() {
    this.baseUrl = 'https://www.mtggoldfish.com';
    this.rateLimit = 200; // ms between requests (be respectful)
    this.lastRequestTime = 0;
  }

  /**
   * Rate limiting: Wait if needed before making request
   */
  async waitForRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.rateLimit) {
      await new Promise(resolve => 
        setTimeout(resolve, this.rateLimit - timeSinceLastRequest)
      );
    }
    
    this.lastRequestTime = Date.now();
  }

  /**
   * Fetch HTML from MTGGoldfish
   * @param {string} path - URL path
   * @returns {Promise<string>} HTML content
   */
  async fetchHTML(path) {
    await this.waitForRateLimit();
    
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        headers: {
          'User-Agent': 'BigDeckAI/1.0 (Educational deck builder)',
        },
      });
      
      if (!response.ok) {
        throw new Error(`MTGGoldfish request failed: ${response.status}`);
      }
      
      return await response.text();
    } catch (error) {
      console.error('MTGGoldfish request failed:', error.message);
      throw error;
    }
  }

  /**
   * Parse deck list from HTML
   * @param {string} html - HTML content
   * @returns {Object} Parsed deck data
   */
  parseDeckHTML(html) {
    // Note: This uses basic regex parsing for demonstration
    // For production use, consider using a proper HTML parser library like:
    // - cheerio: npm install cheerio
    // - jsdom: npm install jsdom
    // These provide more reliable and maintainable HTML parsing
    
    const deck = {
      commander: null,
      mainboard: [],
      sideboard: [],
    };
    
    // Extract commander (if present)
    const commanderMatch = html.match(/<div class="deck-container-header">.*?Commander.*?<\/div>/is);
    if (commanderMatch) {
      const nameMatch = commanderMatch[0].match(/data-card-name="([^"]+)"/);
      if (nameMatch) {
        deck.commander = nameMatch[1];
      }
    }
    
    // Extract mainboard cards
    const mainboardSection = html.match(/<table class="deck-view-deck-table">.*?<\/table>/is);
    if (mainboardSection) {
      const cardMatches = [...mainboardSection[0].matchAll(/(\d+)\s+<a[^>]*>([^<]+)<\/a>/g)];
      cardMatches.forEach(match => {
        deck.mainboard.push({
          quantity: parseInt(match[1]),
          name: match[2].trim(),
        });
      });
    }
    
    return deck;
  }

  /**
   * Get deck by ID
   * @param {string} deckId - Deck ID from URL
   * @returns {Promise<Object>} Deck data
   */
  async getDeck(deckId) {
    const html = await this.fetchHTML(`/deck/${deckId}`);
    return this.parseDeckHTML(html);
  }

  /**
   * Get user's public decks (basic implementation)
   * @param {string} username - MTGGoldfish username
   * @returns {Promise<Object>} User's deck list
   */
  async getUserDecks(username) {
    try {
      const html = await this.fetchHTML(`/player/${username}`);
      
      // Extract deck links using regex
      const deckLinkPattern = /<a href="\/deck\/(\d+)"[^>]*>([^<]+)<\/a>/g;
      const decks = [];
      
      let match;
      while ((match = deckLinkPattern.exec(html)) !== null) {
        decks.push({
          id: match[1],
          name: match[2].trim(),
        });
      }
      
      return {
        username,
        decks,
        totalDecks: decks.length,
      };
    } catch (error) {
      throw new Error(`Failed to fetch user decks: ${error.message}`);
    }
  }

  /**
   * Get meta decks for a format
   * @param {string} format - Format name (e.g., 'commander')
   * @returns {Promise<Array>} Meta deck list
   */
  async getMetaDecks(format = 'commander') {
    try {
      const html = await this.fetchHTML(`/metagame/${format}`);
      
      // Extract meta decks
      const deckPattern = /<div class="archetype-tile">.*?<a href="([^"]+)"[^>]*>([^<]+)<\/a>.*?<span class="archetype-tile-statistic-value">([^<]+)<\/span>/gs;
      const decks = [];
      
      let match;
      while ((match = deckPattern.exec(html)) !== null) {
        decks.push({
          name: match[2].trim(),
          url: match[1],
          metaShare: match[3].trim(),
        });
      }
      
      return decks;
    } catch (error) {
      console.error('Failed to fetch meta decks:', error.message);
      // Return empty array if parsing fails
      return [];
    }
  }

  /**
   * Analyze user's brewing patterns
   * @param {string} username - MTGGoldfish username
   * @returns {Promise<Object>} Analysis of user's deck building patterns
   */
  async analyzeUserProfile(username) {
    const userDecks = await this.getUserDecks(username);
    
    // Fetch details for some decks to analyze patterns
    const detailedDecks = [];
    const maxDecksToAnalyze = Math.min(5, userDecks.decks.length);
    
    for (let i = 0; i < maxDecksToAnalyze; i++) {
      try {
        const deck = await this.getDeck(userDecks.decks[i].id);
        detailedDecks.push({
          ...userDecks.decks[i],
          ...deck,
        });
      } catch (error) {
        console.error(`Failed to fetch deck ${userDecks.decks[i].id}:`, error.message);
      }
    }
    
    // Analyze patterns
    const commanders = {};
    detailedDecks.forEach(deck => {
      if (deck.commander) {
        commanders[deck.commander] = (commanders[deck.commander] || 0) + 1;
      }
    });
    
    return {
      username,
      totalDecks: userDecks.totalDecks,
      analyzedDecks: detailedDecks.length,
      topCommanders: Object.entries(commanders)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count })),
      decks: detailedDecks,
    };
  }
}

// Export singleton instance
export const mtggoldfish = new MTGGoldfishAPI();

export default mtggoldfish;
