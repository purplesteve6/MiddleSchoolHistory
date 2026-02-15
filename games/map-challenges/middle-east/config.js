/* ============================================================
   Europe - Map Challenge Config
   Only edit this file (and the SVG / optional CSS variables)
   ============================================================ */

window.MAP_CHALLENGE_CONFIG = {
  slug: "middle-east",

  // SVG file to load (must exist)
    svgPath: "./middle-east-clickable.svg",

  



  // Flags optional (towns usually don't need them)
 	showFlags: true,
 	flagsBase: "/games/map-challenges/middle-east/flags/",
	flagExt: ".jpg",

  // IDs that count as "targets" (must match SVG element IDs)
  targets: [
	"bahrain",
	"cyprus",
	"egypt",
	"iran",
	"iraq",
	"israel",
	"jordan",
	"kuwait",
	"lebanon",
	"oman",
	"qatar",
	"saudi_arabia",
	"syria",
	"turkey",
	"uae",
	"yemen",

	
  ],

  // IDs that exist in SVG but should NOT count as wrong / clickable targets
  ignoreIds: [
    "water",
    "borders",
    "context_land"
  ],

  // Optional display name overrides
  displayNames: {
	saudi_arabia: "Saudi Arabia",
	uae: "United Arab Emirates (UAE)",
  },

  // Optional aliasing (Other named layers that should behave like another layer when clicked)
  alias: {
    // example:
    // palestine: "israel"
	palestine: "israel",
	gaza: "israel",
	israel_internal_borders: "israel",
	israel: "israel",
  },

  // Optional grouping (apply correct/wrong color styling to multiple SVG elements - this is for other names layers that need to change color too)
  groups: {
    // example:
    // israel: ["israel", "gaza", "palestine"]
	israel: ["israel", "gaza", "palestine"]
  },

  // Optional extra IDs to clear classes from (usually only used with alias/group setups)
  extraIds: [
    // example: "warsaw_label_bg"
	const EXTRA_IDS = ["gaza", "palestine", "israel_internal_borders"];
  ],

  // UI text for this specific map
  ui: {
    bannerTitle: "MIDDLE EAST MAP CHALLENGE",
    bannerAria: "Middle East countries map challenge banner",

    mainAria: "Middle East countries map challenge",
    mapAria: "Middle East countries map",

    overlayKicker: "MAP CHALLENGE",
    overlayTitle: "MIDDLE EAST",
    beginMessage: "How fast can you identify the countries of the Middle East?",

    logoSrc: "/assets/images/logo/MSHistory_Logo_Small.png"
  }
};
