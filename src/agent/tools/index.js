/**
 * Agent Tools Export
 * Exports all tools for the DeckBuilderAgent
 */

export { createSearchInventoryTool } from './searchInventory.js';
export { createGetCardInfoTool } from './getCardInfo.js';
export { createValidateDeckTool } from './validateDeck.js';

/**
 * Get all agent tools
 * @returns {Array} Array of LangChain tools
 */
export async function getAllTools() {
  // Import dynamically to avoid circular dependencies
  const { createSearchInventoryTool } = await import('./searchInventory.js');
  const { createGetCardInfoTool } = await import('./getCardInfo.js');
  const { createValidateDeckTool } = await import('./validateDeck.js');

  return [
    createSearchInventoryTool(),
    createGetCardInfoTool(),
    createValidateDeckTool(),
  ];
}

export default getAllTools;
