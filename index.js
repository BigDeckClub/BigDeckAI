/**
 * BigDeck AI - Commander Deck Builder
 * Main module entrypoint for npm/library usage
 * 
 * This file exports all core components for use in frontend applications,
 * API servers, and other JavaScript/Node.js projects.
 * 
 * @example
 * // Import as ES module
 * import { DeckBuilderAgent, createDeckBuilderAgent } from 'bigdeck-ai';
 * 
 * // Create and use agent
 * const agent = await createDeckBuilderAgent({ 
 *   apiKey: process.env.GROQ_API_KEY,
 *   temperature: 0.7
 * });
 * const response = await agent.chat('Build me a cEDH Atraxa deck');
 */

// Core Agent
export { 
  DeckBuilderAgent, 
  createDeckBuilderAgent 
} from './src/agent/DeckBuilderAgent.js';

// Agent Tools
export {
  createSearchInventoryTool,
  createGetCardInfoTool,
  createValidateDeckTool,
  getAllTools
} from './src/agent/tools/index.js';

// System Prompt
export { 
  systemPrompt 
} from './src/agent/prompts/systemPrompt.js';

// Integrations
export { 
  config, 
  validateConfig 
} from './src/integrations/config.js';
export { 
  scryfall 
} from './src/integrations/scryfall.js';
export { 
  createGroqLLM, 
  GROQ_MODELS 
} from './src/integrations/groq.js';

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

// Default export for convenience
export { DeckBuilderAgent as default } from './src/agent/DeckBuilderAgent.js';
