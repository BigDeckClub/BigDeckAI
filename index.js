/**
 * BigDeck AI - MTG Commander Knowledge & Utilities Library
 * 
 * A lightweight library providing MTG Commander knowledge, utilities,
 * and OpenAI-compatible tool schemas for AI-powered deck building.
 * 
 * @example
 * // Import system prompt
 * import { systemPrompt } from 'bigdeck-ai';
 * 
 * // Import knowledge
 * import { isCardBanned, archetypes } from 'bigdeck-ai';
 * 
 * // Import utilities
 * import { validateDeckColorIdentity, calculateManaCurve } from 'bigdeck-ai';
 * 
 * // Import tool schemas for OpenAI function calling
 * import { allToolSchemas } from 'bigdeck-ai';
 */

// System Prompt
export { 
  systemPrompt 
} from './src/prompts/systemPrompt.js';

// Knowledge Base
export { 
  commanderRules, 
  isCardBanned, 
  getFormattedRules 
} from './src/knowledge/commanderRules.js';
export { 
  archetypes,
  getArchetype,
  getArchetypesForColors
} from './src/knowledge/archetypes.js';
export { 
  deckStructure,
  getStructureForStrategy,
  validateDeckStructure
} from './src/knowledge/deckStructure.js';
export { 
  staples,
  getStaplesForColors,
  getEssentialStaples
} from './src/knowledge/staples.js';

// Learning Modules
export { profileAnalyzer } from './src/learning/profileAnalyzer.js';
export { youtubeLearner } from './src/learning/youtubeLearner.js';
export { metaAnalyzer } from './src/learning/metaAnalyzer.js';
export { recommendationEngine } from './src/learning/recommendationEngine.js';

// Utilities
export { 
  COLORS,
  COLOR_SYMBOLS,
  parseColorIdentity, 
  getColorIdentityString,
  isValidForCommander,
  getColorCombinationName,
  calculateColorDistribution,
  getRecommendedManaBase,
  validateDeckColorIdentity
} from './src/utils/colorIdentity.js';
export { 
  calculateManaCurve,
  visualizeManaCurve,
  analyzeManaCurve,
  getIdealCurve,
  compareCurveToIdeal,
  getCardsByCMC
} from './src/utils/curveAnalysis.js';
export { 
  calculateLandCount,
  calculateColorSources,
  generateManaBase,
  analyzeManaRequirements,
  calculateTotalManaSources
} from './src/utils/manabase.js';

// Tool Schemas (OpenAI function calling)
export {
  allToolSchemas,
  readToolSchemas,
  writeToolSchemas,
  toolSchemasByName,
  searchScryfallSchema,
  getCardPriceSchema,
  validateDeckSchema,
  analyzeMoxfieldProfileSchema,
  analyzeMTGGoldfishProfileSchema,
  learnFromYoutubeSchema,
  suggestDeckTechsSchema,
  analyzeFormatMetaSchema,
  // Write tool schemas
  addCardToInventorySchema,
  removeCardFromInventorySchema,
  moveCardSchema,
  searchInventorySchema,
  createDeckSchema,
  addCardToDeckSchema,
  removeCardFromDeckSchema,
  getDecksSchema,
  deleteDeckSchema,
  recordSaleSchema,
  getSalesSchema
} from './src/tools/schemas.js';

// Tool Handlers (implementations)
export {
  toolHandlers,
  executeTool,
  addCardToInventory,
  removeCardFromInventory,
  moveCard,
  searchInventory,
  createDeck,
  addCardToDeck,
  removeCardFromDeck,
  getDecks,
  deleteDeck,
  recordSale,
  getSales
} from './src/tools/handlers.js';

// Data Store
export { store } from './src/data/store.js';

// UI Messages
export {
  aiName,
  statusMessages,
  getRandomThinkingMessage,
  getToolStatusMessage
} from './src/ui/messages.js';

// Integrations
export { 
  scryfall,
  searchScryfall,
  getCardPrice
} from './src/integrations/scryfall.js';
