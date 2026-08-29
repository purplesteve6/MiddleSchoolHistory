/* ============================================================
   Balkan Countries - Map Challenge Config
   Reuses the existing Europe SVG, CSS, flags, and shared engine.
   Countries outside the Balkans remain visible as gray context.
   ============================================================ */

window.MAP_CHALLENGE_CONFIG = {
  slug: "balkan-countries",

  // Reuse the existing Europe SVG.
  svgPath: "./europe-clickable.svg",

  // Reuse the existing Europe flags.
  showFlags: true,
  flagsBase: "/games/map-challenges/europe/flags/",
  flagExt: ".png",

  // Only these countries are part of this regional challenge.
  targets: [
    "albania",
    "bosnia_and_herzegovina",
    "bulgaria",
    "croatia",
    "greece",
    "kosovo",
    "montenegro",
    "north_macedonia",
    "romania",
    "serbia",
  ],

  // Every country outside this region begins gray.
  // Because these IDs are not in targets[], they remain visible as
  // geographic context but are not part of the challenge.
  startColors: [
    {
      color: "#777777",
      ids: [
        "andorra",
        "austria",
        "belarus",
        "belgium",
        "cyprus",
        "czechia",
        "denmark",
        "estonia",
        "finland",
        "france",
        "germany",
        "hungary",
        "iceland",
        "ireland",
        "italy",
        "latvia",
        "liechtenstein",
        "lithuania",
        "luxembourg",
        "malta",
        "moldova",
        "monaco",
        "netherlands",
        "norway",
        "poland",
        "portugal",
        "russia",
        "san_marino",
        "slovakia",
        "slovenia",
        "spain",
        "sweden",
        "switzerland",
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
    bosnia_and_herzegovina: "Bosnia & Herzegovina",
    north_macedonia: "North Macedonia",
  },

  // Optional engine features not needed for this map.
  alias: {},
  groups: {},
  extraIds: [],

  // UI text for this specific challenge.
  ui: {
    bannerTitle: "BALKAN COUNTRIES MAP CHALLENGE",
    bannerAria: "Balkan countries map challenge banner",

    mainAria: "Balkan countries map challenge",
    mapAria: "Balkan countries map",

    overlayKicker: "MAP CHALLENGE",
    overlayTitle: "BALKAN COUNTRIES",
    beginMessage: "How fast can you identify the Balkan countries?",

    logoSrc: "/assets/images/logo/MSHistory_Logo_Small.png"
  }
};
