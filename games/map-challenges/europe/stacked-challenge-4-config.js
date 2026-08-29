/* ============================================================
   Europe - Stacked Challenge 4
   Reuses the existing Europe SVG, CSS, flags, and shared engine.
   Included regions start in different colors; unused countries are gray.
   ============================================================ */

window.MAP_CHALLENGE_CONFIG = {
  slug: "stacked-challenge-4",

  // Reuse the existing Europe SVG.
  svgPath: "./europe-clickable.svg",

  // Reuse the existing Europe flags.
  showFlags: true,
  flagsBase: "/games/map-challenges/europe/flags/",
  flagExt: ".png",

  // Only countries from the stacked regions are playable targets.
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
    "austria",
    "czechia",
    "germany",
    "hungary",
    "liechtenstein",
    "poland",
    "slovakia",
    "slovenia",
    "switzerland",
    "belarus",
    "estonia",
    "latvia",
    "lithuania",
    "moldova",
    "russia",
    "ukraine",
    "denmark",
    "finland",
    "iceland",
    "norway",
    "sweden",
    "andorra",
    "cyprus",
    "italy",
    "malta",
    "monaco",
    "portugal",
    "san_marino",
    "spain",
    "vatican_city"
  ],

  // Give every included region its own starting shade.
  // All countries not used in this level remain visible in gray.
  startColors: [
    {
      color: "#c98274",
      ids: [
        "albania",
        "bosnia_and_herzegovina",
        "bulgaria",
        "croatia",
        "greece",
        "kosovo",
        "montenegro",
        "north_macedonia",
        "romania",
        "serbia"
      ]
    },
    {
      color: "#b9a56a",
      ids: [
        "austria",
        "czechia",
        "germany",
        "hungary",
        "liechtenstein",
        "poland",
        "slovakia",
        "slovenia",
        "switzerland"
      ]
    },
    {
      color: "#9882b5",
      ids: [
        "belarus",
        "estonia",
        "latvia",
        "lithuania",
        "moldova",
        "russia",
        "ukraine"
      ]
    },
    {
      color: "#73a7c2",
      ids: [
        "denmark",
        "finland",
        "iceland",
        "norway",
        "sweden"
      ]
    },
    {
      color: "#d29a62",
      ids: [
        "andorra",
        "cyprus",
        "italy",
        "malta",
        "monaco",
        "portugal",
        "san_marino",
        "spain",
        "vatican_city"
      ]
    },
    {
      color: "#777777",
      ids: [
        "belgium",
        "france",
        "ireland",
        "luxembourg",
        "netherlands",
        "united_kingdom"
      ]
    }
  ],

  ignoreIds: [
    "water",
    "borders",
    "context_land"
  ],

  displayNames: {
    bosnia_and_herzegovina: "Bosnia & Herzegovina",
    north_macedonia: "North Macedonia",
    san_marino: "San Marino",
    united_kingdom: "United Kingdom",
    vatican_city: "Vatican City"
  },

  alias: {},
  groups: {},
  extraIds: [],

  ui: {
    bannerTitle: "EUROPE STACKED CHALLENGE 4",
    bannerAria: "Europe stacked map challenge 4 banner",

    mainAria: "Europe stacked map challenge 4",
    mapAria: "European countries map",

    overlayKicker: "STACKED MAP CHALLENGE",
    overlayTitle: "EUROPE | LEVEL 4",
    beginMessage: "Balkan + Central + Eastern + Scandinavia + Southern",

    logoSrc: "/assets/images/logo/MSHistory_Logo_Small.png"
  }
};
