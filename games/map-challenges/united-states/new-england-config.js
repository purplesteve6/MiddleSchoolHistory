/* ============================================================
   United States - New England Map Challenge Config
   Reuses the existing United States SVG, CSS, flags, and shared engine.
   States outside this region remain visible in gray as non-playable context.
   ============================================================ */

window.MAP_CHALLENGE_CONFIG = {
  slug: "united-states-new-england",

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
        "maryland",
        "michigan",
        "minnesota",
        "mississippi",
        "missouri",
        "montana",
        "nebraska",
        "nevada",
        "new_jersey",
        "new_mexico",
        "new_york",
        "north_carolina",
        "north_dakota",
        "ohio",
        "oklahoma",
        "oregon",
        "pennsylvania",
        "south_carolina",
        "south_dakota",
        "tennessee",
        "texas",
        "utah",
        "virginia",
        "washington",
        "west_virginia",
        "wisconsin",
        "wyoming"
      ]
    }
  ],

  // Only these states are playable in this regional challenge.
  targets: [
    "connecticut",
    "maine",
    "massachusetts",
    "new_hampshire",
    "rhode_island",
    "vermont"
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
    bannerTitle: "UNITED STATES: NEW ENGLAND MAP CHALLENGE",
    bannerAria: "United States New England map challenge banner",

    mainAria: "United States New England map challenge",
    mapAria: "United States map",

    overlayKicker: "MAP CHALLENGE",
    overlayTitle: "UNITED STATES | NEW ENGLAND",
    beginMessage: "How fast can you identify the states of the New England?",

    logoSrc: "/assets/images/logo/MSHistory_Logo_Small.png"
  }
};
