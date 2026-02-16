/* ============================================================
   United States: National Parks - Map Challenge Config
   Only edit this file (and the SVG / optional CSS variables)
   ============================================================ */

window.MAP_CHALLENGE_CONFIG = {
  slug: "united states-national-parks",

  // SVG file to load (must exist)
    svgPath: "./united-states-national-parks-clickable.svg",

  



  // Flags optional (towns usually don't need them)
 	showFlags: false,
 	flagsBase: "/games/map-challenges/united-states-national-parks/flags/",
	flagExt: ".png",

  // IDs that count as "targets" (must match SVG element IDs)
  targets: [
	"acadia",
	"american_samoa",
	"arches",
	"badlands",
	"big_bend",
	"biscayne",
	"black_canyon",
	"bryce_canyon",
	"canyonlands",
	"capitol_reef",
	"carlsbad_caverns",
	"channel_islands",
	"congaree",
	"crater_lake",
	"cuyahoga_valley",
	"death_valley",
	"denali",
	"dry_tortugas",
	"everglades",
	"gates_arctic",
	"gateway_arch",
	"glacier",
	"glacier_bay",
	"grand_canyon",
	"grand_teton",
	"great_basin",
	"great_sand_dunes",
	"great_smoky_mountains",
	"guadalupe_mountains",
	"haleakala",
	"hawaii_volcanoes",
	"hot_springs",
	"indiana_dunes",
	"isle_royale",
	"joshua_tree",
	"katmai",
	"kenai_fjords",
	"kings_canyon",
	"kobuk_valley",
	"lake_clark",
	"lassen_volcanic",
	"mammoth_cave",
	"mesa_verde",
	"mount_rainier",
	"new_river_gorge",
	"north_cascades",
	"olympic",
	"petrified_forest",
	"pinnacles",
	"redwood",
	"rocky_mountain",
	"saguaro",
	"sequoia",
	"shenandoah",
	"theodore_roosevelt",
	"virgin_islands",
	"voyageurs",
	"white_sands",
	"wind_cave",
	"wrangell",
	"yellowstone",
	"yosemite",
	"zion",
  ],

  // IDs that exist in SVG but should NOT count as wrong / clickable targets
  ignoreIds: [
    "water",
    "borders",
    "context_land"
  ],

  // Optional display name overrides
  displayNames: {
	acadia: "Acadia NP",
	american_samoa: "National Park of American Samoa",
	arches: "Arches NP",
	badlands: "Badlands NP",
	big_bend: "Big Bend NP",
	biscayne: "Biscayne NP",
	black_canyon: "Black Canyon of the Gunnison NP",
	bryce_canyon: "Bryce Canyon NP",
	canyonlands: "Canyonlands NP",
	capitol_reef: "Capitol Reef NP",
	carlsbad_caverns: "Carlsbad Caverns NP",
	channel_islands: "Channel Islands NP",
	congaree: "Congaree NP",
	crater_lake: "Crater Lake NP",
	cuyahoga_valley: "Cuyahoga Valley NP",
	death_valley: "Death Valley NP",
	denali: "Denali NP & Pres.",
	dry_tortugas: "Dry Tortugas NP",
	everglades: "Everglades NP",
	gates_arctic: "Gates of the Arctic NP & Pres.",
	gateway_arch: "Gateway Arch NP",
	glacier: "Glacier NP",
	glacier_bay: "Glacier Bay NP & Pres.",
	grand_canyon: "Grand Canyon NP",
	grand_teton: "Grand Teton NP",
	great_basin: "Great Basin NP",
	great_sand_dunes: "Great Sand Dunes NP & Pres.",
	great_smoky_mountains: "Great Smoky Mountains NP",
	guadalupe_mountains: "Guadalupe Mountains NP",
	haleakala: "Haleakalā NP",
	hawaii_volcanoes: "Hawaiʻi Volcanoes NP",
	hot_springs: "Hot Springs NP",
	indiana_dunes: "Indiana Dunes NP",
	isle_royale: "Isle Royale NP",
	joshua_tree: "Joshua Tree NP",
	katmai: "Katmai NP & Pres.",
	kenai_fjords: "Kenai Fjords NP",
	kings_canyon: "Kings Canyon NP",
	kobuk_valley: "Kobuk Valley NP",
	lake_clark: "Lake Clark NP & Pres.",
	lassen_volcanic: "Lassen Volcanic NP",
	mammoth_cave: "Mammoth Cave NP",
	mesa_verde: "Mesa Verde NP",
	mount_rainier: "Mount Rainier NP",
	new_river_gorge: "New River Gorge NP & Pres.",
	north_cascades: "North Cascades NP",
	olympic: "Olympic NP",
	petrified_forest: "Petrified Forest NP",
	pinnacles: "Pinnacles NP",
	redwood: "Redwood NP",
	rocky_mountain: "Rocky Mountain NP",
	saguaro: "Saguaro NP",
	sequoia: "Sequoia NP",
	shenandoah: "Shenandoah NP",
	theodore_roosevelt: "Theodore Roosevelt NP",
	virgin_islands: "Virgin Islands NP",
	voyageurs: "Voyageurs NP",
	white_sands: "White Sands NP",
	wind_cave: "Wind Cave NP",
	wrangell: "Wrangell–St. Elias NP & Pres.",
	yellowstone: "Yellowstone NP",
	yosemite: "Yosemite NP",
	zion: "Zion NP",  },

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
    bannerTitle: "U.S. NATIONAL PARKS MAP CHALLENGE",
    bannerAria: "U.S. National Parks map challenge banner",

    mainAria: "U.S. National Parks map challenge",
    mapAria: "U.S. National Parks countries map",

    overlayKicker: "MAP CHALLENGE",
    overlayTitle: "U.S. NATIONAL PARKS",
    beginMessage: "How fast can you identify the National Parks of the United States?",

    logoSrc: "/assets/images/logo/MSHistory_Logo_Small.png"
  }
};
