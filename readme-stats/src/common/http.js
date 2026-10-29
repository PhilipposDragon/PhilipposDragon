// @ts-check

// MODIFICADO em relação ao github-readme-stats (ver MODIFICATIONS.diff):
// usa o fetch nativo do Node no lugar do axios, para não depender de pacotes
// do npm. Mantém o contrato que o resto do código espera:
//   - sucesso: resolve com { data, status, statusText }
//   - resposta não-2xx: lança um erro com err.response = { data, status, statusText }
//   - falha de rede: lança um erro sem err.response
// Trava de segurança: o token só pode ser enviado para https://api.github.com.

const ALLOWED_ORIGIN = "https://api.github.com";
const TIMEOUT_MS = 30000;

/**
 * Envia uma requisição HTTP para a API do GitHub.
 *
 * @param {object} config Configuração da requisição.
 * @param {string} config.url URL completa (deve ser da api.github.com).
 * @param {string} [config.method] Método HTTP.
 * @param {Record<string, string>} [config.headers] Cabeçalhos.
 * @param {any} [config.data] Corpo (objeto vira JSON).
 * @returns {Promise<{ data: any, status: number, statusText: string }>} Resposta.
 */
const httpRequest = async ({ url, method = "get", headers = {}, data }) => {
  if (new URL(url).origin !== ALLOWED_ORIGIN) {
    throw new Error(`Requisição bloqueada: destino fora de ${ALLOWED_ORIGIN}`);
  }

  /** @type {Record<string, string>} */
  const finalHeaders = { Accept: "application/json", ...headers };
  let body;
  if (data !== undefined) {
    body = typeof data === "string" ? data : JSON.stringify(data);
    const hasContentType = Object.keys(finalHeaders).some(
      (key) => key.toLowerCase() === "content-type",
    );
    if (!hasContentType) {
      finalHeaders["Content-Type"] = "application/json";
    }
  }

  const res = await fetch(url, {
    method: method.toUpperCase(),
    headers: finalHeaders,
    body,
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  const text = await res.text();
  /** @type {any} */
  let parsed = text;
  try {
    parsed = text ? JSON.parse(text) : text;
  } catch {
    // resposta que não é JSON: mantém o texto
  }

  const response = {
    data: parsed,
    status: res.status,
    statusText: res.statusText,
  };

  if (!res.ok) {
    /** @type {any} */
    const err = new Error(`Request failed with status code ${res.status}`);
    err.response = response;
    throw err;
  }
  return response;
};

/**
 * Envia uma requisição GraphQL para a API do GitHub.
 *
 * @param {any} data Corpo da requisição ({ query, variables }).
 * @param {Record<string, string>} headers Cabeçalhos da requisição.
 * @returns {Promise<any>} Resposta.
 */
const request = (data, headers) => {
  return httpRequest({
    url: `${ALLOWED_ORIGIN}/graphql`,
    method: "post",
    headers,
    data,
  });
};

export { request, httpRequest };
