/* ============================================================
   United States: 13 Colonies - Map Challenge Config
   Only edit this file (and the SVG / optional CSS variables)
   ============================================================ */

window.MAP_CHALLENGE_CONFIG = {
  slug: "13-colonies",

  // SVG file to load (must exist)
    svgPath: "./13-colonies-clickable.svg",

  



  // Flags optional (towns usually don't need them)
 	showFlags: false,
 	flagsBase: "/games/map-challenges/13-colonies/flags/",
	flagExt: ".jpg",

  // IDs that count as "targets" (must match SVG element IDs)
  targets: [
	"connecticut",
	"delaware",
	"georgia",
	"maryland",
	"massachusetts_bay",
	"new_hampshire",
	"new_jersey",
	"new_york",
	"north_carolina",
	"pennsylvania",
	"rhode_island",
	"south_carolina",
	"virginia",
	
  ],

  // IDs that exist in SVG but should NOT count as wrong / clickable targets
  ignoreIds: [
    "water",
    "borders",
    "context_land"
  ],

  // Optional display name overrides
  displayNames: {
	connecticut: "Connecticut",
	delaware: "The Lower Counties on the Delaware",
	georgia: "Georgia",
	maryland: "Maryland",
	massachusetts_bay: "Massachusetts Bay",
	new_hampshire: "New Hampshire",
	new_jersey: "New Jersey",
	new_york: "New York",
	north_carolina: "North Carolina",
	pennsylvania: "Pennsylvania",
	rhode_island: "Rhode Island and Providence Plantations",
	south_carolina: "South Carolina",
	virginia: "Virginia",  },

  // Optional aliasing (Other named layers that should behave like another layer when clicked)
  alias: {
    // example:
    // palestine: "israel"

  },

  // Optional grouping (apply correct/wrong color styling to multiple SVG elements - this is for other names layers that need to change color too)
  groups: {
    // example:
    // israel: ["israel", "gaza", "palestine"]

  },

  // Optional extra IDs to clear classes from (usually only used with alias/group setups)
  extraIds: [


  ],

  // UI text for this specific map
  ui: {
    bannerTitle: "UNITED STATES: 13 COLONIES MAP CHALLENGE",
    bannerAria: "UNITED STATES: 13 COLONIES map challenge banner",

    mainAria: "United States: 13 Colonies map challenge",
    mapAria: "United States: 13 Colonies map",

    overlayKicker: "MAP CHALLENGE",
    overlayTitle: "UNITED STATES:\n13 COLONIES",
    beginMessage: "How fast can you identify the 13 oringal U.S. colonies?",

    logoSrc: "/assets/images/logo/MSHistory_Logo_Small.png"
  }
};
