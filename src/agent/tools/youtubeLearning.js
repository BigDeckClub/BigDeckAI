/**
 * YouTube Learning Tool
 * Allows AI agent to learn from YouTube deck tech videos
 */

import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { youtubeLearner } from '../../learning/youtubeLearner.js';

/**
 * Create YouTube learning tool
 */
export function createLearnFromYouTubeTool() {
  return new DynamicStructuredTool({
    name: 'learn_from_youtube',
    description: 'Extract deck information and strategy from a Magic: The Gathering YouTube video (deck tech, gameplay, etc.). Use this when asked to learn from or analyze a YouTube video.',
    schema: z.object({
      url: z.string().describe('YouTube video URL (supports youtube.com/watch?v= or youtu.be/ formats)'),
    }),
    func: async ({ url }) => {
      try {
        const result = await youtubeLearner.learnFromVideo(url);
        
        if (!result.success) {
          return 'Failed to learn from video';
        }
        
        const { knowledge, summary } = result;
        
        // Format result for AI
        let output = `Learned from YouTube video:\n\n`;
        output += `Title: ${summary.video}\n`;
        output += `Creator: ${summary.creator}\n`;
        
        if (summary.commander) {
          output += `Commander: ${summary.commander}\n`;
        }
        
        if (summary.strategy) {
          output += `Strategy: ${summary.strategy}\n`;
        }
        
        if (summary.deckAvailable) {
          output += `\nFull decklist available (${summary.cardCount} cards)\n`;
        } else {
          output += `\nNote: ${knowledge.note}\n`;
          output += `Decklist may be linked in video description or comments\n`;
        }
        
        return output;
      } catch (error) {
        return `Error learning from YouTube video: ${error.message}`;
      }
    },
  });
}

/**
 * Create tool to suggest deck techs
 */
export function createSuggestDeckTechsTool() {
  return new DynamicStructuredTool({
    name: 'suggest_deck_techs',
    description: 'Get suggestions for YouTube deck tech videos to learn from for a specific commander. Use this when users want to find educational content about a commander.',
    schema: z.object({
      commander: z.string().describe('Commander name to search deck techs for'),
    }),
    func: async ({ commander }) => {
      try {
        const suggestions = await youtubeLearner.suggestDeckTechs(commander);
        
        let output = `Deck Tech Video Suggestions for ${commander}:\n\n`;
        output += `Search Query: "${suggestions.searchQuery}"\n\n`;
        output += `Recommended Channels:\n`;
        suggestions.suggestedChannels.forEach(channel => {
          output += `- ${channel}\n`;
        });
        output += `\n${suggestions.note}`;
        
        return output;
      } catch (error) {
        return `Error suggesting deck techs: ${error.message}`;
      }
    },
  });
}

export default {
  createLearnFromYouTubeTool,
  createSuggestDeckTechsTool,
};
