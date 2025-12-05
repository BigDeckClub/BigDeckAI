/**
 * Profile Analysis Tool
 * Allows AI agent to analyze user profiles from Moxfield or MTGGoldfish
 */

import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { profileAnalyzer } from '../../learning/profileAnalyzer.js';

/**
 * Create profile analysis tool for Moxfield
 */
export function createAnalyzeMoxfieldProfileTool() {
  return new DynamicStructuredTool({
    name: 'analyze_moxfield_profile',
    description: 'Analyze a Moxfield user profile to understand their deck building patterns, favorite commanders, color preferences, and brewing style. Use this when asked to analyze or learn from a Moxfield profile.',
    schema: z.object({
      username: z.string().describe('Moxfield username to analyze'),
    }),
    func: async ({ username }) => {
      try {
        const analysis = await profileAnalyzer.analyzeMoxfieldProfile(username);
        
        // Format analysis for AI
        let result = `Moxfield Profile Analysis for ${username}:\n\n`;
        result += `Total Decks: ${analysis.totalDecks}\n\n`;
        
        if (analysis.insights && analysis.insights.length > 0) {
          result += 'Insights:\n';
          analysis.insights.forEach(insight => {
            result += `- ${insight}\n`;
          });
          result += '\n';
        }
        
        if (analysis.recommendations && analysis.recommendations.length > 0) {
          result += 'Recommendations:\n';
          analysis.recommendations.forEach(rec => {
            result += `- ${rec}\n`;
          });
        }
        
        return result;
      } catch (error) {
        return `Error analyzing Moxfield profile: ${error.message}`;
      }
    },
  });
}

/**
 * Create profile analysis tool for MTGGoldfish
 */
export function createAnalyzeMTGGoldfishProfileTool() {
  return new DynamicStructuredTool({
    name: 'analyze_mtggoldfish_profile',
    description: 'Analyze a MTGGoldfish user profile to understand their deck building patterns and favorite commanders. Use this when asked to analyze or learn from a MTGGoldfish profile.',
    schema: z.object({
      username: z.string().describe('MTGGoldfish username to analyze'),
    }),
    func: async ({ username }) => {
      try {
        const analysis = await profileAnalyzer.analyzeMTGGoldfishProfile(username);
        
        // Format analysis for AI
        let result = `MTGGoldfish Profile Analysis for ${username}:\n\n`;
        result += `Total Decks: ${analysis.totalDecks}\n`;
        result += `Analyzed: ${analysis.analyzedDecks} decks\n\n`;
        
        if (analysis.insights && analysis.insights.length > 0) {
          result += 'Insights:\n';
          analysis.insights.forEach(insight => {
            result += `- ${insight}\n`;
          });
          result += '\n';
        }
        
        if (analysis.recommendations && analysis.recommendations.length > 0) {
          result += 'Recommendations:\n';
          analysis.recommendations.forEach(rec => {
            result += `- ${rec}\n`;
          });
        }
        
        return result;
      } catch (error) {
        return `Error analyzing MTGGoldfish profile: ${error.message}`;
      }
    },
  });
}

export default {
  createAnalyzeMoxfieldProfileTool,
  createAnalyzeMTGGoldfishProfileTool,
};
