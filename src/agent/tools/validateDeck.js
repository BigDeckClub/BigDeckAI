/**
 * Validate Deck Tool
 * Validates Commander deck legality and structure
 */

import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { isCardBanned } from '../../knowledge/commanderRules.js';
import { validateDeckColorIdentity } from '../../utils/colorIdentity.js';
import { validateDeckStructure } from '../../knowledge/deckStructure.js';

/**
 * Create validate deck tool for LangChain agent
 */
export function createValidateDeckTool() {
  return new DynamicStructuredTool({
    name: 'validate_deck',
    description: 'Validate a Commander deck for legality and format rules. Checks deck size (must be 100 cards), color identity restrictions, singleton rule, ban list compliance, and provides structural recommendations. Returns validation results with any errors or warnings.',
    schema: z.object({
      deck: z.array(z.object({
        name: z.string(),
        type_line: z.string().optional(),
        color_identity: z.array(z.string()).optional(),
        cmc: z.number().optional(),
      })).describe('Array of card objects in the deck'),
      commander: z.object({
        name: z.string(),
        color_identity: z.array(z.string()),
      }).describe('Commander card object'),
    }),
    func: async ({ deck, commander }) => {
      const errors = [];
      const warnings = [];
      const info = [];

      try {
        // Check deck size
        const totalCards = deck.length + 1; // +1 for commander
        if (totalCards !== 100) {
          errors.push(`Deck must be exactly 100 cards (including commander). Current: ${totalCards}`);
        }

        // Check for banned cards
        const bannedCards = [];
        deck.forEach(card => {
          if (isCardBanned(card.name)) {
            bannedCards.push(card.name);
          }
        });
        
        if (bannedCards.length > 0) {
          errors.push(`Banned cards detected: ${bannedCards.join(', ')}`);
        }

        // Check singleton rule (except basic lands)
        const cardCounts = {};
        const basicLands = ['Plains', 'Island', 'Swamp', 'Mountain', 'Forest'];
        
        deck.forEach(card => {
          if (!basicLands.includes(card.name)) {
            cardCounts[card.name] = (cardCounts[card.name] || 0) + 1;
          }
        });

        const duplicates = Object.entries(cardCounts)
          .filter(([, count]) => count > 1)
          .map(([name, count]) => `${name} (${count}x)`);

        if (duplicates.length > 0) {
          errors.push(`Singleton violation - duplicate cards: ${duplicates.join(', ')}`);
        }

        // Check color identity
        const colorValidation = validateDeckColorIdentity(deck, commander.color_identity);
        if (!colorValidation.valid) {
          colorValidation.invalid.forEach(card => {
            errors.push(`${card.name}: ${card.reason}`);
          });
        }

        // Check deck structure
        const structureValidation = validateDeckStructure(deck);
        warnings.push(...structureValidation.warnings);

        // Provide statistics
        info.push(`Total cards: ${totalCards}`);
        info.push(`Lands: ${structureValidation.stats.lands}`);
        info.push(`Creatures: ${structureValidation.stats.creatures}`);
        info.push(`Instants: ${structureValidation.stats.instants}`);
        info.push(`Sorceries: ${structureValidation.stats.sorceries}`);

        return JSON.stringify({
          valid: errors.length === 0,
          errors,
          warnings,
          info,
          stats: structureValidation.stats,
        });
      } catch (error) {
        return JSON.stringify({
          valid: false,
          errors: [`Validation error: ${error.message}`],
          warnings: [],
          info: [],
        });
      }
    },
  });
}

export default createValidateDeckTool;
