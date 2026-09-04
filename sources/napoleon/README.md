# Napoleon — An Unfinished Legacy

A standalone, dark-mode historical exhibition tracing Napoleon from Corsica through revolution, empire, collapse and the institutions that outlived him.

## Run locally

Requires Node.js 22.12 or later and npm.

```sh
cd sources/napoleon
npm ci
npm run dev -- --port 4173
```

Open http://127.0.0.1:4173/.

## Build and preview

```sh
npm run build
npm run preview -- --port 4173
```

The `dist/` directory is a static deployment artifact. It does not require a backend, environment variables, API keys or external runtime asset services.

## Verify

```sh
npm run test:install
npm run check
```

`test:install` places Chromium inside `work/browsers`. `check` builds the production bundle and runs seven Playwright tests against Vite's production preview on port 4174. The tests cover story completeness, dates, source anchors, local artwork, console errors, contents and focus, all eight campaign selections, all seven legacy themes, responsive widths, reduced motion, accessibility, geographic label bounds, scroll staging and sticky height.

## Creative and technical choices

- Near-black ink, ivory, muted brass and restrained green tones; Cormorant Garamond and Inter.
- Jacques-Louis David's 1812 portrait serves as an opening argument about image-making, with clear credit and interpretation.
- Vite and TypeScript without a UI framework. Semantic HTML, native buttons, native modal dialog, native disclosures and CSS handle the experience.
- D3 is limited to geographic projections and path generation. Natural Earth physical land provides context without falsely implying historical borders.
- Desktop campaign stages update a sticky map. Every campaign is also directly selectable. Narrow layouts put the atlas in normal flow; reduced motion disables automatic staging and sticky positioning.
- A proportional overview timeline becomes an ordered timeline on phones. The legacy explorer is a qualitative relationship diagram, with a complete text equivalent.
- Images and fonts are local; no analytics, runtime data services or third-party font requests.

## Editing

- `src/data.ts`: campaigns, reference coordinates, chronology, legacy themes and bibliography.
- `src/main.ts`: narrative markup, navigation, source disclosure, scroll staging and accessible control state.
- `src/maps.ts`: D3 geography and schematic connections.
- `src/style.css`: visual system, responsive layouts, reduced motion and print rules.
- `tests/story.spec.ts`: end-to-end checks; screenshots saved under `work/qa/`.
- `VERIFICATION.md`: rendered-review evidence and limitations.
- `DEVELOPMENT_TIMELINE.md`: work record, newest first.

## Historical method

The audience is a curious general reader. The exhibition presents a selective chronology, not an exhaustive military reference. The bibliography is available from the end of the page and from numbered inline links.

The maps show rounded reference coordinates and selected schematic connections. They do not encode territorial control, reconstructed army positions, army size or casualties. The Russia diagram uses a separate closer geographic scale and offsets its dashed return line slightly for readability. Neither distance along a route nor line width measures loss. Legacy relationships are an editorial synthesis; the seven themes have no numerical ranking.

Sources include Fondation Napoléon, the National Army Museum, the National Gallery of Art, the U.S. Office of the Historian, and Michael Rowe's Oxford handbook chapter abstract. Dates, policy, interpretation and simplification are distinguished in the site. Broad claims should receive specialist editorial review before institutional publication.

## Clean-room boundary

This project was created independently in this directory. The comparison project at the excluded path was not inspected, copied or modified.

## Designscapes publication

This exhibition is published at https://zergmutalisp.github.io/designscapes/demos/napoleon/ and linked from the Designscapes gallery. Its footer credits zergmutalisp, links to the project collection, and links to the editable GitHub source. The contents menu also returns to Designscapes.

Vite uses a relative base, including the portrait URL, so production assets work when the exhibition is hosted below a nested path. The Designscapes repository keeps the editable project in `sources/napoleon` and the generated static site in `demos/napoleon`.
