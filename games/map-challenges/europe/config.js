/* ============================================================
   Europe - Map Challenge Config
   Only edit this file (and the SVG / optional CSS variables)
   ============================================================ */

window.MAP_CHALLENGE_CONFIG = {
  slug: "europe",

  // SVG file to load (must exist)
    svgPath: "./wyoming-county-ny-clickable.svg",


  // Flags optional (towns usually don't need them)
  showFlags: false,
  flagsBase: "/games/map-challenges/europe/flags/",

  // IDs that count as "targets" (must match SVG element IDs)
  targets: [
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
	"france",
	"germany",
	"greece",
	"hungary",
	"iceland",
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
	"norway",
	"poland",
	"portugal",
	"romania",
	"russia",
	"san_marino",
	"serbia",
	"slovakia",
	"slovenia",
	"spain",
	"sweden",
	"switzerland",
	"ukraine",
	"united_kingdom",
	"vatican_city",
  ],

  // IDs that exist in SVG but should NOT count as wrong / clickable targets
  ignoreIds: [
    "county_outline",
    "labels",
    "water",
    "borders",
    "context_land"
  ],

  // Optional display name overrides
  displayNames: {
	bosnia_and_herzegovina: "Bosnia & Herzegovina"
	north_macedonia: "North Macedonia"
	san_marino: "San Marino"
	united_kingdom: "United Kingdom"
	vatican_city: "Vatican City"
  },

  // Optional aliasing (not needed for this map, but supported)
  alias: {
    // example:
    // "village_of_warsaw": "warsaw"
  },

  // Optional grouping (apply correct/wrong styling to multiple SVG elements)
  groups: {
    // example:
    // "warsaw": ["warsaw", "warsaw_label_bg"]
  },

  // Optional extra IDs to clear classes from (usually only used with alias/group setups)
  extraIds: [
    // example: "warsaw_label_bg"
  ],

  // UI text for this specific map
  ui: {
    bannerTitle: "EUROPE MAP CHALLENGE",
    bannerAria: "European countries map challenge banner",

    mainAria: "European countries map challenge",
    mapAria: "European countries map",

    overlayKicker: "MAP CHALLENGE",
    overlayTitle: "EUROPE",
    beginMessage: "How fast can you identify the countries of Europe?",

    logoSrc: "/assets/images/logo/MSHistory_Logo_Small.png"
  }
};
