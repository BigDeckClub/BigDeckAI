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

// ============ WRITE TOOL SCHEMAS ============

/**
 * Add card to inventory
 */
export const addCardToInventorySchema = {
  type: "function",
  function: {
    name: "add_card_to_inventory",
    description: "Add a Magic card to the user's inventory. Looks up card details from Scryfall automatically.",
    parameters: {
      type: "object",
      properties: {
        cardName: {
          type: "string",
          description: "Name of the card to add (e.g., 'Sol Ring', 'Lightning Bolt')"
        },
        quantity: {
          type: "number",
          description: "Number of copies to add (default: 1)"
        },
        folder: {
          type: "string",
          description: "Folder/category to put the card in (default: 'Unsorted')"
        }
      },
      required: ["cardName"]
    }
  }
};

/**
 * Remove card from inventory
 */
export const removeCardFromInventorySchema = {
  type: "function",
  function: {
    name: "remove_card_from_inventory",
    description: "Remove a card from the user's inventory.",
    parameters: {
      type: "object",
      properties: {
        cardName: {
          type: "string",
          description: "Name of the card to remove"
        },
        quantity: {
          type: "number",
          description: "Number of copies to remove (default: 1)"
        }
      },
      required: ["cardName"]
    }
  }
};

/**
 * Move card to folder
 */
export const moveCardSchema = {
  type: "function",
  function: {
    name: "move_card",
    description: "Move cards to a different folder/category in the inventory.",
    parameters: {
      type: "object",
      properties: {
        cardName: {
          type: "string",
          description: "Name of the card(s) to move (supports partial matching)"
        },
        targetFolder: {
          type: "string",
          description: "Destination folder name (e.g., 'Unsorted', 'Commander Staples', 'For Sale')"
        },
        quantity: {
          type: "number",
          description: "Number of copies to move (omit to move all matching cards)"
        }
      },
      required: ["cardName", "targetFolder"]
    }
  }
};

/**
 * Search inventory
 */
export const searchInventorySchema = {
  type: "function",
  function: {
    name: "search_inventory",
    description: "Search the user's card inventory by name, type, color, or folder.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query - card name, type, color, or folder. Use 'all' to list entire inventory."
        }
      },
      required: ["query"]
    }
  }
};

/**
 * Create deck
 */
export const createDeckSchema = {
  type: "function",
  function: {
    name: "create_deck",
    description: "Create a new deck.",
    parameters: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Name for the deck"
        },
        commander: {
          type: "string",
          description: "Commander card name (for Commander format)"
        },
        format: {
          type: "string",
          description: "Deck format (default: 'commander')",
          enum: ["commander", "modern", "standard", "pioneer", "legacy", "vintage", "pauper"]
        }
      },
      required: ["name"]
    }
  }
};

/**
 * Add card to deck
 */
export const addCardToDeckSchema = {
  type: "function",
  function: {
    name: "add_card_to_deck",
    description: "Add a card to an existing deck.",
    parameters: {
      type: "object",
      properties: {
        deckName: {
          type: "string",
          description: "Name of the deck to add the card to"
        },
        cardName: {
          type: "string",
          description: "Name of the card to add"
        },
        quantity: {
          type: "number",
          description: "Number of copies to add (default: 1). Note: Commander/EDH format is singleton - only 1 copy allowed except basic lands. Other formats may allow up to 4 copies."
        }
      },
      required: ["deckName", "cardName"]
    }
  }
};

/**
 * Remove card from deck
 */
export const removeCardFromDeckSchema = {
  type: "function",
  function: {
    name: "remove_card_from_deck",
    description: "Remove a card from a deck.",
    parameters: {
      type: "object",
      properties: {
        deckName: {
          type: "string",
          description: "Name of the deck"
        },
        cardName: {
          type: "string",
          description: "Name of the card to remove"
        },
        quantity: {
          type: "number",
          description: "Number of copies to remove (default: 1)"
        }
      },
      required: ["deckName", "cardName"]
    }
  }
};

/**
 * Get decks
 */
export const getDecksSchema = {
  type: "function",
  function: {
    name: "get_decks",
    description: "Get the user's saved decks. Use 'all' to list all decks, or provide a deck name for details.",
    parameters: {
      type: "object",
      properties: {
        deckName: {
          type: "string",
          description: "Specific deck name to get details, or 'all' for list"
        }
      },
      required: []
    }
  }
};

/**
 * Delete deck
 */
export const deleteDeckSchema = {
  type: "function",
  function: {
    name: "delete_deck",
    description: "Delete a saved deck.",
    parameters: {
      type: "object",
      properties: {
        deckName: {
          type: "string",
          description: "Name of the deck to delete"
        }
      },
      required: ["deckName"]
    }
  }
};

/**
 * Record sale
 */
export const recordSaleSchema = {
  type: "function",
  function: {
    name: "record_sale",
    description: "Record a card sale. This removes the card from inventory and logs the sale.",
    parameters: {
      type: "object",
      properties: {
        cardName: {
          type: "string",
          description: "Name of the card sold"
        },
        price: {
          type: "number",
          description: "Sale price in dollars"
        },
        quantity: {
          type: "number",
          description: "Number of copies sold (default: 1)"
        }
      },
      required: ["cardName", "price"]
    }
  }
};

/**
 * Get sales history
 */
export const getSalesSchema = {
  type: "function",
  function: {
    name: "get_sales",
    description: "Get the user's sales history.",
    parameters: {
      type: "object",
      properties: {},
      required: []
    }
  }
};

// ============ NEW TOOL SCHEMAS ============

/**
 * Assess deck power level
 */
export const assessPowerLevelSchema = {
  type: "function",
  function: {
    name: "assess_power_level",
    description: "Analyze a deck's power level on a 1-10 scale with detailed breakdown of factors like fast mana, tutors, interaction, and mana base quality.",
    parameters: {
      type: "object",
      properties: {
        decklist: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              type: { type: "string" },
              cmc: { type: "number" },
            },
          },
          description: "Array of card objects with name, type, and cmc properties"
        }
      },
      required: ["decklist"]
    }
  }
};

/**
 * Find card synergies
 */
export const findSynergiesSchema = {
  type: "function",
  function: {
    name: "find_synergies",
    description: "Find all synergy pairs and combos in a decklist, including infinite combos and card interactions.",
    parameters: {
      type: "object",
      properties: {
        decklist: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
            },
          },
          description: "Array of card objects with name property"
        }
      },
      required: ["decklist"]
    }
  }
};

/**
 * Suggest cards with budget constraints
 */
export const suggestWithBudgetSchema = {
  type: "function",
  function: {
    name: "suggest_with_budget",
    description: "Get budget-aware card suggestions and alternatives for expensive cards in a deck.",
    parameters: {
      type: "object",
      properties: {
        decklist: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              prices: { type: "object" },
            },
          },
          description: "Array of card objects with name and price data"
        },
        budgetTier: {
          type: "string",
          enum: ["budget", "moderate", "optimized", "noLimit"],
          description: "Budget tier: budget ($100), moderate ($300), optimized ($750), or noLimit"
        }
      },
      required: ["decklist"]
    }
  }
};

/**
 * Analyze deck ratios
 */
export const analyzeDeckRatiosSchema = {
  type: "function",
  function: {
    name: "analyze_deck_ratios",
    description: "Analyze card draw, ramp, and interaction ratios in a deck and suggest improvements based on archetype.",
    parameters: {
      type: "object",
      properties: {
        decklist: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              type: { type: "string" },
              oracle_text: { type: "string" },
            },
          },
          description: "Array of card objects"
        },
        archetype: {
          type: "string",
          enum: ["aggro", "midrange", "control", "combo", "tribal", "voltron"],
          description: "Deck archetype for ratio recommendations"
        },
        colors: {
          type: "array",
          items: { type: "string" },
          description: "Color identity (e.g., ['W', 'U', 'B'])"
        }
      },
      required: ["decklist"]
    }
  }
};

/**
 * Detect win conditions
 */
export const detectWinConditionsSchema = {
  type: "function",
  function: {
    name: "detect_win_conditions",
    description: "Identify all win conditions in a deck including combat, combo, alternate win cons, and assess redundancy.",
    parameters: {
      type: "object",
      properties: {
        decklist: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              type: { type: "string" },
            },
          },
          description: "Array of card objects"
        }
      },
      required: ["decklist"]
    }
  }
};

/**
 * Get EDHREC data
 */
export const getEdhrecDataSchema = {
  type: "function",
  function: {
    name: "get_edhrec_data",
    description: "Get popular cards, themes, and synergy data for a commander from EDHREC.",
    parameters: {
      type: "object",
      properties: {
        commanderName: {
          type: "string",
          description: "Name of the commander to look up"
        },
        category: {
          type: "string",
          enum: ["all", "themes", "topCards", "synergies", "saltScore"],
          description: "Type of data to retrieve"
        }
      },
      required: ["commanderName"]
    }
  }
};

/**
 * Adapt to playgroup meta
 */
export const adaptToPlaygroupSchema = {
  type: "function",
  function: {
    name: "adapt_to_playgroup",
    description: "Adapt deck recommendations based on local playgroup meta, common strategies, and hated cards.",
    parameters: {
      type: "object",
      properties: {
        playgroupProfile: {
          type: "object",
          properties: {
            powerLevel: { type: "number" },
            commonStrategies: { type: "array", items: { type: "string" } },
            frequentCommanders: { type: "array", items: { type: "string" } },
            hatedCards: { type: "array", items: { type: "string" } },
          },
          description: "Playgroup meta profile"
        },
        recommendations: {
          type: "array",
          items: { type: "object" },
          description: "Card recommendations to adapt"
        }
      },
      required: ["playgroupProfile", "recommendations"]
    }
  }
};

/**
 * Analyze interaction package
 */
export const analyzeInteractionSchema = {
  type: "function",
  function: {
    name: "analyze_interaction",
    description: "Analyze removal, counterspells, and protection in a deck. Score the interaction package and identify gaps.",
    parameters: {
      type: "object",
      properties: {
        decklist: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              type: { type: "string" },
              oracle_text: { type: "string" },
            },
          },
          description: "Array of card objects"
        },
        colors: {
          type: "array",
          items: { type: "string" },
          description: "Color identity for suggestions"
        }
      },
      required: ["decklist"]
    }
  }
};

/**
 * All tool schemas as an array for easy consumption
 */
export const allToolSchemas = [
  // Read tools
  searchScryfallSchema,
  getCardPriceSchema,
  validateDeckSchema,
  analyzeMoxfieldProfileSchema,
  analyzeMTGGoldfishProfileSchema,
  learnFromYoutubeSchema,
  suggestDeckTechsSchema,
  analyzeFormatMetaSchema,
  // New analysis tools
  assessPowerLevelSchema,
  findSynergiesSchema,
  suggestWithBudgetSchema,
  analyzeDeckRatiosSchema,
  detectWinConditionsSchema,
  getEdhrecDataSchema,
  adaptToPlaygroupSchema,
  analyzeInteractionSchema,
  // Write tools
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
];

/**
 * Read-only tool schemas
 */
export const readToolSchemas = [
  searchScryfallSchema,
  getCardPriceSchema,
  validateDeckSchema,
  analyzeMoxfieldProfileSchema,
  analyzeMTGGoldfishProfileSchema,
  learnFromYoutubeSchema,
  suggestDeckTechsSchema,
  analyzeFormatMetaSchema,
  assessPowerLevelSchema,
  findSynergiesSchema,
  suggestWithBudgetSchema,
  analyzeDeckRatiosSchema,
  detectWinConditionsSchema,
  getEdhrecDataSchema,
  adaptToPlaygroupSchema,
  analyzeInteractionSchema,
  searchInventorySchema,
  getDecksSchema,
  getSalesSchema
];

/**
 * Write tool schemas
 */
export const writeToolSchemas = [
  addCardToInventorySchema,
  removeCardFromInventorySchema,
  moveCardSchema,
  createDeckSchema,
  addCardToDeckSchema,
  removeCardFromDeckSchema,
  deleteDeckSchema,
  recordSaleSchema
];

/**
 * Export schemas by name for easy lookup
 */
export const toolSchemasByName = {
  // Read tools
  search_scryfall: searchScryfallSchema,
  get_card_price: getCardPriceSchema,
  validate_deck: validateDeckSchema,
  analyze_moxfield_profile: analyzeMoxfieldProfileSchema,
  analyze_mtggoldfish_profile: analyzeMTGGoldfishProfileSchema,
  learn_from_youtube: learnFromYoutubeSchema,
  suggest_deck_techs: suggestDeckTechsSchema,
  analyze_format_meta: analyzeFormatMetaSchema,
  // New analysis tools
  assess_power_level: assessPowerLevelSchema,
  find_synergies: findSynergiesSchema,
  suggest_with_budget: suggestWithBudgetSchema,
  analyze_deck_ratios: analyzeDeckRatiosSchema,
  detect_win_conditions: detectWinConditionsSchema,
  get_edhrec_data: getEdhrecDataSchema,
  adapt_to_playgroup: adaptToPlaygroupSchema,
  analyze_interaction: analyzeInteractionSchema,
  // Write tools
  add_card_to_inventory: addCardToInventorySchema,
  remove_card_from_inventory: removeCardFromInventorySchema,
  move_card: moveCardSchema,
  search_inventory: searchInventorySchema,
  create_deck: createDeckSchema,
  add_card_to_deck: addCardToDeckSchema,
  remove_card_from_deck: removeCardFromDeckSchema,
  get_decks: getDecksSchema,
  delete_deck: deleteDeckSchema,
  record_sale: recordSaleSchema,
  get_sales: getSalesSchema
};

export default allToolSchemas;
