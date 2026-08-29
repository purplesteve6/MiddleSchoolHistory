/* ============================================================
   United States - Pacific West Map Challenge Config
   Regional challenge using the shared United States SVG and engine.
   ============================================================ */

window.MAP_CHALLENGE_CONFIG = {
  slug: "united-states-pacific-west",

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
        "arizona",
        "arkansas",
        "colorado",
        "connecticut",
        "delaware",
        "florida",
        "georgia",
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
        "new_hampshire",
        "new_jersey",
        "new_mexico",
        "new_york",
        "north_carolina",
        "north_dakota",
        "ohio",
        "oklahoma",
        "pennsylvania",
        "rhode_island",
        "south_carolina",
        "south_dakota",
        "tennessee",
        "texas",
        "utah",
        "vermont",
        "virginia",
        "west_virginia",
        "wisconsin",
        "wyoming"
      ]
    }
  ],

  // Only these states are part of this regional challenge.
  targets: [
    "alaska",
    "california",
    "hawaii",
    "nevada",
    "oregon",
    "washington"
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
    bannerTitle: "UNITED STATES: PACIFIC WEST MAP CHALLENGE",
    bannerAria: "United States Pacific West map challenge banner",

    mainAria: "United States Pacific West map challenge",
    mapAria: "United States map",

    overlayKicker: "MAP CHALLENGE",
    overlayTitle: "UNITED STATES | PACIFIC WEST",
    beginMessage: "How fast can you identify the states of the Pacific West?",

    logoSrc: "/assets/images/logo/MSHistory_Logo_Small.png"
  }
};
