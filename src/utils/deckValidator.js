/**
 * Deck List Validator
 * Parses and validates Commander deck lists for format legality
 */

/**
 * Parse a deck list from text format
 * Supports formats like "1x Card Name", "1 Card Name", "Card Name"
 * @param {string} deckText - Raw deck list text
 * @returns {Array} Array of { quantity, name } objects
 */
export function parseDeckList(deckText) {
  const lines = deckText.split('\n');
  const cards = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    // Skip section headers and non-card lines
    if (trimmed.startsWith('#') || trimmed.startsWith('**') || trimmed.startsWith('###')) continue;
    if (trimmed.toLowerCase().includes('commander') && !trimmed.match(/^\d/)) continue;
    if (trimmed.toLowerCase().includes('creatures') && !trimmed.match(/^\d/)) continue;
    if (trimmed.toLowerCase().includes('lands') && !trimmed.match(/^\d/)) continue;
    if (trimmed.toLowerCase().includes('artifacts') && !trimmed.match(/^\d/)) continue;
    if (trimmed.toLowerCase().includes('enchantments') && !trimmed.match(/^\d/)) continue;
    if (trimmed.toLowerCase().includes('instants') && !trimmed.match(/^\d/)) continue;
    if (trimmed.toLowerCase().includes('sorceries') && !trimmed.match(/^\d/)) continue;
    if (trimmed.toLowerCase().includes('planeswalkers') && !trimmed.match(/^\d/)) continue;
    if (trimmed.toLowerCase().includes('strategy') && !trimmed.match(/^\d/)) continue;
    if (trimmed.toLowerCase().includes('win condition') && !trimmed.match(/^\d/)) continue;
    
    // Match patterns: "1x Card Name", "1 Card Name", "Card Name"
    const match = trimmed.match(/^(\d+)x?\s+(.+)$/i);
    
    if (match) {
      cards.push({
        quantity: parseInt(match[1], 10),
        name: match[2].trim()
      });
    } else if (trimmed && !trimmed.includes(':') && trimmed.length > 2) {
      // Assume it's a card name without quantity
      cards.push({
        quantity: 1,
        name: trimmed
      });
    }
  }
  
  return cards;
}

/**
 * Basic lands that are allowed as multiples
 */
const BASIC_LANDS = [
  'plains',
  'island', 
  'swamp',
  'mountain',
  'forest',
  'wastes',
  'snow-covered plains',
  'snow-covered island',
  'snow-covered swamp',
  'snow-covered mountain',
  'snow-covered forest'
];

/**
 * Check if a card is a basic land
 * @param {string} cardName - Card name to check
 * @returns {boolean}
 */
function isBasicLand(cardName) {
  return BASIC_LANDS.includes(cardName.toLowerCase());
}

/**
 * Validate a parsed deck list for Commander format
 * @param {Array} cards - Parsed card list from parseDeckList()
 * @param {Object} options - Validation options
 * @returns {Object} Validation result
 */
export function validateParsedDeck(cards, options = {}) {
  const { 
    expectedSize = 100,
    isMonoColor = false 
  } = options;
  
  const errors = [];
  const warnings = [];
  const duplicates = [];
  
  // Track card names (lowercase for comparison)
  const cardCounts = {};
  let totalCards = 0;
  let landCount = 0;
  
  for (const card of cards) {
    const nameLower = card.name.toLowerCase();
    totalCards += card.quantity;
    
    // Track duplicates (non-basic lands)
    if (!isBasicLand(card.name)) {
      if (cardCounts[nameLower]) {
        cardCounts[nameLower] += card.quantity;
      } else {
        cardCounts[nameLower] = card.quantity;
      }
    }
    
    // Rough land detection (imperfect without Scryfall lookup)
    if (nameLower.includes('land') || 
        BASIC_LANDS.includes(nameLower) ||
        nameLower.includes('temple') ||
        nameLower.includes('fountain') ||
        nameLower.includes('shock') ||
        nameLower.includes('gate')) {
      landCount += card.quantity;
    }
  }
  
  // Find duplicates
  for (const [name, count] of Object.entries(cardCounts)) {
    if (count > 1) {
      duplicates.push({ name, count });
      errors.push(`Duplicate card: "${name}" appears ${count} times (singleton format allows only 1)`);
    }
  }
  
  // Check total card count
  if (totalCards !== expectedSize) {
    if (totalCards < expectedSize) {
      errors.push(`Deck has only ${totalCards} cards (needs exactly ${expectedSize})`);
    } else {
      errors.push(`Deck has ${totalCards} cards (maximum is ${expectedSize})`);
    }
  }
  
  // Check land count
  const expectedLands = isMonoColor ? 32 : 36;
  if (landCount < expectedLands - 5) {
    warnings.push(`Deck may have too few lands: ~${landCount} detected (recommended: ${expectedLands})`);
  }
  
  return {
    isValid: errors.length === 0,
    totalCards,
    uniqueCards: Object.keys(cardCounts).length,
    landCount,
    hasDuplicates: duplicates.length > 0,
    duplicates,
    errors,
    warnings,
    cards
  };
}

/**
 * Validate a deck list from raw text
 * @param {string} deckText - Raw deck list text
 * @param {Object} options - Validation options
 * @returns {Object} Validation result
 */
export function validateDeckList(deckText, options = {}) {
  const cards = parseDeckList(deckText);
  return validateParsedDeck(cards, options);
}

/**
 * Remove duplicates from a card list, keeping first occurrence
 * @param {Array} cards - Parsed card list
 * @returns {Array} Deduplicated card list
 */
export function removeDuplicates(cards) {
  const seen = new Set();
  const result = [];
  
  for (const card of cards) {
    const nameLower = card.name.toLowerCase();
    
    // Always allow basic lands
    if (isBasicLand(card.name)) {
      result.push(card);
      continue;
    }
    
    // Only keep first occurrence of non-basic cards
    if (!seen.has(nameLower)) {
      seen.add(nameLower);
      result.push({ ...card, quantity: 1 }); // Force quantity to 1
    }
  }
  
  return result;
}

/**
 * Format a card list back to text
 * @param {Array} cards - Card list
 * @returns {string} Formatted deck list
 */
export function formatDeckList(cards) {
  return cards.map(c => `1x ${c.name}`).join('\n');
}

export default {
  parseDeckList,
  validateParsedDeck,
  validateDeckList,
  removeDuplicates,
  formatDeckList,
  BASIC_LANDS
};
