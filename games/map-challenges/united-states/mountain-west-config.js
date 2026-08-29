/* ============================================================
   United States - Mountain West Map Challenge Config
   Regional challenge using the shared United States SVG and engine.
   ============================================================ */

window.MAP_CHALLENGE_CONFIG = {
  slug: "united-states-mountain-west",

  // Reuse the existing United States SVG.
  svgPath: "./united-states-clickable.svg",

  // Reuse the existing state flags.
  showFlags: true,
  flagsBase: "/games/map-challenges/united-states/flags/",
  flagExt: ".webp",

  // States outside this region remain visible as gray, non-playable context.
  startColors: [
    {
      color: "#777777",
      ids: [
        "alabama",
        "alaska",
        "arizona",
        "arkansas",
        "california",
        "connecticut",
        "delaware",
        "florida",
        "georgia",
        "hawaii",
        "illinois",
        "indiana",
        "iowa",
        "kansas",
        "kentucky",
        "louisiana",
        "maine",
        "maryland",
        "massachusetts",
        "michigan",
        "minnesota",
        "mississippi",
        "missouri",
        "nebraska",
        "nevada",
        "new_hampshire",
        "new_jersey",
        "new_mexico",
        "new_york",
        "north_carolina",
        "north_dakota",
        "ohio",
        "oklahoma",
        "oregon",
        "pennsylvania",
        "rhode_island",
        "south_carolina",
        "south_dakota",
        "tennessee",
        "texas",
        "vermont",
        "virginia",
        "washington",
        "west_virginia",
        "wisconsin"
      ]
    }
  ],

  // Only these states are part of this regional challenge.
  targets: [
    "colorado",
    "idaho",
    "montana",
    "utah",
    "wyoming"
  ],

  // Existing non-state SVG layers.
  ignoreIds: [
    "water",
    "borders",
    "context_land"
  ],

  // Optional display-name overrides.
  displayNames: {
    new_york: "New York"
  },

  alias: {},
  groups: {},
  extraIds: [],

  ui: {
    bannerTitle: "UNITED STATES: MOUNTAIN WEST MAP CHALLENGE",
    bannerAria: "United States Mountain West map challenge banner",

    mainAria: "United States Mountain West map challenge",
    mapAria: "United States map",

    overlayKicker: "MAP CHALLENGE",
    overlayTitle: "UNITED STATES | MOUNTAIN WEST",
    beginMessage: "How fast can you identify the states of the Mountain West?",

    logoSrc: "/assets/images/logo/MSHistory_Logo_Small.png"
  }
};
