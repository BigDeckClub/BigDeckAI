/**
 * Get Card Info Tool
 * Fetches card details from Scryfall API
 */

import { scryfall } from '../../integrations/scryfall.js';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';

/**
 * Create get card info tool for LangChain agent
 */
export function createGetCardInfoTool() {
  return new DynamicStructuredTool({
    name: 'get_card_info',
    description: 'Get detailed information about a Magic: The Gathering card from Scryfall. Returns card details including mana cost, type, oracle text, legality, and prices. Useful for verifying card details, checking legality, or getting exact oracle text.',
    schema: z.object({
      cardName: z.string().describe('Exact or partial card name to search for'),
      fuzzy: z.boolean().optional().describe('Whether to use fuzzy search (default: false)'),
    }),
    func: async ({ cardName, fuzzy = false }) => {
      try {
        let card;
        
        if (fuzzy) {
          // Use search for fuzzy matching
          const results = await scryfall.searchCards(cardName, { unique: 'cards' });
          if (results.data && results.data.length > 0) {
            card = results.data[0];
          } else {
            return JSON.stringify({
              success: false,
              error: `No cards found matching "${cardName}"`,
            });
          }
        } else {
          // Use exact name lookup
          card = await scryfall.getCard(cardName);
        }

        return JSON.stringify({
          success: true,
          card: {
            name: card.name,
            mana_cost: card.mana_cost,
            cmc: card.cmc,
            type_line: card.type_line,
            oracle_text: card.oracle_text,
            colors: card.colors,
            color_identity: card.color_identity,
            legalities: card.legalities,
            prices: {
              usd: card.prices?.usd,
              usd_foil: card.prices?.usd_foil,
            },
            edhrec_rank: card.edhrec_rank,
            set: card.set_name,
            rarity: card.rarity,
          },
        });
      } catch (error) {
        return JSON.stringify({
          success: false,
          error: error.message,
          message: `Failed to fetch card info for "${cardName}"`,
        });
      }
    },
  });
}

export default createGetCardInfoTool;
