/**
 * Prepare the static build for Cloudflare Pages.
 *
 * Run after `bun run build:cloudflare`. The Worker continues serving SSR
 * (no index.html is fabricated); Pages serves only copied real static assets.
 * _routes.json ensures static images/scripts never count as Function calls.
 */
import { existsSync, mkdirSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const output = "dist/client";
if (!existsSync(output)) {
  throw new Error("Missing dist/client. Run bun run build:cloudflare first.");
}
const assets = join(output, "assets");
const photos = join(output, "market");
if (!existsSync(assets) || !existsSync(photos)) {
  throw new Error("Cloudflare build did not include expected JS/CSS or photo assets.");
}
const hasJs = readdirSync(assets).some(name => name.endsWith(".js"));
const hasPhoto = readdirSync(photos).some(name => name === "report-market-v27.webp");
if (!hasJs || !hasPhoto) throw new Error("Required static build files are missing.");

const routes = {
  version: 1,
  include: ["/*"],
  exclude: ["/assets/*", "/market/*", "/favicon.ico", "/robots.txt"],
};
writeFileSync(join(output, "_routes.json"), JSON.stringify(routes, null, 2) + "\n");
console.log(
  "Pages static output prepared; middleware handles SSR/API, " +
  "static assets are served by Pages without Functions.",
);
