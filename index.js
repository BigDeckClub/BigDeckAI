/**
 * BigDeck AI - MTG Commander Knowledge & Utilities Library
 * 
 * A lightweight library providing MTG Commander knowledge, utilities,
 * and OpenAI-compatible tool schemas for AI-powered deck building.
 * 
 * ## Structure
 * This library is organized into several major sections:
 * - **System Prompts & Personas**: AI communication styles and system instructions
 * - **Knowledge Base**: Commander rules, archetypes, staples, synergies
 * - **Learning & Recommendations**: ML-based recommendations, meta analysis
 * - **Utilities**: Deck analysis, validation, and optimization tools
 * - **Tool Schemas**: OpenAI function calling schemas
 * - **Tool Handlers**: Implementation of tool functions
 * - **Integrations**: Scryfall, EDHREC, Archidekt, TCGPlayer
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
 * 
 * @module bigdeck-ai
 */

// =============================================================================
// SYSTEM PROMPTS & PERSONAS
// =============================================================================

// System Prompt
export { 
  systemPrompt 
} from './src/prompts/systemPrompt.js';

// Personas
export {
  personas,
  getPersonaPrompt,
  detectUserLevel,
  adaptResponse,
  getPersonaRecommendations,
  getAllPersonas
} from './src/prompts/personas.js';

// =============================================================================
// KNOWLEDGE BASE
// =============================================================================

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
export {
  synergies,
  synergyCategories,
  getSynergiesFor,
  findSynergyPairs,
  suggestSynergyCards,
  calculateSynergyScore,
  getDeckSynergyCategories,
  findInfiniteCombos
} from './src/knowledge/synergies.js';

// =============================================================================
// LEARNING & RECOMMENDATIONS
// =============================================================================

// Learning Modules
export { profileAnalyzer } from './src/learning/profileAnalyzer.js';
export { youtubeLearner } from './src/learning/youtubeLearner.js';
export { metaAnalyzer } from './src/learning/metaAnalyzer.js';
export { recommendationEngine } from './src/learning/recommendationEngine.js';
export {
  extractDeckFeatures,
  calculateDeckSimilarity,
  findSimilarDecks,
  recommendFromSimilarDecks,
  trainOnDecklists,
  getWeightedRecommendations
} from './src/learning/mlRecommender.js';
export {
  defaultPlaygroupProfile,
  createPlaygroupTracker,
  recordGameResult,
  analyzePlaygroupMeta,
  adaptRecommendations,
  suggestMetaCounters,
  getDeckWinRate,
  getGameHistory,
  clearGameHistory
} from './src/learning/playgroupMeta.js';

// =============================================================================
// UTILITIES
// =============================================================================

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
export {
  powerLevelTiers,
  assessPowerLevel,
  getPowerLevelFactors,
  suggestPowerLevelAdjustments,
  getPowerLevelTier,
  calculateAverageCMC
} from './src/utils/powerLevel.js';
export {
  budgetTiers,
  budgetAlternatives,
  calculateDeckCost,
  findBudgetAlternatives,
  suggestWithBudget,
  optimizeDeckForBudget,
  recommendBudgetTier,
  analyzeBudgetDistribution
} from './src/utils/budgetOptimizer.js';
export {
  idealRatios,
  analyzeCardAdvantage,
  analyzeRampPackage,
  getIdealRatios,
  suggestRatioImprovements,
  analyzeDeckBalance
} from './src/utils/deckAnalysis.js';
export {
  winConditionTypes,
  detectWinConditions,
  categorizeWinConditions,
  assessWinConRedundancy,
  suggestWinConditions,
  detectInfiniteCombos as detectWinConditionCombos,
  getWinConditionStats
} from './src/utils/winConditions.js';
export {
  interactionCategories,
  analyzeInteraction,
  scoreInteractionPackage,
  identifyInteractionGaps,
  suggestInteraction,
  evaluateRemovalQuality,
  getInteractionReport
} from './src/utils/interactionAnalysis.js';

// Deck Validator
export {
  parseDeckList,
  validateParsedDeck,
  validateDeckList,
  removeDuplicates,
  formatDeckList
} from './src/utils/deckValidator.js';

// =============================================================================
// TOOL SCHEMAS (OpenAI Function Calling)
// =============================================================================

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
  // New analysis tool schemas
  assessPowerLevelSchema,
  findSynergiesSchema,
  suggestWithBudgetSchema,
  analyzeDeckRatiosSchema,
  detectWinConditionsSchema,
  getEdhrecDataSchema,
  adaptToPlaygroupSchema,
  analyzeInteractionSchema,
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

// =============================================================================
// TOOL HANDLERS
// =============================================================================

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

// =============================================================================
// DATA & UI
// =============================================================================

// Data Store
export { store } from './src/data/store.js';

// UI Messages
export {
  aiName,
  statusMessages,
  getRandomThinkingMessage,
  getToolStatusMessage
} from './src/ui/messages.js';

// =============================================================================
// INTEGRATIONS
// =============================================================================

// Integrations
export { 
  scryfall,
  searchScryfall,
  getCardPrice
} from './src/integrations/scryfall.js';
export {
  getCommanderData,
  getPopularCards,
  getSynergyScores,
  getThemes,
  getSaltScore,
  getAverageDecklist,
  getSimilarCommanders,
  getTopCommandersByColors
} from './src/integrations/edhrec.js';
export {
  fetchDeck,
  fetchUserDecks,
  parseDeckData,
  searchDecks,
  getFeaturedDecks
} from './src/integrations/archidekt.js';
export {
  getCardPrice as getTCGPlayerPrice,
  getBulkPrices,
  getPriceHistory,
  comparePrices,
  getTrendingCards,
  getBudgetAlternatives as getTCGBudgetAlternatives
} from './src/integrations/tcgplayer.js';
