import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const grsDir = path.resolve(process.env.GRS_DIR ?? ".grs");
const username = process.env.GH_USER;
const outDir = path.resolve(process.env.OUT_DIR ?? "docs");

if (!username) {
  console.error("Defina a variável de ambiente GH_USER.");
  process.exit(1);
}

const load = (file) => import(pathToFileURL(path.join(grsDir, file)).href);

const { fetchStats } = await load("src/fetchers/stats.js");
const { fetchTopLanguages } = await load("src/fetchers/top-languages.js");
const { renderStatsCard } = await load("src/cards/stats.js");
const { renderTopLanguages } = await load("src/cards/top-languages.js");

const common = {
  hide_border: true,
  bg_color: "00000000",
  title_color: "3fb950",
  text_color: "8b949e",
};

const cards = [
  {
    file: "stats.svg",
    build: async () =>
      renderStatsCard(await fetchStats(username), {
        ...common,
        show_icons: true,
        icon_color: "3fb950",
      }),
  },
  {
    file: "top-langs.svg",
    build: async () =>
      renderTopLanguages(await fetchTopLanguages(username), {
        ...common,
        layout: "compact",
        langs_count: 8,
      }),
  },
];

await mkdir(outDir, { recursive: true });

let failed = false;
for (const { file, build } of cards) {
  try {
    const svg = await build();
    await writeFile(path.join(outDir, file), svg, "utf8");
    console.log(`OK  ${file}`);
  } catch (err) {
    failed = true;
    console.error(`ERRO ${file}: ${err?.message ?? err}`);
  }
}

process.exit(failed ? 1 : 0);
