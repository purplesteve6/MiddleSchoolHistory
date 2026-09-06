window.TIMELINE_CONFIG = {
  "hasDefault": true,
  "defaultInterval": "year",
  "defaultIntervalAmount": 1.4,
  "defaultZoom": "default",
  "numericYearEndMode": "endOfYear",
  "range": {
    "begin": "1861-01-01",
    "end": "1865-06-30"
  },
  "zoomLevels": [
    "year",
    "decade"
  ],
  "pxPerDay": {
    "day": 18,
    "month": 3.0,
    "year": 0.7,
    "decade": 0.14,
    "century": 0.03
  },
  "theme": {
    "bg": "#243B52",
    "bg2": "#182A3A",
    "gold": "#6F91B0",
    "gold2": "#D9E1E7",
    "red": "#7B8084",
    "red2": "#4A5055",
    "bgOvalA": "rgba(65,101,132,0.26)",
    "bgOvalB": "rgba(145,149,153,0.20)",
    "vpOvalA": "rgba(65,101,132,0.16)",
    "vpOvalB": "rgba(145,149,153,0.12)",
    "intervalA": "rgba(65,101,132,0.20)",
    "intervalB": "rgba(110,115,120,0.20)",
    "markerText": "rgba(245,248,250,0.97)"
  },
  "barColors": [
    "#416584",
    "#6E7479",
    "#7E9DB7",
    "#4C5359",
    "#9BA9B4"
  ],
  "contextEvents": [
    {
      "id": "emancipation",
      "date": "1863-01-01",
      "label": "Emancipation Proclamation \u2022 Jan. 1, 1863"
    },
    {
      "id": "reelection",
      "date": "1864-11-08",
      "label": "Lincoln Reelected \u2022 Nov. 8, 1864"
    }
  ],
  "events": [
    {
      "id": "fort_sumter",
      "label": "Fort Sumter",
      "dateLabel": "April 12\u201313, 1861",
      "start": "1861-04-12",
      "end": "1861-04-13",
      "anchor": "1861-04-12",
      "href": "battles/fort-sumter.html",
      "side": "below",
      "showInterval": true,
      "intervalColor": "default",
      "eventType": "BATTLE",
      "lineLength": 85
    },
    {
      "id": "first_bull_run",
      "label": "Bull Run",
      "dateLabel": "July 21, 1861",
      "start": "1861-07-21",
      "end": "1861-07-21",
      "anchor": "1861-07-21",
      "href": "battles/first-bull-run.html",
      "side": "above",
      "showInterval": false,
      "intervalColor": "default",
      "eventType": "BATTLE",
      "lineLength": 110
    },
    {
      "id": "hampton_roads",
      "label": "Hampton Roads",
      "dateLabel": "March 8\u20139, 1862",
      "start": "1862-03-08",
      "end": "1862-03-09",
      "anchor": "1862-03-09",
      "href": "battles/hampton-roads.html",
      "side": "below",
      "showInterval": true,
      "intervalColor": "default",
      "eventType": "NAVAL",
      "lineLength": 135
    },
    {
      "id": "shiloh",
      "label": "Shiloh",
      "dateLabel": "April 6\u20137, 1862",
      "start": "1862-04-06",
      "end": "1862-04-07",
      "anchor": "1862-04-06",
      "href": "battles/shiloh.html",
      "side": "above",
      "showInterval": true,
      "intervalColor": "default",
      "eventType": "BATTLE",
      "lineLength": 160
    },
    {
      "id": "antietam",
      "label": "Antietam",
      "dateLabel": "September 17, 1862",
      "start": "1862-09-17",
      "end": "1862-09-17",
      "anchor": "1862-09-17",
      "href": "battles/antietam.html",
      "side": "below",
      "showInterval": false,
      "intervalColor": "default",
      "eventType": "BATTLE",
      "lineLength": 85
    },
    {
      "id": "fredericksburg",
      "label": "Fredericksburg",
      "dateLabel": "December 11\u201315, 1862",
      "start": "1862-12-11",
      "end": "1862-12-15",
      "anchor": "1862-12-13",
      "href": "battles/fredericksburg.html",
      "side": "above",
      "showInterval": true,
      "intervalColor": "default",
      "eventType": "BATTLE",
      "lineLength": 110
    },
    {
      "id": "chancellorsville",
      "label": "Chancellorsville",
      "dateLabel": "April 30\u2013May 6, 1863",
      "start": "1863-04-30",
      "end": "1863-05-06",
      "anchor": "1863-05-03",
      "href": "battles/chancellorsville.html",
      "side": "below",
      "showInterval": true,
      "intervalColor": "default",
      "eventType": "BATTLE",
      "lineLength": 135
    },
    {
      "id": "gettysburg",
      "label": "Gettysburg",
      "dateLabel": "July 1\u20133, 1863",
      "start": "1863-07-01",
      "end": "1863-07-03",
      "anchor": "1863-07-02",
      "href": "battles/gettysburg.html",
      "side": "above",
      "showInterval": true,
      "intervalColor": "default",
      "eventType": "BATTLE",
      "lineLength": 160
    },
    {
      "id": "vicksburg",
      "label": "Vicksburg",
      "dateLabel": "May 18\u2013July 4, 1863",
      "start": "1863-05-18",
      "end": "1863-07-04",
      "anchor": "1863-06-10",
      "href": "battles/vicksburg.html",
      "side": "below",
      "showInterval": true,
      "intervalColor": "default",
      "eventType": "SIEGE",
      "lineLength": 85
    },
    {
      "id": "wilderness_spotsylvania",
      "label": "Wilderness / Spotsylvania",
      "dateLabel": "May 5\u201321, 1864",
      "start": "1864-05-05",
      "end": "1864-05-21",
      "anchor": "1864-05-13",
      "href": "battles/wilderness-spotsylvania.html",
      "side": "above",
      "showInterval": true,
      "intervalColor": "default",
      "eventType": "CAMPAIGN",
      "lineLength": 110
    },
    {
      "id": "atlanta_march",
      "label": "Atlanta / March",
      "dateLabel": "May\u2013December 1864",
      "start": "1864-05-07",
      "end": "1864-12-21",
      "anchor": "1864-09-02",
      "href": "battles/atlanta-march.html",
      "side": "below",
      "showInterval": true,
      "intervalColor": "default",
      "eventType": "CAMPAIGN",
      "lineLength": 135
    },
    {
      "id": "appomattox",
      "label": "Appomattox",
      "dateLabel": "April 9, 1865",
      "start": "1865-04-09",
      "end": "1865-04-09",
      "anchor": "1865-04-09",
      "href": "battles/appomattox.html",
      "side": "above",
      "showInterval": false,
      "intervalColor": "default",
      "eventType": "SURRENDER",
      "lineLength": 160
    }
  ]
};
