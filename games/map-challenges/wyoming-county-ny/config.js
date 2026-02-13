window.MAP_CHALLENGE_CONFIG = {
  kicker: "MAP CHALLENGE",
  title: "WYOMING COUNTY, NY",
  startMessage: "How fast can you identify the towns of Wyoming County, New York?",
  svgPath: "/games/map-challenges/wyoming-county-ny/wyoming-county-ny-clickable.svg",
  ...
};

  // Town IDs (must match your SVG layer IDs)
  items: [
    "arcade",
    "attica",
    "bennington",
    "castile",
    "covington",
    "eagle",
    "gainesville",
    "genesee_falls",
    "java",
    "middlebury",
    "orangeville",
    "perry",
    "pike",
    "sheldon",
    "warsaw",
    "wethersfield"
  ],

  // Per-map ignore (engine also ALWAYS ignores: context_land, borders, water)
  ignore: ["labels"],

  // Optional: make names nicer if you want (engine title-cases by default)
  displayNames: {
    genesee_falls: "Genesee Falls"
  },

  // No flags for now (leave off)
  showFlags: false
};
