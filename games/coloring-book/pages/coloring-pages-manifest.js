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
    tags: ["athena", "greek mythology", "greek goddess", "ancient greece", "goddess of wisdom", "warrior goddess", "owl", "spear", "shield", "helmet", "parthenon", "acropolis", "athens", "medusa", "greek armor", "olive tree"]

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
  }
];
