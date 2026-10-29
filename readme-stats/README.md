# readme-stats (cópia local)

Gera os cards "Stats" e "Top Langs" do perfil como SVG (`docs/stats.svg` e
`docs/top-langs.svg`). O workflow `.github/workflows/readme-stats.yml` roda
`generate.mjs` todo dia.

## Origem

Código copiado de [anuraghazra/github-readme-stats](https://github.com/anuraghazra/github-readme-stats)
(licença MIT, ver `LICENSE`), commit `54a7985aeefda00d5eadb55b80c17c7f976c37d2`.
Só os arquivos que os dois cards usam foram copiados (20 de centenas).
O `word-wrap` (MIT, Jon Schlinkert, ver `LICENSE-word-wrap`) está embutido em
`src/vendor/word-wrap.js`.

## O que foi alterado

Ver `MODIFICATIONS.diff` (diff exato contra o original). Resumo:

| Arquivo | Alteração |
| --- | --- |
| `src/common/http.js` | `axios` trocado pelo `fetch` nativo. Só permite enviar requisições para `https://api.github.com`. Timeout de 30 s. |
| `src/fetchers/stats.js` | Removidos `axios`, `dotenv` e `github-username-regex` (a regex foi embutida). A busca REST usa `httpRequest`. |
| `src/common/ops.js` | Removida `parseEmojis` (não usada pelos cards) e a dependência `emoji-name-map`. |
| `src/common/fmt.js` | Importa o `word-wrap` local. |

Os outros 16 arquivos são idênticos ao original. Arquivos novos: `generate.mjs`,
`package.json` (só marca os arquivos como módulos ES) e `src/vendor/word-wrap.js`.

## Segurança

- **Zero dependências do npm.** O workflow não roda `npm install`.
- O token (`PAT_1`) só é enviado para `api.github.com`; qualquer outro destino é bloqueado em `http.js`.
- O código não usa `eval`, processos externos nem lê/escreve arquivos (só o `generate.mjs` grava os SVGs).

## Atualizar para uma versão nova do projeto original

Não é automático, de propósito. Para atualizar: compare os arquivos copiados com
os da versão nova do projeto original, revise a diferença, copie o que mudou e
refaça as quatro alterações acima. Se o card continuar funcionando, não precisa
atualizar.

## Token

O workflow usa o secret `STATS_TOKEN` (token clássico **sem escopos**) e, se ele
não existir, o `GITHUB_TOKEN` padrão. Quando o token expirar: *Settings →
Developer settings → Personal access tokens → Regenerate token* e atualize o
secret.

### Como reconhecer erros no log do passo "Generate cards"

| Mensagem | Significado |
| --- | --- |
| `PAT_1 Failed` + `Downtime due to GitHub API rate limiting` | Token recusado (expirado, revogado ou inválido). É a mensagem padrão do projeto original, apesar de falar em "rate limit". Gere um token novo. |
| `Resource not accessible by integration` | O token em uso (normalmente o `GITHUB_TOKEN` padrão) não enxerga os dados pedidos. Crie o secret `STATS_TOKEN`. |
| `fetch failed` | Falha de rede ou da API do GitHub. Rode de novo mais tarde. |

Em qualquer erro, os SVGs que já estavam no repositório não são sobrescritos.
