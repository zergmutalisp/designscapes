import { geoMercator, geoPath, geoGraticule10 } from "d3-geo";
import { feature } from "topojson-client";
import landJSON from "world-atlas/land-110m.json";
import type { Topology, GeometryCollection } from "topojson-specification";
import { campaigns, type Place } from "./data";
const land = feature(
  landJSON as unknown as Topology<{ land: GeometryCollection }>,
  landJSON.objects.land as unknown as GeometryCollection,
);
export function renderMap(el: HTMLElement, index: number) {
  const width = Math.round(el.clientWidth) || 720,
    height =
      width < 500 ? 310 : Math.min(380, Math.max(240, innerHeight - 450));
  const projection = geoMercator()
    .fitExtent(
      [
        [18, 18],
        [width - 18, height - 18],
      ],
      {
        type: "MultiPoint",
        coordinates: [
          [-14, 28],
          [45, 62],
        ],
      },
    )
    .clipExtent([
      [0, 0],
      [width, height],
    ]);
  const path = geoPath(projection),
    campaign = campaigns[index];
  const places = campaign.places;
  const marks = places
    .map((p, i) => {
      const [x, y] = projection(p.ll)!;
      let dx = p.dx ?? 9,
        dy = p.dy ?? -10;
      if (width < 500 && campaign.id === "prussia") {
        dx = [-77, -48, -84, 15, 10][i];
        dy = [28, -25, 18, 27, -12][i];
      }
      if (width < 500 && campaign.id === "egypt") {
        dx = [-28, -65, 4, -18][i];
        dy = [-12, 23, 42, -12][i];
      }
      const labelx = Math.max(5, Math.min(width - 90, x + dx));
      const labely = Math.max(18, Math.min(height - 8, y + dy));
      return `<g class="map-place"><path d="M${x},${y}L${labelx + (dx < 0 ? 25 : 0)},${labely - 4}" class="label-leader"/><circle cx="${x}" cy="${y}" r="4"/><text x="${labelx}" y="${labely}">${p.name}</text></g>`;
    })
    .join("");
  el.innerHTML = `<svg viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="atlas-title atlas-desc"><title id="atlas-title">${campaign.name}, ${campaign.date}</title><desc id="atlas-desc">Selected locations: ${places.map((p) => p.name).join(", ")}. Lines connect selected campaign locations schematically; they are not exact routes or borders.</desc><defs><pattern id="sea-dots" width="8" height="8" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".6" fill="#393d35"/></pattern><clipPath id="map-clip"><rect width="${width}" height="${height}"/></clipPath></defs><g clip-path="url(#map-clip)"><rect width="${width}" height="${height}" fill="url(#sea-dots)"/><path d="${path(land)}" class="map-land"/><path d="${path(geoGraticule10())}" class="graticule"/>${[
    ["ATLANTIC", -12, 46],
    ["MEDITERRANEAN", 12, 35],
    ["RUSSIA", 33, 59],
  ]
    .map(([s, lon, lat]) => {
      const [x, y] = projection([Number(lon), Number(lat)])!;
      return `<text x="${x}" y="${y}" class="sea-label">${s}</text>`;
    })
    .join(
      "",
    )}${campaign.routes.map((route) => `<path class="campaign-route" d="${path({ type: "LineString", coordinates: route })}"/>`).join("")}${marks}</g><g transform="translate(${width - 24},26)" class="compass"><text y="-4" text-anchor="middle">N</text><path d="M0,3L-3,17L0,14L3,17Z"/></g></svg>`;
}
export function renderRussia(el: HTMLElement) {
  const width = Math.round(el.clientWidth) || 1100,
    mobile = width < 600,
    height = mobile ? 310 : 370;
  const projection = geoMercator()
    .center([30.7, 55.1])
    .scale(width / 0.3)
    .translate([width / 2, height / 2]);
  const path = geoPath(projection);
  const advance = [
    [23.9, 54.9],
    [25.28, 54.69],
    [30.2, 55.19],
    [32.05, 54.78],
    [35.82, 55.53],
    [37.62, 55.75],
  ];
  const retreat = [
    [37.62, 55.75],
    [36.46, 55.01],
    [32.05, 54.78],
    [30.4, 54.51],
    [28.37, 54.32],
    [25.28, 54.69],
    [23.9, 54.9],
  ];
  const places: Place[] = [
    { name: "Niemen", ll: [23.9, 54.9] },
    { name: "Vilna", ll: [25.28, 54.69] },
    { name: "Berezina", ll: [28.37, 54.32] },
    { name: "Smolensk", ll: [32.05, 54.78] },
    { name: "Borodino", ll: [35.82, 55.53] },
    { name: "Moscow", ll: [37.62, 55.75] },
  ];
  const labelOffsets = mobile
    ? [
        [0, -35],
        [0, 45],
        [0, 64],
        [0, -35],
        [-20, 35],
        [-15, -35],
      ]
    : [
        [0, -30],
        [0, 45],
        [0, 70],
        [0, -32],
        [0, 42],
        [0, -32],
      ];
  el.innerHTML = `<svg viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="russia-map-title russia-map-desc"><title id="russia-map-title">The road to Moscow and the retreat, 1812</title><desc id="russia-map-desc">Advance east from the Niemen through Vilna, Smolensk and Borodino to Moscow. Retreat west, crossing the Berezina. The solid line shows the advance; the dashed line shows the return, slightly offset for visibility. Width does not represent army size.</desc><defs><marker id="advance-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0L10,5L0,10" fill="none" stroke="#d1b782" stroke-width="2"/></marker><marker id="retreat-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0L10,5L0,10" fill="none" stroke="#eee8dc" stroke-width="2"/></marker></defs><path d="${path(geoGraticule10())}" class="graticule"/><path class="russia-advance" d="${path({ type: "LineString", coordinates: advance })}" marker-end="url(#advance-arrow)"/><path class="russia-retreat" transform="translate(0 10)" d="${path({ type: "LineString", coordinates: retreat })}" marker-end="url(#retreat-arrow)"/>${places
    .map((p, i) => {
      const [x, y] = projection(p.ll)!,
        [dx, dy] = labelOffsets[i];
      return `<g class="map-place"><path class="label-leader" d="M${x},${y}L${x + dx},${y + dy - (dy > 0 ? 14 : -5)}"/><circle cx="${x}" cy="${y}" r="4"/><text x="${x + dx}" y="${y + dy}" text-anchor="middle">${p.name}</text></g>`;
    })
    .join("")}</svg>`;
}
