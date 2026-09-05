GRADE 7 UNIT STRUCTURE UPDATE
=============================

Copy the contents of this ZIP into the ROOT of the existing MiddleSchoolHistory repository.
Merge/replace the included files when prompted.

WHAT THIS UPDATE DOES
---------------------
1. Creates /7/index.html as the Grade 7 course landing page.
2. Creates seven permanent Grade 7 unit overview URLs:
   /7/FirstAmericans/
   /7/ColumbianExchange/
   /7/ColonialDevelopments/
   /7/AmericanRevolution/
   /7/Constitution/
   /7/WestwardExpansion/
   /7/CivilWar/
3. Changes the Grade 7 hover dropdown in the main site header so it lists these seven units,
   rather than an ever-growing list of individual topic pages.
4. Links existing content into the new hierarchy without moving or renaming it:
   - The Enlightenment -> Colonial Developments
   - Key Battles of the American Revolution -> American Revolution
   - John Brown -> Civil War
   - Bleeding Kansas is also cross-linked from Westward Expansion
5. Adds optional parent-unit navigation to the shared topic header. John Brown and Key Battles
   now show a unit link alongside their existing topic-home link. Older topics are unaffected
   until unitLabel and unitHref are added to their config.js.

IMPORTANT
---------
This package intentionally contains only new/changed files. It does not repackage your existing
images, icons, fonts, timeline files, or unrelated topic files.

The existing topic URLs are preserved, so links/bookmarks to John Brown and the American
Revolution battle pages do not need to change.
