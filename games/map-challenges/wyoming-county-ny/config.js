/* ============================================================
   Wyoming County (NY) Towns - Map Challenge Config
   Only edit this file (and the SVG / optional CSS variables)
   ============================================================ */

window.MAP_CHALLENGE_CONFIG = {
  slug: "wyoming-county-ny",

  // SVG file to load (must exist)
  svgPath: "/games/map-challenges/wyoming-county-ny/wyoming-county-ny-clickable.svg",

  // Flags optional (towns usually don't need them)
  showFlags: false,
  flagsBase: "/games/map-challenges/wyoming-county-ny/flags/",

  // IDs that count as "targets" (must match SVG element IDs)
  targets: [
    "arcade",
    "attica",
    "bennington",
    "castile",
    "covington",
    "eagle",
    "gainesville",
    "genesee_falls",
    "java",
    "middlebury",
    "orangeville",
    "perry",
    "pike",
    "sheldon",
    "warsaw",
    "wethersfield"
  ],

  // IDs that exist in SVG but should NOT count as wrong / clickable targets
  ignoreIds: [
    "county_outline",
    "labels",
    "water",
    "borders",
    "context_land"
  ],

  // Optional display name overrides
  displayNames: {
    genesee_falls: "Genesee Falls"
  },

  // Optional aliasing (not needed for this map, but supported)
  alias: {
    // example:
    // "village_of_warsaw": "warsaw"
  },

  // Optional grouping (apply correct/wrong styling to multiple SVG elements)
  groups: {
    // example:
    // "warsaw": ["warsaw", "warsaw_label_bg"]
  },

  // Optional extra IDs to clear classes from (usually only used with alias/group setups)
  extraIds: [
    // example: "warsaw_label_bg"
  ],

  // UI text for this specific map
  ui: {
    bannerTitle: "WYOMING COUNTY (NY) TOWNS MAP CHALLENGE",
    bannerAria: "Wyoming County towns map challenge banner",

    mainAria: "Wyoming County towns map challenge",
    mapAria: "Wyoming County towns map",

    overlayKicker: "MAP CHALLENGE",
    overlayTitle: "WYOMING COUNTY",
    beginMessage: "Click each of the 16 towns in Wyoming County, New York as fast as you can!",

    logoSrc: "/assets/images/logo/MSHistory_Logo_Small.png"
  }
};
