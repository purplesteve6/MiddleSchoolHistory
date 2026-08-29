/* ============================================================
   Europe - Map Challenge Config
   Only edit this file (and the SVG / optional CSS variables)
   ============================================================ */

window.MAP_CHALLENGE_CONFIG = {
  slug: "united-states",

  // SVG file to load (must exist)
    svgPath: "./united-states-clickable.svg",

  



  // Flags optional (towns usually don't need them)
 	showFlags: true,
 	flagsBase: "/games/map-challenges/united-states/flags/",
	flagExt: ".webp",

  // Optional starting colors for SVG elements.
  // These are visual only: the countries below are STILL targets because they
  // remain listed in targets[]. Remove an ID from targets[] if you want it to
  // stay on the map as non-playable context for a regional challenge.
  // If startColors is omitted entirely, the SVG keeps its original colors.

  startColors: [


    {
      color: "#777777",
      ids: [
// e.g. "hawaii",
	"new_york",
      ]
    },


  ],

  // IDs that count as "targets" (must match SVG element IDs)
  targets: [
	"alabama",
"alaska",
"arizona",
"arkansas",
"california",
"colorado",
"connecticut",
"delaware",
"florida",
"georgia",
"hawaii",
"idaho",
"illinois",
"indiana",
"iowa",
"kansas",
"kentucky",
"louisiana",
"maine",
"maryland",
"massachusetts",
"michigan",
"minnesota",
"mississippi",
"missouri",
"montana",
"nebraska",
"nevada",
"new_hampshire",
"new_jersey",
"new_mexico",
"new_york",
"north_carolina",
"north_dakota",
"ohio",
"oklahoma",
"oregon",
"pennsylvania",
"rhode_island",
"south_carolina",
"south_dakota",
"tennessee",
"texas",
"utah",
"vermont",
"virginia",
"washington",
"west_virginia",
"wisconsin",
"wyoming",

	
  ],

  // IDs that exist in SVG but should NOT count as wrong / clickable targets
  ignoreIds: [
    "water",
    "borders",
    "context_land"
  ],

  // Optional display name overrides
  displayNames: {
	new_york: "New York",

  },

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
    bannerTitle: "UNITED STATES MAP CHALLENGE",
    bannerAria: "United States map challenge banner",

    mainAria: "United States map challenge",
    mapAria: "United States map",

    overlayKicker: "MAP CHALLENGE",
    overlayTitle: "UNITED STATES",
    beginMessage: "How fast can you identify the fifty United States of America?",

    logoSrc: "/assets/images/logo/MSHistory_Logo_Small.png"
  }
};
