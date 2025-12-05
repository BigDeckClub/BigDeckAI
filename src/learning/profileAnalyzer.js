/**
 * Profile Analyzer
 * Analyzes Moxfield and MTGGoldfish profiles to identify patterns
 */

import { moxfield } from '../integrations/moxfield.js';
import { mtggoldfish } from '../integrations/mtggoldfish.js';
import { getColorName } from '../utils/colorIdentity.js';

class ProfileAnalyzer {
  /**
   * Analyze Moxfield profile
   * @param {string} username - Moxfield username
   * @returns {Promise<Object>} Analysis results
   */
  async analyzeMoxfieldProfile(username) {
    try {
      console.log(`Analyzing Moxfield profile: ${username}...`);
      const profile = await moxfield.getUserProfile(username);
      
      // Build comprehensive analysis
      const analysis = {
        platform: 'Moxfield',
        username,
        totalDecks: profile.totalDecks,
        patterns: profile.patterns,
        insights: this.generateInsights(profile.patterns),
        recommendations: this.generateRecommendations(profile.patterns),
      };
      
      return analysis;
    } catch (error) {
      throw new Error(`Failed to analyze Moxfield profile: ${error.message}`);
    }
  }

  /**
   * Analyze MTGGoldfish profile
   * @param {string} username - MTGGoldfish username
   * @returns {Promise<Object>} Analysis results
   */
  async analyzeMTGGoldfishProfile(username) {
    try {
      console.log(`Analyzing MTGGoldfish profile: ${username}...`);
      const profile = await mtggoldfish.analyzeUserProfile(username);
      
      const analysis = {
        platform: 'MTGGoldfish',
        username,
        totalDecks: profile.totalDecks,
        analyzedDecks: profile.analyzedDecks,
        topCommanders: profile.topCommanders,
        insights: this.generateMTGGoldfishInsights(profile),
        recommendations: this.generateMTGGoldfishRecommendations(profile),
      };
      
      return analysis;
    } catch (error) {
      throw new Error(`Failed to analyze MTGGoldfish profile: ${error.message}`);
    }
  }

  /**
   * Generate insights from Moxfield patterns
   * @param {Object} patterns - User's deck patterns
   * @returns {Array} Insights
   */
  generateInsights(patterns) {
    const insights = [];
    
    // Format preference
    if (patterns.favoriteFormat) {
      insights.push(`Primary format: ${patterns.favoriteFormat}`);
    }
    
    // Commander preferences
    if (patterns.topCommanders && patterns.topCommanders.length > 0) {
      const topCommander = patterns.topCommanders[0];
      insights.push(`Most played commander: ${topCommander.name} (${topCommander.count} decks)`);
      
      if (patterns.topCommanders.length > 1) {
        insights.push(`Also frequently plays: ${patterns.topCommanders.slice(1, 3).map(c => c.name).join(', ')}`);
      }
    }
    
    // Color preferences
    if (patterns.topColorCombos && patterns.topColorCombos.length > 0) {
      const topColors = patterns.topColorCombos[0];
      insights.push(`Favorite color combination: ${this.formatColorIdentity(topColors.colors)} (${topColors.count} decks)`);
    }
    
    return insights;
  }

  /**
   * Generate insights from MTGGoldfish profile
   * @param {Object} profile - User profile data
   * @returns {Array} Insights
   */
  generateMTGGoldfishInsights(profile) {
    const insights = [];
    
    insights.push(`Total decks on MTGGoldfish: ${profile.totalDecks}`);
    insights.push(`Analyzed ${profile.analyzedDecks} recent decks`);
    
    if (profile.topCommanders && profile.topCommanders.length > 0) {
      profile.topCommanders.forEach(commander => {
        insights.push(`Plays ${commander.name} (${commander.count} times)`);
      });
    }
    
    return insights;
  }

  /**
   * Generate recommendations based on patterns
   * @param {Object} patterns - User's deck patterns
   * @returns {Array} Recommendations
   */
  generateRecommendations(patterns) {
    const recommendations = [];
    
    // Suggest trying new color combinations
    if (patterns.topColorCombos && patterns.topColorCombos.length > 0) {
      const playedColors = new Set();
      patterns.topColorCombos.forEach(combo => {
        combo.colors.split('').forEach(c => playedColors.add(c));
      });
      
      const allColors = ['W', 'U', 'B', 'R', 'G'];
      const unplayedColors = allColors.filter(c => !playedColors.has(c));
      
      if (unplayedColors.length > 0) {
        recommendations.push(`Try exploring ${unplayedColors.map(c => getColorName(c)).join(' or ')} colors`);
      }
    }
    
    // Suggest archetype variety
    recommendations.push('Consider exploring different archetypes to expand your deck building skills');
    
    // Suggest power level variation
    recommendations.push('Build decks at different power levels for various playgroups');
    
    return recommendations;
  }

  /**
   * Generate recommendations for MTGGoldfish users
   * @param {Object} profile - User profile data
   * @returns {Array} Recommendations
   */
  generateMTGGoldfishRecommendations(profile) {
    const recommendations = [];
    
    if (profile.topCommanders && profile.topCommanders.length > 0) {
      recommendations.push('Consider building with less-played commanders for unique gameplay');
    }
    
    recommendations.push('Explore the current meta to discover powerful new strategies');
    recommendations.push('Try budget builds to challenge your deck building creativity');
    
    return recommendations;
  }

  /**
   * Format color identity for display
   * @param {string} colors - Color string (e.g., 'WUB')
   * @returns {string} Formatted color name
   */
  formatColorIdentity(colors) {
    if (!colors) return 'Colorless';
    
    return colors.split('').map(c => getColorName(c)).join('/');
  }

  /**
   * Compare two user profiles to find similarities
   * @param {Object} profile1 - First profile
   * @param {Object} profile2 - Second profile
   * @returns {Object} Comparison results
   */
  compareProfiles(profile1, profile2) {
    const similarities = [];
    const differences = [];
    
    // Compare commanders
    const commanders1 = new Set(profile1.patterns?.topCommanders?.map(c => c.name) || []);
    const commanders2 = new Set(profile2.patterns?.topCommanders?.map(c => c.name) || []);
    
    const sharedCommanders = [...commanders1].filter(c => commanders2.has(c));
    if (sharedCommanders.length > 0) {
      similarities.push(`Both players enjoy: ${sharedCommanders.join(', ')}`);
    }
    
    return {
      similarities,
      differences,
    };
  }
}

// Export singleton instance
export const profileAnalyzer = new ProfileAnalyzer();

export default profileAnalyzer;
