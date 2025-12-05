#!/usr/bin/env node

/**
 * BigDeck AI - Commander Deck Builder
 * Main CLI entry point
 */

import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import dotenv from 'dotenv';
import { createDeckBuilderAgent } from './agent/DeckBuilderAgent.js';
import { config, validateConfig } from './integrations/config.js';

// Load environment variables
dotenv.config();

const program = new Command();

// CLI metadata
program
  .name('bigdeck')
  .description('AI-powered Commander deck building agent')
  .version('1.0.0');

/**
 * Interactive chat mode (default)
 */
program
  .command('chat', { isDefault: true })
  .description('Start interactive chat with the deck builder')
  .action(async () => {
    try {
      console.log(chalk.cyan.bold('\n🃏 BigDeck AI - Commander Deck Builder'));
      console.log(chalk.gray(`Using: ${config.llm.provider} (${config.llm[config.llm.provider].model})\n`));

      // Validate configuration
      validateConfig();

      // Initialize agent
      console.log(chalk.gray('Initializing AI agent...'));
      const agent = await createDeckBuilderAgent({ verbose: false });
      console.log(chalk.green('✓ Ready!\n'));

      // Conversation history
      let history = [];

      // Interactive loop
      while (true) {
        const { input } = await inquirer.prompt([
          {
            type: 'input',
            name: 'input',
            message: chalk.yellow('You:'),
            prefix: '',
          },
        ]);

        // Exit commands
        if (['exit', 'quit', 'bye'].includes(input.toLowerCase().trim())) {
          console.log(chalk.cyan('\n👋 Thanks for using BigDeck AI!\n'));
          process.exit(0);
        }

        // Skip empty input
        if (!input.trim()) continue;

        try {
          // Get response from agent
          console.log(chalk.gray('\nThinking...\n'));
          const { output, history: newHistory } = await agent.chat(input, history);
          history = newHistory;

          // Display response
          console.log(chalk.cyan('AI:'), output);
          console.log(); // Empty line for spacing
        } catch (error) {
          console.error(chalk.red('Error:'), error.message);
          console.log(chalk.gray('Please try again.\n'));
        }
      }
    } catch (error) {
      console.error(chalk.red('Failed to start chat mode:'), error.message);
      if (error.message.includes('API_KEY')) {
        console.log(chalk.yellow('\n💡 Tip: Get a free Groq API key at https://console.groq.com'));
        console.log(chalk.yellow('   Then add it to your .env file as GROQ_API_KEY\n'));
      }
      process.exit(1);
    }
  });

/**
 * Build a specific deck
 */
program
  .command('build')
  .description('Build a Commander deck')
  .option('-c, --commander <name>', 'Commander name')
  .option('-s, --strategy <strategy>', 'Deck strategy/archetype')
  .option('-b, --budget <amount>', 'Budget in USD')
  .option('-p, --power-level <level>', 'Power level (1-10)')
  .action(async (options) => {
    try {
      console.log(chalk.cyan.bold('\n🃏 Building Commander Deck\n'));

      // Validate configuration
      validateConfig();

      // Collect missing information
      if (!options.commander) {
        const { commander } = await inquirer.prompt([
          {
            type: 'input',
            name: 'commander',
            message: 'Commander name:',
            validate: (input) => input.trim() ? true : 'Please enter a commander name',
          },
        ]);
        options.commander = commander;
      }

      // Initialize agent
      console.log(chalk.gray('Initializing AI agent...'));
      const agent = await createDeckBuilderAgent({ verbose: false });

      // Build prompt
      let prompt = `Build a Commander deck with ${options.commander} as the commander`;
      if (options.strategy) prompt += ` using a ${options.strategy} strategy`;
      if (options.budget) prompt += ` with a budget of $${options.budget}`;
      if (options.powerLevel) prompt += ` at power level ${options.powerLevel}`;
      prompt += '. Provide the complete 100-card decklist organized by category.';

      // Build deck
      console.log(chalk.gray('Building deck...\n'));
      const result = await agent.buildDeck(prompt);

      // Display result
      console.log(result);
      console.log(chalk.green('\n✓ Deck complete!\n'));
    } catch (error) {
      console.error(chalk.red('Failed to build deck:'), error.message);
      process.exit(1);
    }
  });

/**
 * Suggest commanders
 */
program
  .command('suggest')
  .description('Suggest commanders based on criteria')
  .option('-c, --colors <colors>', 'Color identity (e.g., WUB, RG)')
  .option('-t, --theme <theme>', 'Deck theme/archetype')
  .option('-b, --budget <amount>', 'Budget in USD')
  .option('-p, --power-level <level>', 'Power level (1-10)')
  .action(async (options) => {
    try {
      console.log(chalk.cyan.bold('\n🃏 Commander Suggestions\n'));

      // Validate configuration
      validateConfig();

      // Initialize agent
      console.log(chalk.gray('Initializing AI agent...'));
      const agent = await createDeckBuilderAgent({ verbose: false });

      // Get suggestions
      console.log(chalk.gray('Finding commanders...\n'));
      const result = await agent.suggestCommanders(options);

      // Display result
      console.log(result);
      console.log();
    } catch (error) {
      console.error(chalk.red('Failed to suggest commanders:'), error.message);
      process.exit(1);
    }
  });

/**
 * Analyze a deck
 */
program
  .command('analyze')
  .description('Analyze a deck list')
  .option('-f, --file <path>', 'Path to deck list file')
  .action(async (options) => {
    try {
      console.log(chalk.cyan.bold('\n🃏 Deck Analysis\n'));

      if (!options.file) {
        console.error(chalk.red('Error: Please provide a deck list file with --file'));
        process.exit(1);
      }

      // TODO: Implement deck file parsing
      console.log(chalk.yellow('Deck analysis feature coming soon!'));
      console.log(chalk.gray('File:', options.file));
    } catch (error) {
      console.error(chalk.red('Failed to analyze deck:'), error.message);
      process.exit(1);
    }
  });

// Parse arguments
program.parse();
