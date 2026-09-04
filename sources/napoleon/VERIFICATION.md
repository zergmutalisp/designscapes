# Verification record

Date: 4 September 2026.

## Production and repeatability

- TypeScript strict checking and Vite production build passed.
- A separate clean copy containing only source, public assets and package/config files was placed in `work/fresh-install`. `npm ci` and `npm run build` passed there, confirming that the checked-in lockfile and source do not require pre-existing build artifacts.
- npm reported no known dependency vulnerabilities at installation.
- Production JavaScript is approximately 46.5 KB gzipped; CSS approximately 8.1 KB gzipped. The public-domain portrait is approximately 440 KB. Fonts are bundled locally.

## Automated browser checks

Seven Playwright tests run against the production preview in Chromium:

1. All story chapters, chronology, source targets, artwork loading and absence of browser console errors.
2. Keyboard opening of contents, Escape, focus restoration and navigation into a chapter.
3. All eight campaigns and all seven legacy topics, including the complete text transcript.
4. Whole-story overflow checks at 320, 390, 768 and 1440px widths, with full-page and chapter screenshots.
5. Reduced-motion reading and absence of automatic campaign changes in that mode.
6. Axe WCAG 2 A/AA and WCAG 2.1 AA checks for the normal page, contents modal and mobile legacy view.
7. Label bounds for every campaign at 320, 390 and 1440px; automatic scroll staging and sticky atlas fit at 1280 × 720.

## Actual rendered inspection

The app was opened and operated in the Codex browser. The 1440 × 900 desktop review covered the opening, early-life narrative, proportional timeline, ascent to power, Civil Code illustration, campaign map and controls, human/economic cost, Russia routes, exile sequence and legacy explorer. The 390 × 844 mobile review covered the opening, contents drawer, campaign selection and dense labels, Russia diagram, legacy interaction, conclusion and sources. Console inspection found no errors or warnings from the site.

The first review led to fixes for the portrait crop, mobile legacy grid overflow, atlas latitude bounds and small-phone text sizing. Each material fix was rebuilt and rechecked. The fixed header was made opaque to keep scrolled text from showing through it. A false-positive contrast result from capturing the hero mid-entrance was resolved by testing its fully rendered state; reduced-motion is checked separately.

## Visualization integrity

- Timeline values verified: 1769, 1789, 1799, 1804, 1812, 1815, 1821. Desktop mark positions derive directly from a common linear 1769–1821 year scale; mobile preserves all events in order.
- All campaign selections retain visible dates, labels and descriptions. There are no empty states or NaN path coordinates. The map frame is stable across campaign selection and includes Egypt as well as Russia.
- The Russia routes distinguish eastward advance and westward retreat using solid/dashed lines, direction arrows and text. Equal line widths are not quantitative encodings. Place labels are readable at the inspected desktop and mobile sizes.
- The legacy explorer exposes all seven domains and their complications. Its connecting line has no quantitative meaning; a complete text alternative is available.
- Sources, simplifications and the difference between documentary facts and historical interpretation are explained in the exhibition.

## Limitations

- Browser verification covered Chromium and the Codex in-app browser. Dedicated Safari, Firefox, physical-device, screen-reader and print-output reviews were not performed.
- The site requires JavaScript; it provides a coherent experience without animation, not a separate no-JavaScript edition.
- Geographic routes are deliberately schematic and selective. This is not a precise campaign reconstruction or an exhaustive history.
- Historical prose is sourced but has not received an independent historian's editorial review.

## Designscapes integration — 2026-09-04

Production builds use relative asset URLs. The exhibition was tested at the simulated Pages prefix `/designscapes/demos/napoleon/`, including its image, fonts, footer profile/source links and Contents return link. All seven exhibition tests, three gallery/integration tests and eight existing gallery-project calculation tests passed. Rendered review covered the new gallery feature and exhibition footer at 1440 × 900 and 390 × 844; no horizontal overflow or console errors were observed.
