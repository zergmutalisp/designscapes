import "@fontsource/cormorant-garamond/latin-400.css";
import "@fontsource/cormorant-garamond/latin-400-italic.css";
import "@fontsource/cormorant-garamond/latin-500.css";
import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-500.css";
import "./style.css";
import { campaigns, chapters, cite, legacies, sources, timeline } from "./data";
import { renderMap, renderRussia } from "./maps";
const q = <T extends HTMLElement = HTMLElement>(selector: string) =>
  document.querySelector<T>(selector)!;
const all = <T extends HTMLElement = HTMLElement>(selector: string) => [
  ...document.querySelectorAll<T>(selector),
];
const chapter = (n: string, date: string) =>
  `<div class="eyebrow chapter-kicker"><span>${n}</span><span>${date}</span></div>`;
q("#app").innerHTML = `
<a class="skip-link" href="#rise">Skip to the story</a>
<header class="site-header"><a href="#opening" class="wordmark" aria-label="Napoleon, back to beginning"><span class="monogram">N</span><span>NAPOLEON<small>AN UNFINISHED LEGACY</small></span></a><div class="header-right"><span id="current-chapter" class="eyebrow">PROLOGUE</span><button class="contents-trigger" aria-expanded="false" aria-controls="contents-dialog"><span>Contents</span><span aria-hidden="true" class="menu-glyph">+</span></button></div><div class="progress-track" role="progressbar" aria-label="Reading progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><div id="progress-fill"></div></div></header>
<dialog id="contents-dialog" aria-labelledby="contents-title"><div class="contents-top"><span class="eyebrow">THE EXHIBITION</span><button class="close-contents" aria-label="Close contents">×</button></div><h2 id="contents-title">A life. An empire.<br><em>An afterlife.</em></h2><nav aria-label="Chapters"><ol>${chapters.map(([id, name, date], i) => `<li><a href="#${id}"><span class="nav-num">${String(i).padStart(2, "0")}</span><span>${name}</span><small>${date}</small></a></li>`).join("")}</ol></nav><a class="sources-jump" href="#sources">Sources & methodology <span aria-hidden="true">↗</span></a><a class="collection-jump" href="https://zergmutalisp.github.io/designscapes/">← Back to Designscapes</a></dialog>
<nav class="chapter-rail" aria-label="Quick chapter navigation">${chapters.map(([id, name], i) => `<a href="#${id}" aria-label="${name}" data-chapter="${id}"><span>${String(i).padStart(2, "0")} — ${name}</span></a>`).join("")}</nav>
<main>
<section id="opening" class="hero" data-chapter-name="Prologue" aria-labelledby="hero-title"><div class="hero-art"><img src="${import.meta.env.BASE_URL}assets/napoleon-david.jpg" alt="Jacques-Louis David’s portrait of Napoleon in his study, wearing a military uniform with his hand tucked into his waistcoat." width="1200" height="1956" fetchpriority="high"/></div><div class="hero-content"><p class="eyebrow hero-eyebrow">1769 — 1821 <span>•</span> AN INTERACTIVE HISTORY</p><h1 id="hero-title">Napoleon<span>Bonaparte</span></h1><p class="hero-deck">He remade Europe.<br><em>The world is still reckoning with it.</em></p><p class="hero-intro">From the promise of revolution to the machinery of empire. A story of ambition, upheaval and an unfinished legacy.</p><a class="begin-link" href="#rise"><span class="down-arrow" aria-hidden="true">↓</span> Enter the story <span class="read-time">ABOUT 10 MIN</span></a></div><div class="hero-bottom"><span class="eyebrow">SOLDIER / EMPEROR / EXILE</span><a href="#source-12">J.-L. David, 1812 · Detail <span aria-hidden="true">↗</span></a></div></section>
<section id="rise" class="section rise" data-chapter-name="An unlikely beginning" aria-labelledby="rise-title"><div class="section-heading">${chapter("01", "1769 — 1798")}<h2 id="rise-title">Before the empire,<br><em>an outsider.</em></h2></div><div class="rise-layout"><div class="date-monument" aria-hidden="true">17<span>69</span><small>AJACCIO, CORSICA</small></div><div class="prose"><p class="lead">Born on an island newly under French rule, Napoleon arrived in mainland France as a scholarship pupil with a Corsican accent and a place in the minor nobility.</p><p>He trained as an artillery officer. The Revolution of 1789 broke apart the old order—and opened paths through it. At Toulon in 1793, his role in recapturing the port won him promotion to brigadier general.</p><p>In 1795, he helped crush a royalist uprising in Paris. In Italy in 1796–97, victories made him famous. The young general was learning that a reputation could travel faster than an army. ${cite(1)}</p><aside class="margin-note"><span class="eyebrow">1798 · BEYOND EUROPE</span><p>The invasion of Egypt joined military ambition to scientific study. Nelson’s destruction of the French fleet exposed its fragility. Napoleon returned to France in 1799, leaving his soldiers behind. ${cite(1, 2)}</p></aside></div></div><div class="timeline-heading"><span class="eyebrow">A LIFE IN SEVEN MOMENTS</span><span>Explore the chronology ↘</span></div><ol class="life-timeline" aria-label="Selected events in Napoleon’s life, positioned by year">${timeline.map((d, i) => `<li style="--year:${((d.year - 1769) / 52) * 100}%;--row:${i % 2}"><a href="#${d.id}"><time>${d.year}</time><span>${d.title}</span></a></li>`).join("")}</ol><p class="figure-note timeline-note">Selected milestones. Desktop positions follow a linear year scale; mobile presents the same events in chronological order.</p></section>
<section id="power" class="section power" data-chapter-name="The making of an emperor" aria-labelledby="power-title"><div class="section-heading">${chapter("02", "1799 — 1804")}<h2 id="power-title">The revolution<br><em>acquires a crown.</em></h2></div><div class="power-layout"><div class="power-ladder" aria-label="Napoleon’s ascent to power"><div><time>1799</time><h3>First Consul</h3><p>The coup of 18–19 Brumaire ends the Directory.</p></div><div><time>1802</time><h3>Consul for life</h3><p>A plebiscite ratifies a new concentration of power.</p></div><div><time>1804</time><h3>Emperor</h3><p>Hereditary rule returns. On 2 December, Napoleon crowns himself.</p></div></div><div class="prose"><p class="lead">He offered a country exhausted by upheaval the promise of order. He made himself indispensable to it.</p><p>As First Consul, Napoleon centralized administration, strengthened public finances and reconciled the state with the Catholic Church. Prefects and new schools helped bind the country to Paris. ${cite(6)}</p><p>But stability carried conditions. Censorship narrowed public debate, police monitored opposition, and controlled votes helped legitimize personal rule. The language of the Revolution survived inside an increasingly authoritarian state. ${cite(2)}</p><div class="document-fragment"><span class="eyebrow">AN INSTITUTION THAT OUTLIVED HIM</span><h3>Code civil<br><em>des Français.</em></h3><div class="document-rule"></div><p>21 MARCH 1804</p><span>One legal framework. Unequal freedoms.</span></div><p>The Civil Code consolidated property rights and civil equality for men. It also placed married women under their husbands’ authority. A durable legal achievement was built with exclusion written into it. ${cite(5)}</p></div></div><div class="colonial-note"><span class="eyebrow">THE LIMITS OF “LIBERTY”</span><h3>Across the Atlantic,<br><em>emancipation was fought for again.</em></h3><p>In 1802, Napoleon’s regime maintained or restored slavery in French colonies. Its attempt to regain control of Saint-Domingue met resistance from people defending their freedom. French defeat helped clear the way for independent Haiti in 1804. Their emancipation was their achievement. ${cite(7, 8)}</p></div></section>
<section id="campaigns" class="section campaigns-section" data-chapter-name="Europe in motion" aria-labelledby="campaigns-title"><div class="section-heading">${chapter("03", "1805 — 1809")}<h2 id="campaigns-title">A continent<br><em>set in motion.</em></h2><p class="section-intro">An army could win a battle. Holding an empire required winning the next one, too.</p></div><div class="atlas-layout"><figure class="atlas"><div class="atlas-top"><span class="eyebrow">CAMPAIGN ATLAS</span><span id="atlas-year">1805</span></div><div class="campaign-selectors" role="group" aria-label="Choose a campaign">${campaigns.map((c, i) => `<button data-campaign="${i}" aria-pressed="${i === 2}" aria-controls="campaign-description">${c.date}<span>${c.short}</span></button>`).join("")}</div><div id="campaign-map" class="campaign-map"></div><figcaption><div id="campaign-description" aria-live="polite"></div><p class="map-key"><span class="legend-line"></span> Schematic connection <span class="legend-dot"></span> Selected place</p><p class="figure-note">Physical geography; no political borders. Connections are approximate, not exact marches. Line width does not encode army size. ${cite(13)}</p></figcaption></figure><div class="campaign-steps">${[2, 3, 4, 5].map((index, i) => `<article class="campaign-step" data-step="${index}"><span class="eyebrow">${campaigns[index].date} <span class="step-counter">${i + 1} / 4</span></span><h3>${["The height<br>of the system.", "Victory redraws<br>the map.", "Occupation<br>meets resistance.", "The margin<br>narrows."][i]}</h3><p>${campaigns[index].description} ${cite(...campaigns[index].source)}</p><button class="text-button show-campaign" data-show="${index}">Show on the map <span aria-hidden="true">↗</span></button></article>`).join("")}</div></div></section>
<section id="cost" class="section cost" data-chapter-name="The price of empire" aria-labelledby="cost-title"><div class="section-heading">${chapter("04", "1806 — 1811")}<h2 id="cost-title">The empire was built<br><em>from other people’s lives.</em></h2></div><div class="cost-intro"><p class="lead">Beyond the names on monuments were conscripts, wounded soldiers, bereaved families and civilians living under occupation.</p><p>There is no single, secure total for the human cost of these wars. Definitions, periods and records differ. The suffering reaches far beyond those killed on a battlefield.</p></div><div class="consequence-rows"><article><span class="row-num">I</span><h3>The military<br>becomes society.</h3><p>Conscription and requisitions drew people, horses, food and money into the war. Promotion offered opportunity to some; campaigns brought injury, disease and death to many. ${cite(2, 9, 10)}</p></article><article><span class="row-num">II</span><h3>Trade becomes<br>a battlefield.</h3><p>The Continental System sought to shut British goods out of European markets. Smuggling, uneven enforcement and damage to continental trade strained allies. Russia’s retreat from the system deepened the break with France. ${cite(14)}</p></article><article><span class="row-num">III</span><h3>Reform travels.<br>So does resistance.</h3><p>Occupation carried legal and administrative change alongside taxation and coercion. Resistance could invoke local loyalties, religion or the nation. Napoleon helped provoke forces he could not command. ${cite(3, 11)}</p></article></div></section>
<section id="russia" class="section russia" data-chapter-name="The road to Moscow" aria-labelledby="russia-title"><div class="section-heading">${chapter("05", "1812")}<h2 id="russia-title">The road went east.<br><em>Peace did not come.</em></h2></div><div class="russia-intro"><p>In June, Napoleon invaded Russia with a multinational army. He sought the decisive battle that would force Alexander I to negotiate. Instead, retreating Russian armies drew him deeper into the country. ${cite(9)}</p><span class="russia-year" aria-hidden="true">1812</span></div><figure class="russia-figure"><div class="atlas-top"><span class="eyebrow">THE MOSCOW CAMPAIGN</span><span class="map-key"><span class="legend-line"></span> Advance east <span class="legend-line dashed"></span> Retreat west</span></div><div id="russia-map"></div><figcaption class="figure-note">Selected locations on the central axis of the campaign. Routes are schematic; the retreat is offset slightly for legibility. Equal line widths carry no troop-strength or casualty data. ${cite(9, 10)}</figcaption></figure><div class="russia-events"><article><time>07 SEPTEMBER</time><h3>Borodino</h3><p>A costly battle opened the way to Moscow without destroying the Russian army.</p></article><article><time>14 SEPTEMBER</time><h3>Moscow</h3><p>Napoleon entered a largely abandoned city, soon devastated by fire. The tsar did not offer peace.</p></article><article><time>19 OCTOBER</time><h3>The retreat</h3><p>The army left Moscow. Hunger, disease, exhaustion, Russian attacks and then severe cold compounded the disaster.</p></article><article><time>26–29 NOVEMBER</time><h3>The Berezina</h3><p>A desperate river crossing allowed remnants to escape. The army’s fighting power was shattered.</p></article></div><p class="russia-thesis">The winter was not the whole explanation.<br><em>The campaign was failing before the deepest cold.</em> ${cite(9, 10)}</p></section>
<section id="fall" class="section fall" data-chapter-name="The end of the empire" aria-labelledby="fall-title"><div class="section-heading">${chapter("06", "1813 — 1821")}<h2 id="fall-title">From a continent<br><em>to an island.</em></h2></div><div class="fall-layout"><div class="island-visual" aria-hidden="true"><div class="orbit orbit-1"></div><div class="orbit orbit-2"></div><div class="orbit orbit-3"></div><svg viewBox="0 0 260 220"><path d="M53 128L68 112L82 107L99 86L118 79L131 64L150 69L160 84L183 90L194 109L207 119L191 135L169 146L142 152L128 169L108 159L88 157L71 143Z"/></svg><span>SAINT HELENA</span><small>South Atlantic · final exile</small><p>A symbolic island silhouette,<br>not a geographic map.</p></div><ol class="fall-timeline"><li><time>OCTOBER 1813</time><h3>Leipzig</h3><p>A coalition of armies defeats Napoleon at the Battle of the Nations. His hold on Germany collapses.</p></li><li><time>APRIL 1814</time><h3>Elba</h3><p>With allied forces in Paris, Napoleon abdicates. He becomes sovereign of the small Mediterranean island of Elba.</p></li><li><time>MARCH — JUNE 1815</time><h3>The Hundred Days</h3><p>He returns to France and regains power. On 18 June, Wellington’s Anglo-Allied army and Blücher’s Prussians defeat him at Waterloo. A second abdication follows. ${cite(2, 4)}</p></li><li><time>1815 — 1821</time><h3>Saint Helena</h3><p>Under British guard in the South Atlantic, he lives out his final exile. He dies on 5 May 1821. The empire is gone; the struggle over his memory has only begun. ${cite(1)}</p></li></ol></div></section>
<section id="legacy" class="section legacy" data-chapter-name="An unfinished legacy" aria-labelledby="legacy-title"><div class="section-heading">${chapter("07", "THEN → NOW")}<h2 id="legacy-title">Empires fall.<br><em>Structures remain.</em></h2><p class="section-intro">Some legacies were designed. Others grew from resistance. Follow a thread from Napoleon’s world into ours.</p></div><div class="legacy-explorer"><div class="legacy-topics" role="group" aria-label="Explore a legacy">${legacies.map((l, i) => `<button data-legacy="${i}" aria-pressed="${i === 0}" aria-controls="legacy-detail"><span>${String(i + 1).padStart(2, "0")}</span>${l.name}<span aria-hidden="true">↗</span></button>`).join("")}</div><div id="legacy-detail" aria-live="polite"></div></div><p class="figure-note">An interpretive relationship diagram, not a measurement of influence. All seven themes are equally selectable; connecting lines imply no ranking or inevitability.</p><details class="legacy-transcript"><summary>Read all seven legacies as text</summary>${legacies.map((l) => `<article><h3>${l.name} · ${l.date}</h3><p><strong>${l.origin} → ${l.inheritance}.</strong> ${l.body}</p><p>${l.tension} ${cite(...l.source)}</p></article>`).join("")}</details></section>
<section class="conclusion section" aria-labelledby="conclusion-title"><span class="eyebrow">THE HISTORY DOES NOT END HERE</span><h2 id="conclusion-title">How do we inherit<br><em>a complicated past?</em></h2><p>In a law code, a classroom, a government office, or a debate about the nation, the age of Napoleon is still close.</p><p>His achievements do not erase his coercion. His defeats do not erase his influence. Understanding him means holding both in view—and remembering the people whose lives made the history.</p><a href="#opening" class="return-link">Return to the beginning <span aria-hidden="true">↑</span></a></section>
<section id="sources" class="sources section" aria-labelledby="sources-title"><details><summary><div><span class="eyebrow">BEHIND THE EXHIBITION</span><h2 id="sources-title">Sources & methodology</h2></div><span class="summary-plus" aria-hidden="true">+</span></summary><div class="methodology"><p>This is a selective, explanatory history for general readers. Dates use the Gregorian calendar. Event dates and documented policies are distinguished from the interpretive argument about Napoleon’s legacy. No invented numerical data or aggregate death tolls are used.</p><p>The maps use physical land from Natural Earth. Place coordinates are rounded reference locations, not reconstructed army positions. The campaign atlas keeps a consistent European frame; the Russia view uses a closer scale. Routes connect selected locations and omit many units, detours and theaters. The timeline shows selected milestones, not the full chronology.</p><p>The opening portrait is evidence of imperial image-making, not a candid record. David assembled signs of the diligent ruler into a deliberate political image. Its use here is cropped and darkened for readability. ${cite(12)}</p><p>The legacy diagram is an editorial synthesis. Continuity is neither uniform nor inevitable: reforms had predecessors, later societies revised them, and resistance had its own agents. Sources were consulted on 4 September 2026. A specialist editorial review would be appropriate before institutional publication.</p></div><ol class="source-list">${sources.map(([org, title, url, note], i) => `<li id="source-${i + 1}" tabindex="-1"><span class="source-index">${String(i + 1).padStart(2, "0")}</span><div><span class="eyebrow">${org}</span><a href="${url}" target="_blank" rel="noopener noreferrer">${title} <span aria-hidden="true">↗</span></a><p>${note}</p></div></li>`).join("")}</ol></details></section>
</main><footer><div class="footer-brand"><span class="footer-name">Napoleon.</span><span class="eyebrow">AN UNFINISHED LEGACY</span></div><div class="project-credit"><p>Part of <a href="https://zergmutalisp.github.io/designscapes/">Designscapes</a></p><p>A Codex-assisted project by <a href="https://github.com/zergmutalisp">zergmutalisp</a>.</p></div><nav class="footer-links" aria-label="Project and exhibition links"><a href="https://github.com/zergmutalisp/designscapes/tree/main/sources/napoleon">View source on GitHub ↗</a><a href="#sources">Research, images & credits ↗</a></nav></footer>`;

let campaignIndex = 2;
function setCampaign(index: number) {
  campaignIndex = index;
  const c = campaigns[index];
  renderMap(q("#campaign-map"), index);
  q("#atlas-year").textContent = c.date;
  q("#campaign-description").innerHTML =
    `<h3>${c.name}</h3><p>${c.description} ${cite(...c.source)}</p>`;
  all<HTMLButtonElement>("[data-campaign]").forEach((b) =>
    b.setAttribute(
      "aria-pressed",
      String(Number(b.dataset.campaign) === index),
    ),
  );
}
setCampaign(2);
all<HTMLButtonElement>("[data-campaign]").forEach((b) =>
  b.addEventListener("click", () => setCampaign(Number(b.dataset.campaign))),
);
all<HTMLButtonElement>("[data-show]").forEach((b) =>
  b.addEventListener("click", () => {
    setCampaign(Number(b.dataset.show));
    if (innerWidth < 1000)
      q(".atlas").scrollIntoView({
        behavior: reduced.matches ? "instant" : "smooth",
        block: "start",
      });
  }),
);
function setLegacy(index: number) {
  const l = legacies[index];
  all<HTMLButtonElement>("[data-legacy]").forEach((b) =>
    b.setAttribute("aria-pressed", String(Number(b.dataset.legacy) === index)),
  );
  q("#legacy-detail").innerHTML =
    `<div class="legacy-thread"><div><span class="eyebrow">${l.date} · ORIGIN</span><h3>${l.origin}</h3></div><div class="thread-line" aria-hidden="true"><span>→</span></div><div><span class="eyebrow">THE INHERITANCE</span><h3>${l.inheritance}</h3></div></div><p class="legacy-body">${l.body}</p><div class="legacy-tension"><span class="eyebrow">THE COMPLICATION</span><p>${l.tension} ${cite(...l.source)}</p></div>`;
}
setLegacy(0);
all<HTMLButtonElement>("[data-legacy]").forEach((b) =>
  b.addEventListener("click", () => setLegacy(Number(b.dataset.legacy))),
);
renderRussia(q("#russia-map"));
let resizeTimer: ReturnType<typeof setTimeout>;
addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    renderMap(q("#campaign-map"), campaignIndex);
    renderRussia(q("#russia-map"));
  }, 120);
});
const dialog = q<HTMLDialogElement>("#contents-dialog"),
  trigger = q<HTMLButtonElement>(".contents-trigger");
trigger.addEventListener("click", () => {
  dialog.showModal();
  trigger.setAttribute("aria-expanded", "true");
  document.body.classList.add("menu-open");
});
q(".close-contents").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (e) => {
  if (e.target === dialog) {
    const r = dialog.getBoundingClientRect();
    if (
      (e as MouseEvent).clientX < r.left ||
      (e as MouseEvent).clientY < r.top ||
      (e as MouseEvent).clientY > r.bottom
    )
      dialog.close();
  }
});
dialog.addEventListener("close", () => {
  trigger.setAttribute("aria-expanded", "false");
  document.body.classList.remove("menu-open");
});
function openSource(hash: string) {
  if (hash === "#sources" || hash.startsWith("#source-"))
    q<HTMLDetailsElement>("#sources>details").open = true;
}
function handleHash() {
  openSource(location.hash);
  if (location.hash.startsWith("#source-"))
    q(location.hash)?.scrollIntoView({ block: "center", behavior: "instant" });
}
document.addEventListener("click", (e) => {
  const a = (e.target as HTMLElement).closest<HTMLAnchorElement>(
    'a[href^="#"]',
  );
  if (!a) return;
  const hash = a.getAttribute("href")!;
  openSource(hash);
  if (dialog.open) dialog.close();
  const target = document.getElementById(hash.slice(1));
  if (target) {
    target.setAttribute("tabindex", "-1");
    setTimeout(() => target.focus({ preventScroll: true }), 30);
  }
});
addEventListener("hashchange", handleHash);
handleHash();
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
const sectionEls = chapters.map(([id]) => document.getElementById(id)!);
let ticking = false,
  lastChapter = "";
function updateScroll() {
  ticking = false;
  const max = document.documentElement.scrollHeight - innerHeight;
  const progress = max > 0 ? Math.round((scrollY / max) * 100) : 0;
  q("#progress-fill").style.width = `${progress}%`;
  q(".progress-track").setAttribute("aria-valuenow", String(progress));
  let active = sectionEls[0];
  for (const section of sectionEls) {
    if (section.getBoundingClientRect().top < innerHeight * 0.38)
      active = section;
  }
  if (active.id !== lastChapter) {
    lastChapter = active.id;
    q("#current-chapter").textContent = active.dataset.chapterName!;
    all<HTMLAnchorElement>(".chapter-rail a, #contents-dialog nav a").forEach(
      (a) => {
        const on = a.getAttribute("href") === `#${active.id}`;
        if (on) a.setAttribute("aria-current", "location");
        else a.removeAttribute("aria-current");
      },
    );
  }
  if (innerWidth >= 1000 && !reduced.matches) {
    const steps = all(".campaign-step");
    const intersect = steps.find((step) => {
      const r = step.getBoundingClientRect();
      return r.top < innerHeight * 0.55 && r.bottom > innerHeight * 0.55;
    });
    if (intersect && intersect.dataset.wasActive !== "true") {
      steps.forEach((s) => (s.dataset.wasActive = "false"));
      intersect.dataset.wasActive = "true";
      setCampaign(Number(intersect.dataset.step));
    }
  }
}
addEventListener(
  "scroll",
  () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateScroll);
    }
  },
  { passive: true },
);
updateScroll();
