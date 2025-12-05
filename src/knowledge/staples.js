/**
 * Commander Format Staples by Color Identity
 * Essential and commonly played cards organized by color
 */

export const staples = {
  // Colorless staples (any deck)
  colorless: {
    name: 'Colorless',
    description: 'Universal staples that fit in any deck',
    ramp: [
      'Sol Ring',
      'Arcane Signet',
      'Mind Stone',
      'Thought Vessel',
      'Fellwar Stone',
      'Commander\'s Sphere',
      'Wayfarer\'s Bauble',
      'Skyclave Relic',
    ],
    draw: [
      'Endless Atlas',
      'Mind Stone',
      'Hedron Archive',
    ],
    utility: [
      'Lightning Greaves',
      'Swiftfoot Boots',
      'Rogue\'s Passage',
      'Reliquary Tower',
      'Command Tower',
      'Path of Ancestry',
    ],
  },

  // White staples
  W: {
    name: 'White',
    removal: [
      'Swords to Plowshares',
      'Path to Exile',
      'Generous Gift',
      'Farewell',
      'Wrath of God',
      'Day of Judgment',
      'Supreme Verdict',
    ],
    draw: [
      'Esper Sentinel',
      'Ledger Shredder',
      'Archivist of Oghma',
    ],
    protection: [
      'Teferi\'s Protection',
      'Flawless Maneuver',
      'Heroic Intervention',
    ],
    utility: [
      'Smothering Tithe',
      'Land Tax',
      'Archaeomancer\'s Map',
    ],
  },

  // Blue staples
  U: {
    name: 'Blue',
    counterspells: [
      'Counterspell',
      'Swan Song',
      'Negate',
      'Arcane Denial',
      'Fierce Guardianship',
      'Mana Drain',
    ],
    draw: [
      'Rhystic Study',
      'Mystic Remora',
      'Fact or Fiction',
      'Brainstorm',
      'Ponder',
    ],
    bounce: [
      'Cyclonic Rift',
      'Fierce Guardianship',
    ],
    utility: [
      'Mystical Tutor',
      'Merchant Scroll',
      'Propagana',
    ],
  },

  // Black staples
  B: {
    name: 'Black',
    removal: [
      'Toxic Deluge',
      'Damnation',
      'Feed the Swarm',
      'Murderous Rider',
      'Deadly Rollick',
      'Hero\'s Downfall',
    ],
    draw: [
      'Necropotence',
      'Phyrexian Arena',
      'Read the Bones',
      'Night\'s Whisper',
      'Sign in Blood',
    ],
    tutors: [
      'Demonic Tutor',
      'Vampiric Tutor',
      'Diabolic Intent',
      'Grim Tutor',
    ],
    recursion: [
      'Reanimate',
      'Animate Dead',
      'Eternal Witness',
    ],
  },

  // Red staples
  R: {
    name: 'Red',
    removal: [
      'Chaos Warp',
      'Blasphemous Act',
      'Vandalblast',
      'By Force',
    ],
    draw: [
      'Wheel of Fortune',
      'Reforge the Soul',
      'Jeska\'s Will',
      'Light Up the Stage',
    ],
    haste: [
      'Fervor',
      'Anger',
      'Rhythm of the Wild',
    ],
    utility: [
      'Deflecting Swat',
      'Tibalt\'s Trickery',
    ],
  },

  // Green staples
  G: {
    name: 'Green',
    ramp: [
      'Cultivate',
      'Kodama\'s Reach',
      'Three Visits',
      'Nature\'s Lore',
      'Rampant Growth',
      'Farseek',
      'Birds of Paradise',
      'Llanowar Elves',
      'Sakura-Tribe Elder',
    ],
    draw: [
      'Sylvan Library',
      'Guardian Project',
      'The Great Henge',
      'Beast Whisperer',
      'Harmonize',
    ],
    removal: [
      'Beast Within',
      'Krosan Grip',
      'Nature\'s Claim',
    ],
    tutors: [
      'Worldly Tutor',
      'Green Sun\'s Zenith',
      'Chord of Calling',
    ],
  },

  // Azorius (WU)
  WU: {
    name: 'Azorius (White-Blue)',
    removal: [
      'Supreme Verdict',
      'Dovin\'s Veto',
    ],
    draw: [
      'Sphinx\'s Revelation',
      'Teferi\'s Ageless Insight',
    ],
    utility: [
      'Teferi, Time Raveler',
      'Narset, Parter of Veils',
    ],
  },

  // Dimir (UB)
  UB: {
    name: 'Dimir (Blue-Black)',
    removal: [
      'Baleful Mastery',
      'Consume the Meek',
    ],
    draw: [
      'Notion Thief',
      'Whispering Madness',
    ],
    utility: [
      'Cyclonic Rift',
      'Ashiok, Dream Render',
    ],
  },

  // Rakdos (BR)
  BR: {
    name: 'Rakdos (Black-Red)',
    removal: [
      'Terminate',
      'Dreadbore',
      'Kolaghan\'s Command',
    ],
    draw: [
      'Painful Truths',
      'Stinging Study',
    ],
    utility: [
      'Rakdos Charm',
      'Judith, the Scourge Diva',
    ],
  },

  // Gruul (RG)
  RG: {
    name: 'Gruul (Red-Green)',
    ramp: [
      'Mana Flare',
      'Selvala, Heart of the Wilds',
    ],
    removal: [
      'Hull Breach',
      'Decimate',
    ],
    utility: [
      'Rhythm of the Wild',
      'Atarka, World Render',
    ],
  },

  // Selesnya (GW)
  GW: {
    name: 'Selesnya (Green-White)',
    removal: [
      'Austere Command',
      'Return to Dust',
    ],
    tokens: [
      'Parallel Lives',
      'Doubling Season',
      'Anointed Procession',
    ],
    utility: [
      'Eladamri\'s Call',
      'Mirari\'s Wake',
    ],
  },

  // Orzhov (WB)
  WB: {
    name: 'Orzhov (White-Black)',
    removal: [
      'Anguished Unmaking',
      'Vindicate',
      'Merciless Eviction',
    ],
    draw: [
      'Painful Truths',
      'Promise of Power',
    ],
    utility: [
      'Athreos, God of Passage',
      'Kaya\'s Ghostform',
    ],
  },

  // Izzet (UR)
  UR: {
    name: 'Izzet (Blue-Red)',
    removal: [
      'Chaos Warp',
      'Vandalblast',
    ],
    draw: [
      'Narset, Parter of Veils',
      'Curiosity',
    ],
    utility: [
      'Niv-Mizzet, Parun',
      'Thousand-Year Storm',
    ],
  },

  // Golgari (BG)
  BG: {
    name: 'Golgari (Black-Green)',
    recursion: [
      'Eternal Witness',
      'Regrowth',
      'Reanimate',
    ],
    removal: [
      'Assassin\'s Trophy',
      'Putrefy',
      'Maelstrom Pulse',
    ],
    utility: [
      'Golgari Charm',
      'Jarad, Golgari Lich Lord',
    ],
  },

  // Boros (RW)
  RW: {
    name: 'Boros (Red-White)',
    removal: [
      'Boros Charm',
      'Wear // Tear',
    ],
    combat: [
      'Aurelia, the Warleader',
      'Fervent Charge',
    ],
    utility: [
      'Sunforger',
      'Land Tax',
    ],
  },

  // Simic (GU)
  GU: {
    name: 'Simic (Green-Blue)',
    ramp: [
      'Cultivate',
      'Kodama\'s Reach',
      'Growth Spiral',
    ],
    draw: [
      'Rhystic Study',
      'Mystic Remora',
      'Tatyova, Benthic Druid',
    ],
    utility: [
      'Breeding Pool',
      'Uro, Titan of Nature\'s Wrath',
    ],
  },

  // Three+ color combinations have access to all their component colors' staples
};

/**
 * Get staples for a specific color identity
 * @param {string} colors - Color identity (e.g., 'WUB', 'RG')
 * @returns {Object} Combined staples for those colors
 */
export function getStaplesForColors(colors) {
  const result = {
    ...staples.colorless,
  };

  // Add single color staples
  for (const color of colors.split('')) {
    if (staples[color]) {
      Object.assign(result, staples[color]);
    }
  }

  // Add two-color combination staples
  if (colors.length === 2 && staples[colors]) {
    Object.assign(result, staples[colors]);
  }

  return result;
}

/**
 * Get essential staples (highest priority cards)
 * @param {string} colors - Color identity
 * @returns {Array} Essential staples
 */
export function getEssentialStaples(colors = '') {
  const essentials = [
    'Sol Ring',
    'Arcane Signet',
    'Command Tower',
    'Lightning Greaves',
    'Swiftfoot Boots',
  ];

  // Add color-specific essentials
  if (colors.includes('W')) {
    essentials.push('Swords to Plowshares', 'Wrath of God');
  }
  if (colors.includes('U')) {
    essentials.push('Counterspell', 'Cyclonic Rift');
  }
  if (colors.includes('B')) {
    essentials.push('Demonic Tutor', 'Toxic Deluge');
  }
  if (colors.includes('R')) {
    essentials.push('Chaos Warp', 'Blasphemous Act');
  }
  if (colors.includes('G')) {
    essentials.push('Cultivate', 'Beast Within', 'Sol Ring');
  }

  return essentials;
}

export default staples;
