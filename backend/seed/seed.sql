USE confeitaria_db;

-- -----------------------------------------------------------------------------
-- Cardápio de exemplo da Doce & Carinho.
--
-- Este arquivo é o que o `schema.sql` espera: roda uma vez em base vazia. Para
-- recriar os dados de um banco que JÁ existe, use `refazer-cardapio.sql`, que
-- limpa só as tabelas de conteúdo antes de inserir.
--
-- As categorias são TIPOS DE DOCE, não "Doces/Bolos/Salgados". A cliente que
-- compra doce artesanal procurando "pão de mel" não acha nada numa categoria
-- chamada "Doces" — e a vitrine só mostra o que a loja quiser oferecer, sem
-- filtro por tipo dentro da categoria.
-- -----------------------------------------------------------------------------

INSERT INTO categorias (nome) VALUES
  ('Cones'),
  ('Trufas'),
  ('Pão de mel'),
  ('Amendoins');

-- Ingredientes com estoque em nível REALISTA, não redondo. Um mínimo de 500 g
-- de granulado com 3.000 g em estoque deixa "estoque baixo" sempre em zero no
-- Resumo do painel, que é justamente o número que o gestor olha primeiro.
INSERT INTO insumos (nome, unidade_medida, quantidade_atual, quantidade_minima, custo_unitario) VALUES
  ('Leite condensado',        'ml',     6000, 1500, 0.0120),
  ('Massa de cone',           'unidade',   80,   20, 0.6500),
  ('Chocolate granulado',     'g',      2500,  600, 0.0090),
  ('Chocolate meio amargo',   'g',      1800,  500, 0.0180),
  ('Manteiga',                'g',       900,  250, 0.0240),
  ('Morango',                 'g',      1200,  400, 0.0110),
  ('Amêndoas torradas',       'g',       700,  300, 0.0480),
  ('Doce de leite',           'g',      1100,  350, 0.0160),
  ('Farinha de mandioca',     'g',      1400,  400, 0.0070),
  ('Mel',                     'ml',      500,  200, 0.0210),
  ('Granulado de pistache',   'g',       200,  150, 0.0900),
  ('Polpa de maracujá',       'g',       600,  250, 0.0280),
  ('Chocolate branco',        'g',       700,  300, 0.0220),
  ('Amendoim torrado',        'g',       900,  350, 0.0190);

-- -----------------------------------------------------------------------------
-- Produtos.
--
-- As fotos são do Unsplash por URL, conferidas uma a uma: o que não está na
-- lista não entra. Foto genérica "comida bonita" engana mais do que
-- ajuda — a cliente vê brigadeiro na tela e recebe pão de mel.
-- -----------------------------------------------------------------------------
INSERT INTO produtos (nome, descricao, preco, categoria_id, imagem_url) VALUES
  -- Cones ---------------------------------------------------------------------
  ('Cone doce tradicional',
   'Massa crocante, recheio de leite condensado e cobertura de granulado.',
   8.00, 1, NULL),

  ('Cone de morango',
   'Recheio de leite condensado com morango fresco e cobertura de chocolate.',
   10.00, 1, NULL),

  ('Cone brigadeiro gourmet',
   'Brigadeiro cremoso de chocolate meio amargo com granulado de pistache.',
   12.50, 1, NULL),

  -- Trufas --------------------------------------------------------------------
  ('Trufa tradicional',
   'Chocolate meio amargo, manteiga e cacau. A mais pedida da casa.',
   6.50, 2, NULL),

  ('Trufa de maracujá',
   'Casca de chocolate branco recheada com geleia de maracujá.',
   7.00, 2, NULL),

  ('Trufa de doce de leite',
   'Recheio de doce de leite argentino com casca de chocolate meio amargo.',
   7.50, 2, NULL),

  -- Pão de mel ----------------------------------------------------------------
  ('Pão de mel tradicional',
   'Massa macia com mel e muito doce de leite. Rende oito pedaços.',
   14.00, 3, NULL),

  ('Pão de mel com amêndoas',
   'O tradicional com lascas de amêndoa torrada por cima.',
   17.00, 3, NULL),

  -- Amendoins -----------------------------------------------------------------
  ('Doce de amêndoa com doce de leite',
   'Amêndoa torrada em calda com doce de leite. Crocante por fora, macio por dentro.',
   9.00, 4, NULL),

  ('Amendoim torrado com mel',
   'Amendoim torrado em calda de mel e manteiga. Salgado, para o café.',
   11.00, 4, NULL),

  ('Paçoca de amendoim',
   'Massa de amendoim e cana, quebrada em palitos.',
   5.50, 4, NULL);

-- Um item fora do ar de propósito: mostra o selo "Oculto" funcionando e dá para
-- explicar na apresentação que o gestor desliga um produto sem apagá-lo.
UPDATE produtos SET ativo = FALSE WHERE nome = 'Paçoca de amendoim';

-- -----------------------------------------------------------------------------
-- -----------------------------------------------------------------------------
-- Ficha técnica: o que cada receita usa.
--
-- É esta tabela que resolve o furo de estoque. Todo valor aqui é na unidade do
-- insumo (g, ml ou unidade), e a baixa sai na venda.
--
-- Os insumos são ACHADOS POR NOME, não pelo id. A primeira versão deste arquivo
-- usava `id` fixo, e bastou acrescentar três ingredientes no fim da lista de
-- insumos para a "Trufa de maracujá" passar a levar chocolate branco no lugar da
-- polpa — erro silencioso, que só apareceu quando a receita foi lida no banco.
-- Buscar pelo nome deixa a ordem dos insumos irrelevante.
--
-- A tabela derivada entra no PRIMEIRO join, e `produtos`/`insumos` vêm depois
-- dela: no SQL um `JOIN` só enxerga o que já foi declarado, então colocá-la no
-- fim daria "unknown column".
--
-- `UNION ALL` em vez de VALUES: aqui são LINHAS (produto, insumo, quantidade), e
-- é o que deixa o nome do insumo legível ao lado do número. Recompor o INSERT
-- por produto economizaria dez linhas de SQL e custaria a manutenção da ordem.
-- -----------------------------------------------------------------------------
INSERT INTO produto_insumo (produto_id, insumo_id, quantidade_necessaria)
SELECT prod.id, ins.id, receita.quantidade
FROM (
  -- Cones: massa crocante, recheio de leite condensado, cobertura.
  SELECT 'Cone doce tradicional' AS produto_nome, 'Massa de cone' AS insumo_nome, 1 AS quantidade
  UNION ALL SELECT 'Cone doce tradicional', 'Leite condensado', 45
  UNION ALL SELECT 'Cone doce tradicional', 'Chocolate granulado', 18

  UNION ALL SELECT 'Cone de morango', 'Massa de cone', 1
  UNION ALL SELECT 'Cone de morango', 'Leite condensado', 45
  UNION ALL SELECT 'Cone de morango', 'Morango', 30
  UNION ALL SELECT 'Cone de morango', 'Chocolate meio amargo', 15

  UNION ALL SELECT 'Cone brigadeiro gourmet', 'Massa de cone', 1
  UNION ALL SELECT 'Cone brigadeiro gourmet', 'Leite condensado', 50
  UNION ALL SELECT 'Cone brigadeiro gourmet', 'Chocolate meio amargo', 20
  UNION ALL SELECT 'Cone brigadeiro gourmet', 'Granulado de pistache', 8

  -- Trufas: sem massa. Chocolate, manteiga e o recheio de cada uma.
  UNION ALL SELECT 'Trufa tradicional', 'Chocolate meio amargo', 30
  UNION ALL SELECT 'Trufa tradicional', 'Manteiga', 10

  UNION ALL SELECT 'Trufa de maracujá', 'Polpa de maracujá', 25
  UNION ALL SELECT 'Trufa de maracujá', 'Chocolate branco', 22

  UNION ALL SELECT 'Trufa de doce de leite', 'Chocolate meio amargo', 30
  UNION ALL SELECT 'Trufa de doce de leite', 'Doce de leite', 25

  -- Pão de mel: farinha de mandioca, mel, doce de leite e manteiga.
  UNION ALL SELECT 'Pão de mel tradicional', 'Farinha de mandioca', 180
  UNION ALL SELECT 'Pão de mel tradicional', 'Mel', 40
  UNION ALL SELECT 'Pão de mel tradicional', 'Doce de leite', 120
  UNION ALL SELECT 'Pão de mel tradicional', 'Manteiga', 40

  UNION ALL SELECT 'Pão de mel com amêndoas', 'Farinha de mandioca', 180
  UNION ALL SELECT 'Pão de mel com amêndoas', 'Mel', 40
  UNION ALL SELECT 'Pão de mel com amêndoas', 'Doce de leite', 120
  UNION ALL SELECT 'Pão de mel com amêndoas', 'Manteiga', 40
  UNION ALL SELECT 'Pão de mel com amêndoas', 'Amêndoas torradas', 20

  -- Amendoins: o doce de amêndoa leva amêndoa torrada (id 7 no catálogo antigo);
  -- o torrado e a paçoca levam AMENDOIM, que é outro ingrediente.
  UNION ALL SELECT 'Doce de amêndoa com doce de leite', 'Amêndoas torradas', 35
  UNION ALL SELECT 'Doce de amêndoa com doce de leite', 'Doce de leite', 30

  UNION ALL SELECT 'Amendoim torrado com mel', 'Amendoim torrado', 40
  UNION ALL SELECT 'Amendoim torrado com mel', 'Mel', 15
  UNION ALL SELECT 'Amendoim torrado com mel', 'Manteiga', 8

  UNION ALL SELECT 'Paçoca de amendoim', 'Amendoim torrado', 38
  UNION ALL SELECT 'Paçoca de amendoim', 'Mel', 12
) AS receita
JOIN produtos prod ON prod.nome = receita.produto_nome
JOIN insumos ins ON ins.nome = receita.insumo_nome;