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

/**
 * Analyze user profile from Moxfield or MTGGoldfish
 */
program
  .command('analyze-profile')
  .description('Analyze a user profile to learn brewing patterns')
  .option('--moxfield <username>', 'Moxfield username')
  .option('--goldfish <username>', 'MTGGoldfish username')
  .action(async (options) => {
    try {
      console.log(chalk.cyan.bold('\n🃏 Profile Analysis\n'));

      // Validate configuration
      validateConfig();

      // Dynamic import to avoid loading if not needed
      const { profileAnalyzer } = await import('./learning/profileAnalyzer.js');

      if (options.moxfield) {
        console.log(chalk.gray(`Analyzing Moxfield profile: ${options.moxfield}...\n`));
        const analysis = await profileAnalyzer.analyzeMoxfieldProfile(options.moxfield);
        
        // Display results
        console.log(chalk.bold(`Platform: ${analysis.platform}`));
        console.log(chalk.bold(`Username: ${analysis.username}`));
        console.log(chalk.bold(`Total Decks: ${analysis.totalDecks}\n`));
        
        if (analysis.insights && analysis.insights.length > 0) {
          console.log(chalk.yellow('Insights:'));
          analysis.insights.forEach(insight => {
            console.log(chalk.gray(`  • ${insight}`));
          });
          console.log();
        }
        
        if (analysis.recommendations && analysis.recommendations.length > 0) {
          console.log(chalk.yellow('Recommendations:'));
          analysis.recommendations.forEach(rec => {
            console.log(chalk.gray(`  • ${rec}`));
          });
          console.log();
        }
      } else if (options.goldfish) {
        console.log(chalk.gray(`Analyzing MTGGoldfish profile: ${options.goldfish}...\n`));
        const analysis = await profileAnalyzer.analyzeMTGGoldfishProfile(options.goldfish);
        
        // Display results
        console.log(chalk.bold(`Platform: ${analysis.platform}`));
        console.log(chalk.bold(`Username: ${analysis.username}`));
        console.log(chalk.bold(`Total Decks: ${analysis.totalDecks}`));
        console.log(chalk.bold(`Analyzed: ${analysis.analyzedDecks} decks\n`));
        
        if (analysis.insights && analysis.insights.length > 0) {
          console.log(chalk.yellow('Insights:'));
          analysis.insights.forEach(insight => {
            console.log(chalk.gray(`  • ${insight}`));
          });
          console.log();
        }
        
        if (analysis.recommendations && analysis.recommendations.length > 0) {
          console.log(chalk.yellow('Recommendations:'));
          analysis.recommendations.forEach(rec => {
            console.log(chalk.gray(`  • ${rec}`));
          });
          console.log();
        }
      } else {
        console.error(chalk.red('Error: Please provide either --moxfield or --goldfish username'));
        process.exit(1);
      }
      
      console.log(chalk.green('✓ Analysis complete!\n'));
    } catch (error) {
      console.error(chalk.red('Failed to analyze profile:'), error.message);
      process.exit(1);
    }
  });

/**
 * Learn from YouTube video
 */
program
  .command('learn')
  .description('Learn from YouTube deck tech videos')
  .option('--youtube <url>', 'YouTube video URL')
  .action(async (options) => {
    try {
      console.log(chalk.cyan.bold('\n🃏 YouTube Learning\n'));

      if (!options.youtube) {
        console.error(chalk.red('Error: Please provide a YouTube URL with --youtube'));
        process.exit(1);
      }

      // Dynamic import
      const { youtubeLearner } = await import('./learning/youtubeLearner.js');

      console.log(chalk.gray('Extracting information from video...\n'));
      const result = await youtubeLearner.learnFromVideo(options.youtube);
      
      if (result.success) {
        const { summary, knowledge } = result;
        
        console.log(chalk.bold('Video:'), summary.video);
        console.log(chalk.bold('Creator:'), summary.creator);
        
        if (summary.commander) {
          console.log(chalk.bold('Commander:'), summary.commander);
        }
        
        if (summary.strategy) {
          console.log(chalk.bold('Strategy:'), summary.strategy);
        }
        
        if (summary.deckAvailable) {
          console.log(chalk.green(`\n✓ Full decklist available (${summary.cardCount} cards)`));
        } else {
          console.log(chalk.yellow(`\nℹ ${knowledge.notes}`));
        }
        
        console.log(chalk.green('\n✓ Learning complete!\n'));
      } else {
        console.log(chalk.red('Failed to extract information from video\n'));
      }
    } catch (error) {
      console.error(chalk.red('Failed to learn from video:'), error.message);
      process.exit(1);
    }
  });

/**
 * Meta analysis
 */
program
  .command('meta')
  .description('Analyze format metagame')
  .option('--format <format>', 'Format to analyze (e.g., commander, modern)', 'commander')
  .action(async (options) => {
    try {
      console.log(chalk.cyan.bold('\n🃏 Meta Analysis\n'));

      // Dynamic import
      const { metaAnalyzer } = await import('./learning/metaAnalyzer.js');

      console.log(chalk.gray(`Analyzing ${options.format} meta...\n`));
      const analysis = await metaAnalyzer.analyzeFormat(options.format);
      
      console.log(chalk.bold(`Format: ${analysis.format}`));
      console.log(chalk.bold(`Total Decks Analyzed: ${analysis.totalDecks}\n`));
      
      if (analysis.summary && analysis.summary.length > 0) {
        console.log(chalk.yellow('Summary:'));
        analysis.summary.forEach(point => {
          console.log(chalk.gray(`  • ${point}`));
        });
        console.log();
      }
      
      if (analysis.topDecks && analysis.topDecks.length > 0) {
        console.log(chalk.yellow('Top Meta Decks:'));
        analysis.topDecks.slice(0, 10).forEach((deck, index) => {
          console.log(chalk.gray(`  ${index + 1}. ${deck.name} (${deck.metaShare})`));
        });
        console.log();
      }
      
      if (analysis.trends) {
        if (analysis.trends.popular && analysis.trends.popular.length > 0) {
          console.log(chalk.yellow('Popular:'), chalk.gray(analysis.trends.popular.join(', ')));
        }
        
        if (analysis.trends.emerging && analysis.trends.emerging.length > 0) {
          console.log(chalk.yellow('Emerging:'), chalk.gray(analysis.trends.emerging.join(', ')));
        }
        console.log();
      }
      
      console.log(chalk.green('✓ Meta analysis complete!\n'));
    } catch (error) {
      console.error(chalk.red('Failed to analyze meta:'), error.message);
      process.exit(1);
    }
  });

// Parse arguments
program.parse();
