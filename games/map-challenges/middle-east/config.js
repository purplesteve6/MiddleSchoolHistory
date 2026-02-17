/* ============================================================
   Middle East - Map Challenge Config (TEMPLATE-FRIENDLY)
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
  slug: "middle-east",

  // Path to the clickable SVG for THIS game (must exist at this location).
  // Tip: keep the SVG in the same folder as index.html and config.js.
  svgPath: "./middle-east-clickable.svg",

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
  showFlags: true,

  // Folder where the flag images live (absolute path from site root).
  flagsBase: "/games/map-challenges/middle-east/flags/",

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
    saudi_arabia: "Saudi Arabia",
    uae: "United Arab Emirates (UAE)",
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
         gaza: "israel",
         palestine: "israel"
       }
  ------------------------------------------------------------ */

  alias: {
    // example:
    // palestine: "israel"
    palestine: "israel",
    gaza: "israel",
    israel_internal_borders: "israel",
    israel: "israel",
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
    israel: ["israel", "gaza", "palestine"]
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
    "gaza",
    "palestine",
    "israel_internal_borders"
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
    "israel_internal_borders"
  ],

  /* ------------------------------------------------------------
     UI TEXT (what students see)
     ------------------------------------------------------------ */

  ui: {
    // Top banner text (big header across the game)
    bannerTitle: "MIDDLE EAST MAP CHALLENGE",

    // Screen reader description of the banner
    bannerAria: "Middle East countries map challenge banner",

    // Accessibility labels for the main game area and the map itself
    mainAria: "Middle East countries map challenge",
    mapAria: "Middle East countries map",

    // Start overlay text:
    // - overlayKicker is the small label (like a category tag)
    // - overlayTitle is the big title (supports line breaks using \n)
    // - beginMessage is the short explanation under the title
    overlayKicker: "MAP CHALLENGE",
    overlayTitle: "MIDDLE EAST",
    beginMessage: "How fast can you identify the countries of the Middle East?",

    // Logo image shown in the overlay
    logoSrc: "/assets/images/logo/MSHistory_Logo_Small.png"
  }
};
