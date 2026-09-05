// Optional tooling — NOT required to run the site. This is the script used to
// generate scripts/generated-images/*.jpg (the branded illustrations attached
// to the 6 starter services). It's committed here so you can tweak the icon,
// colors, or style later and regenerate. It needs the "sharp" package, which
// is not part of this project's normal dependencies — install it once with
// `npm install --no-save sharp` before running `node scripts/generate-service-images.mjs`.
import React from "react";
import ReactDOMServer from "react-dom/server";
import * as lc from "lucide-react";
import sharp from "sharp";
import fs from "fs";
import path from "path";

const OUT_DIR = path.resolve("scripts/generated-images");
fs.mkdirSync(OUT_DIR, { recursive: true });

const COLORS = {
  primary: "#0b2545",
  secondary: "#13315c",
  accent: "#c8a24a",
  surface: "#ffffff",
};

const W = 1600, H = 900;

function iconPath(name, strokeWidth = 1.2) {
  const el = React.createElement(lc[name], { strokeWidth });
  const svg = ReactDOMServer.renderToStaticMarkup(el);
  // extract inner path/line/circle/etc markup (everything inside the outer <svg>...</svg>)
  const match = svg.match(/<svg[^>]*>([\s\S]*)<\/svg>/);
  return match ? match[1] : "";
}

function buildSvg({ id, icon, strokeWidth = 1.1, secondaryIcon, corner = "tl" }) {
  const inner = iconPath(icon, strokeWidth);
  const secondaryInner = secondaryIcon ? iconPath(secondaryIcon, 1.3) : null;

  // Large faint watermark icon (bottom-right, oversized, low opacity)
  const watermarkSize = 620;
  const watermarkX = W - watermarkSize * 0.62;
  const watermarkY = H - watermarkSize * 0.62;

  // Main centered icon
  const mainSize = 220;
  const mainX = W / 2 - mainSize / 2;
  const mainY = H / 2 - mainSize / 2 - 20;

  // Optional small secondary icon (accent badge, top-left area)
  const secSize = 84;

  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg-${id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${COLORS.primary}"/>
      <stop offset="100%" stop-color="${COLORS.secondary}"/>
    </linearGradient>
    <radialGradient id="glow-${id}" cx="50%" cy="42%" r="60%">
      <stop offset="0%" stop-color="${COLORS.secondary}" stop-opacity="0"/>
      <stop offset="100%" stop-color="${COLORS.primary}" stop-opacity="0.35"/>
    </radialGradient>
    <pattern id="dots-${id}" width="34" height="34" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1.6" fill="${COLORS.surface}" fill-opacity="0.07"/>
    </pattern>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg-${id})"/>
  <rect width="${W}" height="${H}" fill="url(#dots-${id})"/>
  <rect width="${W}" height="${H}" fill="url(#glow-${id})"/>

  <!-- diagonal accent band -->
  <polygon points="0,${H} ${W * 0.34},${H} ${W * 0.14},0 0,0" fill="${COLORS.surface}" fill-opacity="0.035"/>
  <polygon points="${W},0 ${W},${H} ${W * 0.72},${H}" fill="${COLORS.accent}" fill-opacity="0.06"/>

  <!-- thin frame line -->
  <rect x="28" y="28" width="${W - 56}" height="${H - 56}" fill="none" stroke="${COLORS.accent}" stroke-opacity="0.22" stroke-width="1.5"/>

  <!-- oversized watermark icon, bottom right -->
  <g transform="translate(${watermarkX}, ${watermarkY})" stroke="${COLORS.surface}" stroke-opacity="0.055" fill="none">
    <svg width="${watermarkSize}" height="${watermarkSize}" viewBox="0 0 24 24">${inner}</svg>
  </g>

  <!-- accent ring behind main icon -->
  <circle cx="${W / 2}" cy="${H / 2 - 20}" r="170" fill="none" stroke="${COLORS.accent}" stroke-opacity="0.5" stroke-width="2"/>
  <circle cx="${W / 2}" cy="${H / 2 - 20}" r="170" fill="${COLORS.accent}" fill-opacity="0.08"/>

  <!-- main icon -->
  <g transform="translate(${mainX}, ${mainY})" stroke="${COLORS.accent}" fill="none">
    <svg width="${mainSize}" height="${mainSize}" viewBox="0 0 24 24">${inner}</svg>
  </g>

  ${secondaryInner ? `
  <g>
    <circle cx="${W * 0.165}" cy="${H * 0.22}" r="54" fill="${COLORS.surface}" fill-opacity="0.08"/>
    <g transform="translate(${W * 0.165 - secSize / 2}, ${H * 0.22 - secSize / 2})" stroke="${COLORS.surface}" stroke-opacity="0.75" fill="none">
      <svg width="${secSize}" height="${secSize}" viewBox="0 0 24 24">${secondaryInner}</svg>
    </g>
  </g>` : ""}
</svg>`;
}

const SERVICES = [
  { key: "visitor-visa", icon: "Plane", secondaryIcon: "Globe" },
  { key: "sponsorship", icon: "Users", secondaryIcon: "Heart" },
  { key: "work-permits", icon: "Briefcase", secondaryIcon: "FileCheck2" },
  { key: "study-permits", icon: "GraduationCap", secondaryIcon: "BookOpen" },
  { key: "passport-services", icon: "Stamp", secondaryIcon: "BookMarked" },
  { key: "citizenship", icon: "Award", secondaryIcon: "Flag" },
];

for (const svc of SERVICES) {
  const svg = buildSvg({ id: svc.key, icon: svc.icon, secondaryIcon: svc.secondaryIcon });
  const svgPath = path.join(OUT_DIR, `${svc.key}.svg`);
  fs.writeFileSync(svgPath, svg, "utf8");
  const pngPath = path.join(OUT_DIR, `${svc.key}.jpg`);
  await sharp(Buffer.from(svg)).jpeg({ quality: 92 }).toFile(pngPath);
  console.log("Generated", pngPath);
}
