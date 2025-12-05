/**
 * YouTube Deck Tech Learner
 * Extracts and builds knowledge from YouTube deck tech videos
 */

import { youtube } from '../integrations/youtube.js';
import { moxfield } from '../integrations/moxfield.js';

class YouTubeLearner {
  constructor() {
    this.knowledgeBase = [];
  }

  /**
   * Learn from a YouTube video
   * @param {string} url - YouTube URL
   * @returns {Promise<Object>} Learned knowledge
   */
  async learnFromVideo(url) {
    try {
      console.log('Extracting deck information from YouTube video...');
      const knowledge = await youtube.buildKnowledge(url);
      
      // Add to knowledge base
      this.knowledgeBase.push(knowledge);
      
      // Try to fetch linked decks
      if (knowledge.deckLinks && knowledge.deckLinks.length > 0) {
        console.log(`Found ${knowledge.deckLinks.length} deck links`);
        
        for (const link of knowledge.deckLinks) {
          if (link.site === 'moxfield') {
            try {
              const deck = await moxfield.getDeck(link.id);
              knowledge.deck = deck;
              console.log('Successfully fetched deck from Moxfield');
            } catch (error) {
              console.error('Failed to fetch Moxfield deck:', error.message);
            }
          }
        }
      }
      
      return {
        success: true,
        knowledge,
        summary: this.summarizeKnowledge(knowledge),
      };
    } catch (error) {
      throw new Error(`Failed to learn from video: ${error.message}`);
    }
  }

  /**
   * Summarize learned knowledge
   * @param {Object} knowledge - Knowledge entry
   * @returns {Object} Summary
   */
  summarizeKnowledge(knowledge) {
    const summary = {
      video: knowledge.title,
      creator: knowledge.author,
    };
    
    if (knowledge.commander) {
      summary.commander = knowledge.commander;
    }
    
    if (knowledge.strategy) {
      summary.strategy = knowledge.strategy;
    }
    
    if (knowledge.deck) {
      summary.deckAvailable = true;
      summary.cardCount = knowledge.deck.mainboard?.length || 0;
    } else {
      summary.deckAvailable = false;
    }
    
    return summary;
  }

  /**
   * Get all learned knowledge
   * @returns {Array} Knowledge base
   */
  getKnowledgeBase() {
    return this.knowledgeBase;
  }

  /**
   * Search knowledge base by commander
   * @param {string} commander - Commander name
   * @returns {Array} Matching knowledge entries
   */
  searchByCommander(commander) {
    return this.knowledgeBase.filter(k => 
      k.commander && k.commander.toLowerCase().includes(commander.toLowerCase())
    );
  }

  /**
   * Search knowledge base by strategy
   * @param {string} strategy - Strategy type
   * @returns {Array} Matching knowledge entries
   */
  searchByStrategy(strategy) {
    return this.knowledgeBase.filter(k => 
      k.strategy && k.strategy.toLowerCase().includes(strategy.toLowerCase())
    );
  }

  /**
   * Get suggested deck techs for a commander
   * @param {string} commander - Commander name
   * @returns {Promise<Object>} Search suggestions
   */
  async suggestDeckTechs(commander) {
    return await youtube.searchDeckTechs(commander);
  }

  /**
   * Export knowledge base to JSON
   * @returns {string} JSON string
   */
  exportKnowledge() {
    return JSON.stringify(this.knowledgeBase, null, 2);
  }

  /**
   * Import knowledge base from JSON
   * @param {string} json - JSON string
   */
  importKnowledge(json) {
    try {
      const data = JSON.parse(json);
      if (!Array.isArray(data)) {
        throw new Error('Invalid knowledge data: expected an array');
      }
      this.knowledgeBase = data;
    } catch (error) {
      throw new Error(`Failed to import knowledge: ${error.message}`);
    }
  }
}

// Export singleton instance
export const youtubeLearner = new YouTubeLearner();

export default youtubeLearner;
