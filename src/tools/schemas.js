/**
 * OpenAI Function Calling Tool Schemas
 * Compatible with OpenAI's function calling API
 */

/**
 * Search for MTG cards using Scryfall API
 */
export const searchScryfallSchema = {
  type: "function",
  function: {
    name: "search_scryfall",
    description: "Search for Magic: The Gathering cards using Scryfall query syntax. Supports filters for colors, types, formats, text, and more.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Scryfall search query (e.g., 'c:red type:creature cmc<=3', 'commander:WUB', 'o:draw o:card')"
        },
        limit: {
          type: "number",
          description: "Maximum number of results to return (default: 10)"
        }
      },
      required: ["query"]
    }
  }
};

/**
 * Get card pricing information
 */
export const getCardPriceSchema = {
  type: "function",
  function: {
    name: "get_card_price",
    description: "Get current market prices for a specific Magic: The Gathering card from various sources.",
    parameters: {
      type: "object",
      properties: {
        cardName: {
          type: "string",
          description: "Exact card name (e.g., 'Lightning Bolt', 'Sol Ring')"
        }
      },
      required: ["cardName"]
    }
  }
};

/**
 * Validate Commander deck legality
 */
export const validateDeckSchema = {
  type: "function",
  function: {
    name: "validate_deck",
    description: "Validate a Commander/EDH deck for format legality, including card count, singleton rule, color identity, and ban list compliance.",
    parameters: {
      type: "object",
      properties: {
        commander: {
          type: "string",
          description: "Commander card name"
        },
        decklist: {
          type: "array",
          items: {
            type: "string"
          },
          description: "Array of card names in the deck (excluding commander)"
        }
      },
      required: ["commander", "decklist"]
    }
  }
};

/**
 * Analyze Moxfield user profile
 */
export const analyzeMoxfieldProfileSchema = {
  type: "function",
  function: {
    name: "analyze_moxfield_profile",
    description: "Analyze a Moxfield user profile to understand their deck building patterns, favorite commanders, color preferences, and play style.",
    parameters: {
      type: "object",
      properties: {
        username: {
          type: "string",
          description: "Moxfield username"
        }
      },
      required: ["username"]
    }
  }
};

/**
 * Analyze MTGGoldfish user profile
 */
export const analyzeMTGGoldfishProfileSchema = {
  type: "function",
  function: {
    name: "analyze_mtggoldfish_profile",
    description: "Analyze a MTGGoldfish user profile to understand their deck building patterns and preferences.",
    parameters: {
      type: "object",
      properties: {
        username: {
          type: "string",
          description: "MTGGoldfish username"
        }
      },
      required: ["username"]
    }
  }
};

/**
 * Learn from YouTube deck tech video
 */
export const learnFromYoutubeSchema = {
  type: "function",
  function: {
    name: "learn_from_youtube",
    description: "Extract deck information, strategy insights, and card choices from a YouTube deck tech video.",
    parameters: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "YouTube video URL"
        }
      },
      required: ["url"]
    }
  }
};

/**
 * Suggest deck tech videos
 */
export const suggestDeckTechsSchema = {
  type: "function",
  function: {
    name: "suggest_deck_techs",
    description: "Suggest relevant YouTube deck tech videos for a specific commander or strategy.",
    parameters: {
      type: "object",
      properties: {
        commander: {
          type: "string",
          description: "Commander name to find deck techs for"
        },
        strategy: {
          type: "string",
          description: "Optional deck strategy (e.g., 'combo', 'control', 'tribal')"
        }
      },
      required: ["commander"]
    }
  }
};

/**
 * Analyze format metagame
 */
export const analyzeFormatMetaSchema = {
  type: "function",
  function: {
    name: "analyze_format_meta",
    description: "Analyze the current metagame for a Magic format (Commander, Modern, Standard, etc.) including popular decks and trends.",
    parameters: {
      type: "object",
      properties: {
        format: {
          type: "string",
          description: "Format name (e.g., 'commander', 'modern', 'standard')",
          enum: ["commander", "modern", "standard", "pioneer", "legacy", "vintage", "pauper"]
        }
      },
      required: ["format"]
    }
  }
};

/**
 * All tool schemas as an array for easy consumption
 */
export const allToolSchemas = [
  searchScryfallSchema,
  getCardPriceSchema,
  validateDeckSchema,
  analyzeMoxfieldProfileSchema,
  analyzeMTGGoldfishProfileSchema,
  learnFromYoutubeSchema,
  suggestDeckTechsSchema,
  analyzeFormatMetaSchema
];

/**
 * Export schemas by name for easy lookup
 */
export const toolSchemasByName = {
  search_scryfall: searchScryfallSchema,
  get_card_price: getCardPriceSchema,
  validate_deck: validateDeckSchema,
  analyze_moxfield_profile: analyzeMoxfieldProfileSchema,
  analyze_mtggoldfish_profile: analyzeMTGGoldfishProfileSchema,
  learn_from_youtube: learnFromYoutubeSchema,
  suggest_deck_techs: suggestDeckTechsSchema,
  analyze_format_meta: analyzeFormatMetaSchema
};

export default allToolSchemas;
