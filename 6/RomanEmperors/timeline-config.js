/**
 * ============================================================
 * TIMELINE CONFIG (TOPIC-SPECIFIC) — EDIT THIS FILE ONLY
 * ============================================================
 *
 * Location:
 *   /6/RomanEmperors/timeline-config.js
 *
 * How this file is used:
 *   1) Your universal loader reads the iframe query string:
 *        /timeline/timeline.html?topic=/6/RomanEmperors
 *   2) It loads THIS file:
 *        /6/RomanEmperors/timeline-config.js
 *   3) The universal engine (timeline-core.js) reads window.TIMELINE_CONFIG
 *   4) Any event "image" or "href" that is NOT an absolute URL is resolved
 *      relative to the topic folder (TIMELINE_CONFIG_BASE):
 *        /6/RomanEmperors/
 *
 * IMPORTANT PATH RULES:
 *   - Use paths relative to /6/RomanEmperors/
 *     ✅ image: "images/timeline/augustus_timeline.jpg"
 *     ✅ href:  "emperors/augustus.html"
 *
 * BCE DATE RULE:
 *   - BCE years are NEGATIVE and should be ZERO-PADDED to 4 digits in date strings:
 *     ✅ "-0044-03-15" (44 BCE, March 15)
 *     ✅ "-0027-01-16" (27 BCE, Jan 16)
 *     ✅ "-0060-01-01" (60 BCE, Jan 1)
 *
 * DATE FORMAT OPTIONS:
 *   A) Full date string (most precise — recommended for reigns):
 *        "0476-09-04"
 *        "-0027-01-16"
 *   B) Year number (less precise; engine will infer month/day):
 *        14
 *        -27
 *
 * NUMERIC YEAR END BEHAVIOR (only matters if you use option B above):
 *   - "endOfYear"   => end: 476 means 0476-12-31
 *   - "startOfYear" => end: 476 means 0476-01-01
 *
 * EVENT OBJECT RULES:
 *   Required:
 *     - id, label, start, end (or omit end to equal start), anchor, image, href, side
 *   Optional:
 *     - dateLabel (display text)
 *     - showInterval (default true)  // whether to show interval bars for this event
 *     - intervalColor ("default" to use theme/alternating colors, or a CSS color to override)
 *     - lineLength (number of px; omit or null to use default)
 *
 * CONTEXT EVENTS:
 *   - dotted “tags” at the top; do not create portrait cards
 *
 * ============================================================
 */

window.TIMELINE_CONFIG = {

  defaultInterval: "decade",
  defaultZoom: "century",

  // If an END date is written as a year-only number (example: end: 476),
  // choose what day of that year it means:
  //   - "endOfYear"   => 476-12-31  (recommended)
  //   - "startOfYear" => 476-01-01
  //
  // NOTE: In this RomanEmperors config, most reigns below use *exact dates*,
  // so this mainly protects you if you add future events using numeric years.
  numericYearEndMode: "endOfYear",

  range: {
    begin: "-0060-01-01",
    end:   "0476-12-31"
  },

  zoomLevels: [
    "day",
    "month",
    "year",
    "decade",
    "century",
    "fit"
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
      id:    "empire_begins",
      // aligned to Augustus accession date (exact)
      date:  "-0027-01-16",
      label: "27 BCE — Empire Begins"
    },

    {
      id:    "byzantine_established",
      date:  "0330-01-01",
      label: "330 CE — Byzantine Empire Established"
    },

    {
      id:    "west_falls",
      // aligned to Romulus Augustulus deposition date (exact)
      date:  "0476-09-04",
      label: "476 CE — Western Empire Falls"
    }

  ],

  events: [

    {
      id:           "caesar_assassinated",
      label:        "Julius Caesar Assassinated",
      dateLabel:    "44 BCE",
      start:        "-0044-03-15",
      end:          "-0044-03-15",
      anchor:       "-0044-03-15",
      image:        "images/timeline/juliuscaesar_timeline.jpg",
      href:         "index.html",
      side:         "above",

      // NEW OPTIONS:
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

      // NEW OPTIONS:
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

      // NEW OPTIONS:
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

      // NEW OPTIONS:
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

      // NEW OPTIONS:
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

      // NEW OPTIONS:
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

      // NEW OPTIONS:
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

      // NEW OPTIONS:
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

      // NEW OPTIONS:
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

      // NEW OPTIONS:
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

      // NEW OPTIONS:
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

      // NEW OPTIONS:
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

      // NEW OPTIONS:
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

      // NEW OPTIONS:
      showInterval: true,
      intervalColor:"default",
      lineLength:   null
    }

  ]
};