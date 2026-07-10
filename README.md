# Designscapes

A small gallery of complete browser demos, published as a dependency-free static site.

## Demos

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

The repository is structured for GitHub Pages with no build step. Push `main`; the existing Pages site can serve the root `index.html` and both routes under `demos/`.
