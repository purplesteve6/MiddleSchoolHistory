/* ============================================================
   Europe: by capital city - Map Challenge Config (TEMPLATE-FRIENDLY)
   ------------------------------------------------------------
   ✅ You usually only edit THIS file (plus the SVG, and optional CSS)
   ✅ IDs must match the SVG element IDs (case-sensitive in the SVG)
   ✅ Keep values exactly as strings shown (lowercase recommended)
   ============================================================ */

window.MAP_CHALLENGE_CONFIG = {
  /* ------------------------------------------------------------
     REQUIRED BASICS
     ------------------------------------------------------------ */

  // Used for folders, analytics, and general identification.
  // Example: "13-colonies", "ancient-greece", "middle-east"
  slug: "europe-by-capital",

  // Path to the clickable SVG for THIS game (must exist at this location).
  // Tip: keep the SVG in the same folder as index.html and config.js.
  svgPath: "./europe-clickable.svg",

  /* ------------------------------------------------------------
     OPTIONAL: FLAGS (turn on/off + where to find them)
     ------------------------------------------------------------
     If showFlags is true, the game tries to load a flag image for
     each target ID using this pattern:

       {flagsBase}{targetId}{flagExt}

     Example (for target "egypt"):
       /games/map-challenges/middle-east/flags/egypt.jpg
  ------------------------------------------------------------ */

  // If true, flags appear in the UI when identifying places.
  // If you don't have flags, set this to false.
  showFlags: false,

  // Folder where the flag images live (absolute path from site root).
  flagsBase: "/games/map-challenges/europe-by-capital/flags/",

  // File extension for flags. Common: ".png" or ".jpg"
  flagExt: ".jpg",

  /* ------------------------------------------------------------
     REQUIRED: TARGETS
     ------------------------------------------------------------
     This is the "answer bank" for the game.

     - Each entry must match an SVG element ID exactly.
     - These are the IDs the game will quiz the student on.
     - Order doesn’t usually matter, but it’s nice to keep alphabetical.
  ------------------------------------------------------------ */

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

  /* ------------------------------------------------------------
     OPTIONAL: IGNORE IDS
     ------------------------------------------------------------
     SVGs often contain extra layers that should NOT be treated as:
       - clickable "wrong" answers
       - valid quiz targets

     Put those SVG element IDs here.

     Common examples:
       "water" (ocean fill)
       "borders" (outline strokes)
       "context_land" (nearby countries for context)
  ------------------------------------------------------------ */

  ignoreIds: [
    "water",
    "borders",
    "context_land"
  ],

  /* ------------------------------------------------------------
     OPTIONAL: DISPLAY NAMES
     ------------------------------------------------------------
     If an SVG ID is not the way you want it shown to students,
     you can override the label here.

     Example:
       svg id: "saudi_arabia"  -> display "Saudi Arabia"
       svg id: "uae"           -> display "United Arab Emirates (UAE)"
  ------------------------------------------------------------ */

  displayNames: {
albania: "Tirana",
andorra: "Andorra la Vella",
austria: "Vienna",
belarus: "Minsk",
belgium: "Brussels",
bosnia_and_herzegovina: "Sarajevo",
bulgaria: "Sofia",
croatia: "Zagreb",
cyprus: "Nicosia",
czechia: "Prague",
denmark: "Copenhagen",
estonia: "Tallinn",
finland: "Helsinki",
france: "Paris",
germany: "Berlin",
greece: "Athens",
hungary: "Budapest",
iceland: "Reykjavik",
ireland: "Dublin",
italy: "Rome",
kosovo: "Pristina",
latvia: "Riga",
liechtenstein: "Vaduz",
lithuania: "Vilnius",
luxembourg: "Luxembourg",
malta: "Valletta",
moldova: "Chisinau",
monaco: "Monaco",
montenegro: "Podgorica",
netherlands: "Amsterdam",
north_macedonia: "Skopje",
norway: "Oslo",
poland: "Warsaw",
portugal: "Lisbon",
romania: "Bucharest",
russia: "Moscow",
san_marino: "San Marino",
serbia: "Belgrade",
slovakia: "Bratislava",
slovenia: "Ljubljana",
spain: "Madrid",
sweden: "Stockholm",
switzerland: "Bern",
ukraine: "Kyiv",
united_kingdom: "London",
vatican_city: "Vatican City",
  },

  /* ------------------------------------------------------------
     OPTIONAL: ALIAS
     ------------------------------------------------------------
     Use alias when MULTIPLE SVG layers should all "count as" one
     logical country/target when clicked.

     This is perfect for cases like Israel where the SVG has:
       - israel
       - gaza
       - palestine
       - israel_internal_borders (a border line)

     With alias, clicking any of those layers can be treated as "israel".

     IMPORTANT:
     - alias DOES NOT automatically recolor multiple layers.
       It only decides "what target did they mean?"
     - For recoloring multiple layers, use GROUPS (next section).

     Example pattern:
       alias: {
      }
  ------------------------------------------------------------ */

  alias: {
    // example:
    // palestine: "israel"

  },

  /* ------------------------------------------------------------
     OPTIONAL: GROUPS
     ------------------------------------------------------------
     Use groups when ONE logical target should recolor MULTIPLE SVG
     elements together (correct green/red, and interim blink behavior).

     Think of this as:
       "When the answer is X, paint these SVG IDs as a unit."

     Example:
       groups: {
         israel: ["israel", "gaza", "palestine"]
       }

     Notes:
     - You typically list the "filled areas" here (not thin border lines).
     - If you include a border line ID in a group, it WILL try to recolor.
       If you need it clickable but never recolored, use noPaintIds below.
  ------------------------------------------------------------ */

  groups: {
    // example:
    // israel: ["israel", "gaza", "palestine"]
    
  },

  /* ------------------------------------------------------------
     OPTIONAL: EXTRA IDS
     ------------------------------------------------------------
     This is mainly for cleanup when using alias/groups.

     The engine adds/removes CSS classes like correct/wrong/active.
     If your "logical target" is made from multiple SVG elements, you
     want ALL related IDs to get their classes cleared between rounds.

     Put those related SVG IDs here (usually the same ones you used in
     alias/groups, plus any special layers).
  ------------------------------------------------------------ */

  extraIds: [
    
  ],

  /* ------------------------------------------------------------
     OPTIONAL: NO PAINT IDS  (cosmetic protection)
     ------------------------------------------------------------
     These IDs may be clickable and may alias to a target,
     BUT they should NEVER change color (no blink / no correct/wrong).

     Perfect for thin outline layers like:
       "israel_internal_borders"

     Typical use:
       - keep it clickable so students aren't frustrated
       - but prevent ugly recoloring of border strokes
  ------------------------------------------------------------ */

  noPaintIds: [
    
  ],

  /* ------------------------------------------------------------
     UI TEXT (what students see)
     ------------------------------------------------------------ */

  ui: {
    // Top banner text (big header across the game)
    bannerTitle: "EUROPE: BY CAPITAL CITY MAP CHALLENGE",

    // Screen reader description of the banner
    bannerAria: "Europe by capital city map challenge banner",

    // Accessibility labels for the main game area and the map itself
    mainAria: "Europe by capital city map challenge",
    mapAria: "Europe countries map",

    // Start overlay text:
    // - overlayKicker is the small label (like a category tag)
    // - overlayTitle is the big title (supports line breaks using \n e.g. UNITED STATES:\13 Colonies) 
    // - beginMessage is the short explanation under the title
    overlayKicker: "MAP CHALLENGE",
    overlayTitle: "EUROPE:\nBY CAPITAL CITY",
    beginMessage: "How fast can you identify all European countries by their capitals?",

    // Logo image shown in the overlay
    logoSrc: "/assets/images/logo/MSHistory_Logo_Small.png"
  }
};
