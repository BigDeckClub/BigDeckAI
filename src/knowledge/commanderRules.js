/**
 * Commander Format Rules and Ban List
 * Official Commander/EDH format rules as of 2024
 */

export const commanderRules = {
  // Basic format rules
  deckSize: 100, // Including commander
  singleton: true, // Only one copy of each card (except basic lands)
  
  // Color identity rules
  colorIdentity: {
    description: 'All cards in deck must match commander\'s color identity',
    includesManaCost: true,
    includesTextBox: true,
    includesColorIndicator: true,
    basicLandsException: false, // Even basic lands must match
  },

  // Commander rules
  commander: {
    mustBeLegendary: true,
    mustBeCreature: true, // Or have "can be your commander" text
    canBePartner: true, // Partner commanders allowed
    canBeBackground: true, // Background enchantments allowed with "Choose a Background"
    startInCommandZone: true,
    commanderDamage: 21, // 21 combat damage from a single commander = elimination
  },

  // Commander tax
  commanderTax: {
    baseManaCost: 'commander\'s mana cost',
    additionalCost: 2, // Colorless mana per cast after first
    appliesPerCommander: true,
  },

  // Starting life total
  startingLife: 40,

  // Mulligan rules
  mulligan: 'London mulligan (draw 7, bottom N cards)',

  // Current ban list (as of 2024)
  bannedCards: [
    'Ancestral Recall',
    'Balance',
    'Biorhythm',
    'Black Lotus',
    'Braids, Cabal Minion',
    'Channel',
    'Chaos Orb',
    'Coalition Victory',
    'Emrakul, the Aeons Torn',
    'Erayo, Soratami Ascendant',
    'Falling Star',
    'Fastbond',
    'Flash',
    'Gifts Ungiven',
    'Golos, Tireless Pilgrim',
    'Griselbrand',
    'Hullbreacher',
    'Iona, Shield of Emeria',
    'Karakas',
    'Leovold, Emissary of Trest',
    'Library of Alexandria',
    'Limited Resources',
    'Lutri, the Spellchaser',
    'Mox Emerald',
    'Mox Jet',
    'Mox Pearl',
    'Mox Ruby',
    'Mox Sapphire',
    'Panoptic Mirror',
    'Paradox Engine',
    'Primeval Titan',
    'Prophet of Kruphix',
    'Recurring Nightmare',
    'Rofellos, Llanowar Emissary',
    'Shahrazad',
    'Sundering Titan',
    'Sway of the Stars',
    'Sylvan Primordial',
    'Time Vault',
    'Time Walk',
    'Tinker',
    'Tolarian Academy',
    'Trade Secrets',
    'Upheaval',
    'Worldfire',
    'Yawgmoth\'s Bargain',
  ],

  // Format philosophy
  philosophy: {
    casual: 'Meant to be played casually with friends',
    social: 'Emphasizes social interaction and politics',
    expressive: 'Allows for unique deck building and expression',
    powerLevel: 'Games should be balanced and fun for all players',
  },
};

/**
 * Check if a card is banned in Commander
 * @param {string} cardName - Card name to check
 * @returns {boolean} True if banned
 */
export function isCardBanned(cardName) {
  return commanderRules.bannedCards.some(
    banned => banned.toLowerCase() === cardName.toLowerCase()
  );
}

/**
 * Get format rules as formatted text
 * @returns {string} Formatted rules text
 */
export function getFormattedRules() {
  return `
Commander Format Rules:
- Deck Size: ${commanderRules.deckSize} cards (including commander)
- Singleton format (except basic lands)
- Starting Life: ${commanderRules.startingLife}
- Commander Damage: ${commanderRules.commander.commanderDamage} combat damage from one commander
- Commander Tax: +2 colorless mana for each time cast from command zone
- Color Identity: All cards must match commander's color identity

Commander Requirements:
- Must be a legendary creature (or have "can be your commander" text)
- Starts in the command zone
- Can be cast from command zone
- Can be returned to command zone if it would change zones

Ban List: ${commanderRules.bannedCards.length} cards banned
  `.trim();
}

export default commanderRules;
