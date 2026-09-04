export const chapters = [
  ["opening", "Prologue", "1769–1821"],
  ["rise", "An unlikely beginning", "1769–1798"],
  ["power", "The making of an emperor", "1799–1804"],
  ["campaigns", "Europe in motion", "1805–1809"],
  ["cost", "The price of empire", "1806–1811"],
  ["russia", "The road to Moscow", "1812"],
  ["fall", "The end of the empire", "1813–1821"],
  ["legacy", "An unfinished legacy", "Then → now"],
];
export const sources = [
  [
    "Fondation Napoléon",
    "Napoleon I: biographical chronology",
    "https://www.napoleon.org/histoire-des-2-empires/biographies/napoleon-ier-1769-1821-empereur/",
    "Early life and dated turning points.",
  ],
  [
    "Fondation Napoléon",
    "Timeline: Consulate / First French Empire",
    "https://www.napoleon.org/en/young-historians/napodoc/timeline-consulate1st-french-empire/",
    "Political chronology and continental campaigns.",
  ],
  [
    "National Army Museum",
    "The Peninsular War",
    "https://www.nam.ac.uk/explore/peninsular-war",
    "Iberian resistance and the coalition war.",
  ],
  [
    "National Army Museum",
    "The Battle of Waterloo",
    "https://www.nam.ac.uk/explore/battle-waterloo",
    "The 1815 campaign and the roles of Wellington and Blücher.",
  ],
  [
    "Fondation Napoléon · Irène Delage",
    "The French Civil Code: an overview",
    "https://www.napoleon.org/en/history-of-the-two-empires/articles/the-french-civil-code-or-code-civil-21-march-1804-an-overview/",
    "Codification, property and the legal subordination of women.",
  ],
  [
    "Fondation Napoléon",
    "The new Napoleonic institutions",
    "https://www.napoleon.org/en/young-historians/napodoc/les-masses-de-granit-de-nouvelles-institutions-napoleoniennes/",
    "The Bank of France, prefects, religion and education.",
  ],
  [
    "U.S. Department of State · Office of the Historian",
    "The United States and the Haitian Revolution, 1791–1804",
    "https://history.state.gov/milestones/1784-1800/haitian-rev",
    "Haitian agency, French reconquest and slavery. Archived educational essay.",
  ],
  [
    "Fondation Napoléon",
    "Napoleon and the restoration of slavery",
    "https://www.napoleon.org/wp-content/uploads/2020/12/pointhistoirenapoleonesclavage2020.pdf",
    "The 1802 colonial policy and its different applications.",
  ],
  [
    "Fondation Napoléon",
    "The Russian campaign: from the Niemen to Moscow",
    "https://www.napoleon.org/en/history-of-the-two-empires/timelines/napoleons-russian-campaign-from-the-niemen-to-moscow/",
    "Advance, geography and the search for a decisive battle.",
  ],
  [
    "Fondation Napoléon",
    "The Russian campaign: the retreat",
    "https://www.napoleon.org/en/history-of-the-two-empires/timelines/napoleons-russian-campaign-the-retreat/",
    "Retreat chronology and the multiple causes of collapse.",
  ],
  [
    "Oxford University Press · Michael Rowe",
    "The French Revolution, Napoleon, and Nationalism in Europe",
    "https://academic.oup.com/edited-volume/28170/chapter-abstract/213007791",
    "2013 chapter abstract; used for the interpretation of nationalism and resistance.",
  ],
  [
    "National Gallery of Art",
    "The Emperor Napoleon in His Study at the Tuileries",
    "https://www.nga.gov/artworks/46114-emperor-napoleon-his-study-tuileries",
    "Jacques-Louis David, 1812. Samuel H. Kress Collection, 1961.9.15. Public-domain open-access image.",
  ],
  [
    "Natural Earth / world-atlas",
    "Physical land, 1:110 million",
    "https://github.com/topojson/world-atlas",
    "Public-domain physical geography; modern political borders are deliberately omitted.",
  ],
  [
    "Fondation Napoléon",
    "The Russian campaign: the march to the Niemen",
    "https://www.napoleon.org/en/history-of-the-two-empires/timelines/napoleons-russian-campaign-the-march-to-the-niemen/",
    "Trade restrictions and the breakdown of the Franco-Russian alliance.",
  ],
];
export const cite = (...ids: number[]) =>
  `<span class="citations">${ids.map((id) => `<a href="#source-${id}" aria-label="Source ${id}">${String(id).padStart(2, "0")}</a>`).join("")}</span>`;
export type Place = {
  name: string;
  ll: [number, number];
  dx?: number;
  dy?: number;
};
export type Campaign = {
  id: string;
  date: string;
  name: string;
  short: string;
  description: string;
  places: Place[];
  routes: number[][][];
  source: number[];
};
const p = (name: string, x: number, y: number, dx = 9, dy = -10): Place => ({
  name,
  ll: [x, y],
  dx,
  dy,
});
export const campaigns: Campaign[] = [
  {
    id: "italy",
    date: "1796–97",
    name: "The Italian campaign",
    short: "Italy",
    description:
      "Victories over Piedmont-Sardinia and Austria made Bonaparte a national figure. Military success also meant occupation, requisitions and the removal of works of art.",
    places: [
      p("Nice", 7.26, 43.7, -37, 20),
      p("Milan", 9.19, 45.46, -18, -13),
      p("Arcole", 11.28, 45.36, 12, 18),
    ],
    routes: [
      [
        [7.26, 43.7],
        [7.7, 45.1],
        [9.19, 45.46],
        [11.28, 45.36],
      ],
    ],
    source: [1],
  },
  {
    id: "egypt",
    date: "1798–99",
    name: "Egypt and Syria",
    short: "Egypt",
    description:
      "An expedition aimed at British interests in the East became a military trap after Nelson destroyed the French fleet at the Nile. Scholarship accompanied an invasion; Napoleon left his army and returned to France in 1799.",
    places: [
      p("Toulon", 5.93, 43.12, -25, -13),
      p("Alexandria", 29.92, 31.2, -77, 24),
      p("Cairo", 31.24, 30.04, 10, 20),
      p("Acre", 35.08, 32.93),
    ],
    routes: [
      [
        [5.93, 43.12],
        [14.5, 35.9],
        [29.92, 31.2],
        [31.24, 30.04],
        [35.08, 32.93],
      ],
    ],
    source: [1, 2],
  },
  {
    id: "austerlitz",
    date: "1805",
    name: "Austerlitz & the limits of victory",
    short: "Austerlitz",
    description:
      "At Ulm and Austerlitz, Napoleon defeated Austrian and Russian forces. Yet Britain’s victory at Trafalgar secured its command of the seas. Dominance on land did not mean control of Europe.",
    places: [
      p("Paris", 2.35, 48.86, -36, -14),
      p("Ulm", 9.99, 48.4, -17, 24),
      p("Austerlitz", 16.88, 49.15, 10, -13),
      p("Trafalgar", -6.03, 36.18, 9, 22),
    ],
    routes: [
      [
        [2.35, 48.86],
        [9.99, 48.4],
        [16.37, 48.2],
        [16.88, 49.15],
      ],
    ],
    source: [2],
  },
  {
    id: "prussia",
    date: "1806–07",
    name: "The continent rearranged",
    short: "Prussia",
    description:
      "Jena and Auerstedt broke Prussian military power. After the bloody check at Eylau, victory at Friedland led to the Treaties of Tilsit. Napoleon reorganized states and placed relatives on European thrones.",
    places: [
      p("Jena / Auerstedt", 11.59, 50.93, -105, -15),
      p("Berlin", 13.4, 52.52, -18, -15),
      p("Eylau", 20.64, 54.39, -56, 26),
      p("Friedland", 21.02, 54.45, 10, -14),
      p("Tilsit", 21.88, 55.08, 16, -26),
    ],
    routes: [
      [
        [11.59, 50.93],
        [13.4, 52.52],
        [20.64, 54.39],
        [21.02, 54.45],
        [21.88, 55.08],
      ],
    ],
    source: [2],
  },
  {
    id: "iberia",
    date: "1808–14",
    name: "A war that would not end",
    short: "Iberia",
    description:
      "The occupation of Spain and installation of Joseph Bonaparte provoked revolt. Spanish and Portuguese resistance, guerrilla warfare and Wellington’s Anglo-Portuguese army turned Iberia into a sustained drain on the empire.",
    places: [
      p("Lisbon", -9.14, 38.72, -51, 23),
      p("Madrid", -3.7, 40.42, 10, 2),
      p("Vitoria", -2.67, 42.85, 10, -10),
    ],
    routes: [],
    source: [3],
  },
  {
    id: "wagram",
    date: "1809",
    name: "Victory, with less room to spare",
    short: "Austria",
    description:
      "Austria challenged Napoleon again. A setback at Aspern-Essling preceded victory at Wagram. The empire still expanded, but opposing armies were learning and repeated war demanded new recruits.",
    places: [
      p("Aspern-Essling", 16.48, 48.22, -116, 28),
      p("Wagram", 16.56, 48.3, 14, -13),
    ],
    routes: [],
    source: [2],
  },
  {
    id: "russia",
    date: "1812",
    name: "The invasion of Russia",
    short: "Russia",
    description:
      "Napoleon crossed the Niemen seeking a decisive settlement. The road through Smolensk and Borodino led to Moscow, but no peace. The return march destroyed the army as an effective fighting force.",
    places: [
      p("Niemen", 23.9, 54.9, -60, 22),
      p("Smolensk", 32.05, 54.78, -49, 23),
      p("Moscow", 37.62, 55.75, 11, -10),
    ],
    routes: [
      [
        [23.9, 54.9],
        [25.28, 54.69],
        [30.2, 55.19],
        [32.05, 54.78],
        [35.82, 55.53],
        [37.62, 55.75],
      ],
    ],
    source: [9, 10],
  },
  {
    id: "coalition",
    date: "1813–15",
    name: "The coalition closes in",
    short: "Defeat",
    description:
      "Defeat at Leipzig in 1813 was followed by invasion and abdication in 1814. Napoleon’s return from Elba in 1815 ended at Waterloo, against Wellington’s multinational army and Blücher’s Prussians.",
    places: [
      p("Leipzig", 12.37, 51.34, 10, -8),
      p("Paris", 2.35, 48.86, -35, 24),
      p("Waterloo", 4.4, 50.68, -76, -14),
      p("Elba", 10.33, 42.78, 10, 18),
    ],
    routes: [],
    source: [2, 4],
  },
];
export const timeline = [
  { year: 1769, title: "Born in Corsica", id: "rise" },
  { year: 1789, title: "Revolution", id: "rise" },
  { year: 1799, title: "First Consul", id: "power" },
  { year: 1804, title: "Emperor", id: "power" },
  { year: 1812, title: "Russia", id: "russia" },
  { year: 1815, title: "Waterloo", id: "fall" },
  { year: 1821, title: "Death in exile", id: "fall" },
];
export const legacies = [
  {
    name: "Law",
    date: "1804",
    origin: "Civil Code",
    inheritance: "The codified state",
    body: "A unified civil code protected property and equality before the law for men. Adopted and adapted abroad, it helped shape civil-law traditions beyond France.",
    tension:
      "The original code subordinated married women. Its survival has depended on extensive revision, including the rejection of that inequality.",
    source: [5],
  },
  {
    name: "Government",
    date: "1800",
    origin: "Prefects & administration",
    inheritance: "Central authority, locally present",
    body: "Appointed prefects connected the central government to the departments. Administrative coordination became a durable part of the French state.",
    tension:
      "Efficient administration also made surveillance, censorship and the enforcement of conscription easier. Capacity and accountability are different things.",
    source: [6],
  },
  {
    name: "Education",
    date: "1802",
    origin: "The lycées",
    inheritance: "A national educational structure",
    body: "State secondary schools trained boys for military and civil service. The lycée became an enduring institution, transformed by later access, curriculum and social reforms.",
    tension:
      "This was selective training for a male elite, not universal schooling. Its institutional descendants serve a very different society.",
    source: [6],
  },
  {
    name: "Economy",
    date: "1800–06",
    origin: "Bank & blockade",
    inheritance: "Finance as state power",
    body: "The Bank of France helped stabilize finance. The Continental System, by contrast, tried to make exclusion from trade a weapon against Britain.",
    tension:
      "Restrictions brought smuggling and hardship as well as protection for some producers. The empire could not make the continent a sealed market.",
    source: [6, 14],
  },
  {
    name: "Warfare",
    date: "1796–1815",
    origin: "Corps & mass mobilization",
    inheritance: "An enduring field of study",
    body: "Napoleon combined flexible corps, rapid concentration and the resources of a mobilized state. His campaigns became reference points for later military thinkers.",
    tension:
      "He developed practices with revolutionary and earlier roots. Operational success could not overcome every logistical, political or human constraint.",
    source: [2, 9, 10],
  },
  {
    name: "Nationalism",
    date: "1789–1815",
    origin: "Revolution & resistance",
    inheritance: "The nation as a political force",
    body: "French expansion spread institutions while provoking resistance to occupation. National language helped some opponents mobilize against imperial rule.",
    tension:
      "Neither nationalism nor later nation-states were Napoleon’s single-handed creation. Local loyalties, reformers and later conflicts shaped different outcomes.",
    source: [11],
  },
  {
    name: "Borders",
    date: "1806–15",
    origin: "Consolidation & settlement",
    inheritance: "Europe after empire",
    body: "Napoleonic reorganization ended the Holy Roman Empire and consolidated German territories. The settlement at Vienna reshaped Europe after his defeat.",
    tension:
      "The 1815 settlement did not simply restore every old border, and today’s map was not drawn by Napoleon. Further revolutions and wars transformed it.",
    source: [2],
  },
];
