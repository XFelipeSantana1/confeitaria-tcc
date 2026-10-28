// Número da loja em um lugar só. A vitrine lê em dois pontos (o modal de
// configuração e o botão de finalizar pedido) e eles precisam concordar — duas
// cópias da mesma chave no localStorage é como aparece bug do tipo "salvei o
// número e o botão continuou avisando que faltava".
//
// O valor salvo no navegador tem prioridade sobre o do build: assim a loja
// troca o número pela engrenagem, sem rebuild, e o `.env` versionado não
// carrega o telefone de ninguém.
export const CHAVE_WHATS = "cg_whats";

export function lerWhatsSalvo(): string {
  return localStorage.getItem(CHAVE_WHATS) ?? "";
}

export function lerWhatsDoBuild(): string {
  return (import.meta.env.VITE_WHATSAPP_LOJA as string | undefined) ?? "";
}

// Só dígitos com DDI+DDD (10 ou mais) contam como número utilizável: o
// wa.me com número incompleto abre o chat errado e o cliente acha que a
// loja não recebeu o pedido.
export function lerWhats(): string {
  const numero = lerWhatsSalvo() || lerWhatsDoBuild();
  return numero.replace(/\D/g, "").length >= 10 ? numero : "";
}
