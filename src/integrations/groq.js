/**
 * Groq LLM Integration
 * Fast, free LLM API using Llama models
 */

import { ChatGroq } from '@langchain/groq';
import { config } from './config.js';

/**
 * Creates and configures a Groq LLM instance
 * @param {Object} options - Optional configuration overrides
 * @returns {ChatGroq} Configured Groq LLM instance
 */
export function createGroqLLM(options = {}) {
  const groqConfig = config.llm.groq;
  
  return new ChatGroq({
    apiKey: options.apiKey || groqConfig.apiKey,
    model: options.model || groqConfig.model,
    temperature: options.temperature !== undefined ? options.temperature : groqConfig.temperature,
    maxTokens: options.maxTokens,
    streaming: options.streaming || false,
  });
}

/**
 * Available Groq models with their characteristics
 */
export const GROQ_MODELS = {
  'llama-3.3-70b-versatile': {
    name: 'Llama 3.3 70B Versatile',
    description: 'Best overall model, great for complex tasks',
    contextWindow: 32768,
    speed: 'very-fast',
  },
  'llama-3.1-70b-versatile': {
    name: 'Llama 3.1 70B Versatile',
    description: 'Previous generation, still excellent',
    contextWindow: 32768,
    speed: 'very-fast',
  },
  'llama-3.1-8b-instant': {
    name: 'Llama 3.1 8B Instant',
    description: 'Fastest model, good for simple tasks',
    contextWindow: 8192,
    speed: 'extremely-fast',
  },
  'mixtral-8x7b-32768': {
    name: 'Mixtral 8x7B',
    description: 'Good alternative with large context',
    contextWindow: 32768,
    speed: 'fast',
  },
};

export default createGroqLLM;
