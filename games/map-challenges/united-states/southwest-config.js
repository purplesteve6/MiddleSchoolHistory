/* ============================================================
   United States - Southwest Map Challenge Config
   Regional challenge using the shared United States SVG and engine.
   ============================================================ */

window.MAP_CHALLENGE_CONFIG = {
  slug: "united-states-southwest",

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
        "arkansas",
        "california",
        "colorado",
        "connecticut",
        "delaware",
        "florida",
        "georgia",
        "hawaii",
        "idaho",
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
        "montana",
        "nebraska",
        "nevada",
        "new_hampshire",
        "new_jersey",
        "new_york",
        "north_carolina",
        "north_dakota",
        "ohio",
        "oregon",
        "pennsylvania",
        "rhode_island",
        "south_carolina",
        "south_dakota",
        "tennessee",
        "utah",
        "vermont",
        "virginia",
        "washington",
        "west_virginia",
        "wisconsin",
        "wyoming"
      ]
    }
  ],

  // Only these states are part of this regional challenge.
  targets: [
    "arizona",
    "new_mexico",
    "oklahoma",
    "texas"
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
    bannerTitle: "UNITED STATES: SOUTHWEST MAP CHALLENGE",
    bannerAria: "United States Southwest map challenge banner",

    mainAria: "United States Southwest map challenge",
    mapAria: "United States map",

    overlayKicker: "MAP CHALLENGE",
    overlayTitle: "UNITED STATES | SOUTHWEST",
    beginMessage: "How fast can you identify the states of the Southwest?",

    logoSrc: "/assets/images/logo/MSHistory_Logo_Small.png"
  }
};
