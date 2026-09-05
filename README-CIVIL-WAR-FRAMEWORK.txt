CIVIL WAR FRAMEWORK — SEPTEMBER 2026
=====================================

This package is intentionally CHANGED/NEW FILES ONLY.
Copy its contents into the root of MiddleSchoolHistory/ and merge folders.

WHAT THIS ADDS
--------------
1. A standalone Civil War experience under /7/CivilWar/ using the compact topic header rather than the full site header.
2. Four connected overview pages:
   - /7/CivilWar/
   - /7/CivilWar/antebellum-america.html
   - /7/CivilWar/road-to-war.html
   - /7/CivilWar/war-at-a-glance.html
3. A universal topic tree engine in /topic-nav/.
   - Civil War categories currently: Overview, Major Events, People, Battles.
   - It stays Civil-War-only; it does not expose other grades or units.
   - Desktop: sticky left navigation.
   - Smaller screens: "Explore" drawer.
4. The Civil War tree is also installed on every John Brown page.
5. A shared Civil War timeline is embedded at the bottom of all Civil War overview pages and all John Brown pages.
6. Timeline engine upgrades:
   - ?active=EVENT_ID centers/highlights an event when an embedded timeline opens.
   - Events can now use eventType (LAW, COURT, BATTLE, etc.) when no image exists.
   - Existing image-based timelines remain compatible.
7. Grade 7 landing page Civil War accordion now links the new overview sequence plus John Brown.

ADDING A CIVIL WAR TOPIC LATER
------------------------------
Add it to /7/CivilWar/navigation-config.js under the appropriate category.
If the topic belongs on the timeline, add its event to /7/CivilWar/timeline-config.js.
The timeline href can link to an entire topic or directly to a specific subpage/anchor.

PLANNED TREE ITEMS
------------------
Some future pages appear dimmed in the navigation tree to show the developing structure without creating dead links. Remove or rename those entries any time.
