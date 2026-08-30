/* ============================================================
   United States - Southeast Map Challenge Config
   Reuses the existing United States SVG, CSS, flags, and shared engine.
   States outside this region remain visible in gray as non-playable context.
   ============================================================ */

window.MAP_CHALLENGE_CONFIG = {
  slug: "united-states-southeast",

  svgPath: "./united-states-clickable.svg",

  showFlags: true,
  flagsBase: "/games/map-challenges/united-states/flags/",
  flagExt: ".webp",

  // All states outside this region remain visible as gray context.
  startColors: [
    {
      color: "#777777",
      ids: [
        "alaska",
        "arizona",
        "california",
        "colorado",
        "connecticut",
        "delaware",
        "hawaii",
        "idaho",
        "illinois",
        "indiana",
        "iowa",
        "kansas",
        "maine",
        "maryland",
        "massachusetts",
        "michigan",
        "minnesota",
        "missouri",
        "montana",
        "nebraska",
        "nevada",
        "new_hampshire",
        "new_jersey",
        "new_mexico",
        "new_york",
        "north_dakota",
        "ohio",
        "oklahoma",
        "oregon",
        "pennsylvania",
        "rhode_island",
        "south_dakota",
        "texas",
        "utah",
        "vermont",
        "washington",
        "wisconsin",
        "wyoming"
      ]
    }
  ],

  // Only these states are playable in this regional challenge.
  targets: [
    "alabama",
    "arkansas",
    "florida",
    "georgia",
    "kentucky",
    "louisiana",
    "mississippi",
    "north_carolina",
    "south_carolina",
    "tennessee",
    "virginia",
    "west_virginia"
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
    bannerTitle: "UNITED STATES: SOUTHEAST MAP CHALLENGE",
    bannerAria: "United States Southeast map challenge banner",

    mainAria: "United States Southeast map challenge",
    mapAria: "United States map",

    overlayKicker: "MAP CHALLENGE",
    overlayTitle: "UNITED STATES | SOUTHEAST",
    beginMessage: "How fast can you identify the states of the Southeast?",

    logoSrc: "/assets/images/logo/MSHistory_Logo_Small.png"
  }
};
