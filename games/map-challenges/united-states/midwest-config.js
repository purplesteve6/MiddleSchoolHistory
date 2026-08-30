/* ============================================================
   United States - Midwest Map Challenge Config
   Reuses the existing United States SVG, CSS, flags, and shared engine.
   States outside this region remain visible in gray as non-playable context.
   ============================================================ */

window.MAP_CHALLENGE_CONFIG = {
  slug: "united-states-midwest",

  svgPath: "./united-states-clickable.svg",

  showFlags: true,
  flagsBase: "/games/map-challenges/united-states/flags/",
  flagExt: ".webp",

  // All states outside this region remain visible as gray context.
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
        "iowa",
        "kansas",
        "kentucky",
        "louisiana",
        "maine",
        "maryland",
        "massachusetts",
        "mississippi",
        "missouri",
        "montana",
        "nebraska",
        "nevada",
        "new_hampshire",
        "new_jersey",
        "new_mexico",
        "new_york",
        "north_carolina",
        "north_dakota",
        "oklahoma",
        "oregon",
        "pennsylvania",
        "rhode_island",
        "south_carolina",
        "south_dakota",
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

  // Only these states are playable in this regional challenge.
  targets: [
    "illinois",
    "indiana",
    "michigan",
    "minnesota",
    "ohio",
    "wisconsin"
  ],

  ignoreIds: [
    "water",
    "borders",
    "context_land"
  ],

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
