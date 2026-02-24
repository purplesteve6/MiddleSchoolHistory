/**
 * ============================================================
 * TIMELINE CONFIG (TOPIC-SPECIFIC) — EDIT THIS FILE ONLY
 * ============================================================
 *
 * Location:
 *   /6/RomanEmperors/timeline-config.js
 *
 * HOW THIS FILE WORKS (Plain English)
 * ------------------------------------
 * This file controls the data + options for ONE timeline topic.
 * The universal timeline engine reads window.TIMELINE_CONFIG and:
 *   • builds the ticks/labels
 *   • draws interval bars (reigns)
 *   • places portrait cards
 *   • draws connector lines
 *
 * ------------------------------------------------------------
 * PATH RULES (IMPORTANT)
 * ------------------------------------------------------------
 * All "image" and "href" paths in events should be RELATIVE to:
 *   /6/RomanEmperors/
 *
 * Examples:
 *   image: "images/timeline/augustus_timeline.jpg"
 *   href:  "emperors/augustus.html"
 *
 * If you start with "/" it becomes site-absolute (not topic-relative).
 * Full URLs (https://...) also work.
 *
 * ------------------------------------------------------------
 * DATE RULES
 * ------------------------------------------------------------
 * BCE years MUST:
 *   • be negative
 *   • be zero-padded to 4 digits in date strings
 *
 * Correct:
 *   "-0044-03-15"   (44 BCE, March 15)
 *   "-0027-01-16"   (27 BCE, Jan 16)
 *
 * CE years:
 *   "0014-09-17"
 *   "0330-01-01"
 *
 * You MAY use a year-only number, but full dates are best:
 *   start: 14
 *   end:   37
 *
 * If you use year-only numbers, numericYearEndMode decides what "end" means:
 *   "endOfYear"   => end: 476 becomes 0476-12-31  (recommended)
 *   "startOfYear" => end: 476 becomes 0476-01-01
 *
 * ------------------------------------------------------------
 * EVENT OPTIONS (per event)
 * ------------------------------------------------------------
 * Required fields:
 *   id, label, start, end, anchor, image, href, side
 *
 * Optional fields:
 *   dateLabel      → displayed next to the name
 *
 *   showInterval   → whether the interval bar (reign bar) draws
 *                    - true  (default)
 *                    - false (use for single-day events like assassination)
 *
 *   intervalColor  → overrides the interval bar color
 *                    - "default"  (recommended; uses palette/theme)
 *                    - "#RRGGBB"
 *                    - "rgba(...)"
 *                    - "var(--gold)" etc.
 *
 *   lineLength     → OPTIONAL portrait spacing override (pixels)
 *
 *                    Controls the distance between the portrait
 *                    and the timeline (or reign bar).
 *
 *                    IMPORTANT:
 *                    This does NOT directly change the connector line.
 *                    Instead, it repositions the portrait so that the
 *                    connector becomes exactly this length.
 *
 *                    How it works:
 *                      Above lane  → portrait bottom sits L pixels ABOVE timeline
 *                      Below lane  → portrait top sits L pixels BELOW timeline
 *
 *                    Default behavior:
 *                      90 / undefined → uses standard CSS spacing
 *                      (the normal symmetrical layout)
 *
 *                    Example values:
 *                      90   = closer to timeline
 *                      120  = standard default look
 *                      150  = farther from timeline
 *                      180+ = dramatic stagger (use sparingly)
 *
 *                    Avoid:
 *                      < 60   (crowded look)
 *                      > 240  (detached look)
 *
 *                    Example usage:
 *                      lineLength: 150
 * ------------------------------------------------------------
 * CONTEXT EVENTS
 * ------------------------------------------------------------
 * contextEvents show as small dotted tags (no portraits).
 * Use these for “big timeline markers” like:
 *   • Empire begins
 *   • Western Empire falls
 *
 * ============================================================
 */

window.TIMELINE_CONFIG = {

  // ============================================================
  // DESIGNER DEFAULT VIEW (OPTIONAL)
  // ============================================================
  // If hasDefault is true, the Timeline View dropdown includes "(default)" as the FIRST option.
  // That "(default)" view shows:
  //    defaultIntervalAmount × defaultInterval
  //
  // Example:
  //   defaultInterval: "decade"
  //   defaultIntervalAmount: 1.5
  // → field of view is ~15 years.
  //
  // Ticks follow existing logic: one step smaller than the interval.
  // (decade → year, century → decade, year → month, month → day)
  hasDefault: false,
  defaultInterval: "decade",
  defaultIntervalAmount: .1,

  // If hasDefault is true, you can set this to "default" to start in that view.
  // If hasDefault is false, use "day/month/year/decade/century/fit" like before.
  defaultZoom: "yeart",

  // If an END date is written as a year-only number (example: end: 476),
  // choose what day of that year it means.
  numericYearEndMode: "endOfYear",

  range: {
    begin: "1769-01-01",
    end:   "1784-12-31"
  },

  // Timeline View options shown to the user (in this topic).
  // NOTE: We removed "fit" here because you asked to replace the Full Timeline option with "(default)".
  // If you ever want "Full Timeline" back for a topic, add "fit" here.
  zoomLevels: [
    	"year",
 	"decade"
  ],

  pxPerDay: {
    day:     18,
    month:   3.0,
    year:    0.55,
    decade:  0.12,
    century: 0.03
  },

  theme: {
    bg:        "#12060a",
    bg2:       "#0b0507",
    gold:      "#FFD84A",
    gold2:     "#f2c94c",
    red:       "#b3122a",
    red2:      "#7b0b1d",
    intervalA: "rgba(255,216,74,18)",
    intervalB: "rgba(179,18,42,18)",
    markerText:"rgba(255,216,74,95)"
  },

  // Default bar color palette (used when intervalColor === "default")
  barColors: [
    "#FFD84A",
    "#B3122A",
    "#F2C94C",
    "#7B0B1D",
    "#E9B949",
    "#9E0F26"
  ],

  contextEvents: [

    {
      id:    "declaration_of_independence",
      date:  "1776-07-04",
      label: "Declaration of Independence July 4, 1776"
    },

    {
      id:    "treaty_of_paris",
      date:  "1783-09-03",
      label: "Treaty of Paris Signed - September 3, 1783"
    },

    
  ],

  events: [

    {
      id:           "lexington_concord",
      label:        "Lexington & Concord",
      dateLabel:    "April 19, 1775",
      start:        "1775-04-19",
      end:          "1775-04-20",
      anchor:       "1775-04-19",
      image:        "images/lexcon_timeline.webp",
      href:         "battles/lexington-concord.html",
      side:         "above",

      // New per-event options:
      // Caesar is a single-day event, so we do NOT show an interval bar.
      showInterval: false,
      intervalColor:"default",
      lineLength:   90
    },

    {
      id:           "bunker_hill",
      label:        "Bunker Hill",
      dateLabel:    "June 17, 1775",
      start:        "1775-06-17",
      end:          "1775-06-18",
      anchor:       "1775-06-17",
      image:        "images/bunkerhill_timeline.webp",
      href:         "battles/bunker-hill.html",
      side:         "above",

      showInterval: false,
      intervalColor:"default",
      lineLength:   90
    },

    {
      id:           "fort_ticonderoga",
      label:        "Fort Ticonderoga",
      dateLabel:    "May 10, 1775",
      start:        "1775-05-10",
      end:          "1775-05-10",
      anchor:       "1775-05-10",
      image:        "images/ticonderoga_timeline.webp",
      href:         "battles/fort-ticonderoga.html",
      side:         "below",

      showInterval: false,
      intervalColor:"default",
      lineLength:   90
    },

    {
      id:           "long_island",
      label:        "Long Island",
      dateLabel:    "Aug. 27, 1776",
      start:        "1776-08-27",
      end:          "1776-08-27",
      anchor:       "1776-08-27",
      image:        "images/longisland_timeline.webp",
      href:         "battles/long-island.html",
      side:         "below",

      showInterval: false,
      intervalColor:"default",
      lineLength:   90
    },

    {
      id:           "harlem_heights",
      label:        "Harlem Heights",
      dateLabel:    "Sept. 16, 1776",
      start:        "1776-09-16",
      end:          "1776-09-16",
      anchor:       "1776-09-16",
      image:        "images/harlemheights_timeline.webp",
      href:         "battles/harlem-heights.html",
      side:         "above",

      showInterval: false,
      intervalColor:"default",
      lineLength:   90
    },

    {
      id:           "trenton",
      label:        "Trenton",
      dateLabel:    "Dec. 26, 1776",
      start:        "1776-12-26",
      end:          "1776-12-26",
      anchor:       "1776-12-26",
      image:        "images/trenton_timeline.webp",
      href:         "battles/trenton.html",
      side:         "below",

      showInterval: false,
      intervalColor:"default",
      lineLength:   90
    },

    {
      id:           "saratoga",
      label:        "Saratoga",
      dateLabel:    "Sep. 19-Oct. 14, 1777",
      start:        "1777-09-19",
      end:          "1777-10-14",
      anchor:       "1777-10-01",
      image:        "images/saratoga_timeline.webp",
      href:         "battles/saratoga.html",
      side:         "above",

      showInterval: true,
      intervalColor:"default",
      lineLength:   90
    },

    {
      id:           "yorktown",
      label:        "Yorktown",
      dateLabel:    "Sep. 28-Oct. 19, 1781",
      start:        "1781-09-28",
      end:          "1781-10-19",
      anchor:       "1781-10-08",
      image:        "images/yorktown_timeline.webp",
      href:         "battles/yorktown.html",
      side:         "below",

      showInterval: true,
      intervalColor:"default",
      lineLength:   90
    },

   

  ]
};



/**
 * ============================================================
 * EMBEDDING INSTRUCTIONS (COPY/PASTE)
 * ============================================================
 *
 * ✅ Recommended universal embed (works from ANY page):
 *
 * <section class="timeline-embed" aria-label="Timeline">
 *   <iframe
 *     src="/timeline/timeline.html?topic=/6/RomanEmperors"
 *     class="timeline-frame"
 *     loading="lazy"
 *     title="Timeline"
 *     frameborder="0"
 *   ></iframe>
 * </section>
 *
 * 1) Change ONLY the topic path:
 *    topic=/6/RomanEmperors  →  topic=/6/NewTopicFolder
 *
 * 2) Required file location:
 *    /6/NewTopicFolder/timeline-config.js
 *
 * 3) Paths inside events (image/href):
 *    - Use topic-relative paths like "images/timeline/pic.jpg" or "pages/event.html"
 *    - Leading "/" makes it site-absolute
 *
 * Note:
 * - If you omit ?topic=..., the timeline defaults to "/6/RomanEmperors".
 */