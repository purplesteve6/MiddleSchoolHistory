# MiddleSchoolHistory — Project Handoff

**Project:** MiddleSchoolHistory.com  
**Repository:** `MiddleSchoolHistory/`  
**Canonical cloud location:** Google Drive → `Design/Website/MiddleSchoolHistory/`  
**Local synced location observed:** `G:\My Drive\Design\Website\MiddleSchoolHistory\`  
**Current handoff established:** 2026-09-21

---

## 1. Purpose of this file

This is the canonical bootstrap document for future ChatGPT work on the MiddleSchoolHistory website. In a new chat, read this file first, then inspect the **current versions of the actual repo files** named here before making changes.

This file describes the project **as it currently works and the decisions that should be preserved**. Historical build-by-build details belong in `#handoff/CHANGELOG.md`.

### Source-of-truth order

1. **Current files in the MiddleSchoolHistory repo** are authoritative for actual code, content, paths, and assets.
2. `#handoff/PROJECT_HANDOFF.md` is authoritative for project conventions, architecture, workflow, and current-state guidance.
3. `#handoff/CHANGELOG.md` records meaningful changes over time.
4. Root-level legacy README/TXT files remain useful historical notes, but may be older than the current implementation.
5. `SITE_FEATURES.txt` is the reusable feature/sticker inventory. Check the actual live CSS/HTML when it conflicts with an older note.

**Known example of possible documentation drift:** the current `/7/FirstAmericans/native-american-fonts.css` uses **Holy Grail Lore** for the Native/First Americans display title font and **Aztec Way** for major subheads. Some older notes still refer to Cahokia/Dragging Canoe as the display font. Trust the current stylesheet unless the user asks to change it.

---

## 2. Project character

MiddleSchoolHistory.com is a static, student-facing social studies website organized primarily by grade level and instructional topic. It is designed for middle-school readability rather than textbook density: short sections, clear hierarchy, strong visuals, vocabulary support, interactive breaks, reusable callouts/stickers, and topic-specific visual identities.

The site uses plain HTML/CSS/JavaScript and shared partials/configuration rather than a framework. Root-relative URLs are common and intentional.

The broad site visual identity is **purple and browns**, while major topics may have their own theme. The Civil War area, for example, uses a blue/gray visual system while still fitting the shared site architecture.

---

## 3. Repository map

Important root-level areas currently include:

```text
MiddleSchoolHistory/
├── 5/
├── 6/
├── 7/
├── 8/
├── assets/
├── data/
├── games/
├── partials/
├── teacher-resources/
├── timeline/
├── topic-nav/
├── #handoff/                  ← canonical project handoff docs
├── index.html
├── styles.css
├── include.js
├── nav.js
├── featured.js
├── SITE_FEATURES.txt
├── CNAME
└── legacy README/TXT notes
```

Other repo items may exist, including working ZIPs or temporary folders. Do not treat those as production architecture unless the user says otherwise.

### Grade-level content currently visible in the repo

- **Grade 5**
  - `/5/WesternHemisphere/`
  - Includes a main topic page plus region subpages.
- **Grade 6**
  - `/6/GreekMythology/`
  - `/6/RomanEmperors/`
- **Grade 7**
  - Course landing: `/7/`
  - Seven permanent unit overview URLs:
    1. `/7/FirstAmericans/`
    2. `/7/ColumbianExchange/`
    3. `/7/ColonialDevelopments/`
    4. `/7/AmericanRevolution/`
    5. `/7/Constitution/`
    6. `/7/WestwardExpansion/`
    7. `/7/CivilWar/`
  - Existing standalone topic areas include `/7/Enlightenment/`, `/7/BattlesOfTheAmericanRevolution/`, and `/7/JohnBrown/`.
- **Grade 8**
  - Folder exists but currently has no substantive site content in the repo snapshot/audit.

---

## 4. Shared site architecture

### 4.1 Shared header/footer injection

`/include.js` loads the shared header and footer into `#siteHeader` and `#siteFooter`.

There are two important header patterns:

**Main site/course header**

```html
<div id="siteHeader" data-include="/partials/main-header.html"></div>
```

When `include.js` sees `main-header.html`, it loads `/nav.js` after the partial exists in the DOM. This header contains the site logo, Grade 5–8 navigation, Games, Teacher Resources, and the hover dropdown band.

**Compact topic header**

```html
<div id="siteHeader"></div>
```

With no `data-include`, `include.js` defaults to `/partials/header.html`. Topic pages load a local `config.js` before `/include.js`; `include.js` then binds the values from `window.TOPIC_CONFIG`.

Typical topic config fields:

```js
window.TOPIC_CONFIG = {
  gradeKicker: "Grade 7",
  title: "The Civil War",
  subtitle: "A Nation Divided • 1861–1865",
  homeLabel: "Civil War Home",
  homeHref: "/7/CivilWar/",
  badgeIcon: "/assets/images/icons/7_icon.png",
  mainLogo: "/assets/images/logo/MSHistory_Logo_Basic_Web.png"
};
```

Optional parent-unit fields:

```js
unitLabel: "The First Americans",
unitHref: "/7/FirstAmericans/"
```

These reveal the parent-unit button in the compact topic header without breaking older topics that do not define them.

**Load order matters:** `config.js` must load before `/include.js` on pages that use `TOPIC_CONFIG`.

### 4.2 Main navigation

`/partials/main-header.html` contains the global navigation markup. `/nav.js` controls the hover dropdown band and arrow positioning.

The Grade 7 global dropdown intentionally lists the **seven major units**, not every individual Grade 7 topic page. Individual topics live under or are cross-linked from those unit overview pages.

### 4.3 Homepage featured content

The root homepage uses `/featured.js`, which reads `/data/topics.json` and randomly chooses a valid topic with a title, URL, and image for the featured hero.

When a major student-facing topic becomes available, consider whether it should also be added to `/data/topics.json`.

---

## 5. Grade 7 information architecture

Grade 7 is the most developed example of the newer site structure.

### 5.1 Course landing

`/7/index.html` presents the course as seven unit accordions under the title **“From the First Americans to the Civil War.”** The unit overview pages are the stable top-level structure.

Existing standalone content is linked into this hierarchy rather than being moved merely for neatness. Preserve stable URLs when practical.

Examples:

- The Enlightenment remains `/7/Enlightenment/` and is linked from Colonial Developments.
- Key Battles of the American Revolution remains `/7/BattlesOfTheAmericanRevolution/` and is linked from American Revolution.
- John Brown remains `/7/JohnBrown/` and is linked from Civil War.
- Bleeding Kansas can also be cross-linked from Westward Expansion.

### 5.2 Folder convention going forward

For **new** standalone Civil War topics, nesting them under `/7/CivilWar/` is preferred when practical.

Do **not** move existing stable topic URLs only to make the folder tree look cleaner. Avoid breaking established links, assets, or bookmarks.

---

## 6. Civil War area — mature reference implementation

`/7/CivilWar/` is the strongest reference for a mature Grade 7 unit with overview pages, nested topics, shared navigation, timeline integration, and reusable student-facing patterns.

### 6.1 Current overview sequence

- `/7/CivilWar/`
- `/7/CivilWar/antebellum-america.html`
- `/7/CivilWar/road-to-war.html`
- `/7/CivilWar/war-at-a-glance.html`

### 6.2 Civil War topic tree

The shared engine lives in:

- `/topic-nav/topic-tree.js`
- `/topic-nav/topic-tree.css`

The Civil War tree is configured by:

- `/7/CivilWar/navigation-config.js`

It creates:

- a sticky left navigation rail on desktop;
- an **Explore** drawer on smaller screens;
- active-page highlighting;
- support for exact anchors and `matchPrefix` matching;
- planned/disabled items without dead links.

Current Civil War tree categories include **Overview**, **Major Events**, **People**, and **Key Battles**.

The same Civil War tree is also used on the John Brown pages so John Brown remains part of the broader Civil War experience despite retaining its older stable URL.

### 6.3 Civil War timelines

The shared timeline engine lives under `/timeline/`:

- `timeline.html`
- `timeline-loader.js`
- `timeline-core.js`
- `timeline.css`

A topic embeds a timeline with a URL such as:

```text
/timeline/timeline.html?topic=/7/CivilWar&active=fort_sumter
```

The loader retrieves the topic's `timeline-config.js`. The timeline system supports images, event-type fallbacks, date ranges, links, interval bars, and an `active` event query parameter for centering/highlighting.

The Civil War overview timeline config is `/7/CivilWar/timeline-config.js`.

### 6.4 Key Battles

Nested topic:

```text
/7/CivilWar/Battles/
```

It has a landing page, dedicated CSS/JS/config/timeline, and twelve battle/campaign pages:

- Fort Sumter
- First Bull Run / Manassas
- Hampton Roads
- Shiloh
- Antietam
- Fredericksburg
- Chancellorsville
- Gettysburg
- Vicksburg
- Wilderness & Spotsylvania
- Atlanta & Sherman’s March
- Appomattox Court House

Representative battle-page conventions include:

- hero treatment;
- **Battle at a Glance** information;
- locator map;
- **Person of Interest** callout;
- **Key Takeaway** near the top;
- age-appropriate narrative sections;
- decision/thinking prompts where appropriate;
- click-to-zoom images/maps;
- previous/next or topic navigation;
- shared battle timeline.

Civil War battle assets are intentionally organized into subfolders such as `images/heroes/`, `images/maps/`, `images/nav/`, `images/people/`, `images/flags/`, and galleries/content folders.

### 6.5 Antebellum map experience

`/7/CivilWar/antebellum-america.html` is a developed map-analysis experience and should be treated as a reference for map-based instruction. Current map topics include railroads, enslaved population, free African Americans, foreign-born population, cash crops, manufacturing, commander origins/leadership, Civil War battle locations, and the free/slave states map used in the broader Civil War experience.

Maps and historical images are generally clickable/zoomable.

---

## 7. First Americans / Native Americans area

Unit overview:

```text
/7/FirstAmericans/
```

The current developed topic beneath it is:

```text
/7/FirstAmericans/Mississippians/
```

with:

- `index.html` — Mississippian culture overview;
- `cahokia.html` — focused Cahokia page;
- `mississippians.css`;
- `mississippians.js`;
- `config.js`;
- `SOURCES.txt`;
- local images and navigation art.

### 7.1 Current Native/First Americans typography

Shared stylesheet:

```text
/7/FirstAmericans/native-american-fonts.css
```

Current live implementation:

- **Holy Grail Lore** — large display/hero title font, bundled at `/7/FirstAmericans/fonts/CCHolyGrailLore-Bold.ttf`.
- **Aztec Way** — major section subheads/compact labels, loaded from `/assets/fonts/native-american/AztecWay-OVRr6.otf`.
- Body copy should remain in the established readable site/topic body fonts.

Do not use decorative fonts for dense body text.

### 7.2 Mississippians/Cahokia page patterns

These pages are good references for:

- topic header + parent-unit button;
- rich but readable historical narrative;
- vocabulary hovers;
- click-to-enlarge/lightbox images;
- captioned figures;
- archaeology/evidence interactions;
- clear statements about historical uncertainty;
- chapter/topic page navigation;
- source documentation.

---

## 8. Other useful reference topics

Use these when a new page needs a pattern not yet mature in Grade 7:

- `/5/WesternHemisphere/` — Grade 5 geography structure, region navigation, vocabulary hovers, strong explanatory cards.
- `/6/GreekMythology/` — image-rich topic, vocabulary hovers, grid navigation to subpages, Did You Know/Big Idea treatment.
- `/6/RomanEmperors/` — multi-page topic with timeline embedding and previous/next subject navigation.
- `/7/JohnBrown/` — mature multi-page topic with interactives, primary sources, interpretation activities, chapter navigation, timeline integration, and reusable stickers.
- `/7/BattlesOfTheAmericanRevolution/` — earlier multi-page battle/timeline model.

Do not copy old local assets or old patterns blindly when a newer shared pattern now exists.

---

## 9. Reusable site features and stickers

Before inventing a new callout or interaction, inspect `/SITE_FEATURES.txt` and existing implementations.

Current reusable sticker graphics live in:

```text
/assets/images/ui/
```

Current named sticker assets include:

- `big_question.png`
- `bigidea.png`
- `decision_point.png`
- `didyouknow.png`
- `helpremember.png`
- `primary_source.png`
- `quickquiz.png`
- `quick_facts.png`
- `sixty_seconds_with.png`
- `vocabulary.png`
- `coloring-book.png`
- `person-of-interest.png`
- `key-takeaway.png`

### Sticker rule

When the graphic already contains its own title words, **do not repeat the same title as adjacent visible text**. A distinct subtitle is fine when useful.

### Common reusable interaction/content patterns

- vocabulary hover definitions using `.vocabWord` + `data-def`;
- clickable/expanding timelines;
- short event-sequence interactives;
- Decision Point choice/reveal interactions;
- evidence/interpretation cards;
- route/journey diagrams;
- Quick Facts tile grids;
- chapter/topic page navigation;
- primary-source document panels;
- Quick Quiz knowledge checks;
- memory-aid callouts;
- Coloring Book callouts;
- Key Takeaway callouts;
- shared printable/digital flashcard tools under `/teacher-resources/`.

When a genuinely reusable new feature is created, update `SITE_FEATURES.txt` as part of the same build.

---

## 10. Asset and file conventions

### Global assets

Use `/assets/` for resources intended to be reused across the site.

Important areas include:

```text
/assets/fonts/
/assets/images/logo/
/assets/images/icons/
/assets/images/featured/
/assets/images/ui/
/assets/images/banners/
/assets/images/backgrounds/
/assets/images/landing/
```

### Topic-local assets

Keep content images that belong specifically to one topic inside that topic's folder when practical, usually in an `images/` subfolder.

### Image conventions

- Historical/content images should preferably be **WEBP**.
- UI stickers are generally **PNG**.
- Preserve supplied image aspect ratios unless the design intentionally crops them.
- Provide meaningful `alt` text.
- Use captions when they add historical/contextual value.
- Maps and substantial content images commonly use click-to-zoom behavior.
- Do not overwrite or replace existing image assets casually; the user may have manually corrected them outside ChatGPT.

### Paths

The site relies heavily on root-relative paths such as `/assets/...` and `/7/...`. Preserve them unless there is a specific reason not to.

---

## 11. Content and instructional design conventions

The target audience is middle-school students. Prefer:

- short, readable sections;
- strong visual hierarchy;
- plain language without becoming childish;
- accurate historical nuance;
- clear distinction between known evidence, interpretation, and uncertainty;
- visuals that actually teach rather than decorate;
- embedded vocabulary help instead of constant interruption;
- occasional high-interest facts and interactive breaks;
- Big Question / Decision Point / Primary Source / Key Takeaway features when they genuinely fit.

When difficult history appears, present it directly and age-appropriately rather than sanitizing it or sensationalizing it.

For historical claims, especially quotations, statistics, and contested interpretations, preserve or add source documentation in the topic's source file where the project already uses one.

---

## 12. CSS/JavaScript safety rules

- Reuse shared header/footer partials rather than recreating them locally.
- Keep topic-specific CSS scoped whenever practical.
- Avoid broad selectors that accidentally restyle shared header/footer/navigation components.
- Preserve responsive behavior; desktop and smaller-screen layouts are both first-class.
- When adding JavaScript, avoid breaking pages that do not load the new feature.
- Load dependencies/configs in the established order.
- Prefer extending a shared engine when the behavior is genuinely reusable; otherwise keep the feature local to the topic.

---

## 13. Packaging and update workflow — IMPORTANT

### Changed-files-only rule

Every update package must contain **only files that were actually edited or newly created for that update**.

**Do not repackage unchanged existing assets, especially images.** The user may have manually corrected existing files and does not want an update ZIP to overwrite those corrections.

Preserve each changed file's correct repo-relative path inside the update ZIP so the package can be copied into the repository root and merged cleanly.

### Handoff files are part of every meaningful build

Every meaningful website build/update must update and include:

```text
#handoff/PROJECT_HANDOFF.md
#handoff/CHANGELOG.md
```

`PROJECT_HANDOFF.md` should describe the **current state**, not accumulate a diary of old changes.

`CHANGELOG.md` should record the meaningful change chronologically.

### Preferred working sequence

1. Read this handoff.
2. Inspect the current authoritative repo files involved in the requested change (Google Drive when connected; otherwise current uploads).
3. Make only the requested changes.
4. Check paths, dependency/load order, responsive implications, and consistency with existing patterns.
5. Update both handoff files.
6. Because direct Drive editing is now authorized, apply the changes to the live Drive repo and report exactly what changed. Create a changed-files-only ZIP only when the user asks for a portable snapshot/update package.

Do not treat an old ZIP from a previous chat as more authoritative than the current repo.

---

## 14. Google Drive workflow

The repo is available in the user's connected Google Drive at:

```text
Design/Website/MiddleSchoolHistory/
```

Use Drive as the source for current file versions when available.

**Current default workflow:** the user has explicitly authorized direct editing of the connected Google Drive repo. Inspect the current repo version before editing, update files in place when possible, create new files/folders directly in the repo, and update both handoff documents as part of each meaningful build. Changed-files-only ZIPs are optional snapshots/backups rather than the normal delivery method.

The `#handoff/` folder itself is intended to remain in the repo so a future chat can begin from `PROJECT_HANDOFF.md` and then retrieve whatever current source files are needed.

---

## 15. Current project status as of 2026-09-21

- Site-wide shared static architecture is established.
- Grade 5 has a developed Western Hemisphere topic.
- Grade 6 has developed Greek Mythology and Roman Emperors topics.
- Grade 7 has a seven-unit course structure.
- Civil War is the most mature Grade 7 unit framework and the primary structural reference.
- John Brown is a mature existing topic integrated into the Civil War navigation/timeline while preserving its stable URL.
- Civil War Key Battles contains twelve detailed pages and a dedicated timeline.
- First Americans has a unit landing page plus a developed Mississippians/Cahokia topic.
- A new `/7/FirstAmericans/CultureRegions/` branch is being built to organize Native American history by broad culture region while stressing that regions are study tools rather than identities.
- The first developed region is `/7/FirstAmericans/CultureRegions/Southwest/`, with overview content plus Apache Peoples, Hopi, Diné (Navajo), and Pueblo Peoples pages.
- Units 2–6 of Grade 7 have permanent overview URLs, but several are still lighter/placeholder structures awaiting more developed topic content.
- Grade 8 site content is not yet substantively built in the current repo audit.
- Games include at least the Coloring Book and map challenges.
- Teacher Resources include shared printable and digital flashcard tools.

### Current active work

The active workstream is the Grade 7 **First Americans → Native American Culture Regions → Southwest** branch. The Culture Regions landing page, Southwest overview, and Apache, Hopi, Diné (Navajo), and Pueblo Peoples pages are built. The Southwest overview includes horse-introduction and Southwest-home comparison features; the individual people pages include expanded historical/cultural text and one carefully sourced public traditional story each.

**Pueblo Peoples image pass (2026-09-21):** seven user-supplied images were converted to WEBP, saved under `/7/FirstAmericans/CultureRegions/Southwest/images/pueblo/`, and integrated into the Pueblo page. They cover living Pueblo dance, Zuni architecture (1873), waffle-garden farming, a Mesa Verde kiva, Coronado at Hawikuh, Po’pay, and Bandelier National Monument. Captions preserve only user-supplied/identifiable credit information.

**Publishing workflow:** Google Drive is the working copy that the user reviews/updates locally; the user can push these synced changes through their GitHub updater.

---

## 16. High-value files to inspect first in a fresh chat

For general architecture:

```text
#handoff/PROJECT_HANDOFF.md
#handoff/CHANGELOG.md
SITE_FEATURES.txt
include.js
partials/header.html
partials/main-header.html
partials/footer.html
styles.css
nav.js
data/topics.json
topic-nav/topic-tree.js
topic-nav/topic-tree.css
timeline/timeline.html
timeline/timeline-loader.js
timeline/timeline-core.js
timeline/timeline.css
```

For Grade 7 structure:

```text
7/index.html
7/grade7.css
README-GRADE7-STRUCTURE.txt          (historical reference)
```

For the mature Civil War model:

```text
7/CivilWar/index.html
7/CivilWar/civil-war.css
7/CivilWar/config.js
7/CivilWar/navigation-config.js
7/CivilWar/timeline-config.js
7/CivilWar/antebellum-america.html
7/CivilWar/road-to-war.html
7/CivilWar/war-at-a-glance.html
7/CivilWar/Battles/index.html
7/CivilWar/Battles/battles.css
7/CivilWar/Battles/battles.js
7/CivilWar/Battles/config.js
7/CivilWar/Battles/timeline-config.js
```

For the First Americans model:

```text
7/FirstAmericans/index.html
7/FirstAmericans/first-americans.css
7/FirstAmericans/native-american-fonts.css
7/FirstAmericans/CultureRegions/index.html
7/FirstAmericans/CultureRegions/culture-regions.css
7/FirstAmericans/CultureRegions/navigation-config.js
7/FirstAmericans/CultureRegions/Southwest/index.html
7/FirstAmericans/CultureRegions/Southwest/southwest.css
7/FirstAmericans/CultureRegions/Southwest/apache.html
7/FirstAmericans/CultureRegions/Southwest/hopi.html
7/FirstAmericans/CultureRegions/Southwest/dine-navajo.html
7/FirstAmericans/CultureRegions/Southwest/pueblo-peoples.html
7/FirstAmericans/Mississippians/index.html
7/FirstAmericans/Mississippians/cahokia.html
7/FirstAmericans/Mississippians/mississippians.css
7/FirstAmericans/Mississippians/mississippians.js
7/FirstAmericans/Mississippians/config.js
7/FirstAmericans/Mississippians/SOURCES.txt
```

---

## 17. Rules a future assistant should not accidentally reverse

1. **Do not turn the Grade 7 global dropdown into a giant list of every page.** It lists the seven units.
2. **Do not relocate stable existing topics merely to make folder hierarchy look cleaner.** Cross-link them instead.
3. **Do not recreate shared headers/footers locally.** Use the partials/config system.
4. **Do not duplicate sticker title text when the sticker already contains it.**
5. **Do not ship unchanged assets in update ZIPs.** Especially do not overwrite existing images unnecessarily.
6. **Do not ignore responsive/mobile behavior.** The topic tree intentionally becomes an Explore drawer below desktop widths.
7. **Do not treat decorative fonts as body fonts.** Readability comes first.
8. **Do not invent a new shared feature before checking `SITE_FEATURES.txt` and current implementations.**
9. **Do not trust historical README notes over current production code when they disagree.**
10. **Do not let the handoff drift.** Update `PROJECT_HANDOFF.md` and `CHANGELOG.md` with every meaningful build.

---

## 18. Starting a new chat

The user should be able to upload **only this file** and say, in effect:

> This is the MiddleSchoolHistory website project. Read the handoff, inspect the current repo files you need, and continue from here.

If Google Drive is connected, use the paths in this file to retrieve current source files. If Drive is not connected, ask only for the specific current files needed for the requested work rather than requesting the entire repo again.
