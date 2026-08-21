/* ============================================================
   South America - Map Challenge Config
   Only edit this file (and the SVG / optional CSS variables)
   ============================================================ */

window.MAP_CHALLENGE_CONFIG = {
  slug: "south_america",

  // SVG file to load (must exist)
    svgPath: "./south-america-clickable.svg",

  



  // Flags optional (towns usually don't need them)
 	showFlags: true,
 	flagsBase: "/games/map-challenges/south-america/flags/",
	flagExt: ".webp",

  // IDs that count as "targets" (must match SVG element IDs)
  targets: [
    	"argentina",
	"bolivia",
	"brazil",
	"chile",
	"colombia",
	"ecuador",
	"french_guiana",
	"guyana",
	"paraguay",
	"peru",
	"suriname",
	"uruguay",
	"venezuela",
	  ],

  // IDs that exist in SVG but should NOT count as wrong / clickable targets
  ignoreIds: [
    "water",
    "borders",
    "context_land"
  ],

  // Optional display name overrides
  displayNames: {
	french_guiana: "French Guiana",
  },

  // Optional aliasing (not needed for this map, but supported)
  alias: {
    // example:
    // "village_of_warsaw": "warsaw"
	lake_maricaibo: "venezuela",
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
    bannerTitle: "SOUTH AMERICA MAP CHALLENGE",
    bannerAria: "South America countries map challenge banner",

    mainAria: "South America countries map challenge",
    mapAria: "South America countries map",

    overlayKicker: "MAP CHALLENGE",
    overlayTitle: "SOUTH AMERICA",
    beginMessage: "How fast can you identify the countries of South America?",

    logoSrc: "/assets/images/logo/MSHistory_Logo_Small.png"
  }
};
