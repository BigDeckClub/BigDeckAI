/**
 * Commander Deck Archetypes
 * Common deck strategies and their characteristics
 */

export const archetypes = {
  aggro: {
    name: 'Aggro',
    description: 'Win through early, aggressive creature-based combat',
    characteristics: {
      avgCMC: '2.5-3.0',
      creatureCount: '30-40',
      rampPriority: 'low-medium',
      cardDraw: 'medium',
    },
    keyCards: [
      'Shared Animosity',
      'Coat of Arms',
      'Herald\'s Horn',
      'Vanquisher\'s Banner',
      'Lightning Greaves',
    ],
    colors: ['R', 'W', 'RW', 'RG', 'WG'],
    examples: [
      'Krenko, Mob Boss',
      'Edgar Markov',
      'Najeela, the Blade-Blossom',
    ],
  },

  control: {
    name: 'Control',
    description: 'Control the game through counterspells, removal, and card advantage',
    characteristics: {
      avgCMC: '3.0-4.0',
      creatureCount: '10-20',
      rampPriority: 'high',
      cardDraw: 'very high',
    },
    keyCards: [
      'Counterspell',
      'Cyclonic Rift',
      'Mystic Remora',
      'Rhystic Study',
      'Propaganda',
    ],
    colors: ['U', 'UW', 'UB', 'UWB'],
    examples: [
      'Talrand, Sky Summoner',
      'Grand Arbiter Augustin IV',
      'Baral, Chief of Compliance',
    ],
  },

  combo: {
    name: 'Combo',
    description: 'Win through specific card combinations that create infinite loops or instant wins',
    characteristics: {
      avgCMC: '2.5-4.0',
      creatureCount: '15-25',
      rampPriority: 'high',
      cardDraw: 'high',
      tutors: 'high priority',
    },
    keyCards: [
      'Demonic Tutor',
      'Vampiric Tutor',
      'Cyclonic Rift',
      'Thassa\'s Oracle',
      'Isochron Scepter',
    ],
    colors: ['Any', 'especially U, B, or both'],
    examples: [
      'Kinnan, Bonder Prodigy',
      'Thrasios & Tymna',
      'Kess, Dissident Mage',
    ],
  },

  midrange: {
    name: 'Midrange',
    description: 'Efficient threats and value engines, flexible strategy',
    characteristics: {
      avgCMC: '3.0-4.5',
      creatureCount: '25-35',
      rampPriority: 'high',
      cardDraw: 'high',
    },
    keyCards: [
      'Eternal Witness',
      'Beast Whisperer',
      'Cultivate',
      'Skullclamp',
      'Heroic Intervention',
    ],
    colors: ['G', 'GW', 'GB', 'GU'],
    examples: [
      'Meren of Clan Nel Toth',
      'Ghave, Guru of Spores',
      'Tasigur, the Golden Fang',
    ],
  },

  tribal: {
    name: 'Tribal',
    description: 'Synergies based on creature types',
    characteristics: {
      avgCMC: '3.0-4.0',
      creatureCount: '30-40',
      rampPriority: 'medium',
      cardDraw: 'medium-high',
      lords: 'essential',
    },
    keyCards: [
      'Herald\'s Horn',
      'Door of Destinies',
      'Vanquisher\'s Banner',
      'Coat of Arms',
      'Cavern of Souls',
    ],
    tribes: [
      'Goblins', 'Elves', 'Dragons', 'Zombies', 'Vampires',
      'Merfolk', 'Slivers', 'Wizards', 'Warriors', 'Clerics',
    ],
    examples: [
      'Edgar Markov (Vampires)',
      'The Ur-Dragon (Dragons)',
      'Lathril, Blade of the Elves (Elves)',
    ],
  },

  superfriends: {
    name: 'Superfriends',
    description: 'Planeswalker-focused strategy with protecting and proliferating',
    characteristics: {
      avgCMC: '3.5-5.0',
      planeswalkerCount: '15-25',
      rampPriority: 'very high',
      cardDraw: 'medium',
      wipes: 'essential',
    },
    keyCards: [
      'Doubling Season',
      'The Chain Veil',
      'Teferi, Temporal Archmage',
      'Wrath of God',
      'Propaganda',
    ],
    colors: ['WU', 'WUG', 'WUBR'],
    examples: [
      'Atraxa, Praetors\' Voice',
      'Sisay, Weatherlight Captain',
      'Esika, God of the Tree',
    ],
  },

  aristocrats: {
    name: 'Aristocrats',
    description: 'Sacrifice creatures for value and drain opponents',
    characteristics: {
      avgCMC: '3.0-4.0',
      creatureCount: '30-40',
      rampPriority: 'medium',
      cardDraw: 'high',
      sacrificeOutlets: 'essential',
    },
    keyCards: [
      'Blood Artist',
      'Zulaport Cutthroat',
      'Ashnod\'s Altar',
      'Phyrexian Altar',
      'Grave Pact',
    ],
    colors: ['B', 'WB', 'BR', 'WBR'],
    examples: [
      'Teysa Karlov',
      'Meren of Clan Nel Toth',
      'Korvold, Fae-Cursed King',
    ],
  },

  voltron: {
    name: 'Voltron',
    description: 'Build up one creature (usually commander) with equipment/auras',
    characteristics: {
      avgCMC: '2.5-3.5',
      equipmentCount: '10-15',
      auraCount: '5-10',
      rampPriority: 'medium',
      protection: 'essential',
    },
    keyCards: [
      'Sword of Feast and Famine',
      'Sword of Fire and Ice',
      'Lightning Greaves',
      'Swiftfoot Boots',
      'All That Glitters',
    ],
    colors: ['W', 'WU', 'WR', 'WUB'],
    examples: [
      'Ardenn & Rograkh',
      'Sram, Senior Edificer',
      'Rafiq of the Many',
    ],
  },

  spellslinger: {
    name: 'Spellslinger',
    description: 'Cast many instants and sorceries, trigger value from casting spells',
    characteristics: {
      avgCMC: '2.5-3.5',
      instantSorceryCount: '30-40',
      rampPriority: 'high',
      cardDraw: 'very high',
    },
    keyCards: [
      'Thousand-Year Storm',
      'Aria of Flame',
      'Young Pyromancer',
      'Talrand, Sky Summoner',
      'Mizzix\'s Mastery',
    ],
    colors: ['U', 'R', 'UR'],
    examples: [
      'Kalamax, the Stormsire',
      'Veyran, Voice of Duality',
      'Mizzix of the Izmagnus',
    ],
  },

  reanimator: {
    name: 'Reanimator',
    description: 'Put creatures in graveyard, reanimate them for cheap',
    characteristics: {
      avgCMC: '3.5-4.5',
      bigCreatures: '10-15',
      rampPriority: 'medium',
      cardDraw: 'high',
      graveyard: 'essential resource',
    },
    keyCards: [
      'Reanimate',
      'Animate Dead',
      'Buried Alive',
      'Entomb',
      'Living Death',
    ],
    colors: ['B', 'UB', 'WB', 'UBG'],
    examples: [
      'Muldrotha, the Gravetide',
      'Karador, Ghost Chieftain',
      'Chainer, Nightmare Adept',
    ],
  },

  stax: {
    name: 'Stax',
    description: 'Slow down opponents with resource denial',
    characteristics: {
      avgCMC: '3.0-4.0',
      taxEffects: 'many',
      rampPriority: 'high',
      asymmetric: 'preferred',
    },
    keyCards: [
      'Winter Orb',
      'Static Orb',
      'Sphere of Resistance',
      'Trinisphere',
      'Cursed Totem',
    ],
    colors: ['W', 'WU', 'WB'],
    examples: [
      'Derevi, Empyrial Tactician',
      'Grand Arbiter Augustin IV',
      'Nath of the Gilt-Leaf',
    ],
    warning: 'Not recommended for casual play - can make games unfun',
  },

  grouphug: {
    name: 'Group Hug',
    description: 'Help all players, then win with that advantage',
    characteristics: {
      avgCMC: '3.0-4.5',
      symmetricEffects: 'many',
      winCons: 'unexpected',
      politics: 'essential',
    },
    keyCards: [
      'Howling Mine',
      'Tempt with Discovery',
      'Rites of Flourishing',
      'Prosperity',
      'Pir & Toothy',
    ],
    colors: ['G', 'U', 'UG'],
    examples: [
      'Phelddagrif',
      'Kynaios and Tiro of Meletis',
      'Zedruu the Greathearted',
    ],
  },
};

/**
 * Get archetype by name
 * @param {string} name - Archetype name
 * @returns {Object|null} Archetype data
 */
export function getArchetype(name) {
  const key = name.toLowerCase().replace(/\s+/g, '');
  return archetypes[key] || null;
}

/**
 * Get archetypes suitable for color identity
 * @param {string} colors - Color identity (e.g., 'WUB')
 * @returns {Array} Suitable archetypes
 */
export function getArchetypesForColors(colors) {
  return Object.values(archetypes).filter(archetype => {
    if (!archetype.colors) return true;
    return archetype.colors.some(c => 
      c === 'Any' || colors.includes(c) || c.split('').every(ch => colors.includes(ch))
    );
  });
}

export default archetypes;
