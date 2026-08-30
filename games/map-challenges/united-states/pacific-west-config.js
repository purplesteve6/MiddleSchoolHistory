/* ============================================================
   United States - Pacific West Map Challenge Config
   Reuses the existing United States SVG, CSS, flags, and shared engine.
   States outside this region remain visible in gray as non-playable context.
   ============================================================ */

window.MAP_CHALLENGE_CONFIG = {
  slug: "united-states-pacific-west",

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
        "nevada",
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

  // Only these states are playable in this regional challenge.
  targets: [
    "alaska",
    "california",
    "hawaii",
    "oregon",
    "washington"
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
