/**
 * DeckBuilderAgent
 * Core AI agent for building Commander decks using LangChain
 */

import { AgentExecutor, createReactAgent } from 'langchain/agents';
import { pull } from 'langchain/hub';
import { createGroqLLM } from '../integrations/groq.js';
import systemPrompt from './prompts/systemPrompt.js';
import {
  createSearchInventoryTool,
  createGetCardInfoTool,
  createValidateDeckTool,
} from './tools/index.js';

/**
 * DeckBuilderAgent class
 * Manages the AI agent for deck building
 */
export class DeckBuilderAgent {
  constructor(options = {}) {
    this.llm = null;
    this.agent = null;
    this.agentExecutor = null;
    this.options = options;
  }

  /**
   * Initialize the agent with LLM and tools
   */
  async initialize() {
    // Create LLM instance (Groq by default)
    this.llm = createGroqLLM({
      apiKey: this.options.apiKey,
      temperature: this.options.temperature || 0.7,
      streaming: this.options.streaming || false,
    });

    // Create tools
    const tools = [
      createSearchInventoryTool(),
      createGetCardInfoTool(),
      createValidateDeckTool(),
    ];

    // Pull the ReAct prompt from LangChain Hub or use default
    let prompt;
    try {
      prompt = await pull('hwchase17/react');
    } catch (error) {
      console.warn('Could not pull prompt from hub, using default ReAct prompt');
      // Use a basic ReAct prompt structure
      prompt = {
        template: `${systemPrompt}

Answer the following questions as best you can. You have access to the following tools:

{tools}

Use the following format:

Question: the input question you must answer
Thought: you should always think about what to do
Action: the action to take, should be one of [{tool_names}]
Action Input: the input to the action
Observation: the result of the action
... (this Thought/Action/Action Input/Observation can repeat N times)
Thought: I now know the final answer
Final Answer: the final answer to the original input question

Begin!

Question: {input}
Thought: {agent_scratchpad}`,
      };
    }

    // Create the agent
    this.agent = await createReactAgent({
      llm: this.llm,
      tools,
      prompt,
    });

    // Create agent executor
    this.agentExecutor = new AgentExecutor({
      agent: this.agent,
      tools,
      verbose: this.options.verbose || false,
      maxIterations: this.options.maxIterations || 15,
      returnIntermediateSteps: this.options.returnIntermediateSteps || false,
    });

    console.log('✅ DeckBuilderAgent initialized');
  }

  /**
   * Build a Commander deck based on user input
   * @param {string} input - User's deck building request
   * @returns {Promise<string>} Agent's response
   */
  async buildDeck(input) {
    if (!this.agentExecutor) {
      throw new Error('Agent not initialized. Call initialize() first.');
    }

    const result = await this.agentExecutor.invoke({
      input: `${systemPrompt}\n\nUser Request: ${input}`,
    });

    return result.output;
  }

  /**
   * Chat with the agent (for interactive mode)
   * @param {string} message - User's message
   * @param {Array} history - Conversation history
   * @returns {Promise<Object>} Response with output and updated history
   */
  async chat(message, history = []) {
    if (!this.agentExecutor) {
      throw new Error('Agent not initialized. Call initialize() first.');
    }

    // Build context from history
    let context = systemPrompt;
    if (history.length > 0) {
      context += '\n\nPrevious conversation:\n';
      history.forEach(({ role, content }) => {
        context += `${role}: ${content}\n`;
      });
    }

    const result = await this.agentExecutor.invoke({
      input: `${context}\n\nUser: ${message}`,
    });

    // Update history
    const newHistory = [
      ...history,
      { role: 'User', content: message },
      { role: 'Assistant', content: result.output },
    ];

    return {
      output: result.output,
      history: newHistory,
    };
  }

  /**
   * Suggest commanders based on criteria
   * @param {Object} criteria - Search criteria (colors, theme, etc.)
   * @returns {Promise<string>} Suggestions
   */
  async suggestCommanders(criteria) {
    const { colors, theme, budget, powerLevel } = criteria;
    
    let prompt = 'Suggest 5 excellent commanders';
    if (colors) prompt += ` with color identity ${colors}`;
    if (theme) prompt += ` for a ${theme} strategy`;
    if (budget) prompt += ` with a budget of $${budget}`;
    if (powerLevel) prompt += ` at power level ${powerLevel}`;
    
    prompt += '. For each commander, explain why they\'re good for this strategy and what makes them unique.';

    return await this.buildDeck(prompt);
  }

  /**
   * Analyze a deck list
   * @param {Array} deckList - Array of card objects
   * @param {Object} commander - Commander card
   * @returns {Promise<string>} Analysis
   */
  async analyzeDeck(deckList, commander) {
    const prompt = `Analyze this Commander deck and provide feedback:

Commander: ${commander.name}

Deck list (${deckList.length} cards):
${deckList.map(card => card.name).join('\n')}

Please analyze:
1. Overall strategy and consistency
2. Mana curve and land count
3. Removal and interaction
4. Card draw and ramp
5. Win conditions
6. Suggestions for improvement

Provide specific, actionable recommendations.`;

    return await this.buildDeck(prompt);
  }
}

/**
 * Create and initialize a DeckBuilderAgent
 * @param {Object} options - Agent options
 * @returns {Promise<DeckBuilderAgent>} Initialized agent
 */
export async function createDeckBuilderAgent(options = {}) {
  const agent = new DeckBuilderAgent(options);
  await agent.initialize();
  return agent;
}

export default DeckBuilderAgent;
