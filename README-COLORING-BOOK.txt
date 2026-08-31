MIDDLE SCHOOL HISTORY - COLORING BOOK DROP-IN PACKAGE
=====================================================

WHERE TO EXTRACT
----------------
Extract this ZIP into the ROOT of your MiddleSchoolHistory repository.

Example:
  MiddleSchoolHistory/
    games/
    styles.css
    include.js
    ...

Allow your unzip program to merge the /games/ folders and replace:
  games/index.html
  games/games.css

Those two replacement files are based directly on the Repo Sample you supplied;
the only intended change is adding the new Coloring Book mode and adjusting the
desktop mode grid to four columns.

NEW FILES
---------
games/coloring-book/index.html
games/coloring-book/coloring-book.css
games/coloring-book/engine/coloring-book.js
games/coloring-book/engine/coloring-book-engine.css
games/coloring-book/engine/palettes.js
games/coloring-book/harriet-tubman/index.html
games/coloring-book/harriet-tubman/config.js
games/coloring-book/harriet-tubman/harriet-tubman.svg
games/images/thumbs/coloring-book.webp
games/images/thumbs/coloring-book/harriet-tubman.webp

CURRENT FEATURES
----------------
- SVG paint bucket filling
- Basic + themed palettes
- Integrated saturation/brightness color picker + hue slider
- Hex color entry
- Freehand brush with four sizes
- Undo / Redo history
- Clear page
- Text tool with font, size, and color
- Drag placed text to reposition it
- Delete selected text
- Print / Save as PDF using the browser print dialog
- Fixed artwork viewport with independent horizontal/vertical scrolling
- Zoom slider (100%-400%) + mouse-wheel zoom toward pointer
- Responsive desktop/tablet/mobile layout

SVG FORMAT FOR FUTURE PAGES
---------------------------
Every coloring-page SVG should contain two top-level groups:

  <g id="color"> ... closed fillable shapes ... </g>
  <g id="ink">   ... protected line art ...   </g>

The engine automatically discovers all path, polygon, rect, circle, and ellipse
shapes inside #color. You do NOT need to hand-name each fillable shape.

The #ink group is protected and has pointer events disabled so the user clicks
through line art to the fillable shape underneath.

ADDING A NEW COLORING PAGE
--------------------------
1. Copy the Harriet Tubman folder and rename it.
2. Replace the SVG.
3. Edit config.js (title and svgPath).
4. Add a thumbnail and a card to games/coloring-book/index.html.

IMPORTANT TESTING NOTE
----------------------
The engine loads the SVG with fetch(), so test it through GitHub Pages or a local
web server. Opening index.html directly with file:// may be blocked by the browser.


DRAWING LAYERS
--------------
Brush strokes and text are stored individually either behind or above the SVG ink layer.
Changing the Drawing Position control affects new work only; existing work stays where it was created.
When a text object is selected, choosing Behind Lines or On Top moves only that selected text.
Paint-bucket fills remain in the SVG color group and are not affected by drawing position.


INTERFACE LAYOUT
----------------
- Upper-left workspace menu: Undo, Redo, Clear, Print / Save
- Upper-right workspace controls: Drawing Position followed by Zoom
- Left toolbar order: Tools, active tool options, Palette, Color Picker
- 100% zoom means the full artwork is fitted inside the fixed workspace viewport.
- Zooming never enlarges the page layout; the artwork viewport supplies its own scrollbars.
