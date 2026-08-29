/* ============================================================
   Western Europe - Map Challenge Config
   Reuses the existing Europe SVG, CSS, flags, and shared engine.
   Countries outside Western Europe remain visible as gray context.
   ============================================================ */

window.MAP_CHALLENGE_CONFIG = {
  slug: "western-europe",

  // Reuse the existing Europe SVG.
  svgPath: "./europe-clickable.svg",

  // Reuse the existing Europe flags.
  showFlags: true,
  flagsBase: "/games/map-challenges/europe/flags/",
  flagExt: ".png",

  // Western Europe targets only.
  // This uses a broad classroom-geography definition of Western Europe.
  targets: [
    "andorra",
    "austria",
    "belgium",
    "france",
    "germany",
    "ireland",
    "liechtenstein",
    "luxembourg",
    "monaco",
    "netherlands",
    "portugal",
    "spain",
    "switzerland",
    "united_kingdom"
  ],

  // Every non-target European country begins gray.
  // Because these IDs are not in targets[], they remain visible but are
  // not part of the challenge.
  startColors: [
    {
      color: "#777777",
      ids: [
        "albania",
        "belarus",
        "bosnia_and_herzegovina",
        "bulgaria",
        "croatia",
        "cyprus",
        "czechia",
        "denmark",
        "estonia",
        "finland",
        "greece",
        "hungary",
        "iceland",
        "italy",
        "kosovo",
        "latvia",
        "lithuania",
        "malta",
        "moldova",
        "montenegro",
        "north_macedonia",
        "norway",
        "poland",
        "romania",
        "russia",
        "san_marino",
        "serbia",
        "slovakia",
        "slovenia",
        "sweden",
        "ukraine",
        "vatican_city"
      ]
    }
  ],

  // IDs that exist in SVG but should NOT count as wrong / clickable targets.
  ignoreIds: [
    "water",
    "borders",
    "context_land"
  ],

  // Optional display name overrides.
  displayNames: {
    united_kingdom: "United Kingdom"
  },

  // Optional aliasing (not needed for this map, but supported).
  alias: {},

  // Optional grouping (not needed for this map, but supported).
  groups: {},

  // Optional extra IDs (not needed for this map).
  extraIds: [],

  // UI text for this specific challenge.
  ui: {
    bannerTitle: "WESTERN EUROPE MAP CHALLENGE",
    bannerAria: "Western Europe countries map challenge banner",

    mainAria: "Western Europe countries map challenge",
    mapAria: "Western Europe countries map",

    overlayKicker: "MAP CHALLENGE",
    overlayTitle: "WESTERN EUROPE",
    beginMessage: "How fast can you identify the countries of Western Europe?",

    logoSrc: "/assets/images/logo/MSHistory_Logo_Small.png"
  }
};
