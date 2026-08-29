/* ============================================================
   United States - Northeast Map Challenge Config
   Regional challenge using the shared United States SVG and engine.
   ============================================================ */

window.MAP_CHALLENGE_CONFIG = {
  slug: "united-states-northeast",

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
        "michigan",
        "minnesota",
        "mississippi",
        "missouri",
        "montana",
        "nebraska",
        "nevada",
        "new_mexico",
        "north_carolina",
        "north_dakota",
        "ohio",
        "oklahoma",
        "oregon",
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

  // Only these states are part of this regional challenge.
  targets: [
    "connecticut",
    "delaware",
    "maine",
    "maryland",
    "massachusetts",
    "new_hampshire",
    "new_jersey",
    "new_york",
    "pennsylvania",
    "rhode_island",
    "vermont"
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
    bannerTitle: "UNITED STATES: NORTHEAST MAP CHALLENGE",
    bannerAria: "United States Northeast map challenge banner",

    mainAria: "United States Northeast map challenge",
    mapAria: "United States map",

    overlayKicker: "MAP CHALLENGE",
    overlayTitle: "UNITED STATES | NORTHEAST",
    beginMessage: "How fast can you identify the states of the Northeast?",

    logoSrc: "/assets/images/logo/MSHistory_Logo_Small.png"
  }
};
