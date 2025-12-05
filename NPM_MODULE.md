# BigDeck AI - NPM Module Export

## Summary
BigDeck AI can now be imported as an npm module for use in frontend applications, API servers, and other Node.js projects. This enables direct integration with BigDeckAppV3 and other projects.

## Installation

### From GitHub
```bash
npm install github:BigDeckClub/BigDeckApp
```

### Add to package.json
```json
{
  "dependencies": {
    "bigdeck-ai": "github:BigDeckClub/BigDeckApp"
  }
}
```

## Quick Start

### Basic Usage
```javascript
import { createDeckBuilderAgent } from 'bigdeck-ai';

// Create agent
const agent = await createDeckBuilderAgent({
  apiKey: process.env.GROQ_API_KEY
});

// Build a deck
const deck = await agent.buildDeck(
  'Build me a budget Atraxa superfriends deck under $500'
);
console.log(deck);
```

### Interactive Chat
```javascript
import { createDeckBuilderAgent } from 'bigdeck-ai';

const agent = await createDeckBuilderAgent({
  apiKey: process.env.GROQ_API_KEY
});

let history = [];
const { output, history: newHistory } = await agent.chat(
  'What are the best commanders for control?',
  history
);
console.log(output);
```

### Using Utilities
```javascript
import {
  parseColorIdentity,
  getColorCombinationName,
  isCardBanned,
  getEssentialStaples,
  scryfall
} from 'bigdeck-ai';

// Color utilities
const colors = parseColorIdentity('WUB'); // ['W', 'U', 'B']
const name = getColorCombinationName('WUB'); // 'Esper'

// Commander rules
const banned = isCardBanned('Flash'); // true

// Get staples
const staples = getEssentialStaples('WUB');

// Fetch card data
const card = await scryfall.getCard('Atraxa, Praetors\' Voice');
```

## Available Exports

### Main Export
Import everything from the main entrypoint:
```javascript
import {
  DeckBuilderAgent,
  createDeckBuilderAgent,
  commanderRules,
  archetypes,
  // ... and more
} from 'bigdeck-ai';
```

### Subpath Exports
Import from specific modules for better tree-shaking:

```javascript
// Agent
import { DeckBuilderAgent, createDeckBuilderAgent } from 'bigdeck-ai/agent';

// Tools
import { createGetCardInfoTool, createValidateDeckTool } from 'bigdeck-ai/tools';

// System Prompt
import { systemPrompt } from 'bigdeck-ai/prompts';

// Integrations
import { config } from 'bigdeck-ai/integrations/config';
import { scryfall } from 'bigdeck-ai/integrations/scryfall';
import { createGroqLLM } from 'bigdeck-ai/integrations/groq';

// Knowledge Base
import { commanderRules } from 'bigdeck-ai/knowledge/commanderRules';
import { archetypes } from 'bigdeck-ai/knowledge/archetypes';
import { deckStructure } from 'bigdeck-ai/knowledge/deckStructure';
import { staples } from 'bigdeck-ai/knowledge/staples';

// Utilities
import { parseColorIdentity } from 'bigdeck-ai/utils/colorIdentity';
import { calculateManaCurve } from 'bigdeck-ai/utils/curveAnalysis';
import { generateManaBase } from 'bigdeck-ai/utils/manabase';
```

## Integration Examples

### Express API
```javascript
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
          return res.status(503).json({ error: 'Agent not ready' });
        }
        
        const { commander, strategy, budget } = req.body;
        const prompt = `Build a ${strategy} deck with ${commander} under $${budget}`;
        const deck = await agent.buildDeck(prompt);
        
        res.json({ deck });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    app.listen(3000, () => {
      console.log('Server listening on port 3000');
    });
  } catch (error) {
    console.error('Failed to initialize agent:', error);
    process.exit(1);
  }
}

startServer();
```

### React Component
```javascript
import { useState } from 'react';

function DeckBuilder() {
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const buildDeck = async () => {
    setLoading(true);
    try {
      // Call your backend API instead of using the key in the frontend
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
```

## CLI Still Available

The CLI functionality remains unchanged:
```bash
# Interactive chat
npm run chat

# Build a deck
npm run build -- --commander "Atraxa" --strategy "superfriends"

# Suggest commanders
bigdeck suggest --colors "WUB" --theme "control"
```

## Requirements
- Node.js 18 or higher
- Groq API key (free at console.groq.com)

## More Examples
See `examples.js` in the package for comprehensive usage examples.

## Documentation
Full documentation available in the README.md file.
