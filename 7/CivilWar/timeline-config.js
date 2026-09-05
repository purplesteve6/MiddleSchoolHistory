window.TIMELINE_CONFIG = {
  hasDefault: true,
  defaultInterval: "decade",
  defaultIntervalAmount: 1,
  defaultZoom: "default",
  numericYearEndMode: "endOfYear",

  range: {
    begin: "1849-01-01",
    end:   "1865-12-31"
  },

  zoomLevels: ["year", "decade"],

  pxPerDay: {
    day: 18,
    month: 3.0,
    year: 0.55,
    decade: 0.12,
    century: 0.03
  },

  theme: {
    bg:        "#243B52",
    bg2:       "#16283A",
    gold:      "#6F91B0",
    gold2:     "#D9E1E7",
    red:       "#71808D",
    red2:      "#445563",
    bgOvalA:   "rgba(111,145,176,0.25)",
    bgOvalB:   "rgba(190,199,208,0.17)",
    vpOvalA:   "rgba(111,145,176,0.15)",
    vpOvalB:   "rgba(190,199,208,0.10)",
    intervalA: "rgba(111,145,176,0.18)",
    intervalB: "rgba(113,128,141,0.18)",
    markerText:"rgba(239,244,247,0.96)"
  },

  barColors: ["#6F91B0", "#71808D", "#A8B6C2", "#4D6E8D", "#5E6E7B"],

  contextEvents: [
    { id:"war_begins", date:"1861-04-12", label:"Civil War Begins • April 1861" },
    { id:"war_ends", date:"1865-04-09", label:"Lee Surrenders at Appomattox • April 1865" }
  ],

  events: [
    {
      id:"compromise_1850", label:"Compromise of 1850", dateLabel:"1850",
      start:"1850-09-18", end:"1850-09-18", anchor:"1850-09-18",
      href:"/7/CivilWar/road-to-war.html#compromise-1850", side:"above",
      showInterval:false, eventType:"LAW", lineLength:85
    },
    {
      id:"kansas_nebraska", label:"Kansas-Nebraska Act", dateLabel:"May 30, 1854",
      start:"1854-05-30", end:"1854-05-30", anchor:"1854-05-30",
      href:"/7/CivilWar/road-to-war.html#kansas-nebraska", side:"below",
      showInterval:false, eventType:"LAW", lineLength:90
    },
    {
      id:"bleeding_kansas", label:"Bleeding Kansas", dateLabel:"1855–1856",
      start:"1855-11-21", end:"1856-09-15", anchor:"1856-05-21",
      image:"/7/JohnBrown/images/bleeding-kansas.webp",
      href:"/7/JohnBrown/bleeding-kansas.html", side:"above",
      showInterval:true, intervalColor:"default", lineLength:115
    },
    {
      id:"dred_scott", label:"Dred Scott Decision", dateLabel:"March 6, 1857",
      start:"1857-03-06", end:"1857-03-06", anchor:"1857-03-06",
      image:"/7/JohnBrown/images/dred-scott.webp",
      href:"/7/CivilWar/road-to-war.html#dred-scott", side:"below",
      showInterval:false, eventType:"COURT", lineLength:95
    },
    {
      id:"missouri_liberation", label:"Missouri Liberation Raid", dateLabel:"Dec. 20, 1858",
      start:"1858-12-20", end:"1858-12-20", anchor:"1858-12-20",
      image:"/7/JohnBrown/images/missouri-raid.webp",
      href:"/7/JohnBrown/missouri-liberation.html", side:"above",
      showInterval:false, eventType:"RAID", lineLength:105
    },
    {
      id:"harpers_ferry", label:"Harpers Ferry Raid", dateLabel:"Oct. 16–18, 1859",
      start:"1859-10-16", end:"1859-10-18", anchor:"1859-10-17",
      image:"/7/JohnBrown/images/harpers-ferry.webp",
      href:"/7/JohnBrown/harpers-ferry.html", side:"above",
      showInterval:true, intervalColor:"default", lineLength:90
    },
    {
      id:"john_brown_execution", label:"John Brown Executed", dateLabel:"Dec. 2, 1859",
      start:"1859-12-02", end:"1859-12-02", anchor:"1859-12-02",
      image:"/7/JohnBrown/images/execution.webp",
      href:"/7/JohnBrown/trial-legacy.html", side:"below",
      showInterval:false, eventType:"EXECUTION", lineLength:165
    },
    {
      id:"election_1860", label:"Lincoln Elected", dateLabel:"Nov. 6, 1860",
      start:"1860-11-06", end:"1860-11-06", anchor:"1860-11-06",
      href:"/7/CivilWar/road-to-war.html#election-1860", side:"below",
      showInterval:false, eventType:"ELECTION", lineLength:90
    },
    {
      id:"secession", label:"South Carolina Secedes", dateLabel:"Dec. 20, 1860",
      start:"1860-12-20", end:"1860-12-20", anchor:"1860-12-20",
      href:"/7/CivilWar/road-to-war.html#secession", side:"above",
      showInterval:false, eventType:"SECESSION", lineLength:180
    },
    {
      id:"fort_sumter", label:"Fort Sumter", dateLabel:"April 12–13, 1861",
      start:"1861-04-12", end:"1861-04-13", anchor:"1861-04-12",
      href:"/7/CivilWar/war-at-a-glance.html#fort-sumter", side:"below",
      showInterval:true, intervalColor:"default", eventType:"BATTLE", lineLength:160
    },
    {
      id:"antietam", label:"Antietam", dateLabel:"Sept. 17, 1862",
      start:"1862-09-17", end:"1862-09-17", anchor:"1862-09-17",
      href:"/7/CivilWar/war-at-a-glance.html#antietam", side:"above",
      showInterval:false, eventType:"BATTLE", lineLength:85
    },
    {
      id:"emancipation", label:"Emancipation Proclamation", dateLabel:"Jan. 1, 1863",
      start:"1863-01-01", end:"1863-01-01", anchor:"1863-01-01",
      href:"/7/CivilWar/war-at-a-glance.html#emancipation", side:"below",
      showInterval:false, eventType:"PROCLAMATION", lineLength:170
    },
    {
      id:"gettysburg", label:"Gettysburg", dateLabel:"July 1–3, 1863",
      start:"1863-07-01", end:"1863-07-03", anchor:"1863-07-02",
      href:"/7/CivilWar/war-at-a-glance.html#gettysburg", side:"above",
      showInterval:true, intervalColor:"default", eventType:"BATTLE", lineLength:170
    },
    {
      id:"thirteenth_amendment", label:"13th Amendment Passes Congress", dateLabel:"Jan. 31, 1865",
      start:"1865-01-31", end:"1865-01-31", anchor:"1865-01-31",
      href:"/7/CivilWar/war-at-a-glance.html#thirteenth-amendment", side:"below",
      showInterval:false, eventType:"AMENDMENT", lineLength:90
    },
    {
      id:"appomattox", label:"Lee Surrenders", dateLabel:"April 9, 1865",
      start:"1865-04-09", end:"1865-04-09", anchor:"1865-04-09",
      href:"/7/CivilWar/war-at-a-glance.html#appomattox", side:"above",
      showInterval:false, eventType:"SURRENDER", lineLength:175
    },
    {
      id:"lincoln_assassination", label:"Lincoln Assassinated", dateLabel:"April 14, 1865",
      start:"1865-04-14", end:"1865-04-14", anchor:"1865-04-14",
      href:"/7/CivilWar/war-at-a-glance.html#lincoln-assassination", side:"below",
      showInterval:false, eventType:"ASSASSINATION", lineLength:220
    }
  ]
};
