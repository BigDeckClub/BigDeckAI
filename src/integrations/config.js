/**
 * Integration Configuration
 * Central configuration for all external API integrations
 */

import dotenv from 'dotenv';
dotenv.config();

export const config = {
  // LLM Provider Configuration
  llm: {
    provider: process.env.LLM_PROVIDER || 'groq',
    groq: {
      apiKey: process.env.GROQ_API_KEY,
      model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
      temperature: parseFloat(process.env.LLM_TEMPERATURE) || 0.7,
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
      temperature: parseFloat(process.env.LLM_TEMPERATURE) || 0.7,
    },
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: process.env.ANTHROPIC_MODEL || 'claude-3-sonnet-20240229',
      temperature: parseFloat(process.env.LLM_TEMPERATURE) || 0.7,
    },
    ollama: {
      baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
      model: process.env.OLLAMA_MODEL || 'llama3',
      temperature: parseFloat(process.env.LLM_TEMPERATURE) || 0.7,
    },
  },

  // Scryfall API Configuration
  scryfall: {
    baseUrl: process.env.SCRYFALL_API_URL || 'https://api.scryfall.com',
    rateLimit: 100, // milliseconds between requests
  },

  // BigDeckAppV3 API Configuration (for future inventory integration)
  bigdeck: {
    apiUrl: process.env.BIGDECK_API_URL || 'http://localhost:3000/api',
    apiKey: process.env.BIGDECK_API_KEY || '',
  },
};

/**
 * Validates that required configuration is present
 * @throws {Error} if required config is missing
 */
export function validateConfig() {
  const provider = config.llm.provider;
  
  switch (provider) {
    case 'groq':
      if (!config.llm.groq.apiKey) {
        throw new Error('GROQ_API_KEY is required when using Groq provider. Get one at https://console.groq.com');
      }
      break;
    case 'openai':
      if (!config.llm.openai.apiKey) {
        throw new Error('OPENAI_API_KEY is required when using OpenAI provider');
      }
      break;
    case 'anthropic':
      if (!config.llm.anthropic.apiKey) {
        throw new Error('ANTHROPIC_API_KEY is required when using Anthropic provider');
      }
      break;
    case 'ollama':
      // Ollama doesn't require an API key
      break;
    default:
      throw new Error(`Unknown LLM provider: ${provider}. Supported: groq, openai, anthropic, ollama`);
  }
}

export default config;
