/**
 * Erros do MySQL chegam como objeto com `code` (mysql2 estende Error), mas o
 * TypeScript só garante `unknown` no `catch`. Estas funções filtram o que
 * cada controller precisa sem espalhar `as { code: string }` pelo código —
 * e sem `any`, que era o que segurava o `err.code` antes.
 */

/** Erro do driver do MySQL: tem `code` e `errno`. */
interface ErroMysql {
  code: string;
  errno?: number;
  sqlMessage?: string;
}

/** true quando o valor é um erro do MySQL com o código esperado. */
export function temCodigo(erro: unknown, codigo: string): boolean {
  return (erro as ErroMysql | null)?.code === codigo;
}

/** Chave duplicada (índice UNIQUE violado). */
export function ehDuplicado(erro: unknown): boolean {
  return temCodigo(erro, "ER_DUP_ENTRY");
}

/** Chave estrangeira apontando para linha que não existe. */
export function ehReferenciaInvalida(erro: unknown): boolean {
  return (
    temCodigo(erro, "ER_NO_REFERENCED_ROW_2") || temCodigo(erro, "ER_NO_REFERENCED_ROW")
  );
}

/**
 * Mensagem legível de qualquer erro, para o log do servidor.
 * Sem isto o `catch` do Express imprimia `[object Object]`.
 */
export function mensagemDoErro(erro: unknown): string {
  if (erro instanceof Error) return erro.message;
  if (typeof erro === "string") return erro;
  return JSON.stringify(erro);
}