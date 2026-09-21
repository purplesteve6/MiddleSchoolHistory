# MiddleSchoolHistory — Changelog

This file records meaningful project changes. Newest entries go first.

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
