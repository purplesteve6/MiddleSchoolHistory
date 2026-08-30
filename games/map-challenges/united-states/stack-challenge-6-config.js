/* ============================================================
   United States - Stacked Challenge 6
   Reuses the existing United States SVG, CSS, flags, and shared engine.
   Each included region has its own starting color; unused states are gray.
   ============================================================ */

window.MAP_CHALLENGE_CONFIG = {
  slug: "stack-challenge-6",

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
    "pennsylvania",
    "connecticut",
    "maine",
    "massachusetts",
    "new_hampshire",
    "rhode_island",
    "vermont",
    "illinois",
    "indiana",
    "michigan",
    "minnesota",
    "ohio",
    "wisconsin",
    "iowa",
    "kansas",
    "missouri",
    "nebraska",
    "north_dakota",
    "south_dakota",
    "arizona",
    "new_mexico",
    "oklahoma",
    "texas",
    "colorado",
    "idaho",
    "montana",
    "nevada",
    "utah",
    "wyoming"
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
      color: "#58A39B",
      ids: [
        "connecticut",
        "maine",
        "massachusetts",
        "new_hampshire",
        "rhode_island",
        "vermont"
      ]
    },
    {
      color: "#6F9FC8",
      ids: [
        "illinois",
        "indiana",
        "michigan",
        "minnesota",
        "ohio",
        "wisconsin"
      ]
    },
    {
      color: "#A7A95F",
      ids: [
        "iowa",
        "kansas",
        "missouri",
        "nebraska",
        "north_dakota",
        "south_dakota"
      ]
    },
    {
      color: "#D98547",
      ids: [
        "arizona",
        "new_mexico",
        "oklahoma",
        "texas"
      ]
    },
    {
      color: "#6F9B70",
      ids: [
        "colorado",
        "idaho",
        "montana",
        "nevada",
        "utah",
        "wyoming"
      ]
    },
    {
      color: "#777777",
      ids: [
        "alaska",
        "california",
        "hawaii",
        "oregon",
        "washington"
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
    bannerTitle: "UNITED STATES STACKED CHALLENGE 6",
    bannerAria: "United States stacked map challenge 6 banner",

    mainAria: "United States stacked map challenge 6",
    mapAria: "United States map",

    overlayKicker: "STACKED MAP CHALLENGE",
    overlayTitle: "UNITED STATES | LEVEL 6",
    beginMessage: "Southeast + Mid-Atlantic + New England + Midwest + Great Plains + Southwest + Mountain West",

    logoSrc: "/assets/images/logo/MSHistory_Logo_Small.png"
  }
};
