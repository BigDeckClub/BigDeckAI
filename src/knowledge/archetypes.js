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

  chaos: {
    name: 'Chaos',
    description: 'Create unpredictable game states with randomness and chaos effects',
    strategy: 'Disrupt normal gameplay with random effects, benefit from the chaos',
    characteristics: {
      avgCMC: '3.5-5.0',
      chaosEffects: 'many',
      rampPriority: 'high',
      politics: 'high',
    },
    keyCards: [
      'Possibility Storm',
      'Scrambleverse',
      'Warp World',
      'Grip of Chaos',
      'Thieves\' Auction',
      'Confusion in the Ranks',
    ],
    strengths: ['Disrupts combo decks', 'Levels playing field', 'Unpredictable'],
    weaknesses: ['Games take longer', 'Can frustrate opponents', 'Hard to control'],
    recommendedColors: ['R', 'UR', 'RG'],
    powerLevelRange: [4, 7],
    colors: ['R', 'UR', 'RG'],
    examples: [
      'Yidris, Maelstrom Wielder',
      'Zndrsplt & Okaun',
      'Norin the Wary',
    ],
    warning: 'Not recommended for competitive play - can make games very long and unpredictable',
  },

  voltronEquipment: {
    name: 'Voltron - Equipment',
    description: 'Focus on equipment to build an unstoppable creature',
    strategy: 'Load up one creature with powerful equipment for massive damage',
    characteristics: {
      avgCMC: '2.5-3.5',
      equipmentCount: '15-20',
      rampPriority: 'medium',
      protection: 'essential',
    },
    keyCards: [
      'Sword of Feast and Famine',
      'Sword of Fire and Ice',
      'Lightning Greaves',
      'Swiftfoot Boots',
      'Colossus Hammer',
      'Blackblade Reforged',
      'Hammer of Nazahn',
    ],
    strengths: ['Fast clock', 'Commander damage', 'Resilient to board wipes'],
    weaknesses: ['Removal vulnerable', 'Mana intensive', 'One-dimensional'],
    recommendedColors: ['W', 'WR', 'WU'],
    powerLevelRange: [5, 8],
    colors: ['W', 'WU', 'WR', 'WRG'],
    examples: [
      'Wyleth, Soul of Steel',
      'Ardenn & Rograkh',
      'Sram, Senior Edificer',
    ],
  },

  voltronAura: {
    name: 'Voltron - Aura',
    description: 'Build up a creature with powerful auras and enchantments',
    strategy: 'Stack auras on one creature, often with hexproof or protection',
    characteristics: {
      avgCMC: '2.5-3.5',
      auraCount: '15-20',
      rampPriority: 'medium',
      hexproofCreatures: 'preferred',
    },
    keyCards: [
      'All That Glitters',
      'Ethereal Armor',
      'Ancestral Mask',
      'Rancor',
      'Bear Umbra',
      'Mantle of the Ancients',
    ],
    strengths: ['Explosive damage', 'Enchantment synergies', 'Recursion options'],
    weaknesses: ['Removal vulnerable', '2-for-1 risks', 'Needs protection'],
    recommendedColors: ['W', 'WG', 'WU'],
    powerLevelRange: [5, 8],
    colors: ['W', 'WG', 'WU', 'WUG'],
    examples: [
      'Light-Paws, Emperor\'s Voice',
      'Galea, Kindler of Hope',
      'Uril, the Miststalker',
    ],
  },

  voltronCounters: {
    name: 'Voltron - +1/+1 Counters',
    description: 'Grow creatures with +1/+1 counters for commander damage',
    strategy: 'Stack +1/+1 counters on commander with proliferate and doubling effects',
    characteristics: {
      avgCMC: '3.0-4.0',
      counterSynergies: 'essential',
      rampPriority: 'medium-high',
      proliferate: 'important',
    },
    keyCards: [
      'Hardened Scales',
      'Doubling Season',
      'The Ozolith',
      'Sword of Truth and Justice',
      'Evolution Sage',
      'Hydra\'s Growth',
    ],
    strengths: ['Scales quickly', 'Synergizes with other strategies', 'Counter manipulation'],
    weaknesses: ['Removal vulnerable', 'Slow start', 'Needs buildup'],
    recommendedColors: ['G', 'WG', 'UG', 'WUG'],
    powerLevelRange: [5, 8],
    colors: ['G', 'GW', 'GU', 'WUG'],
    examples: [
      'Animar, Soul of Elements',
      'Skullbriar, the Walking Grave',
      'Zaxara, the Exemplary',
    ],
  },

  landfall: {
    name: 'Landfall',
    description: 'Trigger abilities from playing lands',
    strategy: 'Play multiple lands per turn to trigger powerful landfall effects',
    characteristics: {
      avgCMC: '3.0-4.5',
      creatureCount: '25-35',
      landCount: '38-42',
      extraLandDrops: 'essential',
    },
    keyCards: [
      'Lotus Cobra',
      'Avenger of Zendikar',
      'Scute Swarm',
      'Omnath, Locus of Creation',
      'Azusa, Lost but Seeking',
      'Crucible of Worlds',
      'The Gitrog Monster',
    ],
    strengths: ['Consistent triggers', 'Explosive turns', 'Mana advantage'],
    weaknesses: ['Needs land payoffs', 'Graveyard reliant', 'Can flood'],
    recommendedColors: ['G', 'RG', 'WG', 'WRG'],
    powerLevelRange: [5, 8],
    colors: ['G', 'RG', 'WG', 'UG', 'WRG'],
    examples: [
      'Omnath, Locus of Rage',
      'Lord Windgrace',
      'Tatyova, Benthic Druid',
    ],
  },

  blink: {
    name: 'Blink/Flicker',
    description: 'Abuse ETB (enters-the-battlefield) effects by blinking creatures',
    strategy: 'Repeatedly exile and return creatures to trigger ETB abilities',
    characteristics: {
      avgCMC: '3.0-4.0',
      etbCreatures: '20-30',
      blinkEffects: '10-15',
      rampPriority: 'medium-high',
      cardDraw: 'high',
    },
    keyCards: [
      'Ephemerate',
      'Ghostly Flicker',
      'Archaeomancer',
      'Panharmonicon',
      'Soulherder',
      'Restoration Angel',
      'Thassa, Deep-Dwelling',
    ],
    strengths: ['Value engine', 'Flexible answers', 'Hard to disrupt'],
    weaknesses: ['Setup dependent', 'Can be slow', 'Needs creatures'],
    recommendedColors: ['W', 'U', 'WU', 'WUG'],
    powerLevelRange: [5, 8],
    colors: ['U', 'W', 'WU', 'WUG'],
    examples: [
      'Brago, King Eternal',
      'Aminatou, the Fateshifter',
      'Roon of the Hidden Realm',
    ],
  },

  wheels: {
    name: 'Wheels',
    description: 'Force all players to discard and draw new hands repeatedly',
    strategy: 'Wheel effects to refill hand, disrupt opponents, enable graveyard strategies',
    characteristics: {
      avgCMC: '3.0-4.0',
      wheelEffects: '10-15',
      rampPriority: 'high',
      cardDraw: 'very high',
      graveyardSynergy: 'often present',
    },
    keyCards: [
      'Wheel of Fortune',
      'Windfall',
      'Reforge the Soul',
      'Waste Not',
      'Narset, Parter of Veils',
      'Hullbreacher', // Banned in Commander
      'Smothering Tithe',
    ],
    strengths: ['Disrupts hands', 'Refills hand', 'Graveyard fuel'],
    weaknesses: ['Helps opponents', 'Can backfire', 'Needs payoffs'],
    recommendedColors: ['R', 'UR', 'BR', 'UBR'],
    powerLevelRange: [6, 9],
    colors: ['R', 'UR', 'BR', 'UBR'],
    examples: [
      'Anje Falkenrath',
      'Nekusar, the Mindrazer',
      // 'Leovold, Emissary of Trest', // Banned in Commander
    ],
  },

  tokens: {
    name: 'Tokens',
    description: 'Generate and leverage large numbers of token creatures',
    strategy: 'Create many token creatures, boost them, overwhelm with numbers',
    characteristics: {
      avgCMC: '3.5-4.5',
      tokenGenerators: '15-20',
      anthemEffects: '8-12',
      rampPriority: 'medium-high',
    },
    keyCards: [
      'Anointed Procession',
      'Parallel Lives',
      'Doubling Season',
      'Craterhoof Behemoth',
      'Purphoros, God of the Forge',
      'Heroic Intervention',
      'Second Harvest',
    ],
    strengths: ['Go wide', 'Explosive turns', 'Resilient to spot removal'],
    weaknesses: ['Board wipe vulnerable', 'Needs anthem effects', 'Can be slow'],
    recommendedColors: ['W', 'G', 'WG', 'WRG'],
    powerLevelRange: [5, 8],
    colors: ['W', 'G', 'WG', 'WR', 'WRG'],
    examples: [
      'Rhys the Redeemed',
      'Thalisse, Reverent Medium',
      'Adrix and Nev, Twincasters',
    ],
  },

  tribalElves: {
    name: 'Tribal - Elves',
    description: 'Elf tribal with mana generation and overrun effects',
    strategy: 'Generate mana with elf dorks, create many elves, overrun',
    characteristics: {
      avgCMC: '2.5-3.5',
      elfCount: '30-40',
      manaElves: '15-20',
      rampPriority: 'built-in',
    },
    keyCards: [
      'Priest of Titania',
      'Elvish Archdruid',
      'Ezuri, Renegade Leader',
      'Craterhoof Behemoth',
      'Beast Whisperer',
      'Wirewood Symbiote',
    ],
    strengths: ['Fast mana', 'Explosive turns', 'Strong tribal support'],
    weaknesses: ['Board wipe vulnerable', 'Predictable', 'Combat focused'],
    recommendedColors: ['G', 'BG', 'WG', 'WBG'],
    powerLevelRange: [6, 8],
    colors: ['G', 'BG', 'WG', 'WBG'],
    examples: [
      'Lathril, Blade of the Elves',
      'Ezuri, Renegade Leader',
      'Marwyn, the Nurturer',
    ],
  },

  tribalZombies: {
    name: 'Tribal - Zombies',
    description: 'Zombie tribal with recursion and attrition',
    strategy: 'Graveyard recursion, sacrifice synergies, drain effects',
    characteristics: {
      avgCMC: '3.0-4.0',
      zombieCount: '30-40',
      recursion: 'essential',
      graveyardSynergy: 'very high',
    },
    keyCards: [
      'Gravecrawler',
      'Rooftop Storm',
      'Phyrexian Altar',
      'Gray Merchant of Asphodel',
      'Carrion Feeder',
      'Undead Augur',
    ],
    strengths: ['Resilient', 'Recursion', 'Attrition'],
    weaknesses: ['Graveyard hate', 'Slow', 'Predictable'],
    recommendedColors: ['B', 'UB', 'BR', 'UBR'],
    powerLevelRange: [5, 8],
    colors: ['B', 'UB', 'BR', 'UBR'],
    examples: [
      'The Scarab God',
      'Gisa and Geralf',
      'Wilhelt, the Rotcleaver',
    ],
  },

  tribalDragons: {
    name: 'Tribal - Dragons',
    description: 'Dragon tribal with ramp and big flying beaters',
    strategy: 'Ramp hard, cast large dragons, dominate with flying',
    characteristics: {
      avgCMC: '4.5-6.0',
      dragonCount: '25-35',
      rampPriority: 'very high',
      flyingMatters: 'implicit',
    },
    keyCards: [
      'Scion of the Ur-Dragon',
      'Dragon Tempest',
      'Crucible of Fire',
      'Dragonspeaker Shaman',
      'Dragonlord\'s Servant',
      'Terror of the Peaks',
    ],
    strengths: ['Powerful creatures', 'Evasion', 'Strong late game'],
    weaknesses: ['Expensive', 'Slow start', 'Needs ramp'],
    recommendedColors: ['WUBRG', 'BR', 'RG', 'UR'],
    powerLevelRange: [5, 8],
    colors: ['R', 'BR', 'RG', 'UR', 'WUBRG'],
    examples: [
      'The Ur-Dragon',
      'Tiamat',
      'Lathliss, Dragon Queen',
    ],
  },

  tribalVampires: {
    name: 'Tribal - Vampires',
    description: 'Vampire tribal with lifegain and aristocrat synergies',
    strategy: 'Vampire synergies, drain life, aristocrats effects',
    characteristics: {
      avgCMC: '3.0-4.0',
      vampireCount: '30-40',
      lifegain: 'common',
      aristocrats: 'often included',
    },
    keyCards: [
      'Blood Artist',
      'Cordial Vampire',
      'Captivating Vampire',
      'Bloodline Keeper',
      'Stensia Masquerade',
      'Sanctum Seeker',
    ],
    strengths: ['Synergistic', 'Lifegain', 'Resilient'],
    weaknesses: ['Combat focused', 'Needs lords', 'Predictable'],
    recommendedColors: ['B', 'BR', 'WB', 'WBR'],
    powerLevelRange: [5, 8],
    colors: ['B', 'BR', 'WB', 'WBR'],
    examples: [
      'Edgar Markov',
      'Olivia Voldaren',
      'Anowon, the Ruin Thief',
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
