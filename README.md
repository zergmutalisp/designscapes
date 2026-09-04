# Designscapes

A small gallery of complete browser demos, published as a dependency-free static site.

## Demos

- **Napoleon — An Unfinished Legacy** — a Codex-assisted historical exhibition with campaign maps, chronology and an interactive legacy explorer

- **Mortgage Paydown** — an interactive 30-year mortgage and extra-payment calculator
- **Horizon Pier** — a modern, image-led digital newspaper advertisement

## Run locally

```bash
cd /Users/denniskenyon/projects/designscapes
python3 -m http.server 8000
```

Open [http://localhost:8000](http://localhost:8000).

## Test the mortgage model

```bash
cd /Users/denniskenyon/projects/designscapes
node --test demos/mortgage-paydown/mortgage-core.test.mjs
```

## Publish

The repository is structured for GitHub Pages with no build step. Push `main`; the existing Pages site can serve the root `index.html` and routes under `demos/`.

## Rebuild the Napoleon exhibition

The complete editable source is in `sources/napoleon/`. Its compiled, self-contained site is committed to `demos/napoleon/` so the existing GitHub Pages deployment needs no additional build service.

```sh
npm ci --prefix sources/napoleon
npm run build:napoleon
```

Preview the repository with `npm run dev`, then visit `/demos/napoleon/`. Before publishing an update, commit the source changes and rebuilt static files together. The exhibition uses relative asset URLs, so it also works under the GitHub Pages `/designscapes/` prefix.
