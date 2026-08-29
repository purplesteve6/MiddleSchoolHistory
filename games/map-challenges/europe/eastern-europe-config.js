/* ============================================================
   Eastern Europe - Map Challenge Config
   Reuses the existing Europe SVG, CSS, flags, and shared engine.
   Countries outside Eastern Europe remain visible as gray context.
   ============================================================ */

window.MAP_CHALLENGE_CONFIG = {
  slug: "eastern-europe",

  // Reuse the existing Europe SVG.
  svgPath: "./europe-clickable.svg",

  // Reuse the existing Europe flags.
  showFlags: true,
  flagsBase: "/games/map-challenges/europe/flags/",
  flagExt: ".png",

  // Only these countries are part of this regional challenge.
  targets: [
    "belarus",
    "estonia",
    "latvia",
    "lithuania",
    "moldova",
    "russia",
    "ukraine",
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
        "austria",
        "belgium",
        "bosnia_and_herzegovina",
        "bulgaria",
        "croatia",
        "cyprus",
        "czechia",
        "denmark",
        "finland",
        "france",
        "germany",
        "greece",
        "hungary",
        "iceland",
        "ireland",
        "italy",
        "kosovo",
        "liechtenstein",
        "luxembourg",
        "malta",
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
        "spain",
        "sweden",
        "switzerland",
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
    bannerTitle: "EASTERN EUROPE MAP CHALLENGE",
    bannerAria: "Eastern European countries map challenge banner",

    mainAria: "Eastern European countries map challenge",
    mapAria: "Eastern European countries map",

    overlayKicker: "MAP CHALLENGE",
    overlayTitle: "EASTERN EUROPE",
    beginMessage: "How fast can you identify the countries of Eastern Europe?",

    logoSrc: "/assets/images/logo/MSHistory_Logo_Small.png"
  }
};
