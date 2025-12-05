/**
 * Agent Tools Export
 * Exports all tools for the DeckBuilderAgent
 */

export { createSearchInventoryTool } from './searchInventory.js';
export { createGetCardInfoTool } from './getCardInfo.js';
export { createValidateDeckTool } from './validateDeck.js';
export { 
  createAnalyzeMoxfieldProfileTool,
  createAnalyzeMTGGoldfishProfileTool 
} from './profileAnalysis.js';
export {
  createLearnFromYouTubeTool,
  createSuggestDeckTechsTool
} from './youtubeLearning.js';
export { createAnalyzeMetaTool } from './metaAnalysis.js';

/**
 * Get all agent tools
 * @returns {Array} Array of LangChain tools
 */
export async function getAllTools() {
  // Import dynamically to avoid circular dependencies
  const { createSearchInventoryTool } = await import('./searchInventory.js');
  const { createGetCardInfoTool } = await import('./getCardInfo.js');
  const { createValidateDeckTool } = await import('./validateDeck.js');
  const { 
    createAnalyzeMoxfieldProfileTool,
    createAnalyzeMTGGoldfishProfileTool 
  } = await import('./profileAnalysis.js');
  const {
    createLearnFromYouTubeTool,
    createSuggestDeckTechsTool
  } = await import('./youtubeLearning.js');
  const { createAnalyzeMetaTool } = await import('./metaAnalysis.js');

  return [
    createSearchInventoryTool(),
    createGetCardInfoTool(),
    createValidateDeckTool(),
    createAnalyzeMoxfieldProfileTool(),
    createAnalyzeMTGGoldfishProfileTool(),
    createLearnFromYouTubeTool(),
    createSuggestDeckTechsTool(),
    createAnalyzeMetaTool(),
  ];
}

export default getAllTools;
