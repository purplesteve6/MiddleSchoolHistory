/* ============================================================
   Southern Europe - Map Challenge Config
   Reuses the existing Europe SVG, CSS, flags, and shared engine.
   Countries outside Southern Europe remain visible as gray context.
   ============================================================ */

window.MAP_CHALLENGE_CONFIG = {
  slug: "southern-europe",

  // Reuse the existing Europe SVG.
  svgPath: "./europe-clickable.svg",

  // Reuse the existing Europe flags.
  showFlags: true,
  flagsBase: "/games/map-challenges/europe/flags/",
  flagExt: ".png",

  // Only these countries are part of this regional challenge.
  targets: [
    "andorra",
    "cyprus",
    "italy",
    "malta",
    "monaco",
    "portugal",
    "san_marino",
    "spain",
    "vatican_city",
  ],

  // Every country outside this region begins gray.
  // Because these IDs are not in targets[], they remain visible as
  // geographic context but are not part of the challenge.
  startColors: [
    {
      color: "#777777",
      ids: [
        "albania",
        "austria",
        "belarus",
        "belgium",
        "bosnia_and_herzegovina",
        "bulgaria",
        "croatia",
        "czechia",
        "denmark",
        "estonia",
        "finland",
        "france",
        "germany",
        "greece",
        "hungary",
        "iceland",
        "ireland",
        "kosovo",
        "latvia",
        "liechtenstein",
        "lithuania",
        "luxembourg",
        "moldova",
        "montenegro",
        "netherlands",
        "north_macedonia",
        "norway",
        "poland",
        "romania",
        "russia",
        "serbia",
        "slovakia",
        "slovenia",
        "sweden",
        "switzerland",
        "ukraine",
        "united_kingdom",
      ]
    }
  ],

  // IDs that exist in SVG but should NOT count as wrong / clickable targets.
  ignoreIds: [
    "water",
    "borders",
    "context_land"
  ],

  // Display-name overrides used by the original Europe challenge.
  displayNames: {
    san_marino: "San Marino",
    vatican_city: "Vatican City",
  },

  // Optional engine features not needed for this map.
  alias: {},
  groups: {},
  extraIds: [],

  // UI text for this specific challenge.
  ui: {
    bannerTitle: "SOUTHERN EUROPE MAP CHALLENGE",
    bannerAria: "Southern European countries map challenge banner",

    mainAria: "Southern European countries map challenge",
    mapAria: "Southern European countries map",

    overlayKicker: "MAP CHALLENGE",
    overlayTitle: "SOUTHERN EUROPE",
    beginMessage: "How fast can you identify the countries of Southern Europe?",

    logoSrc: "/assets/images/logo/MSHistory_Logo_Small.png"
  }
};
