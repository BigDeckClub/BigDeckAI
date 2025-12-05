/**
 * Meta Analysis Tool
 * Allows AI agent to analyze format meta and trends
 */

import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { metaAnalyzer } from '../../learning/metaAnalyzer.js';

/**
 * Create meta analysis tool
 */
export function createAnalyzeMetaTool() {
  return new DynamicStructuredTool({
    name: 'analyze_format_meta',
    description: 'Analyze the current metagame for a Magic format (Commander, Modern, etc.). Returns popular decks, meta share, and trends. Use this when users ask about the current meta or popular strategies.',
    schema: z.object({
      format: z.string().default('commander').describe('Format to analyze (e.g., commander, modern, standard)'),
    }),
    func: async ({ format }) => {
      try {
        const analysis = await metaAnalyzer.analyzeFormat(format);
        
        // Format analysis for AI
        let result = `${format.charAt(0).toUpperCase() + format.slice(1)} Meta Analysis:\n\n`;
        
        if (analysis.summary && analysis.summary.length > 0) {
          analysis.summary.forEach(point => {
            result += `${point}\n`;
          });
          result += '\n';
        }
        
        if (analysis.topDecks && analysis.topDecks.length > 0) {
          result += `Top Meta Decks:\n`;
          analysis.topDecks.slice(0, 10).forEach((deck, index) => {
            result += `${index + 1}. ${deck.name} (${deck.metaShare})\n`;
          });
          result += '\n';
        }
        
        if (analysis.trends) {
          if (analysis.trends.popular && analysis.trends.popular.length > 0) {
            result += `Popular Strategies: ${analysis.trends.popular.join(', ')}\n`;
          }
          
          if (analysis.trends.emerging && analysis.trends.emerging.length > 0) {
            result += `Emerging Decks: ${analysis.trends.emerging.join(', ')}\n`;
          }
        }
        
        return result;
      } catch (error) {
        return `Error analyzing meta: ${error.message}`;
      }
    },
  });
}

export default {
  createAnalyzeMetaTool,
};
