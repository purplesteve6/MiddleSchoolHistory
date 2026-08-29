/* ============================================================
   Europe - Select Map Challenge
   Reuses the existing Europe SVG, CSS, flags, and shared engine.
   Only the selected countries are playable; all others are gray context.
   ============================================================ */

window.MAP_CHALLENGE_CONFIG = {
  slug: "select-europe",

  svgPath: "./europe-clickable.svg",

  showFlags: true,
  flagsBase: "/games/map-challenges/europe/flags/",
  flagExt: ".png",

  // Only these selected countries are part of the challenge.
  targets: [
    "united_kingdom",
    "france",
    "spain",
    "germany",
    "vatican_city",
    "italy",
    "russia",
    "ukraine",
    "greece"
  ],

  // All other European countries remain visible but are non-playable context.
  startColors: [
    {
      color: "#777777",
      ids: [
        "albania",
        "andorra",
        "austria",
        "belarus",
        "belgium",
        "bosnia_and_herzegovina",
        "bulgaria",
        "croatia",
        "cyprus",
        "czechia",
        "denmark",
        "estonia",
        "finland",
        "hungary",
        "iceland",
        "ireland",
        "kosovo",
        "latvia",
        "liechtenstein",
        "lithuania",
        "luxembourg",
        "malta",
        "moldova",
        "monaco",
        "montenegro",
        "netherlands",
        "north_macedonia",
        "norway",
        "poland",
        "portugal",
        "romania",
        "san_marino",
        "serbia",
        "slovakia",
        "slovenia",
        "sweden",
        "switzerland"
      ]
    }
  ],

  ignoreIds: [
    "water",
    "borders",
    "context_land"
  ],

  displayNames: {
    united_kingdom: "United Kingdom",
    vatican_city: "Vatican City"
  },

  alias: {},
  groups: {},
  extraIds: [],

  ui: {
    bannerTitle: "SELECT EUROPE MAP CHALLENGE",
    bannerAria: "Select Europe map challenge banner",

    mainAria: "Select Europe map challenge",
    mapAria: "European countries map",

    overlayKicker: "MAP CHALLENGE",
    overlayTitle: "SELECT MAP OF EUROPE",
    beginMessage: "How fast can you identify these selected European countries?",

    logoSrc: "/assets/images/logo/MSHistory_Logo_Small.png"
  }
};
