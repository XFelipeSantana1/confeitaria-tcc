import type { Produto } from "../types";

// Cardápio de demonstração: espelha o seed.sql para a pessoa testar o visual
// mesmo com o backend desligado. Só é usado quando a API falha E a pessoa
// escolhe "ver demonstração" — nunca mascara erro silenciosamente.
// As fotos são as mesmas curadas de src/lib/aparenciaProduto.ts.
const foto = (id: string): string =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=80`;

export const PRODUTOS_DEMONSTRACAO: Produto[] = [
  {
    id: 1,
    nome: "Cone doce tradicional",
    descricao: "Cone recheado com leite condensado e granulado",
    preco: 8.5,
    imagemUrl: foto("1486427944299-d1955d23e34d"),
    categoria: "Doces",
    ativo: true,
  },
  {
    id: 2,
    nome: "Cone doce com morango",
    descricao: "Cone recheado com leite condensado e morango fresco",
    preco: 10.0,
    imagemUrl: foto("1565958011703-44f9829ba187"),
    categoria: "Doces",
    ativo: true,
  },
  {
    id: 3,
    nome: "Bolo de chocolate fatiado",
    descricao: "Fatia generosa com cobertura brilhante de chocolate",
    preco: 12.0,
    imagemUrl: foto("1578985545062-69928b1d9587"),
    categoria: "Bolos",
    ativo: true,
  },
  {
    id: 4,
    nome: "Brigadeiro belga (un.)",
    descricao: "Clássico cremoso com granulado nobre",
    preco: 6.5,
    imagemUrl: foto("1549007994-cb92caebd54b"),
    categoria: "Doces",
    ativo: true,
    quantidadeDisponivel: 0,
  },
  {
    id: 5,
    nome: "Coxinha de festa (un.)",
    descricao: "Massa leve e recheio suculento de frango",
    preco: 7.0,
    imagemUrl: foto("1601050690597-df0568f70950"),
    categoria: "Salgados",
    ativo: true,
  },
  {
    id: 6,
    nome: "Bolo de morango inteiro",
    descricao: "Encomenda com chantilly e morangos selecionados",
    preco: 89.9,
    imagemUrl: foto("1578985545062-69928b1d9587"),
    categoria: "Bolos",
    ativo: true,
  },
];

export const CATEGORIAS_DEMONSTRACAO: string[] = ["Bolos", "Doces", "Salgados"];
