## 2026-09-30 — Tlingit page image integration

- Converted/cropped seven user-supplied Tlingit images to WEBP and stored them under `/7/FirstAmericans/CultureRegions/NorthwestCoast/images/tlingit/`.
- Replaced every planned image slot on `tlingit.html` with a real visual: coastal-village hero, homeland map, clan house, formline art, K'alyaan representation, Sitka National Historical Park, and contemporary Tlingit culture.
- Added a new contemporary-culture figure to the final “Tlingit culture today” section rather than leaving that strong supplied image unused.
- Preserved the supplied contemporary image credit as “Photo by Ian Johnson, HIA”; did not invent credits for the other user-supplied images.
- Added click-to-open behavior, section-specific image fitting/cropping, descriptive alt text, contextual captions, and responsive Tlingit image rules.
- Bumped the Tlingit page stylesheet cache token.

## 2026-09-30 — Northwest Coast typography and contrast polish

- Replaced the Northwest Coast H1 display font trial (`Northwest.ttf`) with `/assets/fonts/native-american/wild river.ttf`.
- Reduced H1 size and increased line-height so long/multi-line page titles do not overlap vertically.
- Fixed previous/next pager link contrast by using specificity-safe light text on the dark buttons and a high-contrast hover state.
- Improved captions on images placed inside the dark salmon, cedar, and art feature panels; potlatch captions retain a dark-on-light treatment.
- Bumped the Northwest Coast stylesheet cache token across the overview and all five people pages.

# MiddleSchoolHistory — Changelog

This file records meaningful project changes. Newest entries go first.

---

## 2026-09-30 — Northwest Coast title font + landing-page image pass

### Typography
- Scoped the new `/assets/fonts/native-american/Northwest.ttf` face to the main H1 on all six Northwest Coast pages.
- Bumped the Northwest Coast stylesheet cache key across the branch so the new title face loads immediately.

### Landing-page imagery
- Converted/cropped nine user-supplied regional images to WEBP and integrated them into the Northwest Coast overview.
- Replaced the hero, regional map, salmon, cedar, canoe, and monumental-pole placeholders with real teaching visuals.
- Added the supplied plank-house teaching graphic to the permanent-villages section.
- Rebuilt the potlatch visual area as a two-image modern/historical comparison.
- Added click-to-open behavior, purposeful object positioning, responsive image layouts, descriptive alt text, and contextual captions.
- Recorded the user-supplied image filenames in `NorthwestCoast/SOURCES.txt` without inventing credits.

---

## 2026-09-29 — Thunderbird teaching callout

### Added / changed
- Added a compact Thunderbird callout inside the Northwest Coast overview's poles/formline section, restoring a memorable concept that appeared in the user's older Pacific Northwest materials.
- Explains Thunderbird as a powerful supernatural bird appearing in the traditions and art of several Northwest Coast peoples, commonly associated with thunder/lightning and strength, with whale connections in some traditions.
- Explicitly avoids presenting one universal “Thunderbird story”; the callout tells students that meanings vary by nation/community and that artwork should be identified in its specific cultural context.
- Added focused styling that fits the existing dark formline feature without adding another large image placeholder, and documented Smithsonian/NMAI and National Park Service source support in `NorthwestCoast/SOURCES.txt`.

---

## 2026-09-29 — Pacific Northwest Coast culture-region build

### Added
- Added `/7/FirstAmericans/CultureRegions/NorthwestCoast/` as the second fully developed Native American culture-region branch.
- Built a Northwest Coast overview plus dedicated pages for Tlingit, Haida, Makah, Coast Salish Peoples, and Chinookan Peoples.
- Added region-specific `northwest-coast.css`, `northwest-coast.js`, `config.js`, and `SOURCES.txt`.
- Added organized image folders for the regional overview and all five people pages. Final content images are intentionally not populated yet; each page contains carefully sized and positioned image-plan placeholders so the user can source imagery after reviewing the finished structure.

### Content / features
- Built the regional overview around salmon, cedar, permanent villages plus seasonal resource movement, canoe engineering, formline art and monumental poles, potlatch context, contact/change, and present-day continuity.
- Added an interactive formline explainer for ovoid, U-form, and S-form shapes.
- Expanded well beyond the older classroom source while preserving its core factual checkpoints: Northwest water geography, cedar canoes, marine foods, poles, seasonal movement, potlatches, and living Native communities.
- Corrected the older quiz's oversimplified “nomadic” framing by distinguishing established villages from seasonal travel to fishing, hunting, gathering, and trade locations.
- Used tribal/nation sources, Smithsonian/NMAI, National Park Service, Parks Canada, NOAA, U.S. Fish & Wildlife Service, and other public-history sources; source notes and image-placement guidance are recorded in `NorthwestCoast/SOURCES.txt`.

### Design / navigation
- Created a distinct Northwest Coast visual identity using forest/ocean teal, cedar red, salmon, gold, mist, and cream while preserving the mature layout rhythm established by the Southwest branch.
- Designed image slots around narrative purpose and aspect ratio instead of using generic repeated placeholders; hero, map, process, portrait, artifact, site, and landscape slots are placed where the eventual image will teach something specific.
- Updated the Culture Regions landing page so Northwest Coast is now available and the bottom progression callout points to the new branch.
- Updated the shared Culture Regions topic tree so Northwest Coast is a second nested parent containing Tlingit, Haida, Makah, Coast Salish Peoples, and Chinookan Peoples.
- Checked the new pages in a rendered layout pass and adjusted the structure for balanced spacing, card heights, responsive stacking, and readable long-page pacing before publishing to Drive.

---

## 2026-09-22 — Southwest overview images + Diné card layout cleanup

### Added / changed
- Added a local Southwest image folder with the user-supplied Monument Valley landscape, Edward S. Curtis riders image, and four teaching diagrams for hogan, wickiup, cliff dwellings, and Pueblo/adobe architecture.
- Replaced the Southwest landing-page hero placeholder with Monument Valley and the horse-feature placeholder with the historic rider photograph.
- Replaced all four Southwest-home diagram placeholders with full illustrated teaching diagrams; each diagram can be opened at full size.
- Removed the duplicate large Horseshoe Bend image from the early Diné homeland section.
- Rebuilt the Diné sheep / weaving / trade area as three visually uniform image-topped cards, placing each supplied photo directly with its matching concept.
- Added responsive styling and bumped Southwest CSS cache versions on the two affected pages.

---

## 2026-09-22 — Diné title font consistency fix

### Fixed
- Corrected the mixed-font rendering in the `Diné (Navajo)` hero title.
- Root cause: `southwest.ttf` lacks a precomposed `é`, so the browser substituted a fallback font for that one character.
- Kept the entire visible title in the existing Southwest display font and added the acute accent as a CSS-drawn mark over the final `e`, avoiding font fallback entirely.
- Preserved accessible text with `aria-label="Diné (Navajo)"`.
- Bumped the Diné page stylesheet cache query so the fix appears immediately after publishing.

---


## 2026-09-22 — Hopi and Diné (Navajo) image integration

### Added / changed
- Created `/7/FirstAmericans/CultureRegions/Southwest/images/hopi/` and `/images/navajo/`.
- Converted/cropped all user-supplied Hopi and Diné/Navajo images to WEBP and renamed them for stable site use.
- Replaced Hopi-page placeholders with real images for the mesa-village hero, homelands map, dry farming, historic village architecture, Spanish contact, and Wupatki National Monument.
- Replaced Diné/Navajo placeholders and sparse visual sections with real images for Monument Valley, the Navajo Nation map, sheep herding, weaving, historic trade/market context, the Long Walk, and Colorado River landscape context.
- Added captions directly in `hopi.html` and `dine-navajo.html` using the existing Southwest figure styles.
- Applied the changes directly to the connected Google Drive repo so the user's GitHub updater can detect and push them.

---

## 2026-09-22 — Apache Peoples image integration

### Added / changed
- Created `/7/FirstAmericans/CultureRegions/Southwest/images/apache/`.
- Converted/cropped all eight user-supplied Apache images to WEBP and renamed them for stable site use.
- Replaced Apache-page placeholders with real images for the hero, homelands map, wickiup, horse/mobility section, Cochise, Geronimo, Fort Bowie, and Apache nations today.
- Added captions and responsive image treatments, preserving supplied credit clues such as Edward S. Curtis (1902), David Landry / Village News, and the Geronimo credit string.
- Used cautious wording on the portrait supplied as Cochise instead of presenting photographic identification as certain.
- Updated `Southwest/SOURCES.txt` with the local Apache image inventory and caption notes.
- Added a cache-busting query to the Southwest stylesheet on the Apache page.

---

## 2026-09-21 — Pueblo Peoples image integration

### Added / changed
- Created `/7/FirstAmericans/CultureRegions/Southwest/images/pueblo/`.
- Converted all seven user-supplied Pueblo images to WEBP and renamed them for stable site use.
- Replaced Pueblo-page placeholders with real images for living Pueblo dance, Zuni Pueblo architecture, waffle-garden farming, a Mesa Verde kiva, Coronado at Hawikuh, Po’pay, and Bandelier National Monument.
- Added captions and responsive image treatments; preserved explicit credit clues from supplied filenames without inventing missing credits.
- Added a cache-busting query to the Southwest stylesheet on the Pueblo page.
- Updated `Southwest/SOURCES.txt` with the new local image inventory/caption notes.

---

## 2026-09-21 — Southwest horses, homes, stories, and nested navigation

### Added
- Added a substantial Southwest overview feature explaining the reintroduction and spread of the horse, including the role of Native trade after the Pueblo Revolt of 1680 and distinct effects on Apache, Diné, Pueblo, and Hopi communities.
- Added a comparative Southwest homes section breaking down the Diné hogan, Apache wickiup, Ancestral Pueblo cliff dwelling, and Pueblo adobe construction with diagram placeholders and clear culture/time-period labels.
- Added one public traditional-story feature to each people/group page: Mescalero Apache White Painted Woman and her sons; Hopi Maasaw's gifts and covenant; Diné Hero Twins and Spider Woman; and an Acoma Haak'u migration/homeland tradition as one explicitly identified Pueblo example.
- Added source notes for the new horse, architecture, and oral-tradition material.

### Expanded
- Fleshed out narrative text across Apache, Hopi, Diné (Navajo), and Pueblo Peoples pages, especially geography, food systems, housing, Spanish/U.S. contact, continuity, and modern sovereignty.

### Navigation
- Replaced the Culture Regions accordion organization with a visible nested hierarchy: Southwest is now a parent item with Apache, Hopi, Diné, and Pueblo pages nested directly beneath it.
- Extended the shared topic-tree engine to support optional nested `children` while preserving existing flat topic trees.

---

## 2026-09-21 — Southwest typography, button contrast, and accordion navigation

### Changed
- Standardized the individual Southwest people pages so major page and section headings use the same Southwest display font; removed the Apache-only heading-font override that made the Apache page visually inconsistent.
- Changed text on dark maroon Southwest/Culture Regions action buttons to a warm yellow for stronger contrast.
- Added optional accordion support to the shared topic-tree engine and enabled it for Native American Culture Regions; the section containing the current page opens automatically and opening another section collapses the previous one.

---

## 2026-09-21 — Culture Regions header/footer sizing fix

### Fixed
- Added explicit compact-topic header and footer sizing to `CultureRegions/culture-regions.css` and `Southwest/southwest.css`.
- Scoped the fixes to the new Culture Regions/Southwest pages so shared injected header/footer logos, navigation, and footer branding render at the same practical scale as mature topic pages instead of at their intrinsic image sizes.
- Preserved the Southwest/Culture Regions color themes while matching the established compact topic-header responsive behavior.

---

## 2026-09-21 — Native American Culture Regions + Southwest first build

### Added
- Added `/7/FirstAmericans/CultureRegions/` as a new Unit 1 branch for Native American culture-region study.
- Added a culture-regions landing page with a public-domain regional map, region cards, and explicit guidance that cultural regions are approximate study tools rather than tribal identities or hard borders.
- Added `/7/FirstAmericans/CultureRegions/Southwest/` with a Southwest overview built around geography, water, farming, adaptation, and cultural diversity.
- Added first Southwest people/group pages: Apache Peoples, Hopi, Diné (Navajo), and Pueblo Peoples.
- Added intentional image placeholders throughout the new pages with suggested subject/orientation notes.
- Added an `Explore This History` National Park Service side-feature pattern using a temporary CSS text fallback until the user supplies the dedicated sticker asset. Initial sites: Fort Bowie, Wupatki, Canyon de Chelly, and Bandelier.
- Added Southwest research/source documentation in `Southwest/SOURCES.txt`.

### Updated
- Updated `/7/FirstAmericans/index.html` so Mississippians/Cahokia remains the first major topic and Culture Regions appears as the next major branch.
- Configured the user's new `/assets/fonts/native-american/southwest.ttf` and `/assets/fonts/native-american/Apache.ttf` in the shared First Americans font stylesheet for display-title use.
- Updated the project handoff to record direct Google Drive editing as the default workflow and to document the Culture Regions/Southwest workstream.

### Notes
- Other culture regions appear on the landing page as planned/coming soon; no empty region folders/pages were created.
- The cultural-regions map is currently referenced from the public-domain Wikimedia original rather than duplicated into the repo; a local copy can be added later if desired.
- Ordinary historical photos were intentionally left as styled placeholders, per the user's request.

---

## 2026-09-21 — Canonical handoff system established

### Added
- Added `#handoff/PROJECT_HANDOFF.md` as the canonical new-chat bootstrap document for the MiddleSchoolHistory website.
- Added `#handoff/CHANGELOG.md` as the chronological project change record.

### Documented
- Current repo structure and major grade/topic areas.
- Shared header/footer injection architecture and `TOPIC_CONFIG` behavior.
- Grade 7 seven-unit information architecture and stable-URL/cross-linking policy.
- Civil War overview sequence, universal topic tree, shared timeline engine, and Key Battles structure.
- First Americans / Mississippians / Cahokia structure and current live typography implementation.
- Reusable sticker/feature conventions and the role of `SITE_FEATURES.txt`.
- Asset organization, content-design conventions, CSS/JS safety rules, and source-of-truth order.
- Changed-files-only packaging policy.
- Requirement that both handoff files be updated with every meaningful website build.
- Google Drive repo location and the rule to inspect current repo files before editing.

### Notes
- This documentation update does not intentionally change any production page behavior.
- Repo audit found a documentation mismatch around the First Americans display font: current `native-american-fonts.css` uses **Holy Grail Lore** for display titles and **Aztec Way** for subheads, while an older note in `SITE_FEATURES.txt` still references Cahokia/Dragging Canoe for display titles. Current code is treated as authoritative unless intentionally changed later.
