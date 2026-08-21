/* ============================================================
   Mesoamerica - Map Challenge Config
   Only edit this file (and the SVG / optional CSS variables)
   ============================================================ */

window.MAP_CHALLENGE_CONFIG = {
  slug: "mesoamerica",

  // SVG file to load (must exist)
    svgPath: "./mesoamerica-clickable.svg",

  



  // Flags optional (towns usually don't need them)
 	showFlags: true,
 	flagsBase: "/games/map-challenges/mesoamerica/flags/",
	flagExt: ".webp",

  // IDs that count as "targets" (must match SVG element IDs)
  targets: [
    	"mexico",
	"belize",
	"guatemala",
	"el_salvador",
	"honduras",
	"nicaragua",
	"costa_rica",
	"panama",
	  ],

  // IDs that exist in SVG but should NOT count as wrong / clickable targets
  ignoreIds: [
    "water",
    "borders",
    "context_land"
  ],

  // Optional display name overrides
  displayNames: {
	el_salvador: "El Salvador",
	costa_rica: "Costa Rica",
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
    bannerTitle: "MESOAMERICA MAP CHALLENGE",
    bannerAria: "Mesoamerica countries map challenge banner",

    mainAria: "Mesoamerica countries map challenge",
    mapAria: "Mesoamerica countries map",

    overlayKicker: "MAP CHALLENGE",
    overlayTitle: "MESOAMERICA",
    beginMessage: "How fast can you identify the countries of Mesoamerica?",

    logoSrc: "/assets/images/logo/MSHistory_Logo_Small.png"
  }
};
