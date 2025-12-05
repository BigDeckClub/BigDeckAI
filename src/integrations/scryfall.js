/**
 * Scryfall API Integration
 * Free API for Magic: The Gathering card data
 * Documentation: https://scryfall.com/docs/api
 */

import { config } from './config.js';

class ScryfallAPI {
  constructor() {
    this.baseUrl = config.scryfall.baseUrl;
    this.rateLimit = config.scryfall.rateLimit;
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
   * Make a request to Scryfall API
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
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`Scryfall API error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Scryfall API request failed:', error.message);
      throw error;
    }
  }

  /**
   * Get a card by exact name
   * @param {string} name - Exact card name
   * @returns {Promise<Object>} Card data
   */
  async getCard(name) {
    return this.request('/cards/named', { exact: name });
  }

  /**
   * Search for cards using Scryfall syntax
   * @param {string} query - Scryfall search query
   * @param {Object} options - Search options (unique, order, dir, page)
   * @returns {Promise<Object>} Search results
   */
  async searchCards(query, options = {}) {
    return this.request('/cards/search', {
      q: query,
      unique: options.unique || 'cards',
      order: options.order || 'name',
      dir: options.dir || 'auto',
      page: options.page || 1,
    });
  }

  /**
   * Get a random legendary creature (potential commander)
   * @param {string} colors - Color identity (e.g., 'WUB', 'RG')
   * @returns {Promise<Object>} Random commander
   */
  async getRandomCommander(colors = null) {
    let query = 't:legendary t:creature legal:commander';
    
    if (colors) {
      query += ` id:${colors}`;
    }
    
    return this.request('/cards/random', { q: query });
  }

  /**
   * Get card name autocomplete suggestions
   * @param {string} partial - Partial card name
   * @returns {Promise<Array<string>>} Suggested card names
   */
  async autocomplete(partial) {
    const response = await this.request('/cards/autocomplete', { q: partial });
    return response.data || [];
  }

  /**
   * Get cards by set and collector number
   * @param {string} setCode - Set code (e.g., 'mh2')
   * @param {string} collectorNumber - Collector number
   * @returns {Promise<Object>} Card data
   */
  async getCardBySetAndNumber(setCode, collectorNumber) {
    return this.request(`/cards/${setCode}/${collectorNumber}`);
  }

  /**
   * Get all sets
   * @returns {Promise<Array>} List of all sets
   */
  async getSets() {
    const response = await this.request('/sets');
    return response.data || [];
  }

  /**
   * Search for cards that match a commander's color identity
   * @param {string} colorIdentity - Color identity (e.g., 'WUBR')
   * @param {string} type - Card type filter (optional)
   * @returns {Promise<Object>} Search results
   */
  async getCardsForColorIdentity(colorIdentity, type = null) {
    let query = `legal:commander id<=${colorIdentity}`;
    
    if (type) {
      query += ` t:${type}`;
    }
    
    return this.searchCards(query);
  }

  /**
   * Get format staples by color
   * @param {string} colors - Color identity
   * @param {number} limit - Max results
   * @returns {Promise<Array>} Popular cards
   */
  async getStaples(colors = null, limit = 50) {
    let query = 'legal:commander f:commander';
    
    if (colors) {
      query += ` id:${colors}`;
    }
    
    const results = await this.searchCards(query, { 
      order: 'edhrec',
      unique: 'cards' 
    });
    
    return results.data ? results.data.slice(0, limit) : [];
  }
}

// Export singleton instance
export const scryfall = new ScryfallAPI();

export default scryfall;
