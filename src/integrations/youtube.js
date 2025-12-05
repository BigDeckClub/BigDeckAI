/**
 * YouTube Integration
 * Extract transcripts and parse decklists from Magic YouTube videos
 */

class YouTubeAPI {
  constructor() {
    this.rateLimit = 100;
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
   * Extract video ID from YouTube URL
   * @param {string} url - YouTube URL
   * @returns {string|null} Video ID
   */
  extractVideoId(url) {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?\s]+)/,
      /^([a-zA-Z0-9_-]{11})$/,
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }
    
    return null;
  }

  /**
   * Extract deck links from video description
   * Looks for Moxfield, Archidekt, and other deck hosting sites
   * @param {string} description - Video description
   * @returns {Array} Array of deck links
   */
  extractDeckLinks(description) {
    const deckLinks = [];
    
    // Patterns for popular deck hosting sites
    const patterns = [
      { name: 'moxfield', pattern: /moxfield\.com\/decks\/([a-zA-Z0-9_-]+)/g },
      { name: 'archidekt', pattern: /archidekt\.com\/decks\/([0-9]+)/g },
      { name: 'tappedout', pattern: /tappedout\.net\/mtg-decks\/([a-zA-Z0-9_-]+)/g },
      { name: 'deckstats', pattern: /deckstats\.net\/decks\/[0-9]+\/([0-9]+)/g },
    ];
    
    patterns.forEach(({ name, pattern }) => {
      let match;
      while ((match = pattern.exec(description)) !== null) {
        deckLinks.push({
          site: name,
          id: match[1],
          url: match[0],
        });
      }
    });
    
    return deckLinks;
  }

  /**
   * Parse decklist from text
   * Extracts card names and quantities from plain text
   * @param {string} text - Text containing decklist
   * @returns {Array} Array of cards
   */
  parseDecklistFromText(text) {
    const cards = [];
    const lines = text.split('\n');
    
    // Pattern: "1 Card Name" or "1x Card Name"
    const cardPattern = /^(\d+)x?\s+(.+)$/;
    
    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('//')) return;
      
      const match = trimmed.match(cardPattern);
      if (match) {
        cards.push({
          quantity: parseInt(match[1]),
          name: match[2].trim(),
        });
      }
    });
    
    return cards;
  }

  /**
   * Get video metadata using YouTube's oEmbed API (no API key required)
   * @param {string} videoId - YouTube video ID
   * @returns {Promise<Object>} Video metadata
   */
  async getVideoMetadata(videoId) {
    await this.waitForRateLimit();
    
    try {
      const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch video metadata:', error.message);
      throw error;
    }
  }

  /**
   * Extract deck information from YouTube video
   * Note: Full transcript extraction requires YouTube API key or third-party service
   * This is a basic implementation that works with video metadata
   * @param {string} url - YouTube URL
   * @returns {Promise<Object>} Extracted deck information
   */
  async extractDeckInfo(url) {
    const videoId = this.extractVideoId(url);
    
    if (!videoId) {
      throw new Error('Invalid YouTube URL');
    }
    
    // Get video metadata
    const metadata = await this.getVideoMetadata(videoId);
    
    // In a production implementation, you would:
    // 1. Use YouTube Data API v3 to get video description
    // 2. Use a transcript service to extract captions
    // 3. Parse both for deck information
    
    // For now, we'll return a structure that can be populated
    return {
      videoId,
      title: metadata.title,
      author: metadata.author_name,
      thumbnail: metadata.thumbnail_url,
      deckLinks: [], // Would be populated from description
      commander: null, // Would be extracted from title/description
      strategy: null, // Would be extracted from analysis
      notes: 'Note: Full deck extraction requires YouTube Data API key',
    };
  }

  /**
   * Build knowledge from video
   * Creates a structured knowledge entry for the AI to learn from
   * @param {string} url - YouTube URL
   * @returns {Promise<Object>} Knowledge entry
   */
  async buildKnowledge(url) {
    const deckInfo = await this.extractDeckInfo(url);
    
    // Extract commander from title if present
    const commanderMatch = deckInfo.title.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,4})\b/);
    if (commanderMatch) {
      deckInfo.commander = commanderMatch[0];
    }
    
    // Detect strategy keywords
    const strategyKeywords = [
      'tribal', 'aggro', 'control', 'combo', 'midrange',
      'voltron', 'aristocrats', 'tokens', 'spellslinger',
      'reanimator', 'storm', 'stax', 'group hug'
    ];
    
    const titleLower = deckInfo.title.toLowerCase();
    for (const keyword of strategyKeywords) {
      if (titleLower.includes(keyword)) {
        deckInfo.strategy = keyword;
        break;
      }
    }
    
    return {
      source: 'youtube',
      url,
      ...deckInfo,
      learnedAt: new Date().toISOString(),
    };
  }

  /**
   * Search for deck tech videos (requires description parsing in practice)
   * This is a placeholder that shows the structure
   * @param {string} commander - Commander name
   * @returns {Promise<Array>} Video suggestions
   */
  async searchDeckTechs(commander) {
    // In production, this would use YouTube Data API to search
    // For now, return guidance for manual search
    return {
      searchQuery: `${commander} deck tech commander edh`,
      suggestedChannels: [
        'The Command Zone',
        'EDHRECast',
        'MTGGoldfish Commander',
        'Jumbo Commander',
        'Commander\'s Quarters',
      ],
      note: 'Use YouTube search with the suggested query to find relevant deck techs',
    };
  }
}

// Export singleton instance
export const youtube = new YouTubeAPI();

export default youtube;
