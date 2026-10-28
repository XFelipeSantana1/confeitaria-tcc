import type { Produto } from "../types";

// Hierarquia da imagem de um doce:
//   1. `imagem_url` — a foto que a confeiteira subiu pelo painel. Sempre
//      vence, e é a única que pode ser garantida como sendo aquele doce;
//   2. foto curada — UMA foto só, conferida com o olho: trufas ao
//      natural, que é doce de chocolate e serve para as trufas da casa;
//   3. `null` — o card desenha um fundo areia com o nome do doce em
//      Playfair. Sem emoji e sem gradiente: emoji de doce é piada interna
//      que envelhece mal, e o gradiente aleatório por id pintava brigadeiro
//      de rosa e trufa de verde — coisa que confeitaria de verdade não
//      faz. O vazio honesto (areia + nome) parece desenhado, não quebrado.
//
// Foto de graça no Unsplash foi tentada: quatro URLs responderam 200 e,
// abertas, DUAS mostravam outra coisa (cupcakes azuis no lugar de um cone,
// bolo de framboesa no lugar de um doce de morango). O CDN responde 200
// para foto já removida do catálogo, então "a URL abre" não prova nada.
// Mapear "pão de mel" para uma foto de trufa só porque as duas são escuras
// e massudas parece tempting, e a cliente recebe outra coisa. Sem foto, o
// card não mente.
const foto = (id: string): string =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=80`;

const FOTO_TRUFA = foto("1549007994-cb92caebd54b");

export function imagemParaProduto(produto: Produto): string | null {
  if (produto.imagemUrl) return produto.imagemUrl;

  // A categoria vem antes do nome: "Trufa de maracujá" é trufa, e não o doce
  // de morango que a palavra-chave traria.
  const categoria = produto.categoria?.toLowerCase() ?? "";
  if (categoria.includes("trufa")) return FOTO_TRUFA;

  const nome = produto.nome.toLowerCase();
  if (nome.includes("trufa") || nome.includes("brigadeiro")) return FOTO_TRUFA;
  return null;
}
