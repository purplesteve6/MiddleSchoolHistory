/* ============================================================
   United States - Mid-Atlantic Map Challenge Config
   Reuses the existing United States SVG, CSS, flags, and shared engine.
   States outside this region remain visible in gray as non-playable context.
   ============================================================ */

window.MAP_CHALLENGE_CONFIG = {
  slug: "united-states-mid-atlantic",

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
        "massachusetts",
        "michigan",
        "minnesota",
        "mississippi",
        "missouri",
        "montana",
        "nebraska",
        "nevada",
        "new_hampshire",
        "new_mexico",
        "north_carolina",
        "north_dakota",
        "ohio",
        "oklahoma",
        "oregon",
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
        "wisconsin",
        "wyoming"
      ]
    }
  ],

  // Only these states are playable in this regional challenge.
  targets: [
    "delaware",
    "maryland",
    "new_jersey",
    "new_york",
    "pennsylvania"
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
    bannerTitle: "UNITED STATES: MID-ATLANTIC MAP CHALLENGE",
    bannerAria: "United States Mid-Atlantic map challenge banner",

    mainAria: "United States Mid-Atlantic map challenge",
    mapAria: "United States map",

    overlayKicker: "MAP CHALLENGE",
    overlayTitle: "UNITED STATES | MID-ATLANTIC",
    beginMessage: "How fast can you identify the states of the Mid-Atlantic?",

    logoSrc: "/assets/images/logo/MSHistory_Logo_Small.png"
  }
};
