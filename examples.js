/**
 * BigDeck AI - Module Usage Examples
 * Demonstrates various ways to use the bigdeck-ai module
 */

// ============================================================================
// Example 1: Basic Deck Building
// ============================================================================

import { createDeckBuilderAgent } from 'bigdeck-ai';

async function example1_basicDeckBuilding() {
  console.log('\n=== Example 1: Basic Deck Building ===\n');
  
  // Initialize the agent
  const agent = await createDeckBuilderAgent({
    apiKey: process.env.GROQ_API_KEY,
    temperature: 0.7,
    verbose: false
  });

  // Build a deck
  const deck = await agent.buildDeck(
    'Build a budget Krenko, Mob Boss goblin tribal deck under $100'
  );
  
  console.log(deck);
}

// ============================================================================
// Example 2: Interactive Chat
// ============================================================================

async function example2_interactiveChat() {
  console.log('\n=== Example 2: Interactive Chat ===\n');
  
  const agent = await createDeckBuilderAgent({
    apiKey: process.env.GROQ_API_KEY
  });

  let history = [];
  
  // First message
  const response1 = await agent.chat(
    'What are the best commanders for a control strategy in Azorius colors?',
    history
  );
  console.log('AI:', response1.output);
  history = response1.history;
  
  // Follow-up message (maintains context)
  const response2 = await agent.chat(
    'Can you suggest budget replacements for expensive cards in that archetype?',
    history
  );
  console.log('AI:', response2.output);
}

// ============================================================================
// Example 3: Using Utilities
// ============================================================================

import {
  parseColorIdentity,
  getColorCombinationName,
  isCardBanned,
  getEssentialStaples,
  calculateManaCurve,
  generateManaBase
} from 'bigdeck-ai';

function example3_utilities() {
  console.log('\n=== Example 3: Using Utilities ===\n');
  
  // Color identity utilities
  const colors = parseColorIdentity('WUB');
  console.log('Parsed colors:', colors); // ['W', 'U', 'B']
  console.log('Color name:', getColorCombinationName('WUB')); // 'Esper'
  
  // Check banned cards
  console.log('Is Flash banned?', isCardBanned('Flash')); // true
  console.log('Is Sol Ring banned?', isCardBanned('Sol Ring')); // false
  
  // Get staples for colors
  const staples = getEssentialStaples('WUB');
  console.log('Essential staples for Esper:', staples);
  
  // Mana curve analysis (with example deck list)
  const exampleDeck = [
    { name: 'Lightning Bolt', cmc: 1, type_line: 'Instant' },
    { name: 'Counterspell', cmc: 2, type_line: 'Instant' },
    { name: 'Sol Ring', cmc: 1, type_line: 'Artifact' },
    // ... more cards
  ];
  const curve = calculateManaCurve(exampleDeck);
  console.log('Mana curve:', curve);
  
  // Generate mana base recommendations
  const manaBase = generateManaBase(exampleDeck, 'WUB', {
    totalLands: 37,
    budget: 'medium'
  });
  console.log('Mana base recommendations:', manaBase);
}

// ============================================================================
// Example 4: Scryfall API Integration
// ============================================================================

import { scryfall } from 'bigdeck-ai';

async function example4_scryfallAPI() {
  console.log('\n=== Example 4: Scryfall API Integration ===\n');
  
  // Get a specific card
  const card = await scryfall.getCard('Atraxa, Praetors\' Voice');
  console.log('Card name:', card.name);
  console.log('Mana cost:', card.mana_cost);
  console.log('Color identity:', card.color_identity);
  
  // Search for cards
  const searchResults = await scryfall.searchCards(
    'type:legendary type:creature ci:wubr',
    { unique: 'cards' }
  );
  console.log('Found commanders:', searchResults.data.slice(0, 5).map(c => c.name));
  
  // Get random commander
  const randomCommander = await scryfall.getRandomCommander('WUB');
  console.log('Random Esper commander:', randomCommander.name);
}

// ============================================================================
// Example 5: Knowledge Base Access
// ============================================================================

import {
  commanderRules,
  getArchetype,
  getStructureForStrategy
} from 'bigdeck-ai';

function example5_knowledgeBase() {
  console.log('\n=== Example 5: Knowledge Base Access ===\n');
  
  // Commander rules
  console.log('Deck size:', commanderRules.deckSize); // 100
  console.log('Starting life:', commanderRules.startingLife); // 40
  console.log('Banned cards:', commanderRules.bannedCards.length);
  
  // Archetypes
  const aggro = getArchetype('aggro');
  console.log('Aggro archetype:', aggro.name);
  console.log('Aggro avg CMC:', aggro.characteristics.avgCMC);
  console.log('Key cards:', aggro.keyCards);
  
  // Deck structure
  const controlStructure = getStructureForStrategy('control');
  console.log('Control deck structure:', controlStructure);
}

// ============================================================================
// Example 6: Express API Endpoint
// ============================================================================

// Uncomment to use with Express
/*
import express from 'express';
import { createDeckBuilderAgent } from 'bigdeck-ai';

const app = express();
app.use(express.json());

// Initialize agent once at startup
let agent;

async function startServer() {
  try {
    agent = await createDeckBuilderAgent({
      apiKey: process.env.GROQ_API_KEY
    });
    console.log('Agent initialized');

    app.post('/api/build-deck', async (req, res) => {
      try {
        if (!agent) {
          return res.status(503).json({ success: false, error: 'Agent not ready' });
        }
        
        const { commander, strategy, budget, powerLevel } = req.body;
        
        let prompt = `Build a Commander deck with ${commander}`;
        if (strategy) prompt += ` using a ${strategy} strategy`;
        if (budget) prompt += ` with a budget of $${budget}`;
        if (powerLevel) prompt += ` at power level ${powerLevel}`;
        
        const deck = await agent.buildDeck(prompt);
        
        res.json({ success: true, deck });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    app.post('/api/chat', async (req, res) => {
      try {
        if (!agent) {
          return res.status(503).json({ success: false, error: 'Agent not ready' });
        }
        
        const { message, history = [] } = req.body;
        const response = await agent.chat(message, history);
        
        res.json({ success: true, response });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    app.listen(3000, () => {
      console.log('BigDeck AI API server running on port 3000');
    });
  } catch (error) {
    console.error('Failed to initialize agent:', error);
    process.exit(1);
  }
}

startServer();
*/

// ============================================================================
// Example 7: React Component (Server-Side)
// ============================================================================

// Note: For production use, call your backend API from React instead of
// using the API key in the frontend. This example shows a Node.js server
// that can be used with a React frontend.

/*
// Backend server (Node.js/Express)
import express from 'express';
import { createDeckBuilderAgent } from 'bigdeck-ai';

const app = express();
app.use(express.json());

let agent;

async function startServer() {
  agent = await createDeckBuilderAgent({
    apiKey: process.env.GROQ_API_KEY
  });
  
  app.post('/api/build-deck', async (req, res) => {
    if (!agent) {
      return res.status(503).json({ error: 'Agent not ready' });
    }
    
    const { commander, strategy, budget } = req.body;
    const prompt = `Build a ${strategy} deck with ${commander} under $${budget}`;
    const deck = await agent.buildDeck(prompt);
    
    res.json({ deck });
  });
  
  app.listen(3000);
}

startServer();

// Frontend (React)
import { useState } from 'react';

function DeckBuilder() {
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const buildDeck = async () => {
    setLoading(true);
    try {
      const payload = {
        commander: "Krenko, Mob Boss",
        strategy: "goblin tribal",
        budget: 100
      };
      
      const res = await fetch('/api/build-deck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      setResponse(data.deck || JSON.stringify(data, null, 2));
    } catch (error) {
      setResponse(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={buildDeck} disabled={loading}>
        {loading ? 'Building...' : 'Build Deck'}
      </button>
      <pre>{response}</pre>
    </div>
  );
}
*/

// ============================================================================
// Run Examples
// ============================================================================

// Uncomment the examples you want to run:

// await example1_basicDeckBuilding();
// await example2_interactiveChat();
// example3_utilities();
// await example4_scryfallAPI();
// example5_knowledgeBase();

console.log('\n✅ Examples loaded. Uncomment the examples you want to run.\n');

