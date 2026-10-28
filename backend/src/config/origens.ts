/**
 * Origens que o navegador vai aceitar chamar.
 *
 * Por que existe lista, e não `cors()` aberto: `Authorization` é header comum
 * (não exige preflight), então origem liberada significa que qualquer página
 * com o token do gestor — inclusive uma extensão — conversa com a API. A lista
 * é o oposto de "*", que autoriza qualquer uma.
 *
 * A pegada é que o Codespace tem URL pública, e ela muda de nome quando o
 * ambiente é recriado. Se a lista fosse escrita à mão, o primeiro "não
 * achou a API" depois de recriar o Codespace viria do CORS — que é
 * exatamente o que aconteceu em 2026-10-04, e não dá para diagnosticar pelo
 * que aparece na tela (o navegador só diz "failed to fetch").
 *
 * Por isso: quando `CODESPACE_NAME` existe, as URLs `<nome>-<porta>.<dominio>`
 * entram sozinhas. `CORS_ORIGENS` continua existindo para as outras situações
 * (produção, outro domínio) e para acrescentar origens à mão.
 */

/** Portas em que os dois fronts respondem dentro do Codespace. */
const PORTAS_DO_FRONT = ["5173", "5174"];

export function origensPermitidas(): string[] {
  const doEnv = (process.env.CORS_ORIGENS ?? "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  // Mesmo fora do Codespace o dev precisa do localhost. A entrada do .env vem
  // primeiro de propósito: quem configura na mão tem a palavra final.
  const padrao = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
  ];

  const nome = process.env.CODESPACE_NAME;
  const dominio = process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN;
  const doCodespace =
    nome && dominio
      ? PORTAS_DO_FRONT.map((porta) => `https://${nome}-${porta}.${dominio}`)
      : [];

  return [...new Set([...doEnv, ...doCodespace, ...padrao])];
}

/**
 * A lista vai direto para o `cors({ origin: [...] })`, que compara por
 * igualdade exata (`cors` 2.8.x só aceita array, string, RegExp ou boolean —
 * os tipos mais novos mencionam função, mas o runtime 2.8.5 ignora). Por isso
 * as entradas precisam ser a origem completa, com esquema e porta.
 */