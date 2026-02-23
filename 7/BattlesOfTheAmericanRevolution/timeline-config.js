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
 *   lineLength     → OPTIONAL connector length override (pixels)
 *                    - null means "use the default spacing"
 *
 *                    Reasonable values (pixels):
 *                      100–115  subtle shorter line
 *                      120      recommended default baseline
 *                      130–150  slightly longer
 *                      160–200  strong stagger (use sparingly)
 *
 *                    Avoid:
 *                      < 80   (crowded)
 *                      > 240  (detached)
 *
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
  hasDefault: true,
  defaultInterval: "decade",
  defaultIntervalAmount: 1.5,

  // If hasDefault is true, you can set this to "default" to start in that view.
  // If hasDefault is false, use "day/month/year/decade/century/fit" like before.
  defaultZoom: "default",

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
      dateLabel:    "April 19-20, 1775",
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
      lineLength:   null
    },

    {
      id:           "augustus",
      label:        "Augustus",
      dateLabel:    "27 BCE–14 CE",
      start:        "-0027-01-16",
      end:          "0014-08-19",
      anchor:       "-0027-01-16",
      image:        "images/timeline/augustus_timeline.jpg",
      href:         "emperors/augustus.html",
      side:         "below",

      showInterval: true,
      intervalColor:"default",
      lineLength:   null
    },

    {
      id:           "tiberius",
      label:        "Tiberius",
      dateLabel:    "14–37 CE",
      start:        "0014-09-17",
      end:          "0037-03-16",
      anchor:       "0014-09-17",
      image:        "images/timeline/tiberius_timeline.jpg",
      href:         "emperors/tiberius.html",
      side:         "above",

      showInterval: true,
      intervalColor:"default",
      lineLength:   null
    },

    {
      id:           "caligula",
      label:        "Caligula",
      dateLabel:    "37–41 CE",
      start:        "0037-03-16",
      end:          "0041-01-24",
      anchor:       "0037-03-16",
      image:        "images/timeline/caligula_timeline.jpg",
      href:         "emperors/caligula.html",
      side:         "below",

      showInterval: true,
      intervalColor:"default",
      lineLength:   null
    },

    {
      id:           "claudius",
      label:        "Claudius",
      dateLabel:    "41–54 CE",
      start:        "0041-01-24",
      end:          "0054-10-13",
      anchor:       "0041-01-24",
      image:        "images/timeline/claudius_timeline.jpg",
      href:         "emperors/claudius.html",
      side:         "above",

      showInterval: true,
      intervalColor:"default",
      lineLength:   null
    },

    {
      id:           "nero",
      label:        "Nero",
      dateLabel:    "54–68 CE",
      start:        "0054-10-13",
      end:          "0068-06-09",
      anchor:       "0054-10-13",
      image:        "images/timeline/nero_timeline.jpg",
      href:         "emperors/nero.html",
      side:         "below",

      showInterval: true,
      intervalColor:"default",
      lineLength:   null
    },

    {
      id:           "trajan",
      label:        "Trajan",
      dateLabel:    "98–117 CE",
      start:        "0098-01-28",
      end:          "0117-08-09",
      anchor:       "0098-01-28",
      image:        "images/timeline/trajan_timeline.jpg",
      href:         "emperors/trajan.html",
      side:         "above",

      showInterval: true,
      intervalColor:"default",
      lineLength:   null
    },

    {
      id:           "hadrian",
      label:        "Hadrian",
      dateLabel:    "117–138 CE",
      start:        "0117-08-11",
      end:          "0138-07-10",
      anchor:       "0117-08-11",
      image:        "images/timeline/hadrian_timeline.jpg",
      href:         "emperors/hadrian.html",
      side:         "below",

      showInterval: true,
      intervalColor:"default",
      lineLength:   null
    },

    {
      id:           "marcus_aurelius",
      label:        "Marcus Aurelius",
      dateLabel:    "161–180 CE",
      start:        "0161-03-07",
      end:          "0180-03-17",
      anchor:       "0161-03-07",
      image:        "images/timeline/marcusaurelius_timeline.jpg",
      href:         "emperors/marcus-aurelius.html",
      side:         "above",

      showInterval: true,
      intervalColor:"default",
      lineLength:   null
    },

    {
      id:           "commodus",
      label:        "Commodus",
      dateLabel:    "180–192 CE",
      // Using sole reign start (after Marcus Aurelius' death)
      start:        "0180-03-17",
      end:          "0192-12-31",
      anchor:       "0180-03-17",
      image:        "images/timeline/commodus_timeline.jpg",
      href:         "emperors/commodus.html",
      side:         "below",

      showInterval: true,
      intervalColor:"default",
      lineLength:   null
    },

    {
      id:           "diocletian",
      label:        "Diocletian",
      dateLabel:    "284–305 CE",
      start:        "0284-11-20",
      end:          "0305-05-01",
      anchor:       "0284-11-20",
      image:        "images/timeline/diocletian_timeline.jpg",
      href:         "emperors/diocletian.html",
      side:         "above",

      showInterval: true,
      intervalColor:"default",
      lineLength:   null
    },

    {
      id:           "constantine",
      label:        "Constantine",
      dateLabel:    "306–337 CE",
      start:        "0306-07-25",
      end:          "0337-05-22",
      anchor:       "0306-07-25",
      image:        "images/timeline/constantine_timeline.jpg",
      href:         "emperors/constantine.html",
      side:         "below",

      showInterval: true,
      intervalColor:"default",
      lineLength:   null
    },

    {
      id:           "theodosius",
      label:        "Theodosius I",
      dateLabel:    "379–395 CE",
      start:        "0379-01-19",
      end:          "0395-01-17",
      anchor:       "0379-01-19",
      image:        "images/timeline/theodosiusi_timeline.jpg",
      href:         "emperors/theodosius.html",
      side:         "above",

      showInterval: true,
      intervalColor:"default",
      lineLength:   null
    },

    {
      id:           "romulus_augustulus",
      label:        "Romulus Augustulus",
      dateLabel:    "475–476 CE",
      start:        "0475-10-31",
      end:          "0476-09-04",
      anchor:       "0475-10-31",
      image:        "images/timeline/romulusaugustulus_timeline.jpg",
      href:         "emperors/romulus-augustulus.html",
      side:         "below",

      showInterval: true,
      intervalColor:"default",
      lineLength:   null
    }

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