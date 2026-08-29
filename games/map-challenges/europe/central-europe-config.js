/* ============================================================
   Central Europe - Map Challenge Config
   Reuses the existing Europe SVG, CSS, flags, and shared engine.
   Countries outside Central Europe remain visible as gray context.
   ============================================================ */

window.MAP_CHALLENGE_CONFIG = {
  slug: "central-europe",

  // Reuse the existing Europe SVG.
  svgPath: "./europe-clickable.svg",

  // Reuse the existing Europe flags.
  showFlags: true,
  flagsBase: "/games/map-challenges/europe/flags/",
  flagExt: ".png",

  // Only these countries are part of this regional challenge.
  targets: [
    "austria",
    "czechia",
    "germany",
    "hungary",
    "liechtenstein",
    "poland",
    "slovakia",
    "slovenia",
    "switzerland",
  ],

  // Every country outside this region begins gray.
  // Because these IDs are not in targets[], they remain visible as
  // geographic context but are not part of the challenge.
  startColors: [
    {
      color: "#777777",
      ids: [
        "albania",
        "andorra",
        "belarus",
        "belgium",
        "bosnia_and_herzegovina",
        "bulgaria",
        "croatia",
        "cyprus",
        "denmark",
        "estonia",
        "finland",
        "france",
        "greece",
        "iceland",
        "ireland",
        "italy",
        "kosovo",
        "latvia",
        "lithuania",
        "luxembourg",
        "malta",
        "moldova",
        "monaco",
        "montenegro",
        "netherlands",
        "north_macedonia",
        "norway",
        "portugal",
        "romania",
        "russia",
        "san_marino",
        "serbia",
        "spain",
        "sweden",
        "ukraine",
        "united_kingdom",
        "vatican_city",
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

  },

  // Optional engine features not needed for this map.
  alias: {},
  groups: {},
  extraIds: [],

  // UI text for this specific challenge.
  ui: {
    bannerTitle: "CENTRAL EUROPE MAP CHALLENGE",
    bannerAria: "Central European countries map challenge banner",

    mainAria: "Central European countries map challenge",
    mapAria: "Central European countries map",

    overlayKicker: "MAP CHALLENGE",
    overlayTitle: "CENTRAL EUROPE",
    beginMessage: "How fast can you identify the countries of Central Europe?",

    logoSrc: "/assets/images/logo/MSHistory_Logo_Small.png"
  }
};
