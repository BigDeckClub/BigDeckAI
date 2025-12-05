# 🃏 BigDeck AI - Commander Deck Builder

An AI-powered Magic: The Gathering Commander/EDH deck building agent using LangChain and Groq (free, fast LLM API).

## ✨ Features

- **AI-Powered Deck Building**: Leverages advanced LLMs to create optimized Commander decks
- **Commander Format Expertise**: Built-in knowledge of Commander rules, ban list, and deck building theory
- **Scryfall Integration**: Access to complete Magic card database via free Scryfall API
- **Interactive CLI**: User-friendly command-line interface with multiple modes
- **Archetype Support**: Understands aggro, control, combo, tribal, superfriends, and more
- **Budget Awareness**: Can build decks within specified budget constraints
- **Profile Analysis**: Learn from Moxfield and MTGGoldfish user profiles to personalize recommendations
- **YouTube Learning**: Extract deck strategies from Magic YouTube videos and deck techs
- **Meta Analysis**: Track popular commanders, strategies, and format trends
- **Enhanced Recommendations**: AI learns from your build history and preferences
- **Inventory Integration**: (Future) Connect to BigDeckAppV3 to build from your collection
- **Multiple LLM Providers**: Default Groq (free), with OpenAI/Anthropic/Ollama support

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** (check with `node --version`)
- **Groq API Key** (free, get it at [console.groq.com](https://console.groq.com))

### Installation

```bash
# Clone the repository
git clone https://github.com/BigDeckClub/BigDeckApp.git
cd BigDeckApp

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env and add your GROQ_API_KEY
```

### Getting a Free Groq API Key

1. Visit [https://console.groq.com](https://console.groq.com)
2. Sign up for a free account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key to your `.env` file

## 📖 Usage

### Interactive Chat Mode (Default)

Start an interactive conversation with the AI deck builder:

```bash
npm start chat
# or
npm run chat
# or
bigdeck chat
```

**Example interaction:**
```
🃏 BigDeck AI - Commander Deck Builder
Using: Groq (Llama 3 70B)

You: Build me a budget Atraxa superfriends deck under $100

AI: I'd be happy to help you build a budget Atraxa, Praetors' Voice 
superfriends deck! Here's my recommendation...

[Generates 100-card deck list with explanations]
```

### Build a Specific Deck

Build a deck with a specific commander and strategy:

```bash
npm run build -- --commander "Atraxa, Praetors' Voice" --strategy "superfriends"
npm run build -- --commander "Krenko, Mob Boss" --strategy "goblin tribal" --budget 150
```

### Suggest Commanders

Get commander suggestions based on colors and theme:

```bash
bigdeck suggest --colors "WUB" --theme "control"
bigdeck suggest --colors "RG" --theme "aggro"
```

### Analyze a Deck

Analyze an existing deck list:

```bash
bigdeck analyze --file my-deck.txt
```

### Analyze Player Profiles

Learn from Moxfield or MTGGoldfish profiles to understand brewing patterns:

```bash
# Analyze Moxfield profile
bigdeck analyze-profile --moxfield <username>

# Analyze MTGGoldfish profile
bigdeck analyze-profile --goldfish <username>
```

**Example output:**
```
🃏 Profile Analysis

Platform: Moxfield
Username: example_player
Total Decks: 23

Insights:
  • Primary format: commander
  • Most played commander: Atraxa, Praetors' Voice (3 decks)
  • Favorite color combination: Blue/Black/Green (5 decks)

Recommendations:
  • Try exploring Red or White colors
  • Consider exploring different archetypes
```

### Learn from YouTube Videos

Extract deck information and strategy from Magic YouTube videos:

```bash
bigdeck learn --youtube "https://www.youtube.com/watch?v=..."
```

The AI will extract:
- Video title and creator
- Commander name (if detected)
- Strategy type (aggro, control, combo, etc.)
- Linked decklists (Moxfield, Archidekt, etc.)

### Meta Analysis

Analyze the current metagame for any format:

```bash
# Commander meta (default)
bigdeck meta --format commander

# Other formats
bigdeck meta --format modern
bigdeck meta --format standard
```

**Example output:**
```
🃏 Meta Analysis

Format: commander
Total Decks Analyzed: 50

Summary:
  • Analyzed 50 meta decks
  • Most played: Atraxa, Praetors' Voice (8.5% of meta)

Top Meta Decks:
  1. Atraxa, Praetors' Voice (8.5%)
  2. Kinnan, Bonder Prodigy (7.2%)
  3. Edgar Markov (6.8%)
```

## ⚙️ Configuration

### Environment Variables

Edit `.env` to configure the application:

```bash
# Required: Choose your LLM provider
LLM_PROVIDER=groq

# Add your API key
GROQ_API_KEY=your-key-here
```

### Supported LLM Providers

| Provider | Speed | Cost | Setup |
|----------|-------|------|-------|
| **Groq** (default) | ⚡ Very Fast (~300 tokens/sec) | 💚 Free | Get key at console.groq.com |
| OpenAI | 🔵 Fast | 💰 Paid | Requires OpenAI API key |
| Anthropic | 🔵 Fast | 💰 Paid | Requires Anthropic API key |
| Ollama | 🟢 Medium | 💚 Free | Requires local Ollama installation |

## 🏗️ Architecture

```
BigDeckApp/
├── src/
│   ├── index.js                 # Main CLI entry point
│   ├── agent/
│   │   ├── DeckBuilderAgent.js  # Core AI agent logic
│   │   ├── prompts/
│   │   │   └── systemPrompt.js  # Commander expertise prompt
│   │   └── tools/
│   │       ├── searchInventory.js     # Search user inventory
│   │       ├── getCardInfo.js         # Fetch from Scryfall
│   │       ├── validateDeck.js        # Validate legality
│   │       ├── profileAnalysis.js     # Profile analysis tools
│   │       ├── youtubeLearning.js     # YouTube learning tools
│   │       ├── metaAnalysis.js        # Meta analysis tools
│   │       └── index.js               # Tool exports
│   ├── integrations/
│   │   ├── bigDeckApi.js        # BigDeckAppV3 API client
│   │   ├── scryfall.js          # Scryfall API wrapper
│   │   ├── moxfield.js          # Moxfield API client
│   │   ├── mtggoldfish.js       # MTGGoldfish scraper
│   │   ├── youtube.js           # YouTube video parser
│   │   ├── groq.js              # Groq LLM setup
│   │   └── config.js            # API configuration
│   ├── learning/
│   │   ├── profileAnalyzer.js   # User profile analysis
│   │   ├── youtubeLearner.js    # YouTube video learning
│   │   ├── metaAnalyzer.js      # Format meta analysis
│   │   └── recommendationEngine.js  # Personalized recommendations
│   ├── knowledge/
│   │   ├── commanderRules.js    # Format rules & ban list
│   │   ├── archetypes.js        # Deck archetypes
│   │   ├── deckStructure.js     # Card ratio guidelines
│   │   └── staples.js           # Format staples by color
│   └── utils/
│       ├── manabase.js          # Mana base calculations
│       ├── curveAnalysis.js     # CMC curve analysis
│       └── colorIdentity.js     # Color identity validation
```

## 🎯 Features Deep Dive

### Commander Format Knowledge

The AI agent has deep knowledge of:
- **Format Rules**: 100-card singleton, color identity, commander tax, etc.
- **Current Ban List**: Up-to-date with 2024 ban list
- **Deck Building Theory**: 8x8 theory, mana curve optimization, card ratios
- **Meta Awareness**: Power level assessment (1-10 scale), current meta trends
- **Archetypes**: Aggro, Control, Combo, Tribal, Superfriends, Aristocrats, Voltron, and more
- **Learning Capabilities**: Analyzes external profiles and videos to improve recommendations

### Recommended Deck Structure

The agent follows these guidelines:
- **35-38 lands** (adjusted for strategy)
- **10-12 ramp sources** (Sol Ring, signets, ramp spells)
- **10+ card draw sources** (essential for long games)
- **10-12 removal pieces** (single target + board wipes)
- **Strategy-specific slots** (varies by archetype)

### Supported Archetypes

- **Aggro**: Fast, creature-based strategies
- **Control**: Counter spells and removal
- **Combo**: Win through card combinations
- **Midrange**: Value and efficient threats
- **Tribal**: Creature type synergies
- **Superfriends**: Planeswalker-focused
- **Aristocrats**: Sacrifice and death triggers
- **Voltron**: Single creature focus
- **Spellslinger**: Instant/sorcery focused
- **Reanimator**: Graveyard recursion
- **Group Hug**: Political and friendly
- **Stax**: Resource denial

### External Learning & Personalization

BigDeck AI can now learn from external sources to provide smarter, personalized recommendations:

#### Profile Analysis
- **Moxfield Integration**: Analyze user profiles to understand deck building patterns
  - Identifies favorite commanders and color combinations
  - Tracks archetype preferences and brewing style
  - Generates personalized recommendations
- **MTGGoldfish Integration**: Parse public profiles and deck data
  - Analyzes meta trends and popular strategies
  - Compares decks to current metagame

#### YouTube Learning
- **Video Analysis**: Extract information from deck tech videos
  - Parses video titles for commander names and strategies
  - Detects deck links (Moxfield, Archidekt, TappedOut, etc.)
  - Builds knowledge base from top MTG content creators
- **Deck Tech Suggestions**: Get recommended videos for specific commanders

#### Meta Analysis
- **Format Tracking**: Monitor popular decks and strategies
  - Commander format meta analysis
  - Identifies trending commanders and archetypes
  - Tracks deck popularity and meta share
- **Competitive Insights**: Stay updated on what's winning

#### Enhanced Recommendations
The AI uses all learned data to:
- Suggest commanders based on your play history
- Recommend unexplored color combinations or strategies
- Identify budget alternatives and upgrade paths
- Personalize deck building advice to your preferences

## 🔮 Future Roadmap

- [x] **Profile Analysis**: Learn from Moxfield and MTGGoldfish profiles ✓
- [x] **YouTube Learning**: Extract deck techs from videos ✓
- [x] **Meta Analysis**: Track popular commanders and strategies ✓
- [ ] **Web UI**: Browser-based interface
- [ ] **Discord Bot**: Build decks in Discord servers
- [ ] **BigDeckAppV3 Integration**: Build decks from your actual collection
- [ ] **Deck Pricing**: Real-time price data from TCGPlayer/CardKingdom
- [ ] **Deck Optimization**: Advanced upgrade suggestions with budget alternatives
- [ ] **Proxy Generator**: Generate printable proxies
- [ ] **Deck Testing**: Simulate games and goldfish testing
- [ ] **YouTube API Integration**: Full transcript extraction and deck parsing

## 🔗 Related Projects

- **BigDeckAppV3**: Card inventory management system (coming soon)
- **Scryfall**: [scryfall.com](https://scryfall.com) - Magic card database API

## 📝 Example Commands

```bash
# Start interactive chat
npm run chat

# Build a specific deck
npm run build -- --commander "Muldrotha" --strategy "graveyard"

# Budget deck
npm run build -- --commander "Edric" --strategy "flying men" --budget 50

# Suggest commanders for colors
bigdeck suggest --colors "GW" --theme "tokens"

# Analyze a deck file
bigdeck analyze --file decklist.txt

# Analyze Moxfield profile
bigdeck analyze-profile --moxfield your-username

# Analyze MTGGoldfish profile
bigdeck analyze-profile --goldfish your-username

# Learn from YouTube deck tech
bigdeck learn --youtube "https://www.youtube.com/watch?v=..."

# Analyze Commander meta
bigdeck meta --format commander

# Get help
bigdeck --help
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- **Scryfall**: For their excellent free API
- **Groq**: For providing free, fast LLM inference
- **LangChain**: For the agent framework
- **MTG Community**: For format knowledge and resources
