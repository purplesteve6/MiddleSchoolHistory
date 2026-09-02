/* ============================================================
   Middle School History Coloring Book — Page Catalog

   ADDING A NEW COLORING PAGE
   1. Put the SVG in /games/coloring-book/pages/
   2. Add one object to COLORING_BOOK_PAGES below.
   3. thumbnail is optional. If it is omitted or fails to load,
      the gallery will use the SVG itself as the preview.

   gradeLevels: [] means the page is suitable for all grades.
   Add/edit filter choices in COLORING_BOOK_FILTERS as needed.
   ============================================================ */

window.COLORING_BOOK_FILTERS = {
  gradeLevels: [
    { id: "5", label: "Grade 5" },
    { id: "6", label: "Grade 6" },
    { id: "7", label: "Grade 7" },
    { id: "8", label: "Grade 8" }
  ],

  subjects: [
    { id: "us-history", label: "U.S. History" },
    { id: "world-history", label: "World History" },
    { id: "geography", label: "Geography" },
    { id: "civics", label: "Civics" },
    { id: "economics", label: "Economics" },
    { id: "mythology", label: "Mythology" },
    { id: "native-americans", label: "Native Americans" },

  ]
};

window.COLORING_BOOK_PAGES = [

  {
    id: "athena",
    title: "Athena",
    file: "/games/coloring-book/pages/athena.svg",
    thumbnail: "/games/images/thumbs/coloring-book/athena.webp",
    description: "Color a scene featuring Athena, Greek Goddess of wisdom.",
    gradeLevels: ["6"],
    subjects: ["world-history", "mythology"],
    tags: ["athena", "greek mythology", "greek goddess", "ancient greece", "goddess of wisdom", "warrior goddess", "owl", "spear", "shield", "helmet", "parthenon", "acropolis", "athens", "medusa", "greek armor", "olive tree", "religion"]

  },


  {
    id: "foraging-on-land-bridge",
    title: "Foraging on the Land Bridge",
    file: "/games/coloring-book/pages/foraging-on-land-bridge.svg",
    thumbnail: "/games/images/thumbs/coloring-book/foraging-on-land-bridge.webp",
    description: "Color a scene of early humans foraging and traveling across the Bering Land Bridge",
    gradeLevels: ["7"],
    subjects: ["world-history", "native-americans"],
    tags: ["Bering Land Bridge", "early humans", "migration", "foraging", "hunter-gatherers", "Ice Age", "Beringia", "mammoth", "prehistoric animals"]

  },


  {
    id: "general-washington",
    title: "General Washington",
    file: "/games/coloring-book/pages/general-washington.svg",
    thumbnail: "/games/images/thumbs/coloring-book/general-washington.webp",
    description: "Color a distinguished picture of General George Washington",
    gradeLevels: ["7"],
    subjects: ["us-history"],
    tags: ["George Washington", "horse", "Revolutionary War", "American Revolution", "leadership", "soldiers", "war", "America"]

  },

{
  id: "grant_and_lee",
  title: "Grant and Lee at Appomattox",
  file: "/games/coloring-book/pages/grant_and_lee.svg",
  thumbnail: "/games/images/thumbs/coloring-book/grant_and_lee.webp",
  description: "Color Ulysses S. Grant and Robert E. Lee shaking hands at Appomattox Court House at the end of the Civil War.",
  gradeLevels: ["7", "8"],
  subjects: ["us-history"],
  tags: ["ulysses s grant", "robert e lee", "grant and lee", "appomattox", "appomattox court house", "appomattox courthouse", "civil war", "american civil war", "confederacy", "union", "union army", "confederate army", "surrender at appomattox", "civil war surrender", "end of the civil war", "mclean house", "virginia", "1865", "general grant", "general lee"]
},



  {
    id: "harriet-tubman",
    title: "Harriet Tubman",
    file: "/games/coloring-book/pages/harriet-tubman.svg",
    thumbnail: "/games/images/thumbs/coloring-book/harriet-tubman.webp",
    description: "Color an Underground Railroad scene featuring Harriet Tubman.",
    gradeLevels: ["7", "8"],
    subjects: ["us-history"],
    tags: ["Harriet Tubman", "Underground Railroad", "abolition", "slavery", "Civil War"]
  },

{
  id: "haudenosaunee_lacrosse",
  title: "Haudenosaunee Lacrosse",
  file: "/games/coloring-book/pages/haudenosaunee_lacrosse.svg",
  thumbnail: "/games/images/thumbs/coloring-book/haudenosaunee_lacrosse.webp",
  description: "Color a traditional Haudenosaunee lacrosse player running with a wooden lacrosse stick.",
  gradeLevels: ["7"],
  subjects: ["us-history", "native-americans"],
  tags: ["haudenosaunee", "lacrosse", "traditional lacrosse", "creators game", "iroquois", "iroquois confederacy", "haudenosaunee confederacy", "native americans", "indigenous peoples", "northeast woodlands", "woodland indians", "new york", "traditional sports", "native american games", "lacrosse stick", "traditional clothing"]
},


{
  id: "haudenosaunee_longhouse",
  title: "Haudenosaunee Longhouse",
  file: "/games/coloring-book/pages/haudenosaunee_longhouse.svg",
  thumbnail: "/games/images/thumbs/coloring-book/haudenosaunee_longhouse.webp",
  description: "Color a woodland scene featuring a traditional Haudenosaunee longhouse.",
  gradeLevels: ["7"],
  subjects: ["us-history", "native-americans"],
  tags: ["haudenosaunee", "longhouse", "iroquois", "iroquois confederacy", "haudenosaunee confederacy", "native americans", "indigenous peoples", "northeast woodlands", "woodland indians", "new york", "traditional housing", "longhouse village", "white-tailed deer", "deer"]
},


{
  id: "jigonsaseh_and_tadadaho",
  title: "Jigonsaseh and Tadadaho",
  file: "/games/coloring-book/pages/jigonsaseh_and_tadadaho.svg",
  thumbnail: "/games/images/thumbs/coloring-book/jigonsaseh_and_tadadaho.webp",
  description: "Color a scene of Jigonsaseh combing the snakes from Tadadaho's hair in the Haudenosaunee Peacemaker legend.",
  gradeLevels: ["7"],
  subjects: ["us-history", "native-americans"],
  tags: ["jigonsaseh", "tadadaho", "haudenosaunee", "iroquois", "iroquois confederacy", "great law of peace", "peacemaker", "haudenosaunee confederacy", "five nations", "clan mother", "native american history", "indigenous history", "new york history", "onondaga", "peace", "confederacy"]
},

{
  id: "john_brown",
  title: "John Brown",
  file: "/games/coloring-book/pages/john_brown.svg",
  thumbnail: "/games/images/thumbs/coloring-book/john_brown.webp",
  description: "Color a dramatic scene featuring abolitionist John Brown holding a rifle and Bible amid smoke and fire.",
  gradeLevels: ["8"],
  subjects: ["us-history"],
  tags: ["john brown", "abolitionist", "abolitionism", "slavery", "antislavery", "harpers ferry", "harpers ferry raid", "john browns raid", "bleeding kansas", "civil war", "civil war era", "sectionalism", "antebellum america", "american abolitionists", "enslavement", "rifle", "bible", "1859"]
},


  {
    id: "sphynx",
    title: "Sphinx",
    file: "/games/coloring-book/pages/sphynx.svg",
    thumbnail: "/games/images/thumbs/coloring-book/sphynx.webp",
    description: "Color a scene featuring the Great Sphinx of Ancient Egypt.",
    gradeLevels: ["6"],
    subjects: ["world-history"],
    tags: ["sphinx", "great sphinx", "ancient egypt", "egypt", "giza", "giza plateau", "pyramids", "great pyramid", "pharaoh", "egyptian civilization", "ancient civilization", "desert", "palm trees", "egyptian monuments", "egyptian architecture"]

  },



  {
    id: "washington-crossing-delaware",
    title: "Washington Crossing the Delaware",
    file: "/games/coloring-book/pages/washington-crossing-delaware.svg",
    thumbnail: "/games/images/thumbs/coloring-book/washington-crossing-delaware.webp",
    description: "Color a depiction of Washington crossing the Delaware",
    gradeLevels: ["7"],
    subjects: ["us-history"],
    tags: ["George Washington", "Delaware", "Revolutionary War", "American Revolution", "leadership", "soldiers", "crossing", "flag", "America", "war"]

  },



];
