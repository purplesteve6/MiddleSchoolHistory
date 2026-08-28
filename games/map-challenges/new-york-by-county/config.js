/* ============================================================
   New York: by County - Map Challenge Config
   Only edit this file (and the SVG / optional CSS variables)
   ============================================================ */

window.MAP_CHALLENGE_CONFIG = {
  slug: "new-york-by-county",

  // SVG file to load (must exist)
    svgPath: "./new-york-by-county-clickable.svg",

  



  // Flags optional (towns usually don't need them)
 	showFlags: false,
 	flagsBase: "/games/map-challenges/new-york-by-county/flags/",
	flagExt: ".webp",

  // IDs that count as "targets" (must match SVG element IDs)
  targets: [
	"albany",
	"allegany",
	"bronx",
	"broome",
	"cattaraugus",
	"cayuga",
	"chautauqua",
	"chemung",
	"chenango",
	"clinton",
	"columbia",
	"cortland",
	"delaware",
	"dutchess",
	"erie",
	"essex",
	"franklin",
	"fulton",
	"genesee",
	"greene",
	"hamilton",
	"herkimer",
	"jefferson",
	"kings",
	"lewis",
	"livingston",
	"madison",
	"monroe",
	"montgomery",
	"nassau",
	"new_york",
	"niagara",
	"oneida",
	"onondaga",
	"ontario",
	"orange",
	"orleans",
	"oswego",
	"otsego",
	"putnam",
	"queens",
	"rensselaer",
	"richmond",
	"rockland",
	"st_lawrence",
	"saratoga",
	"schenectady",
	"schoharie",
	"schuyler",
	"seneca",
	"steuben",
	"suffolk",
	"sullivan",
	"tioga",
	"tompkins",
	"ulster",
	"warren",
	"washington",
	"wayne",
	"westchester",
	"wyoming",
	"yates",

],

  // IDs that exist in SVG but should NOT count as wrong / clickable targets
  ignoreIds: [
    "water",
    "borders",
    "context_land"
  ],

  // Optional display name overrides, the program will automatically capitalize single word country names. This section will allow you to override any descrepancies between the svg layer name and the way you want it displayed. e.g. french_guiana: "French Guiana",
  displayNames: {
	new_york: "New York",
	st_lawrence: "St. Lawrence",
			
  },

  // Optional aliasing (not needed for this map, but supported) This is when you want a click on something else to count for a country, but not change color
  alias: {
    // example:
    // village_of_warsaw: "warsaw",
  },

  // Optional grouping (apply correct/wrong styling to multiple SVG elements) This is when you want multiple elements with different names to behave as the same country (they will change color accordingly)
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
    bannerTitle: "NEW YORK: BY COUNTY MAP CHALLENGE",
    bannerAria: "New York counties map challenge banner",

    mainAria: "New York counties map challenge",
    mapAria: "New York counties map",

    overlayKicker: "MAP CHALLENGE",
    overlayTitle: "NEW YORK: BY COUNTY",
    beginMessage: "How fast can you identify the counties of New York?",

    logoSrc: "/assets/images/logo/MSHistory_Logo_Small.png"
  }
};
