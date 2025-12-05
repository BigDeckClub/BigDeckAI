/**
 * Search Inventory Tool
 * Allows the AI agent to search user's card inventory (future integration)
 */

import { bigdeck } from '../../integrations/bigDeckApi.js';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';

/**
 * Create search inventory tool for LangChain agent
 */
export function createSearchInventoryTool() {
  return new DynamicStructuredTool({
    name: 'search_inventory',
    description: 'Search the user\'s card inventory for specific cards. Useful when building a deck from cards the user already owns. Returns a list of cards from the user\'s collection that match the search query.',
    schema: z.object({
      query: z.string().describe('Search query - can be a card name, type, or other criteria'),
      userId: z.string().optional().describe('User ID (optional, uses current user if not provided)'),
    }),
    func: async ({ query, userId }) => {
      try {
        // Check if BigDeck API is configured
        if (!bigdeck.isConfigured()) {
          return JSON.stringify({
            success: false,
            message: 'BigDeck API is not configured. Building deck without inventory constraints.',
            cards: [],
          });
        }

        // Search user's inventory
        const cards = await bigdeck.searchInventory(userId || 'current', query);

        return JSON.stringify({
          success: true,
          query,
          count: cards.length,
          cards: cards.map(card => ({
            name: card.name,
            quantity: card.quantity,
            condition: card.condition,
            foil: card.foil,
          })),
        });
      } catch (error) {
        return JSON.stringify({
          success: false,
          error: error.message,
          message: 'Failed to search inventory. Proceeding without inventory constraints.',
        });
      }
    },
  });
}

export default createSearchInventoryTool;
