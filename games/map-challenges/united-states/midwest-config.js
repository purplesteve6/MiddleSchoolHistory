/* ============================================================
   United States - Midwest Map Challenge Config
   Regional challenge using the shared United States SVG and engine.
   ============================================================ */

window.MAP_CHALLENGE_CONFIG = {
  slug: "united-states-midwest",

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
        "colorado",
        "connecticut",
        "delaware",
        "florida",
        "georgia",
        "hawaii",
        "idaho",
        "kentucky",
        "louisiana",
        "maine",
        "maryland",
        "massachusetts",
        "mississippi",
        "montana",
        "nevada",
        "new_hampshire",
        "new_jersey",
        "new_mexico",
        "new_york",
        "north_carolina",
        "oklahoma",
        "oregon",
        "pennsylvania",
        "rhode_island",
        "south_carolina",
        "tennessee",
        "texas",
        "utah",
        "vermont",
        "virginia",
        "washington",
        "west_virginia",
        "wyoming"
      ]
    }
  ],

  // Only these states are part of this regional challenge.
  targets: [
    "illinois",
    "indiana",
    "iowa",
    "kansas",
    "michigan",
    "minnesota",
    "missouri",
    "nebraska",
    "north_dakota",
    "ohio",
    "south_dakota",
    "wisconsin"
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
    bannerTitle: "UNITED STATES: MIDWEST MAP CHALLENGE",
    bannerAria: "United States Midwest map challenge banner",

    mainAria: "United States Midwest map challenge",
    mapAria: "United States map",

    overlayKicker: "MAP CHALLENGE",
    overlayTitle: "UNITED STATES | MIDWEST",
    beginMessage: "How fast can you identify the states of the Midwest?",

    logoSrc: "/assets/images/logo/MSHistory_Logo_Small.png"
  }
};
