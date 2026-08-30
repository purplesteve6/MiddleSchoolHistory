/* ============================================================
   United States - Stacked Challenge 1
   Reuses the existing United States SVG, CSS, flags, and shared engine.
   Each included region has its own starting color; unused states are gray.
   ============================================================ */

window.MAP_CHALLENGE_CONFIG = {
  slug: "stack-challenge-1",

  svgPath: "./united-states-clickable.svg",

  showFlags: true,
  flagsBase: "/games/map-challenges/united-states/flags/",
  flagExt: ".webp",

  // Only states in the accumulated regions are playable.
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
    "west_virginia",
    "delaware",
    "maryland",
    "new_jersey",
    "new_york",
    "pennsylvania"
  ],

  // Each active region has its own starting color.
  // States not yet included in this level remain gray and non-playable.
  startColors: [
    {
      color: "#C97969",
      ids: [
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
      ]
    },
    {
      color: "#D2A348",
      ids: [
        "delaware",
        "maryland",
        "new_jersey",
        "new_york",
        "pennsylvania"
      ]
    },
    {
      color: "#777777",
      ids: [
        "alaska",
        "arizona",
        "california",
        "colorado",
        "connecticut",
        "hawaii",
        "idaho",
        "illinois",
        "indiana",
        "iowa",
        "kansas",
        "maine",
        "massachusetts",
        "michigan",
        "minnesota",
        "missouri",
        "montana",
        "nebraska",
        "nevada",
        "new_hampshire",
        "new_mexico",
        "north_dakota",
        "ohio",
        "oklahoma",
        "oregon",
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
    bannerTitle: "UNITED STATES STACKED CHALLENGE 1",
    bannerAria: "United States stacked map challenge 1 banner",

    mainAria: "United States stacked map challenge 1",
    mapAria: "United States map",

    overlayKicker: "STACKED MAP CHALLENGE",
    overlayTitle: "UNITED STATES | LEVEL 1",
    beginMessage: "Southeast + Mid-Atlantic",

    logoSrc: "/assets/images/logo/MSHistory_Logo_Small.png"
  }
};
