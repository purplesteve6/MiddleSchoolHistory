JOHN BROWN TOPIC — DROP-IN PACKAGE (REVISION 2)

Copy the contents of this ZIP into the root of the MiddleSchoolHistory repository.

Adds:
  /8/JohnBrown/               complete six-page topic
  /assets/images/featured/    temporary John Brown WEBP featured image

Updates:
  /data/topics.json           adds John Brown to the featured-topic pool

No main navigation files are changed.

REVISION 2 CHANGES
- All topic/featured image references are now .webp.
- Placeholder files are .webp rather than .svg.
- Body typography is explicitly matched to the Greek Mythology page's system-font stack.
- “Did You Know?” text is no longer repeated beside/below the didyouknow.png graphic.
- /assets/images/ui/sixty_seconds_with.png is used on the home page.
- /assets/images/ui/big_question.png is used for reflection/question callouts.
- SOURCES.txt includes vetted public-domain / no-known-restrictions image candidates.

The pages expect these existing shared assets from your live repo:
  /assets/images/ui/bigidea.png
  /assets/images/ui/didyouknow.png
  /assets/images/ui/sixty_seconds_with.png
  /assets/images/ui/big_question.png
  /assets/images/icons/8_icon.png
  /assets/images/logo/MSHistory_Logo_Basic_Web.png
  /include.js
  /partials/header.html
  /partials/footer.html

V3 FIX: John Brown now includes the same footer sizing/layout rules used by Greek Mythology, preventing the footer logos from rendering at their natural large sizes.


NEW ROOT REFERENCE FILE
-----------------------
SITE_FEATURES.txt — keep this in the main repo root. It inventories reusable stickers/callouts and interactive page features for future topic builds.

This version also expects these existing UI sticker files in /assets/images/ui/:
- decision_point.png
- primary_source.png

V6 CHANGES:
- Expanded explanatory text throughout all six pages.
- Consolidated vocabulary from the full topic into the Home page Vocabulary section.
- Centered Decision Point buttons.
- Replaced the Missouri page's CSS route diagram with images/john-brown-freedom-trail.webp.

SEPTEMBER 2, 2026 — CONTENT / PORTRAIT / STICKER UPDATE
------------------------------------------------------
- Home: expanded the “60 Seconds With...” section, renamed the requested fact labels to
  “Fought for...”, “In Kansas...”, and “At Harpers Ferry...”, and added a short summary paragraph.
- Home: Quick Facts now uses /assets/images/ui/quick_facts.png as its visual heading.
- Home: Vocabulary now uses /assets/images/ui/vocabulary.png as its visual heading.
- Bleeding Kansas: expanded all four “How the Violence Escalated” reveal tabs to full paragraphs.
- Allies & Arguments: added individual portraits above Harriet Tubman, Frederick Douglass, and Shields Green.
- SITE_FEATURES.txt: added Quick Facts and Vocabulary to the reusable sticker inventory.

NEW FILES INCLUDED IN THIS UPDATE
---------------------------------
Only the three newly supplied historical portraits are included:
  /8/JohnBrown/images/harriet-tubman.webp
  /8/JohnBrown/images/frederick-douglass.webp
  /8/JohnBrown/images/shields-green.webp

Existing John Brown content images, finalized chapter-navigation icons, UI stickers, and the John Brown
display font are NOT repackaged here, so this update will not overwrite customized/finalized copies.

This update expects these existing UI stickers in /assets/images/ui/:
- quick_facts.png
- vocabulary.png

It also preserves the icon-navigation markup that expects the user's finalized files in:
  /8/JohnBrown/images/nav/home.webp
  /8/JohnBrown/images/nav/bleeding-kansas.webp
  /8/JohnBrown/images/nav/missouri-liberation.webp
  /8/JohnBrown/images/nav/allies-and-arguments.webp
  /8/JohnBrown/images/nav/harpers-ferry.webp
  /8/JohnBrown/images/nav/trial-and-legacy.webp
