# 🃏 BigDeck AI - MTG Commander Knowledge & Utilities Library

A lightweight JavaScript library providing comprehensive Magic: The Gathering Commander knowledge, utilities, and OpenAI-compatible tool schemas for AI-powered deck building applications.

## ✨ Features

- **Commander Format Knowledge**: Complete rules, ban list, archetypes, deck structure guidelines, and format staples
- **Deck Building Utilities**: Color identity validation, mana curve analysis, and mana base calculations
- **Learning Modules**: Profile analysis, YouTube deck tech extraction, and meta analysis
- **OpenAI Function Calling**: Ready-to-use tool schemas for AI function calling
- **Scryfall Integration**: Card search and pricing via the free Scryfall API
- **Zero Dependencies**: Only requires `dotenv` and `zod` for optional configuration
- **TypeScript Friendly**: JSDoc annotations throughout

## 🚀 Installation

```bash
npm install github:BigDeckClub/BigDeckApp
```

Or add to your `package.json`:

```json
{
  "dependencies": {
    "bigdeck-ai": "github:BigDeckClub/BigDeckApp"
  }
}
```

## 📖 Usage

### Basic Imports

```javascript
// Import system prompt for AI agents
import { systemPrompt } from 'bigdeck-ai';

// Import knowledge base
import { isCardBanned, archetypes, staples } from 'bigdeck-ai';

// Import utilities
import { validateDeckColorIdentity, calculateManaCurve } from 'bigdeck-ai';

// Import OpenAI function calling schemas
import { allToolSchemas } from 'bigdeck-ai';
```

### Using with OpenAI Function Calling

```javascript
import OpenAI from 'openai';
import { systemPrompt, allToolSchemas } from 'bigdeck-ai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const response = await openai.chat.completions.create({
  model: "gpt-4-turbo-preview",
  messages: [
    { role: "system", content: systemPrompt },
    { role: "user", content: "Build me a Muldrotha graveyard deck" }
  ],
  tools: allToolSchemas,
  tool_choice: "auto"
});
```

### Commander Rules & Ban List

```javascript
import { commanderRules, isCardBanned } from 'bigdeck-ai';

// Check if a card is banned
const banned = isCardBanned('Flash'); // true

// Get all banned cards
console.log(commanderRules.bannedCards);
// ['Ancestral Recall', 'Balance', 'Biorhythm', ...]

// Access format rules
console.log(commanderRules.deckSize); // 100
console.log(commanderRules.startingLife); // 40
console.log(commanderRules.commanderDamage); // 21
```

### Deck Archetypes

```javascript
import { archetypes, getArchetype, getArchetypesForColors } from 'bigdeck-ai';

// Get specific archetype
const combo = getArchetype('combo');
console.log(combo.description);
console.log(combo.strategy);
console.log(combo.keyCards);

// Get archetypes for color combination
const azorius = getArchetypesForColors('WU');
console.log(azorius); // ['control', 'superfriends', ...]
```

### Color Identity Validation

```javascript
import { 
  parseColorIdentity, 
  validateDeckColorIdentity,
  isValidForCommander 
} from 'bigdeck-ai';

// Parse color identity
const colors = parseColorIdentity('WUB'); // ['W', 'U', 'B']

// Validate deck color identity
const validation = validateDeckColorIdentity(
  'Atraxa, Praetors\' Voice', // WUBG
  ['Sol Ring', 'Lightning Bolt'] // Bolt has R, invalid!
);

console.log(validation.isValid); // false
console.log(validation.violations);
```

### Mana Curve Analysis

```javascript
import { calculateManaCurve, analyzeManaCurve } from 'bigdeck-ai';

const deck = [
  { name: 'Sol Ring', cmc: 1 },
  { name: 'Counterspell', cmc: 2 },
  { name: 'Cultivate', cmc: 3 },
  // ... more cards
];

const curve = calculateManaCurve(deck);
console.log(curve);
// { 0: 0, 1: 5, 2: 12, 3: 15, 4: 10, 5: 8, 6: 5, '7+': 3 }

const analysis = analyzeManaCurve(deck, 'midrange');
console.log(analysis.avgCMC);
console.log(analysis.recommendations);
```

### Mana Base Generation

```javascript
import { generateManaBase, calculateLandCount } from 'bigdeck-ai';

const landCount = calculateLandCount(3.2, 'midrange'); // 37 lands

const manaBase = generateManaBase('WUB', landCount);
console.log(manaBase);
// {
//   basics: { W: 4, U: 5, B: 4 },
//   duals: ['Hallowed Fountain', 'Watery Grave', ...],
//   fetches: ['Polluted Delta', 'Flooded Strand', ...],
//   utility: ['Command Tower', 'Exotic Orchard', ...]
// }
```

### Scryfall Integration

```javascript
import { searchScryfall, getCardPrice, scryfall } from 'bigdeck-ai';

// Search for cards
const cards = await searchScryfall('c:red type:creature cmc<=3', { limit: 10 });
cards.forEach(card => console.log(card.name));

// Get card price
const price = await getCardPrice('Lightning Bolt');
console.log(price);
// {
//   name: 'Lightning Bolt',
//   usd: '0.25',
//   usd_foil: '2.50',
//   eur: '0.20',
//   ...
// }

// Use Scryfall API directly
const card = await scryfall.getCard('Sol Ring');
const commanders = await scryfall.getRandomCommander('WUB');
```

### Profile Analysis

```javascript
import { profileAnalyzer } from 'bigdeck-ai';

// Analyze Moxfield profile
const moxfieldAnalysis = await profileAnalyzer.analyzeMoxfieldProfile('username');
console.log(moxfieldAnalysis.patterns);
console.log(moxfieldAnalysis.insights);
console.log(moxfieldAnalysis.recommendations);

// Analyze MTGGoldfish profile
const goldfishAnalysis = await profileAnalyzer.analyzeMTGGoldfishProfile('username');
console.log(goldfishAnalysis.patterns);
```

### YouTube Learning

```javascript
import { youtubeLearner } from 'bigdeck-ai';

const result = await youtubeLearner.learnFromVideo(
  'https://www.youtube.com/watch?v=...'
);

console.log(result.summary);
// {
//   video: 'Muldrotha Deck Tech',
//   creator: 'MTG Channel',
//   commander: 'Muldrotha, the Gravetide',
//   strategy: 'graveyard',
//   deckAvailable: true
// }
```

### Meta Analysis

```javascript
import { metaAnalyzer } from 'bigdeck-ai';

const meta = await metaAnalyzer.analyzeFormat('commander');
console.log(meta.topDecks);
console.log(meta.trends);
// {
//   popular: ['Atraxa', 'Kinnan', ...],
//   emerging: ['New Commander', ...],
//   declining: ['Old Commander', ...]
// }
```

### Recommendation Engine

```javascript
import { recommendationEngine } from 'bigdeck-ai';

// Track user's deck building history
recommendationEngine.addToHistory({
  commander: 'Atraxa, Praetors\' Voice',
  strategy: 'superfriends',
  colors: ['W', 'U', 'B', 'G']
});

// Get personalized recommendations
const recommendations = recommendationEngine.recommendCommanders();
console.log(recommendations);
// [
//   { name: 'Muldrotha', reason: 'Unexplored sultai colors', score: 85 },
//   ...
// ]
```

## 📦 Module Exports

### Subpath Imports

You can import specific modules using subpath exports:

```javascript
// System prompt
import { systemPrompt } from 'bigdeck-ai/prompts';

// Knowledge modules
import { commanderRules } from 'bigdeck-ai/knowledge/commanderRules';
import { archetypes } from 'bigdeck-ai/knowledge/archetypes';
import { deckStructure } from 'bigdeck-ai/knowledge/deckStructure';
import { staples } from 'bigdeck-ai/knowledge/staples';

// Learning modules
import { profileAnalyzer } from 'bigdeck-ai/learning/profileAnalyzer';
import { youtubeLearner } from 'bigdeck-ai/learning/youtubeLearner';
import { metaAnalyzer } from 'bigdeck-ai/learning/metaAnalyzer';
import { recommendationEngine } from 'bigdeck-ai/learning/recommendationEngine';

// Utilities
import { parseColorIdentity } from 'bigdeck-ai/utils/colorIdentity';
import { calculateManaCurve } from 'bigdeck-ai/utils/curveAnalysis';
import { generateManaBase } from 'bigdeck-ai/utils/manabase';

// Tool schemas
import { allToolSchemas } from 'bigdeck-ai/tools/schemas';

// Integrations
import { scryfall } from 'bigdeck-ai/integrations/scryfall';
```

## 🛠️ OpenAI Function Calling Schemas

The library includes ready-to-use OpenAI function calling schemas:

- `search_scryfall` - Search for MTG cards
- `get_card_price` - Get card prices
- `validate_deck` - Validate Commander deck legality
- `analyze_moxfield_profile` - Analyze Moxfield user profiles
- `analyze_mtggoldfish_profile` - Analyze MTGGoldfish profiles
- `learn_from_youtube` - Extract deck info from YouTube videos
- `suggest_deck_techs` - Suggest deck tech videos
- `analyze_format_meta` - Analyze format metagame

Example usage:

```javascript
import { toolSchemasByName } from 'bigdeck-ai';

// Use individual schema
const tools = [
  toolSchemasByName.search_scryfall,
  toolSchemasByName.validate_deck
];

// Or use all schemas
import { allToolSchemas } from 'bigdeck-ai';
const response = await openai.chat.completions.create({
  tools: allToolSchemas,
  // ...
});
```

## 🏗️ Project Structure

```
bigdeck-ai/
├── index.js                    # Main exports
├── package.json                # Minimal dependencies
├── README.md                   # This file
├── src/
│   ├── prompts/
│   │   └── systemPrompt.js     # AI system prompt
│   ├── knowledge/
│   │   ├── archetypes.js       # Deck archetypes
│   │   ├── commanderRules.js   # Format rules & ban list
│   │   ├── deckStructure.js    # Deck building guidelines
│   │   └── staples.js          # Format staples by color
│   ├── learning/
│   │   ├── metaAnalyzer.js     # Format meta analysis
│   │   ├── profileAnalyzer.js  # User profile analysis
│   │   ├── recommendationEngine.js  # Personalized recommendations
│   │   └── youtubeLearner.js   # YouTube video learning
│   ├── tools/
│   │   └── schemas.js          # OpenAI function calling schemas
│   ├── utils/
│   │   ├── colorIdentity.js    # Color identity validation
│   │   ├── curveAnalysis.js    # Mana curve analysis
│   │   └── manabase.js         # Mana base calculations
│   └── integrations/
│       ├── config.js           # Configuration
│       ├── scryfall.js         # Scryfall API wrapper
│       ├── moxfield.js         # Moxfield API client
│       ├── mtggoldfish.js      # MTGGoldfish scraper
│       └── youtube.js          # YouTube parser
```

## 🎯 Use Cases

### Building an AI Deck Builder

```javascript
import OpenAI from 'openai';
import { 
  systemPrompt, 
  allToolSchemas,
  searchScryfall,
  validateDeckColorIdentity 
} from 'bigdeck-ai';

const openai = new OpenAI();

// Your AI deck building logic here
const response = await openai.chat.completions.create({
  model: "gpt-4-turbo-preview",
  messages: [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt }
  ],
  tools: allToolSchemas
});

// Handle tool calls
if (response.choices[0].message.tool_calls) {
  for (const toolCall of response.choices[0].message.tool_calls) {
    if (toolCall.function.name === 'search_scryfall') {
      const args = JSON.parse(toolCall.function.arguments);
      const cards = await searchScryfall(args.query, { limit: args.limit });
      // Process cards...
    }
  }
}
```

### Deck Validation API

```javascript
import express from 'express';
import { validateDeckColorIdentity, isCardBanned } from 'bigdeck-ai';

const app = express();
app.use(express.json());

app.post('/api/validate-deck', (req, res) => {
  const { commander, decklist } = req.body;
  
  // Check for banned cards
  const banned = decklist.filter(card => isCardBanned(card));
  
  // Validate color identity
  const colorValidation = validateDeckColorIdentity(commander, decklist);
  
  res.json({
    valid: banned.length === 0 && colorValidation.isValid,
    bannedCards: banned,
    colorViolations: colorValidation.violations
  });
});

app.listen(3000);
```

### Personal Deck Advisor

```javascript
import { 
  profileAnalyzer, 
  recommendationEngine,
  metaAnalyzer 
} from 'bigdeck-ai';

// Analyze user's brewing patterns
const profile = await profileAnalyzer.analyzeMoxfieldProfile('username');

// Get meta insights
const meta = await metaAnalyzer.analyzeFormat('commander');

// Generate personalized recommendations
const recommendations = recommendationEngine.recommendCommanders();

console.log('Based on your profile and current meta:');
recommendations.forEach(rec => {
  console.log(`- ${rec.name}: ${rec.reason}`);
});
```

## ⚙️ Configuration

Some modules require environment variables:

```bash
# Optional: For Scryfall API (uses defaults if not set)
SCRYFALL_API_URL=https://api.scryfall.com

# Optional: For profile/meta analysis features
# (These integrations work with public APIs, no keys needed)
```

## 🔗 Related Projects

- **BigDeckAppV3**: Card inventory management system
- **Scryfall**: [scryfall.com](https://scryfall.com) - Magic card database

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- **Scryfall**: For their excellent free API
- **MTG Community**: For format knowledge and resources
