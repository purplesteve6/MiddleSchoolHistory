/* ============================================================
   Caribbean - Map Challenge Config
   Only edit this file (and the SVG / optional CSS variables)
   ============================================================ */

window.MAP_CHALLENGE_CONFIG = {
  slug: "caribbean",

  // SVG file to load (must exist)
    svgPath: "./caribbean-clickable.svg",

  



  // Flags optional (towns usually don't need them)
 	showFlags: true,
 	flagsBase: "/games/map-challenges/caribbean/flags/",
	flagExt: ".webp",

  // IDs that count as "targets" (must match SVG element IDs)
  targets: [
    	"antigua_and_barbuda",
	"the_bahamas",
	"barbados",
	"cuba",
	"dominican_republic",
	"grenada",
	"haiti",
	"jamaica",
	"martinique",
	"st_kitts_and_nevis",
	"saint_lucia",
	"saint_vincent_and_the_grenadines",
	"trinidad_and_tobago",
	  ],

  // IDs that exist in SVG but should NOT count as wrong / clickable targets
  ignoreIds: [
    "water",
    "borders",
    "context_land"
  ],

  // Optional display name overrides
  displayNames: {
	antigua_and_barbuda: "Antigua and Barbuda",
	the_bahamas: "The Bahamas",
	dominican_republic: "Dominican Republic",
	st_kitts_and_nevis: "St. Kitts and Nevis"
	saint_lucia: "Saint Lucia"
	saint_vincent_and_the_grenadines" "Saint Vincent and the Grenadines"
	trinidad_and_tobago: "Trinidad and Tobago"
  },

  // Optional aliasing (not needed for this map, but supported)
  alias: {
    // example:
    // "village_of_warsaw": "warsaw"
	borders_bahamas: "the_bahamas",
	borders_antigua: "antigua_and_barbuda",
	borders_dominica: "dominica",
	borders_saint_lucia: "saint_lucia",
	borders_saint_vincent: "saint_vincent_and_the_grenadines",
	borders_grenada: "grenada",
	borders_barbados: "barbados",
	borders_trinidad: "trinidad_and_tobago",
	borders_st_kitts: "st_kitts_and_nevis",
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
    bannerTitle: "CARIBBEAN MAP CHALLENGE",
    bannerAria: "Caribbean countries map challenge banner",

    mainAria: "Caribbean countries map challenge",
    mapAria: "Caribbean countries map",

    overlayKicker: "MAP CHALLENGE",
    overlayTitle: "CARIBBEAN",
    beginMessage: "How fast can you identify the soevereign countries of the Caribbean?",

    logoSrc: "/assets/images/logo/MSHistory_Logo_Small.png"
  }
};
