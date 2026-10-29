// Gera os cards "Stats" e "Top Langs" como arquivos SVG.
// Usa a cópia local do github-readme-stats (pasta src/) e o token em PAT_1.
// Variáveis de ambiente: GH_USER (obrigatória), PAT_1 (token), OUT_DIR (padrão: docs).

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fetchStats } from "./src/fetchers/stats.js";
import { fetchTopLanguages } from "./src/fetchers/top-languages.js";
import { renderStatsCard } from "./src/cards/stats.js";
import { renderTopLanguages } from "./src/cards/top-languages.js";

const username = process.env.GH_USER;
const outDir = path.resolve(process.env.OUT_DIR ?? "docs");

if (!username) {
  console.error("Defina a variável de ambiente GH_USER.");
  process.exit(1);
}

// Mesmas cores/opções que você usava nas URLs do README.
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
        custom_title: `${username}'s GitHub Stats`,
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
    // Se a consulta à API falhar, build() lança exceção e o arquivo anterior
    // não é sobrescrito.
    const svg = await build();
    await writeFile(path.join(outDir, file), svg, "utf8");
    console.log(`OK  ${file}`);
  } catch (err) {
    failed = true;
    console.error(`ERRO ${file}: ${err?.message ?? err}`);
  }
}

// Falha o job se algum card não foi gerado, para você ver o erro em Actions
// e para nunca publicar um card quebrado por cima do último que funcionou.
process.exit(failed ? 1 : 0);
