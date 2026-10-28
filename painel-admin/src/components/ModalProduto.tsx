import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import type { Categoria, Insumo, ProdutoAdmin } from "../types";
import { Entrada } from "./ui/Entrada";
import { Botao } from "./ui/Botao";
import { EditorFicha, type LinhaFicha } from "./EditorFicha";
import { CampoImagem } from "./CampoImagem";

export interface DadosProduto {
  nome: string;
  descricao: string;
  preco: number;
  categoria_id: number | null;
  imagem_url: string;
  ficha: Array<{ insumo_id: number; quantidade_necessaria: number }>;
}

// Criação e edição com ficha técnica embutida (5.3). Linhas vazias são
// descartadas no salvar; duplicar o mesmo insumo o backend barra (PK).
//
// CELULAR: tela cheia com cabeçalho "Cancelar" (texto, esquerda) · título ·
// "Salvar" (texto carameloForte, direita) — o formulário é longo e o rodapé
// tradicional ficava fora da tela (esse era o motivo do max-h no antigo).
// DESKTOP: modal max-w-xl branco, rounded-card, shadow-flutuante, com X e
// botão primário no rodapé.
// Rótulos em caixa normal acima do campo (Campos pela 3.5: bg branco, borda
// textoSuave/80, 16px — sem zoom do iOS).
interface PropriedadesModalProduto {
  produto: ProdutoAdmin | null;
  fichaInicial: Array<{ insumo_id: number; quantidade_necessaria: number }>;
  categorias: Categoria[];
  insumos: Insumo[];
  salvando: boolean;
  erro: string | null;
  aoFechar: () => void;
  aoSalvar: (dados: DadosProduto) => void;
  // Solta no servidor no momento da escolha: guardar o File em estado e mandar
  // junto no submit seguraria o arquivo em memória durante toda a edição e
  // falharia no refresh acidental do formulário.
  aoEnviarImagem: (arquivo: File) => Promise<string>;
}

let proximaChave = 1;

export function ModalProduto({
  produto,
  fichaInicial,
  categorias,
  insumos,
  salvando,
  erro,
  aoFechar,
  aoSalvar,
  aoEnviarImagem,
}: PropriedadesModalProduto): JSX.Element {
  const [nome, definirNome] = useState(produto?.nome ?? "");
  const [descricao, definirDescricao] = useState(produto?.descricao ?? "");
  const [preco, definirPreco] = useState(produto ? String(produto.preco) : "");
  const [categoria, definirCategoria] = useState(
    produto?.categoria_id != null ? String(produto.categoria_id) : "",
  );
  const [imagem, definirImagem] = useState(produto?.imagem_url ?? "");
  const [linhas, definirLinhas] = useState<LinhaFicha[]>(
    fichaInicial.map((item) => ({
      chave: proximaChave++,
      insumo_id: String(item.insumo_id),
      quantidade: String(item.quantidade_necessaria),
    })),
  );

  function enviar(evento: FormEvent): void {
    evento.preventDefault();
    const ficha = linhas
      .filter((linha) => linha.insumo_id !== "" && Number(linha.quantidade) > 0)
      .map((linha) => ({
        insumo_id: Number(linha.insumo_id),
        quantidade_necessaria: Number(linha.quantidade),
      }));
    aoSalvar({
      nome: nome.trim(),
      descricao: descricao.trim(),
      preco: Number(preco),
      categoria_id: categoria === "" ? null : Number(categoria),
      imagem_url: imagem.trim(),
      ficha,
    });
  }

  return (
    <div
      className="fixed inset-0 z-[70] overflow-y-auto bg-tinta/50 md:grid md:place-items-center md:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={produto ? "Editar produto" : "Novo produto"}
    >
      <form
        onSubmit={enviar}
        className="flex min-h-dvh w-full flex-col gap-3 bg-white p-4 text-tinta shadow-flutuante md:min-h-0 md:max-h-[calc(100dvh-4rem)] md:max-w-xl md:overflow-y-auto md:rounded-card md:border md:border-borda md:p-6"
      >
        {/* Cabeçalho de tampa no celular (aria-busy salvo no botão primário do
            desktop e travado via disabled no celular). */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-2 bg-white pb-1 md:static md:pb-0">
          <button
            type="button"
            onClick={aoFechar}
            className="-ml-2 flex-none rounded-campo px-2 text-sm font-medium text-textoSuave hover:text-tinta hover:underline underline-offset-4 md:hidden"
            aria-label="Cancelar e voltar para a lista"
          >
            Cancelar
          </button>
          <h3 className="min-w-0 flex-1 text-lg font-semibold text-tinta md:flex-none">
            {produto ? "Editar produto" : "Novo produto"}
          </h3>
          <button
            type="submit"
            disabled={salvando}
            className="-mr-2 flex-none rounded-campo px-2 text-sm font-medium text-carameloForte hover:underline underline-offset-4 disabled:cursor-not-allowed disabled:opacity-60 md:hidden"
          >
            {salvando ? "Salvando…" : "Salvar"}
          </button>
          <button
            type="button"
            onClick={aoFechar}
            aria-label="Fechar"
            className="hidden h-11 w-11 flex-none place-items-center rounded-campo transition-colors hover:bg-areia/60 md:grid"
          >
            <X size={18} strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>

        <Entrada id="prod-nome" rotulo="Nome" value={nome} onChange={(e) => definirNome(e.target.value)} placeholder="Ex: Cone doce tradicional" />
        <label className="flex flex-col gap-1.5 text-sm font-medium text-tinta">
          Descrição
          <textarea
            value={descricao}
            onChange={(e) => definirDescricao(e.target.value)}
            rows={2}
            placeholder="O que torna esse doce especial?"
            className="rounded-campo border border-textoSuave/80 bg-white px-3 py-2.5 font-corpo text-base text-tinta outline-none transition-colors placeholder:text-textoSuave/60 focus:border-caramelo focus:ring-2 focus:ring-caramelo/40"
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <Entrada id="prod-preco" rotulo="Preço (R$)" type="number" min="0" step="any" value={preco} onChange={(e) => definirPreco(e.target.value)} placeholder="8.50" />
          <label className="flex flex-col gap-1.5 text-sm font-medium text-tinta">
            Categoria
            <select
              value={categoria}
              onChange={(e) => definirCategoria(e.target.value)}
              className="h-11 rounded-campo border border-textoSuave/80 bg-white px-3 font-corpo text-base text-tinta outline-none transition-colors focus:border-caramelo focus:ring-2 focus:ring-caramelo/40"
            >
              <option value="">Sem categoria</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </label>
        </div>
        <CampoImagem
          valor={imagem}
          rotulo="Foto do doce"
          aoMudar={definirImagem}
          aoEnviar={aoEnviarImagem}
          salvando={salvando}
        />
        <EditorFicha linhas={linhas} insumos={insumos} aoMudar={definirLinhas} />
        {erro ? (
          <p role="alert" className="text-sm text-perigo">
            Erro: {erro}
          </p>
        ) : null}
        {/* Rodapé primário é do DESKTOP; no celular quem salva é o cabeçalho. */}
        <Botao type="submit" disabled={salvando} className="hidden md:inline-flex">
          {salvando ? "Salvando…" : produto ? "Salvar" : "Cadastrar"}
        </Botao>
      </form>
    </div>
  );
}
