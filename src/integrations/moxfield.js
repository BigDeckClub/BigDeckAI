/**
 * Moxfield API Integration
 * Unofficial API for accessing Moxfield decklist data
 * Documentation: https://api.moxfield.com/v2/docs
 */

import { config } from './config.js';

class MoxfieldAPI {
  constructor() {
    this.baseUrl = 'https://api.moxfield.com/v2';
    this.rateLimit = 100; // ms between requests
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
   * Make a request to Moxfield API
   * @param {string} endpoint - API endpoint
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} API response
   */
  async request(endpoint, params = {}) {
    await this.waitForRateLimit();
    
    const url = new URL(`${this.baseUrl}${endpoint}`);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value);
      }
    });

    try {
      const response = await fetch(url.toString(), {
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Moxfield API error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Moxfield API request failed:', error.message);
      throw error;
    }
  }

  /**
   * Get user's public decks
   * @param {string} username - Moxfield username
   * @param {number} pageNumber - Page number (default 1)
   * @param {number} pageSize - Results per page (default 12)
   * @returns {Promise<Object>} User's decks
   */
  async getUserDecks(username, pageNumber = 1, pageSize = 12) {
    return this.request(`/decks/search`, {
      pageNumber,
      pageSize,
      authors: username,
      sortType: 'updated',
      sortDirection: 'Descending',
    });
  }

  /**
   * Get a specific deck by ID
   * @param {string} deckId - Deck ID (public ID from URL)
   * @returns {Promise<Object>} Deck data
   */
  async getDeck(deckId) {
    return this.request(`/decks/all/${deckId}`);
  }

  /**
   * Get user's profile and statistics
   * @param {string} username - Moxfield username
   * @returns {Promise<Object>} User profile data
   */
  async getUserProfile(username) {
    try {
      const decks = await this.getUserDecks(username, 1, 50);
      
      // Analyze patterns from user's decks
      const analysis = {
        username,
        totalDecks: decks.totalResults || 0,
        decks: decks.data || [],
        patterns: this.analyzeUserPatterns(decks.data || []),
      };
      
      return analysis;
    } catch (error) {
      throw new Error(`Failed to fetch user profile: ${error.message}`);
    }
  }

  /**
   * Analyze patterns in user's decks
   * @param {Array} decks - Array of deck objects
   * @returns {Object} Analysis results
   */
  analyzeUserPatterns(decks) {
    const formats = {};
    const commanders = {};
    const colors = {};
    const themes = [];
    
    decks.forEach(deck => {
      // Count formats
      const format = deck.format || 'unknown';
      formats[format] = (formats[format] || 0) + 1;
      
      // Track commanders
      if (deck.commanders && deck.commanders.length > 0) {
        deck.commanders.forEach(commander => {
          const name = commander.card?.name || 'Unknown';
          commanders[name] = (commanders[name] || 0) + 1;
        });
      }
      
      // Track color combinations
      if (deck.colorIdentity && deck.colorIdentity.length > 0) {
        const colorCombo = deck.colorIdentity.sort().join('');
        colors[colorCombo] = (colors[colorCombo] || 0) + 1;
      }
      
      // Collect themes from names/descriptions
      if (deck.name) {
        themes.push(deck.name);
      }
    });
    
    return {
      formats,
      commanders,
      colors,
      favoriteFormat: Object.keys(formats).sort((a, b) => formats[b] - formats[a])[0],
      topCommanders: Object.entries(commanders)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count })),
      topColorCombos: Object.entries(colors)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([colors, count]) => ({ colors, count })),
    };
  }

  /**
   * Get detailed card list from a deck
   * @param {string} deckId - Deck ID
   * @returns {Promise<Array>} Card list with categories
   */
  async getDeckCardList(deckId) {
    const deck = await this.getDeck(deckId);
    
    const cardList = {
      commanders: [],
      mainboard: [],
      sideboard: [],
      maybeboard: [],
    };
    
    // Parse commanders
    if (deck.commanders) {
      Object.values(deck.commanders).forEach(commander => {
        if (commander.card) {
          cardList.commanders.push({
            name: commander.card.name,
            quantity: commander.quantity || 1,
            ...commander.card,
          });
        }
      });
    }
    
    // Parse mainboard
    if (deck.mainboard) {
      Object.values(deck.mainboard).forEach(card => {
        if (card.card) {
          cardList.mainboard.push({
            name: card.card.name,
            quantity: card.quantity || 1,
            ...card.card,
          });
        }
      });
    }
    
    return cardList;
  }
}

// Export singleton instance
export const moxfield = new MoxfieldAPI();

export default moxfield;
