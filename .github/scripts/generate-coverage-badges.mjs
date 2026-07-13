import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const summaryPath = join(root, "frontend/coverage/coverage-summary.json");
const summary = JSON.parse(readFileSync(summaryPath, "utf8")).total;

function badgeColor(pct) {
  if (pct >= 80) return "#4c1";
  if (pct >= 60) return "#dfb317";
  return "#e05d44";
}

function badge(label, pct) {
  const value = `${pct}%`;
  const labelWidth = label.length * 6 + 10;
  const valueWidth = value.length * 6 + 10;
  const width = labelWidth + valueWidth;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="20" role="img" aria-label="${label}: ${value}">
  <title>${label}: ${value}</title>
  <g shape-rendering="crispEdges">
    <rect width="${labelWidth}" height="20" fill="#555"/>
    <rect x="${labelWidth}" width="${valueWidth}" height="20" fill="${badgeColor(pct)}"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11">
    <text x="${labelWidth / 2}" y="14">${label}</text>
    <text x="${labelWidth + valueWidth / 2}" y="14">${value}</text>
  </g>
</svg>`;
}

const outDir = join(root, ".github/badges");
mkdirSync(outDir, { recursive: true });

const metrics = [
  ["statements", "coverage-statements"],
  ["branches", "coverage-branches"],
  ["functions", "coverage-functions"],
  ["lines", "coverage-lines"],
];

for (const [key, filename] of metrics) {
  writeFileSync(join(outDir, `${filename}.svg`), badge(key, summary[key].pct));
}
