/* ============================================================
   United States - Southeast Map Challenge Config
   Regional challenge using the shared United States SVG and engine.
   ============================================================ */

window.MAP_CHALLENGE_CONFIG = {
  slug: "united-states-southeast",

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

  // Only these states are part of this regional challenge.
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
