# BigDeck AI - Smart Features Guide

This guide explains the new smart features added to BigDeck AI to help you build better Commander decks.

## What's New?

BigDeck AI now uses **Retrieval Augmented Generation (RAG)** to provide data-driven deck building recommendations. Instead of relying solely on the AI's training data, it can now query real deck databases and meta statistics.

## Smart Features

### 1. EDHREC Integration

When you ask BigDeck AI to build a deck for a specific commander, it automatically:
- Fetches synergy data from EDHREC
- Finds cards that appear frequently in that commander's decks
- Shows you synergy scores (how well cards work with your commander)
- Organizes recommendations by category (creatures, instants, removal, etc.)

**Example:**
```
You: Build me an Atraxa deck

AI: Let me check EDHREC for the best synergy cards...
    [Uses get_edhrec_synergies tool]
    
    Based on EDHREC data, here are the top cards for Atraxa:
    - Doubling Season (95% inclusion, high synergy)
    - Deepglow Skate (88% inclusion, high synergy)
    - ...
```

### 2. Meta Analysis

Get insights about the current Commander meta:
- Top performing commanders and their win rates
- Popular archetypes and strategies
- Meta-defining cards
- Color combination statistics
- Power level distribution

**Example:**
```
You: What's good in the meta right now?

AI: Let me check the current meta...
    [Uses get_meta_analysis tool]
    
    Current top commanders by win rate:
    1. Kinnan, Bonder Prodigy (61% win rate)
    2. Tymna the Weaver (63% win rate)
    ...
```

### 3. Mana Curve Optimization

The AI can analyze your deck's mana curve and suggest improvements:
- Checks if your average CMC is appropriate for your strategy
- Identifies gaps in your curve
- Suggests adding more low-cost or high-cost cards
- Compares to ideal curves for your archetype

**Example:**
```
You: Analyze the mana curve

AI: [Uses analyze_mana_curve tool]
    
    Your deck has:
    - Average CMC: 3.8 (ideal for control: 3.5-4.5) ✓
    - Good distribution at 2-4 CMC ✓
    - Only 2 one-drops - consider adding more early plays
```

## Multiple AI Models

You can now choose which AI model to use:

### Groq (Default - Free)
- Very fast responses (~300 tokens/sec)
- Free tier available
- Great for most deck building needs
- Get key at: console.groq.com

### GPT-4o (Premium)
- Best overall quality
- Excellent reasoning about complex combos
- More expensive but worth it for competitive builds
- Requires OpenAI API key

### Claude 3.5 Sonnet (Premium)
- Excellent at explaining card interactions
- Great at understanding nuanced strategy questions
- Strong reasoning capabilities
- Requires Anthropic API key

### Ollama (Local)
- Run completely offline
- Free and private
- Requires local installation
- Good for basic deck building

## User Preferences & Memory

BigDeck AI now remembers your preferences:

### Deck History
- Tracks the last 50 decks you've built
- Shows your favorite commanders
- Analyzes your deck building patterns

### Saved Preferences
- Default budget
- Preferred power level
- Favorite colors and archetypes
- Cards/strategies to avoid

**Example:**
```
You: Set my default power level to 7

AI: Done! I'll now build decks at power level 7 by default.

You: What's my deck building history?

AI: You've built 15 decks. Your favorites:
    - Atraxa (built 3 times)
    - Average power level: 6.8
    - Favorite colors: WUBG
```

## How to Use These Features

### Ask Specific Questions
```
"What are the best cards for Muldrotha?"
"What's the current Commander meta?"
"Is this mana curve good for aggro?"
```

### Reference Data in Requests
```
"Build me a meta Atraxa deck using EDHREC data"
"Show me the top win rate commanders"
"Optimize my curve for a midrange strategy"
```

### Let the AI Decide
The AI knows when to use these tools automatically:
```
"Build me a competitive Kinnan deck"
[AI automatically checks EDHREC, meta stats, and optimizes curve]
```

## Configuration

### Switching LLM Providers

Edit your `.env` file:

```bash
# Use Groq (default, free)
LLM_PROVIDER=groq
GROQ_API_KEY=your-key-here

# Or use GPT-4o
LLM_PROVIDER=openai
OPENAI_API_KEY=your-key-here
OPENAI_MODEL=gpt-4o

# Or use Claude
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=your-key-here
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
```

### Setting Temperature

Control creativity vs consistency:

```bash
# More creative (0.7-1.0)
LLM_TEMPERATURE=0.8

# More consistent (0.0-0.5)
LLM_TEMPERATURE=0.3
```

## Tips for Best Results

1. **Be Specific**: "Build a budget Atraxa superfriends deck under $100" is better than "Build an Atraxa deck"

2. **Mention Data Sources**: "Use EDHREC to find synergies" tells the AI to prioritize data-driven recommendations

3. **Ask for Analysis**: "Analyze this deck's curve and suggest improvements" gets more detailed feedback

4. **Set Preferences**: Save your default budget and power level to avoid repeating them

5. **Try Different Models**: GPT-4o and Claude give better results for complex competitive decks

## Troubleshooting

### "No EDHREC data found"
- The commander might be very new
- Check spelling of commander name
- Try a different commander

### "API rate limited"
- Wait a minute and try again
- Integrations respect rate limits automatically

### Slow responses
- Use Groq for fastest responses
- GPT-4o and Claude are slower but higher quality

## Data Sources

BigDeck AI uses these sources:
- **EDHREC**: Commander synergies and deck lists
- **MTGGoldfish**: Meta analysis and archetype data  
- **Untapped.gg**: Win rates and competitive statistics
- **Scryfall**: Complete card database

All data is cached to reduce API calls and respect rate limits.

## Future Features

Coming soon:
- Web UI for easier interaction
- Discord bot integration
- Build from your actual card collection
- Real-time pricing data
- Deck testing and simulation

---

**Questions?** Open an issue on GitHub or check the main README for more information.
