# 🃏 BigDeck AI - MTG Commander Knowledge & Utilities Library

A lightweight JavaScript library providing comprehensive Magic: The Gathering Commander knowledge, utilities, and OpenAI-compatible tool schemas for AI-powered deck building applications.

## ✨ Features

### Core Knowledge Base
- **Commander Format Knowledge**: Complete rules, ban list, archetypes (20+ including new variants), deck structure guidelines, and format staples
- **Synergy Database**: Card interaction mapping with combo detection and synergy scoring
- **Expanded Archetypes**: Chaos, Voltron variants (Equipment/Aura/Counters), Landfall, Blink, Wheels, Tokens, and detailed Tribal sub-types

### Advanced Analysis Tools
- **Power Level Assessment**: Comprehensive 1-10 scale rating with detailed factor breakdown (fast mana, tutors, interaction, mana base quality)
- **Deck Ratio Analysis**: Card draw, ramp, and interaction ratios with archetype-specific recommendations
- **Win Condition Detection**: Identify combat, combo, alternate, and attrition win conditions with redundancy assessment
- **Interaction Scoring**: Evaluate removal, counterspells, protection, and graveyard hate packages
- **Mana Curve Analysis**: Detailed curve visualization and optimization suggestions

### Smart Recommendations
- **ML-Based Recommender**: Similarity-based recommendations using deck feature extraction
- **Budget Optimizer**: Budget-aware suggestions with price comparisons and alternatives across multiple tiers
- **Playgroup Meta Adaptation**: Learn from game results and adapt to local meta
- **Synergy Suggestions**: AI-powered card suggestions based on existing deck synergies

### Integrations
- **Scryfall**: Card search and pricing via the free Scryfall API
- **EDHREC**: Popular cards, themes, synergy scores, and salt ratings (stub implementation)
- **Archidekt**: Deck import and search functionality (stub implementation)
- **TCGPlayer**: Alternative pricing source with price history and trends (stub implementation)

### AI Enhancement
- **Persona System**: Adaptive communication styles (Beginner, Intermediate, Advanced, Competitive, Casual)
- **Chain-of-Thought Reasoning**: Structured 4-phase deck building approach
- **OpenAI Function Calling**: 20+ ready-to-use tool schemas for AI function calling

### Developer Experience
- **TypeScript Friendly**: JSDoc annotations throughout
- **Minimal Dependencies**: Only requires `dotenv` and `zod`
- **Comprehensive Exports**: Granular subpath imports for tree-shaking

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

## 🆕 New Features & Examples

### Power Level Assessment

```javascript
import { assessPowerLevel, suggestPowerLevelAdjustments } from 'bigdeck-ai';

// Assess deck power level
const assessment = assessPowerLevel(decklist);
console.log(assessment);
// {
//   score: 7,
//   tier: 'optimized',
//   confidence: 'high',
//   factors: {
//     avgCMC: 3.2,
//     fastManaCount: 5,
//     tutorCount: 6,
//     interactionCount: 12,
//     comboCount: 2,
//     manaBase: { quality: 'high', premiumCount: 8 }
//   }
// }

// Get suggestions to adjust power level
const adjustments = suggestPowerLevelAdjustments(decklist, 8);
console.log(adjustments.suggestions);
```

### Synergy Detection

```javascript
import { findSynergyPairs, suggestSynergyCards, findInfiniteCombos } from 'bigdeck-ai';

// Find synergy pairs in deck
const pairs = findSynergyPairs(decklist);
console.log(pairs);
// [
//   {
//     card1: 'Doubling Season',
//     card2: 'Planeswalker',
//     categories: ['planeswalkers', 'tokens'],
//     description: 'Doubles loyalty counters'
//   }
// ]

// Detect infinite combos
const combos = findInfiniteCombos(decklist);
console.log(combos);
// [
//   {
//     mainCard: 'Thassa\'s Oracle',
//     pieces: ['Demonic Consultation'],
//     description: 'Exile library, win on ETB'
//   }
// ]

// Suggest synergistic cards
const suggestions = suggestSynergyCards(decklist, 5);
```

### Budget Optimization

```javascript
import { 
  calculateDeckCost, 
  suggestWithBudget, 
  findBudgetAlternatives 
} from 'bigdeck-ai';

// Calculate total deck cost
const cost = calculateDeckCost(decklist);
console.log(cost);
// {
//   total: 456.78,
//   mostExpensive: [...],
//   averageCardPrice: 4.57
// }

// Get budget suggestions
const budgetSuggestions = suggestWithBudget(decklist, 'moderate');
console.log(budgetSuggestions);
// {
//   currentCost: 456.78,
//   targetBudget: 300,
//   suggestions: [
//     {
//       replace: 'Mana Crypt',
//       currentPrice: 150,
//       alternatives: [
//         { name: 'Sol Ring', reason: 'Similar fast mana' }
//       ]
//     }
//   ]
// }

// Find budget alternatives for specific card
const alternatives = findBudgetAlternatives('Mana Crypt', 5);
```

### Deck Analysis

```javascript
import { 
  analyzeCardAdvantage, 
  analyzeRampPackage, 
  suggestRatioImprovements 
} from 'bigdeck-ai';

// Analyze card draw
const drawAnalysis = analyzeCardAdvantage(decklist);
console.log(drawAnalysis);
// {
//   count: 10,
//   cardDraw: 8,
//   impulseDraw: 2,
//   quality: 'good',
//   rating: 8
// }

// Analyze ramp
const rampAnalysis = analyzeRampPackage(decklist);
console.log(rampAnalysis);
// {
//   count: 12,
//   manaRocks: 8,
//   manaDorks: 2,
//   landRamp: 2,
//   quality: 'excellent'
// }

// Get ratio improvement suggestions
const suggestions = suggestRatioImprovements(decklist, 'midrange', ['W', 'U', 'B']);
```

### Win Condition Detection

```javascript
import { 
  detectWinConditions, 
  assessWinConRedundancy, 
  suggestWinConditions 
} from 'bigdeck-ai';

// Detect all win conditions
const wincons = detectWinConditions(decklist);
console.log(wincons);
// {
//   found: [
//     { type: 'combat', name: 'Craterhoof Behemoth' },
//     { type: 'combo', name: 'Thassa\'s Oracle + Consultation' }
//   ],
//   count: 5,
//   hasSufficientWincons: true
// }

// Assess redundancy
const redundancy = assessWinConRedundancy(decklist);
console.log(redundancy);
// {
//   rating: 'good',
//   totalWincons: 5,
//   uniqueTypes: 3,
//   message: 'Good win condition diversity'
// }

// Suggest win conditions
const suggestions = suggestWinConditions(decklist, 'combo', ['U', 'B']);
```

### Interaction Analysis

```javascript
import { 
  analyzeInteraction, 
  scoreInteractionPackage, 
  getInteractionReport 
} from 'bigdeck-ai';

// Analyze interaction
const interaction = analyzeInteraction(decklist);
console.log(interaction);
// {
//   total: 15,
//   breakdown: {
//     spotRemoval: 8,
//     boardWipes: 3,
//     counterspells: 4
//   }
// }

// Score interaction package
const score = scoreInteractionPackage(decklist);
console.log(score);
// {
//   score: 8,
//   rating: 'excellent',
//   total: 15
// }

// Get comprehensive report
const report = getInteractionReport(decklist, ['W', 'U', 'B']);
```

### ML-Based Recommendations

```javascript
import { 
  findSimilarDecks, 
  recommendFromSimilarDecks, 
  extractDeckFeatures 
} from 'bigdeck-ai';

// Find similar decks
const similarDecks = findSimilarDecks(myDeck, deckDatabase, 10);
console.log(similarDecks);
// [
//   {
//     deck: { name: 'Similar Deck', ... },
//     similarity: 0.85,
//     colorMatch: true
//   }
// ]

// Get recommendations from similar decks
const recommendations = recommendFromSimilarDecks(myDeck, deckDatabase, 10);
console.log(recommendations);
// [
//   {
//     name: 'Recommended Card',
//     appearances: 8,
//     reason: 'Found in 8 similar decks'
//   }
// ]
```

### Playgroup Meta Adaptation

```javascript
import { 
  recordGameResult, 
  analyzePlaygroupMeta, 
  suggestMetaCounters 
} from 'bigdeck-ai';

// Record game results
recordGameResult({
  deckUsed: 'Atraxa Superfriends',
  result: 'win',
  turns: 9,
  opponentCommanders: ['Korvold', 'Kinnan', 'Tymna & Thrasios'],
  notes: 'Combo decks were prevalent'
});

// Analyze playgroup meta
const meta = analyzePlaygroupMeta();
console.log(meta);
// {
//   profile: {
//     powerLevel: 8,
//     commonStrategies: ['combo', 'control'],
//     frequentCommanders: [...],
//     comboFrequency: 'high'
//   }
// }

// Get meta-specific tech suggestions
const counters = suggestMetaCounters(meta.profile, 5);
console.log(counters);
// [
//   {
//     name: 'Rule of Law',
//     reason: 'Slows down storm and combo',
//     relevance: 'high'
//   }
// ]
```

### Persona System

```javascript
import { 
  personas, 
  getPersonaPrompt, 
  detectUserLevel, 
  getPersonaRecommendations 
} from 'bigdeck-ai';

// Get persona-specific prompt
const prompt = getPersonaPrompt('competitive');
console.log(prompt);
// Returns customized system prompt for cEDH focus

// Detect user expertise level
const level = detectUserLevel(conversationHistory);
console.log(level); // 'beginner', 'intermediate', 'advanced', 'competitive', 'casual'

// Get persona recommendations
const recommendations = getPersonaRecommendations('beginner');
console.log(recommendations);
// {
//   budgetTier: 'budget',
//   powerLevel: 5,
//   avoidComplexCombos: true,
//   includeExplanations: true
// }
```

### EDHREC Integration

```javascript
import { 
  getCommanderData, 
  getPopularCards, 
  getSaltScore, 
  getThemes 
} from 'bigdeck-ai';

// Get commander data (stub implementation)
const commanderData = await getCommanderData('Atraxa, Praetors\' Voice');
console.log(commanderData.themes);
console.log(commanderData.topCards);

// Get salt score
const saltScore = await getSaltScore('Cyclonic Rift');
console.log(saltScore);
// {
//   card: 'Cyclonic Rift',
//   saltScore: 2.94,
//   rating: 'salty'
// }
```

### TCGPlayer Pricing

```javascript
import { 
  getTCGPlayerPrice, 
  comparePrices, 
  getPriceHistory 
} from 'bigdeck-ai';

// Get TCGPlayer price (stub implementation)
const price = await getTCGPlayerPrice('Sol Ring');
console.log(price);

// Compare prices across platforms
const comparison = await comparePrices('Mana Crypt');
console.log(comparison);
// {
//   sources: {
//     tcgplayer: { low: 145, mid: 165, high: 185 },
//     scryfall: { low: 142, mid: 168, high: 190 }
//   },
//   bestPrice: { source: 'TCGPlayer', price: 145 }
// }

// Get price history
const history = await getPriceHistory('Rhystic Study', 90);
console.log(history.trend); // 'rising', 'falling', or 'stable'
```

## 📦 Module Exports

### Subpath Imports

You can import specific modules using subpath exports:

```javascript
// System prompts
import { systemPrompt } from 'bigdeck-ai/prompts';
import { personas, getPersonaPrompt } from 'bigdeck-ai/prompts/personas';

// Knowledge modules
import { commanderRules } from 'bigdeck-ai/knowledge/commanderRules';
import { archetypes } from 'bigdeck-ai/knowledge/archetypes';
import { deckStructure } from 'bigdeck-ai/knowledge/deckStructure';
import { staples } from 'bigdeck-ai/knowledge/staples';
import { synergies, findSynergyPairs } from 'bigdeck-ai/knowledge/synergies';

// Learning modules
import { profileAnalyzer } from 'bigdeck-ai/learning/profileAnalyzer';
import { youtubeLearner } from 'bigdeck-ai/learning/youtubeLearner';
import { metaAnalyzer } from 'bigdeck-ai/learning/metaAnalyzer';
import { recommendationEngine } from 'bigdeck-ai/learning/recommendationEngine';
import { findSimilarDecks } from 'bigdeck-ai/learning/mlRecommender';
import { analyzePlaygroupMeta } from 'bigdeck-ai/learning/playgroupMeta';

// Utilities
import { parseColorIdentity } from 'bigdeck-ai/utils/colorIdentity';
import { calculateManaCurve } from 'bigdeck-ai/utils/curveAnalysis';
import { generateManaBase } from 'bigdeck-ai/utils/manabase';
import { assessPowerLevel } from 'bigdeck-ai/utils/powerLevel';
import { suggestWithBudget } from 'bigdeck-ai/utils/budgetOptimizer';
import { analyzeCardAdvantage } from 'bigdeck-ai/utils/deckAnalysis';
import { detectWinConditions } from 'bigdeck-ai/utils/winConditions';
import { analyzeInteraction } from 'bigdeck-ai/utils/interactionAnalysis';

// Tool schemas
import { allToolSchemas } from 'bigdeck-ai/tools/schemas';

// Integrations
import { scryfall } from 'bigdeck-ai/integrations/scryfall';
import { getCommanderData } from 'bigdeck-ai/integrations/edhrec';
import { fetchDeck } from 'bigdeck-ai/integrations/archidekt';
import { getTCGPlayerPrice } from 'bigdeck-ai/integrations/tcgplayer';
```

## 🛠️ OpenAI Function Calling Schemas

The library includes ready-to-use OpenAI function calling schemas:

### Analysis Tools (New)
- `assess_power_level` - Analyze deck power level (1-10 scale)
- `find_synergies` - Find card synergies and combos
- `suggest_with_budget` - Budget-aware recommendations
- `analyze_deck_ratios` - Card draw/ramp ratio analysis
- `detect_win_conditions` - Find win conditions
- `analyze_interaction` - Evaluate removal and interaction
- `get_edhrec_data` - EDHREC lookup
- `adapt_to_playgroup` - Playgroup meta adaptation

### Original Tools
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
├── index.js                         # Main exports
├── package.json                     # Minimal dependencies
├── README.md                        # This file
├── src/
│   ├── prompts/
│   │   ├── systemPrompt.js          # AI system prompt with chain-of-thought
│   │   └── personas.js              # Persona system (Beginner to cEDH)
│   ├── knowledge/
│   │   ├── archetypes.js            # 20+ deck archetypes with variants
│   │   ├── commanderRules.js        # Format rules & ban list
│   │   ├── deckStructure.js         # Deck building guidelines
│   │   ├── staples.js               # Format staples by color
│   │   └── synergies.js             # Card synergy database & combos
│   ├── learning/
│   │   ├── metaAnalyzer.js          # Format meta analysis
│   │   ├── profileAnalyzer.js       # User profile analysis
│   │   ├── recommendationEngine.js  # Personalized recommendations
│   │   ├── youtubeLearner.js        # YouTube video learning
│   │   ├── mlRecommender.js         # ML-based similarity engine
│   │   └── playgroupMeta.js         # Playgroup meta adaptation
│   ├── tools/
│   │   ├── schemas.js               # 20+ OpenAI function calling schemas
│   │   └── handlers.js              # Tool implementations
│   ├── utils/
│   │   ├── colorIdentity.js         # Color identity validation
│   │   ├── curveAnalysis.js         # Mana curve analysis
│   │   ├── manabase.js              # Mana base calculations
│   │   ├── powerLevel.js            # Power level assessment (1-10)
│   │   ├── budgetOptimizer.js       # Budget-aware suggestions
│   │   ├── deckAnalysis.js          # Draw/ramp ratio analysis
│   │   ├── winConditions.js         # Win condition detection
│   │   └── interactionAnalysis.js   # Interaction package scoring
│   ├── integrations/
│   │   ├── config.js                # Configuration
│   │   ├── scryfall.js              # Scryfall API wrapper
│   │   ├── moxfield.js              # Moxfield API client
│   │   ├── mtggoldfish.js           # MTGGoldfish scraper
│   │   ├── youtube.js               # YouTube parser
│   │   ├── edhrec.js                # EDHREC integration (stub)
│   │   ├── archidekt.js             # Archidekt integration (stub)
│   │   ├── tcgplayer.js             # TCGPlayer pricing (stub)
│   │   └── bigDeckApi.js            # BigDeck API client
│   └── data/
│       └── store.js                 # Data persistence
```
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
