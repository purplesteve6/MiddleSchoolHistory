/* ============================================================
   Scandinavia - Map Challenge Config
   Reuses the existing Europe SVG, CSS, flags, and shared engine.
   Countries outside Scandinavia remain visible as gray context.
   ============================================================ */

window.MAP_CHALLENGE_CONFIG = {
  slug: "scandinavia",

  // Reuse the existing Europe SVG.
  svgPath: "./europe-clickable.svg",

  // Reuse the existing Europe flags.
  showFlags: true,
  flagsBase: "/games/map-challenges/europe/flags/",
  flagExt: ".png",

  // Only these countries are part of this regional challenge.
  targets: [
    "denmark",
    "finland",
    "iceland",
    "norway",
    "sweden",
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
        "belarus",
        "belgium",
        "bosnia_and_herzegovina",
        "bulgaria",
        "croatia",
        "cyprus",
        "czechia",
        "estonia",
        "france",
        "germany",
        "greece",
        "hungary",
        "ireland",
        "italy",
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
        "poland",
        "portugal",
        "romania",
        "russia",
        "san_marino",
        "serbia",
        "slovakia",
        "slovenia",
        "spain",
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

  },

  // Optional engine features not needed for this map.
  alias: {},
  groups: {},
  extraIds: [],

  // UI text for this specific challenge.
  ui: {
    bannerTitle: "SCANDINAVIA MAP CHALLENGE",
    bannerAria: "Scandinavian countries map challenge banner",

    mainAria: "Scandinavian countries map challenge",
    mapAria: "Scandinavian countries map",

    overlayKicker: "MAP CHALLENGE",
    overlayTitle: "SCANDINAVIA",
    beginMessage: "How fast can you identify the countries of Scandinavia?",

    logoSrc: "/assets/images/logo/MSHistory_Logo_Small.png"
  }
};
