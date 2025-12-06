/**
 * Budget-Aware Deck Optimizer
 * Provides budget-conscious card recommendations and alternatives
 */

/**
 * Budget tiers with spending limits
 */
export const budgetTiers = {
  budget: {
    maxCardPrice: 5,
    totalBudget: 100,
    name: 'Budget',
    description: 'Affordable deck for casual play',
  },
  moderate: {
    maxCardPrice: 25,
    totalBudget: 300,
    name: 'Moderate',
    description: 'Balanced budget with some premium cards',
  },
  optimized: {
    maxCardPrice: 100,
    totalBudget: 750,
    name: 'Optimized',
    description: 'High-performance deck with quality cards',
  },
  noLimit: {
    maxCardPrice: Infinity,
    totalBudget: Infinity,
    name: 'No Limit',
    description: 'Best cards regardless of price',
  },
};

/**
 * Known budget alternatives for expensive staples
 * Maps expensive cards to cheaper alternatives with similar effects
 */
export const budgetAlternatives = {
  'Mana Crypt': [
    { name: 'Sol Ring', reason: 'Similar fast mana, much cheaper' },
    { name: 'Arcane Signet', reason: 'Reliable 2-mana rock' },
    { name: 'Mind Stone', reason: 'Ramp with card draw option' },
  ],
  'Mana Vault': [
    { name: 'Sol Ring', reason: 'Best budget fast mana' },
    { name: 'Mana Crypt', reason: 'Similar effect (still expensive)' },
    { name: 'Worn Powerstone', reason: 'Slower but safer' },
  ],
  'Gaea\'s Cradle': [
    { name: 'Growing Rites of Itlimoc', reason: 'Transforms into Cradle effect' },
    { name: 'Nykthos, Shrine to Nyx', reason: 'Devotion-based mana' },
    { name: 'Wirewood Lodge', reason: 'Untap elf dorks' },
  ],
  'The Tabernacle at Pendrell Vale': [
    { name: 'Pendrell Mists', reason: 'Similar taxing effect' },
    { name: 'Magus of the Tabernacle', reason: 'Creature version' },
    { name: 'Mudslide', reason: 'Budget creature tax' },
  ],
  'Timetwister': [
    { name: 'Wheel of Fortune', reason: 'Similar wheel effect' },
    { name: 'Windfall', reason: 'Budget wheel' },
    { name: 'Reforge the Soul', reason: 'Miracle wheel' },
  ],
  'Force of Will': [
    { name: 'Fierce Guardianship', reason: 'Free counter in Commander' },
    { name: 'Pact of Negation', reason: 'Free counter with delayed cost' },
    { name: 'Counterspell', reason: 'Efficient hard counter' },
  ],
  'Mox Diamond': [
    { name: 'Chrome Mox', reason: 'Similar 0-cost mana' },
    { name: 'Sol Ring', reason: 'Best budget alternative' },
    { name: 'Jeweled Lotus', reason: 'Commander-specific fast mana' },
  ],
  'Lion\'s Eye Diamond': [
    { name: 'Lotus Petal', reason: 'One-shot mana boost' },
    { name: 'Dark Ritual', reason: 'Fast black mana' },
    { name: 'Desperate Ritual', reason: 'Fast red mana' },
  ],
  'Demonic Tutor': [
    { name: 'Diabolic Tutor', reason: '2 more mana, same effect' },
    { name: 'Grim Tutor', reason: 'One more mana, life cost' },
    { name: 'Diabolic Intent', reason: 'Requires sacrifice' },
  ],
  'Vampiric Tutor': [
    { name: 'Mystical Tutor', reason: 'Instant/sorcery tutor' },
    { name: 'Worldly Tutor', reason: 'Creature tutor' },
    { name: 'Imperial Seal', reason: 'Similar but sorcery speed' },
  ],
  'Cyclonic Rift': [
    { name: 'Flood of Tears', reason: 'Returns all nonlands' },
    { name: 'Evacuation', reason: 'Returns all creatures' },
    { name: 'Engulf the Shore', reason: 'Budget bounce all creatures' },
  ],
  'Doubling Season': [
    { name: 'Parallel Lives', reason: 'Doubles tokens only' },
    { name: 'Anointed Procession', reason: 'Doubles tokens in white' },
    { name: 'Primal Vigor', reason: 'Symmetric doubling' },
  ],
  'Rhystic Study': [
    { name: 'Mystic Remora', reason: 'Similar tax-based draw' },
    { name: 'Esper Sentinel', reason: 'Tax-based draw on creature' },
    { name: 'Consecrated Sphinx', reason: 'Powerful card draw' },
  ],
  'Smothering Tithe': [
    { name: 'Monologue Tax', reason: 'Similar taxing effect' },
    { name: 'Treasure Map', reason: 'Treasure generation' },
    { name: 'Curse of Opulence', reason: 'Political treasure gen' },
  ],
  'Fetch Lands': [
    { name: 'Evolving Wilds', reason: 'Budget fetch' },
    { name: 'Terramorphic Expanse', reason: 'Budget fetch' },
    { name: 'Fabled Passage', reason: 'Better budget fetch' },
  ],
  'Original Dual Lands': [
    { name: 'Shock Lands', reason: 'Fetchable duals' },
    { name: 'Check Lands', reason: 'Conditional untapped' },
    { name: 'Pain Lands', reason: 'Always untapped, life cost' },
  ],
};

/**
 * Calculate total cost of a decklist using Scryfall prices
 * @param {Array} decklist - Array of card objects with price data
 * @returns {Object} Cost breakdown
 */
export function calculateDeckCost(decklist) {
  if (!Array.isArray(decklist) || decklist.length === 0) {
    return {
      total: 0,
      currency: 'USD',
      breakdown: {},
      mostExpensive: [],
    };
  }

  let total = 0;
  const breakdown = {
    lands: 0,
    creatures: 0,
    instants: 0,
    sorceries: 0,
    artifacts: 0,
    enchantments: 0,
    planeswalkers: 0,
    other: 0,
  };

  const cardPrices = decklist.map(card => {
    const price = parseFloat(card.prices?.usd || card.price || 0);
    total += price;

    // Categorize by type
    const type = card.type?.toLowerCase() || '';
    if (type.includes('land')) breakdown.lands += price;
    else if (type.includes('creature')) breakdown.creatures += price;
    else if (type.includes('instant')) breakdown.instants += price;
    else if (type.includes('sorcery')) breakdown.sorceries += price;
    else if (type.includes('artifact')) breakdown.artifacts += price;
    else if (type.includes('enchantment')) breakdown.enchantments += price;
    else if (type.includes('planeswalker')) breakdown.planeswalkers += price;
    else breakdown.other += price;

    return {
      name: card.name,
      price,
      type: card.type,
    };
  });

  // Get most expensive cards
  const mostExpensive = cardPrices
    .sort((a, b) => b.price - a.price)
    .slice(0, 10);

  return {
    total: parseFloat(total.toFixed(2)),
    currency: 'USD',
    breakdown,
    mostExpensive,
    averageCardPrice: parseFloat((total / decklist.length).toFixed(2)),
  };
}

/**
 * Find budget alternatives for a specific card
 * @param {string} cardName - Name of the expensive card
 * @param {number} maxPrice - Maximum price for alternatives
 * @returns {Array} Array of budget alternatives
 */
export function findBudgetAlternatives(cardName, maxPrice = 5) {
  // Check if we have known alternatives
  if (budgetAlternatives[cardName]) {
    return budgetAlternatives[cardName].map(alt => ({
      ...alt,
      maxPrice,
    }));
  }

  // Generic alternatives based on card type (simplified)
  const genericAlts = {
    tutor: [
      { name: 'Diabolic Tutor', reason: 'Budget black tutor' },
      { name: 'Increasing Ambition', reason: 'Tutor with flashback' },
    ],
    removal: [
      { name: 'Murder', reason: 'Simple creature removal' },
      { name: 'Doom Blade', reason: 'Efficient removal' },
    ],
    counterspell: [
      { name: 'Counterspell', reason: 'Classic hard counter' },
      { name: 'Cancel', reason: 'Budget hard counter' },
    ],
    ramp: [
      { name: 'Rampant Growth', reason: 'Basic land ramp' },
      { name: 'Cultivate', reason: 'Ramp and card advantage' },
    ],
  };

  // Try to match by card type (would need more sophisticated matching in production)
  for (const [type, alts] of Object.entries(genericAlts)) {
    if (cardName.toLowerCase().includes(type)) {
      return alts;
    }
  }

  return [];
}

/**
 * Suggest budget-friendly alternatives for expensive cards in a deck
 * @param {Array} decklist - Array of card objects with price data
 * @param {string} budgetTier - Budget tier key (budget, moderate, optimized, noLimit)
 * @param {number} maxReplacements - Maximum number of suggestions
 * @returns {Object} Budget optimization suggestions
 */
export function suggestWithBudget(decklist, budgetTier = 'moderate', maxReplacements = 10) {
  const tier = budgetTiers[budgetTier] || budgetTiers.moderate;
  const deckCost = calculateDeckCost(decklist);

  if (deckCost.total <= tier.totalBudget) {
    return {
      message: 'Deck is within budget',
      currentCost: deckCost.total,
      targetBudget: tier.totalBudget,
      suggestions: [],
    };
  }

  // Find cards over the per-card budget
  const expensiveCards = decklist
    .filter(card => {
      const price = parseFloat(card.prices?.usd || card.price || 0);
      return price > tier.maxCardPrice;
    })
    .map(card => ({
      name: card.name,
      price: parseFloat(card.prices?.usd || card.price || 0),
      type: card.type,
    }))
    .sort((a, b) => b.price - a.price);

  // Generate replacement suggestions
  const suggestions = expensiveCards.slice(0, maxReplacements).map(card => {
    const alternatives = findBudgetAlternatives(card.name, tier.maxCardPrice);
    return {
      replace: card.name,
      currentPrice: card.price,
      alternatives,
      savings: alternatives.length > 0 
        ? card.price - tier.maxCardPrice 
        : 0,
    };
  });

  const totalSavings = suggestions.reduce((sum, s) => sum + s.savings, 0);

  return {
    message: `Deck exceeds budget by $${(deckCost.total - tier.totalBudget).toFixed(2)}`,
    currentCost: deckCost.total,
    targetBudget: tier.totalBudget,
    overBudget: deckCost.total - tier.totalBudget,
    expensiveCardsCount: expensiveCards.length,
    suggestions,
    potentialSavings: parseFloat(totalSavings.toFixed(2)),
    tierInfo: tier,
  };
}

/**
 * Optimize deck to meet a specific budget target
 * @param {Array} decklist - Array of card objects with price data
 * @param {number} targetBudget - Target total budget
 * @returns {Object} Optimization plan with specific swaps
 */
export function optimizeDeckForBudget(decklist, targetBudget) {
  const deckCost = calculateDeckCost(decklist);

  if (deckCost.total <= targetBudget) {
    return {
      message: 'Deck is already within budget',
      currentCost: deckCost.total,
      targetBudget,
      swaps: [],
    };
  }

  const overBudget = deckCost.total - targetBudget;

  // Sort cards by price descending
  const sortedCards = decklist
    .map(card => ({
      name: card.name,
      price: parseFloat(card.prices?.usd || card.price || 0),
      type: card.type,
    }))
    .sort((a, b) => b.price - a.price);

  // Generate swap suggestions starting from most expensive
  const swaps = [];
  let cumulativeSavings = 0;

  for (const card of sortedCards) {
    if (cumulativeSavings >= overBudget) break;
    if (card.price < 5) continue; // Don't swap cheap cards

    const alternatives = findBudgetAlternatives(card.name, 5);
    if (alternatives.length > 0) {
      const bestAlt = alternatives[0];
      const altPrice = parseFloat(bestAlt.price || 5); // Use actual price, fallback to $5
      const savings = card.price - altPrice;

      swaps.push({
        remove: card.name,
        removePrice: card.price,
        add: bestAlt.name,
        addPrice: altPrice,
        savings,
        reason: bestAlt.reason,
      });

      cumulativeSavings += savings;
    }
  }

  return {
    message: `Found ${swaps.length} swaps to reduce cost by $${cumulativeSavings.toFixed(2)}`,
    currentCost: deckCost.total,
    targetBudget,
    overBudget,
    projectedCost: deckCost.total - cumulativeSavings,
    swaps,
    remainingOverBudget: Math.max(0, overBudget - cumulativeSavings),
  };
}

/**
 * Get budget tier recommendation based on deck cost
 * @param {number} deckCost - Total deck cost
 * @returns {Object} Recommended budget tier
 */
export function recommendBudgetTier(deckCost) {
  for (const [key, tier] of Object.entries(budgetTiers)) {
    if (deckCost <= tier.totalBudget) {
      return { tier: key, ...tier };
    }
  }
  return { tier: 'noLimit', ...budgetTiers.noLimit };
}

/**
 * Analyze budget distribution in a deck
 * @param {Array} decklist - Array of card objects with price data
 * @returns {Object} Budget distribution analysis
 */
export function analyzeBudgetDistribution(decklist) {
  const deckCost = calculateDeckCost(decklist);

  // Calculate percentage of budget in each category
  const distribution = {};
  for (const [category, cost] of Object.entries(deckCost.breakdown)) {
    distribution[category] = {
      cost: parseFloat(cost.toFixed(2)),
      percentage: deckCost.total > 0 
        ? parseFloat((cost / deckCost.total * 100).toFixed(1))
        : 0,
    };
  }

  // Identify budget concentration
  const topCategories = Object.entries(distribution)
    .sort((a, b) => b[1].cost - a[1].cost)
    .slice(0, 3);

  return {
    totalCost: deckCost.total,
    distribution,
    topCategories,
    recommendedTier: recommendBudgetTier(deckCost.total),
    insights: generateBudgetInsights(distribution, deckCost.total),
  };
}

/**
 * Generate budget insights
 * @private
 */
function generateBudgetInsights(distribution, total) {
  const insights = [];

  // Check for expensive lands
  if (distribution.lands?.percentage > 40) {
    insights.push('Consider budget land alternatives - lands are taking up a large portion of your budget');
  }

  // Check for expensive artifacts
  if (distribution.artifacts?.percentage > 30) {
    insights.push('Artifact costs are high - consider budget ramp alternatives');
  }

  // Check for expensive planeswalkers
  if (distribution.planeswalkers?.cost > 100) {
    insights.push('Planeswalkers are expensive - consider reducing count or finding alternatives');
  }

  if (total > 500 && insights.length === 0) {
    insights.push('Deck has high-quality cards across the board');
  }

  if (total < 100) {
    insights.push('Budget-friendly deck - good for casual play');
  }

  return insights;
}

export default {
  budgetTiers,
  budgetAlternatives,
  calculateDeckCost,
  findBudgetAlternatives,
  suggestWithBudget,
  optimizeDeckForBudget,
  recommendBudgetTier,
  analyzeBudgetDistribution,
};
