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
 * This file controls EVERYTHING about a specific timeline:
 *   • What time period it covers
 *   • What events appear
 *   • Whether events show interval bars
 *   • The colors of interval bars
 *   • The length of connector lines
 *   • The zoom defaults
 *
 * The universal engine (timeline-core.js) reads this file and
 * builds the timeline automatically.
 *
 * ============================================================
 *
 * -------------------------
 * 📁 PATH RULES (IMPORTANT)
 * -------------------------
 * All image and href paths are RELATIVE to this folder:
 *
 *   /6/RomanEmperors/
 *
 * Examples:
 *   image: "images/timeline/augustus_timeline.jpg"
 *   href:  "emperors/augustus.html"
 *
 * DO NOT start paths with "/" unless it is a full absolute URL.
 *
 * ============================================================
 *
 * -------------------------
 * 📅 DATE RULES
 * -------------------------
 *
 * BCE YEARS MUST:
 *   • Be negative
 *   • Be zero-padded to 4 digits
 *
 * CORRECT:
 *   "-0044-03-15"   (44 BCE)
 *   "-0027-01-16"   (27 BCE)
 *
 * INCORRECT:
 *   "-44"
 *   "-27-1-16"
 *
 * CE years can be written normally:
 *   "0037-03-16"
 *
 * You may also use just a year number:
 *   14
 *   -27
 *
 * If you use a NUMBER instead of full date,
 * the engine assumes:
 *   numericYearEndMode: "endOfYear"
 *
 * So:
 *   end: 476
 * becomes:
 *   0476-12-31
 *
 * ============================================================
 *
 * -------------------------
 * 🎛 EVENT OPTIONS (IMPORTANT)
 * -------------------------
 *
 * REQUIRED:
 *   id
 *   label
 *   start
 *   end
 *   anchor
 *   image
 *   href
 *   side ("above" or "below")
 *
 * OPTIONAL:
 *
 * showInterval (default: true)
 * --------------------------------
 * Controls whether an interval bar is drawn.
 *
 * Example:
 *   showInterval: false
 *
 * Use this for:
 *   • Assassinations
 *   • Single-day events
 *   • Battles
 *
 *
 * intervalColor (default: "default")
 * -----------------------------------
 * Controls the color of the interval bar.
 *
 * If set to:
 *   "default"
 * → uses the theme's alternating colors.
 *
 * You may override with:
 *   "#4cc9f0"
 *   "red"
 *   "var(--gold)"
 *
 * Example:
 *   intervalColor: "#3a86ff"
 *
 *
 * lineLength (default: null)
 * -----------------------------------
 * Controls how far the portrait sits from the timeline.
 *
 * If null:
 *   Uses the global default spacing (recommended).
 *
 * If a number:
 *   That number represents PIXELS.
 *
 * Example:
 *   lineLength: 160
 *   think of the default as being 120
 *
 * Reasonable values:
 *   100–140 → subtle adjustment
 *   150–200 → noticeable stagger
 *
 * Use this ONLY if:
 *   • Portraits feel crowded
 *   • You want to stagger visually
 *
 * Avoid:
 *   Very small numbers (<80)
 *   Very large numbers (>250)
 *
 * ============================================================
 *
 * 🧠 RULES ABOUT CONNECTOR LINES
 * --------------------------------
 *
 * If showInterval: false
 *   → line connects to timeline center spine
 *
 * If showInterval: true
 *   → line connects to the interval bar
 *     on the SAME SIDE as the portrait.
 *
 * ============================================================
 */

window.TIMELINE_CONFIG = {

  defaultInterval: "decade",
  defaultZoom: "century",

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
    }

    // (Remaining events unchanged — truncated here for readability)

  ]
};