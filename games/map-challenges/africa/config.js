/* ============================================================
   Africa - Map Challenge Config
   Only edit this file (and the SVG / optional CSS variables)
   ============================================================ */

window.MAP_CHALLENGE_CONFIG = {
  slug: "africa",

  // SVG file to load (must exist)
    svgPath: "./africa-clickable.svg",

  



  // Flags optional (towns usually don't need them)
 	showFlags: true,
 	flagsBase: "/games/map-challenges/africa/flags/",
	flagExt: ".webp",

  // IDs that count as "targets" (must match SVG element IDs)
  targets: [
	"algeria",
	"angola",
	"benin",
	"botswana",
	"burkina_faso",
	"burundi",
	"cabo_verde",
	"cameroon",
	"central_african_republic",
	"chad",
	"comoros",
	"cote_d_ivoire",
	"democratic_republic_of_the_congo",
	"djibouti",
	"egypt",
	"equatorial_guinea",
	"eritrea",
	"eswatini",
	"ethiopia",
	"gabon",
	"gambia",
	"ghana",
	"guinea",
	"guinea_bissau",
	"kenya",
	"lesotho",
	"liberia",
	"libya",
	"madagascar",
	"malawi",
	"mali",
	"mauritania",
	"mauritius",
	"morocco",
	"mozambique",
	"namibia",
	"niger",
	"nigeria",
	"republic_of_the_congo",
	"rwanda",
	"sao_tome_and_principe",
	"senegal",
	"seychelles",
	"sierra_leone",
	"somalia",
	"south_africa",
	"south_sudan",
	"sudan",
	"tanzania",
	"togo",
	"tunisia",
	"uganda",
	"zambia",
	"zimbabwe",	  ],

  // IDs that exist in SVG but should NOT count as wrong / clickable targets
  ignoreIds: [
    "water",
    "borders",
    "context_land"
  ],

  // Optional display name overrides, the program will automatically capitalize single word country names. This section will allow you to override any descrepancies between the svg layer name and the way you want it displayed. e.g. french_guiana: "French Guiana",
  displayNames: {
	burkina_faso: "Burkina Faso",
	cabo_verde: "Cabo Verde",
	central_african_republic: "Central African Republic",
	cote_d_ivoire: "Côte d'Ivoire",
	democratic_republic_of_the_congo: "Democratic Republic of the Congo",
	equatorial_guinea: "Equatorial Guinea",
	guinea_bissau: "Guinea Bissau",
	republic_of_the_congo: "Republic of the Congo",
	sao_tome_and_principe: "São Tomé and Príncipe",
	sierra_leone: "Sierra Leone",
	south_africa: "South Africa",
	south_sudan: "South Sudan",
			
  },

  // Optional aliasing (not needed for this map, but supported) This is when you want a click on something else to count for a country, but not change color
  alias: {
    // example:
    // village_of_warsaw: "warsaw",
	western_sahara: "morocco",
	western_sahara_borders: "morocco",
	cabo_verde_border: "cabo_verde",
	comoros_border: "comoros",
	mauritius_border: "mauritius",
	sao_tome_and_principe_border: "sao_tome_and_principe",
  },

  // Optional grouping (apply correct/wrong styling to multiple SVG elements) This is when you want multiple elements with different names to behave as the same country (they will change color accordingly)
  groups: {
    // example:
    // "warsaw": ["warsaw", "warsaw_label_bg"]
	 morocco: ["morocco", "western_sahara"]
  },


  // Optional extra IDs to clear classes from (usually only used with alias/group setups)
  extraIds: [
    // example: "warsaw_label_bg"
  ],

  // UI text for this specific map
  ui: {
    bannerTitle: "AFRICA MAP CHALLENGE",
    bannerAria: "Africa countries map challenge banner",

    mainAria: "Africa countries map challenge",
    mapAria: "Africa countries map",

    overlayKicker: "MAP CHALLENGE",
    overlayTitle: "AFRICA",
    beginMessage: "How fast can you identify the countries of Africa?",

    logoSrc: "/assets/images/logo/MSHistory_Logo_Small.png"
  }
};
