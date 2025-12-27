/**
 * Orb visual configuration inspired by the five basic lands.
 * Provides mythic motifs and intensity tuning as choices progress.
 */

export const basicLandOrbs = [
  {
    land: "Plains",
    mythicForm: "Seraphic Griffin",
    aura: "golden dawnlight with feathered halos",
    sigil: "sunburst crest etched in soft ivory",
    palette: {
      core: "#F7E7B2",
      glow: "#FFF4D6",
      shadow: "#C9B073"
    },
    ambient: "choral wind, radiant motes"
  },
  {
    land: "Island",
    mythicForm: "Abyssal Leviathan",
    aura: "moonlit cerulean tides",
    sigil: "spiral tide glyphs in silver",
    palette: {
      core: "#66B7E6",
      glow: "#B3E7FF",
      shadow: "#2C4E7A"
    },
    ambient: "mist, drifting starlight"
  },
  {
    land: "Swamp",
    mythicForm: "Umbral Wraith Serpent",
    aura: "violet shadowflame and whispering smoke",
    sigil: "obsidian rune of depth",
    palette: {
      core: "#5A3A8E",
      glow: "#A786FF",
      shadow: "#1D0F2E"
    },
    ambient: "inkfall embers, spectral fog"
  },
  {
    land: "Mountain",
    mythicForm: "Volcanic Phoenix",
    aura: "molten flare with ember trails",
    sigil: "cracked lava seal",
    palette: {
      core: "#F26A3D",
      glow: "#FFC09A",
      shadow: "#5B1A0D"
    },
    ambient: "sparks, heat shimmer"
  },
  {
    land: "Forest",
    mythicForm: "Ancient World-Tree Stag",
    aura: "emerald breath with living spores",
    sigil: "verdant knotwork",
    palette: {
      core: "#5CC46B",
      glow: "#B8F2C1",
      shadow: "#204429"
    },
    ambient: "pollen glow, leaf whispers"
  }
];

export const orbIntensityLevels = [
  {
    stage: 0,
    label: "calm",
    glowStrength: 0.35,
    pulseSpeed: 0.9,
    particleDensity: 0.25,
    distortion: 0.08,
    transitionMs: 5200
  },
  {
    stage: 1,
    label: "awakening",
    glowStrength: 0.5,
    pulseSpeed: 1.1,
    particleDensity: 0.4,
    distortion: 0.12,
    transitionMs: 4400
  },
  {
    stage: 2,
    label: "mythic",
    glowStrength: 0.7,
    pulseSpeed: 1.35,
    particleDensity: 0.6,
    distortion: 0.18,
    transitionMs: 3600
  },
  {
    stage: 3,
    label: "ascendant",
    glowStrength: 0.9,
    pulseSpeed: 1.6,
    particleDensity: 0.85,
    distortion: 0.24,
    transitionMs: 3000
  },
  {
    stage: 4,
    label: "apex",
    glowStrength: 1.1,
    pulseSpeed: 1.9,
    particleDensity: 1,
    distortion: 0.3,
    transitionMs: 2400
  }
];

const clampChoiceCount = (choiceCount) =>
  Math.max(0, Math.min(choiceCount, orbIntensityLevels.length - 1));

/**
 * Returns the current orb state based on how many card options have been chosen.
 * @param {number} choiceCount
 * @param {number} cycleIndex
 * @returns {{land: object, nextLand: object, intensity: object, transition: object}}
 */
export const getOrbState = (choiceCount = 0, cycleIndex = 0) => {
  const intensityIndex = clampChoiceCount(choiceCount);
  const landIndex = ((cycleIndex % basicLandOrbs.length) + basicLandOrbs.length) %
    basicLandOrbs.length;
  const nextIndex = (landIndex + 1) % basicLandOrbs.length;

  const intensity = orbIntensityLevels[intensityIndex];
  const land = basicLandOrbs[landIndex];
  const nextLand = basicLandOrbs[nextIndex];

  return {
    land,
    nextLand,
    intensity,
    transition: {
      from: land.land,
      to: nextLand.land,
      style: "mythic-crossfade",
      durationMs: intensity.transitionMs,
      surge: intensity.glowStrength > 0.8 ? "radiant-bloom" : "soft-bloom"
    }
  };
};
