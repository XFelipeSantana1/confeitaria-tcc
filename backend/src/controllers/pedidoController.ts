import pool from "../config/db.js";
import { Request, Response } from "express";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { ehFinal, podeMudar, rotulo, STATUS_VALIDOS } from "../lib/cicloPedido.js";
import { registrar } from "../services/registroService.js";
import type { RequisicaoAutenticada } from "../middleware/auth.js";

class ErroNegocio extends Error {}

/** Produto lendo preço e nome na mesma consulta do pedido. */
interface LinhaProduto extends RowDataPacket {
  id: number;
  nome: string;
  preco: number;
}

interface LinhaReceita extends RowDataPacket {
  insumo_id: number;
  quantidade_necessaria: number;
}

interface LinhaEstoque extends RowDataPacket {
  quantidade_atual: number;
}

interface LinhaStatus extends RowDataPacket {
  status: string;
  status_pagamento: string;
}

/** Soma por insumo no estorno: volta string (SUM de DECIMAL), Number() no uso. */
interface LinhaUso extends RowDataPacket {
  insumo_id: number;
  quantidade: number | string;
}

/** Item já validado, na forma em que entra no INSERT. */
interface ItemPronto {
  produto_id: number;
  quantidade: number;
  preco_unitario: number;
  subtotal: number;
}

// GET /api/pedidos?status=pendente -> painel
export async function listar(req: Request, res: Response) {
  // ?status=x&status=y chega como array. Fica só o primeiro valor, e só se for
  // texto: passar o array inteiro ao driver gerava SQL que ninguém revisou.
  const bruto = req.query.status;
  const status = Array.isArray(bruto) ? bruto[0] : bruto;

  let sql = `
    SELECT pe.*, c.nome AS cliente_nome, c.whatsapp
    FROM pedidos pe
    JOIN clientes c ON c.id = pe.cliente_id
  `;
  const params: (string | number)[] = [];

  if (typeof status === "string" && status !== "") {
    sql += " WHERE pe.status = ?";
    params.push(status);
  }
  sql += " ORDER BY pe.criado_em DESC";

  const [rows] = await pool.query(sql, params);
  res.json(rows);
}

export async function buscarPorId(req: Request, res: Response) {
  const id = Number(req.params.id);

  const [pedidoRows] = await pool.query<RowDataPacket[]>(
    `SELECT pe.*, c.nome AS cliente_nome, c.whatsapp
     FROM pedidos pe JOIN clientes c ON c.id = pe.cliente_id
     WHERE pe.id = ?`,
    [id]
  );
  if (!pedidoRows[0]) return res.status(404).json({ erro: "Pedido não encontrado." });

  const [itens] = await pool.query(
    `SELECT ip.*, p.nome AS produto_nome
     FROM itens_pedido ip JOIN produtos p ON p.id = ip.produto_id
     WHERE ip.pedido_id = ?`,
    [id]
  );

  res.json({ ...pedidoRows[0], itens });
}

// POST /api/bot/pedidos - chamado pelo bot (menu fixo, Nível 2)
// Body: { whatsapp, nome_cliente, forma_pagamento, itens: [{ produto_id, quantidade }] }
//
// Tudo roda em UMA transação: só confirma o pedido se houver estoque
// suficiente de TODOS os insumos envolvidos - é isso que impede o
// "furo de estoque" mesmo com pedidos simultâneos.
export async function criarViaBot(req: Request, res: Response) {
  const { whatsapp, nome_cliente, forma_pagamento, itens } = req.body;

  if (!whatsapp || !Array.isArray(itens) || itens.length === 0) {
    return res.status(400).json({ erro: "whatsapp e itens são obrigatórios." });
  }

  // Validação dura de cada item ANTES de abrir a transação: sem ela,
  // quantidade 0 criava pedido vazio e quantidade negativa AUMENTAVA o
  // estoque (a baixa subtrai o valor, e menos com menos dá mais).
  const itensNormalizados = itens.map((item) => ({
    produto_id: Number(item?.produto_id),
    quantidade: Number(item?.quantidade),
  }));
  const itemInvalido = itensNormalizados.some(
    (item) =>
      !Number.isInteger(item.produto_id) ||
      item.produto_id <= 0 ||
      !Number.isInteger(item.quantidade) ||
      item.quantidade <= 0,
  );
  if (itemInvalido) {
    return res.status(400).json({
      erro: "Cada item precisa de produto_id e quantidade inteira maior que zero.",
    });
  }

  const conexao = await pool.getConnection();
  try {
    await conexao.beginTransaction();

    // 1. Garante que o cliente existe.
    // INSERT ... ON DUPLICATE KEY UPDATE + LAST_INSERT_ID: dois pedidos do
    // mesmo whatsapp novo, ao mesmo tempo, não podem colidir no
    // índice único (viraria 500). O SELECT seguido de INSERT tinha essa
    // corrida; aqui o próprio banco resolve e devolve o id.
    const [resultado] = await conexao.query<ResultSetHeader>(
      `INSERT INTO clientes (nome, whatsapp) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)`,
      [nome_cliente || null, whatsapp]
    );
    const clienteId = resultado.insertId;

    // 2. Para cada item: busca preço + ficha técnica, e TRAVA a linha
    //    do insumo (FOR UPDATE) para evitar corrida entre pedidos
    //    simultâneos disputando o mesmo insumo escasso.
    let valorTotal = 0;
    const itensParaInserir: ItemPronto[] = [];
    const baixasDeEstoque: { insumo_id: number; quantidade: number }[] = [];

    for (const item of itensNormalizados) {
      const [produtoRows] = await conexao.query<LinhaProduto[]>(
        "SELECT id, nome, preco FROM produtos WHERE id = ? AND ativo = TRUE",
        [item.produto_id]
      );
      const produto = produtoRows[0];
      if (!produto) {
        throw new ErroNegocio(`Produto ${item.produto_id} não encontrado ou inativo.`);
      }

      const subtotal = produto.preco * item.quantidade;
      valorTotal += subtotal;
      itensParaInserir.push({
        produto_id: produto.id,
        quantidade: item.quantidade,
        preco_unitario: produto.preco,
        subtotal,
      });

      const [receita] = await conexao.query<LinhaReceita[]>(
        "SELECT insumo_id, quantidade_necessaria FROM produto_insumo WHERE produto_id = ?",
        [produto.id]
      );

      for (const ingrediente of receita) {
        const necessario = ingrediente.quantidade_necessaria * item.quantidade;

        const [insumoRows] = await conexao.query<LinhaEstoque[]>(
          "SELECT quantidade_atual FROM insumos WHERE id = ? FOR UPDATE",
          [ingrediente.insumo_id]
        );
        const disponivel = insumoRows[0]?.quantidade_atual ?? 0;

        if (disponivel < necessario) {
          throw new ErroNegocio(`Estoque insuficiente para o produto "${produto.nome}".`);
        }

        baixasDeEstoque.push({ insumo_id: ingrediente.insumo_id, quantidade: necessario });
      }
    }

    // 3. Cria o pedido (forma de pagamento validada: é enum no banco,
    // então string arbitrária viraria 500 do MySQL em vez de 400).
    const formasValidas = ["pix", "cartao", "dinheiro", "outro"];
    if (forma_pagamento !== undefined && forma_pagamento !== null && !formasValidas.includes(forma_pagamento)) {
      await conexao.rollback();
      return res.status(400).json({ erro: "Forma de pagamento inválida. Use: pix, cartao, dinheiro ou outro." });
    }
    const [pedidoResult] = await conexao.query<ResultSetHeader>(
      `INSERT INTO pedidos (cliente_id, status, forma_pagamento, valor_total, origem)
       VALUES (?, 'pendente', ?, ?, 'whatsapp')`,
      [clienteId, forma_pagamento || null, valorTotal]
    );
    const pedidoId = pedidoResult.insertId;

    // 4. Insere os itens
    for (const item of itensParaInserir) {
      await conexao.query(
        `INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario, subtotal)
         VALUES (?, ?, ?, ?, ?)`,
        [pedidoId, item.produto_id, item.quantidade, item.preco_unitario, item.subtotal]
      );
    }

    // 5. Debita estoque e registra a movimentação (auditoria)
    for (const baixa of baixasDeEstoque) {
      await conexao.query(
        "UPDATE insumos SET quantidade_atual = quantidade_atual - ? WHERE id = ?",
        [baixa.quantidade, baixa.insumo_id]
      );
      await conexao.query(
        `INSERT INTO movimentacoes_estoque (insumo_id, tipo, quantidade, pedido_id, observacao)
         VALUES (?, 'saida', ?, ?, 'Baixa automática por venda')`,
        [baixa.insumo_id, baixa.quantidade, pedidoId]
      );
    }

    await conexao.commit();
    res.status(201).json({ id: pedidoId, valor_total: valorTotal, status: "pendente" });
  } catch (err) {
    await conexao.rollback();
    if (err instanceof ErroNegocio) {
      return res.status(409).json({ erro: err.message });
    }
    throw err;
  } finally {
    conexao.release();
  }
}

// PATCH /api/pedidos/:id/status -> painel
// Regras: cancelado é estado final (não sai de lá) e cancelar ESTORNA o
// estoque debitado na venda (baixa reversa auditada). Sem isso, cancelar
// sumia com o pedido e o insumo ficava debitado para sempre.
export async function atualizarStatus(req: RequisicaoAutenticada, res: Response) {
  const id = Number(req.params.id);
  const { status } = req.body;

  if (!STATUS_VALIDOS.includes(status)) {
    return res.status(400).json({ erro: "Status inválido." });
  }

  const conexao = await pool.getConnection();
  try {
    await conexao.beginTransaction();

    const [pedidoRows] = await conexao.query<LinhaStatus[]>(
      "SELECT status, status_pagamento FROM pedidos WHERE id = ? FOR UPDATE",
      [id]
    );
    if (!pedidoRows[0]) {
      await conexao.rollback();
      return res.status(404).json({ erro: "Pedido não encontrado." });
    }
    const statusAnterior = pedidoRows[0].status;

    if (statusAnterior === status) {
      await conexao.rollback();
      return res.json({ id, status });
    }

    // A regra mora na API (lib/cicloPedido): a tela esconder o botão não
    // impede a chamada. Sem esta checagem dava para devolver ao estoque uma
    // encomenda já entregue, ou andar para trás no fluxo.
    if (!podeMudar(statusAnterior, status)) {
      await conexao.rollback();
      const motivo = ehFinal(statusAnterior)
        ? `Pedido ${rotulo(statusAnterior)} é o fim do fluxo e não muda mais.`
        : `Não dá para ir de "${rotulo(statusAnterior)}" para "${rotulo(status)}".`;
      return res.status(409).json({ erro: motivo });
    }

    // Cancelar devolve o dinheiro recebido: o pedido não vai mais ser entregue.
    const estornarPagamento = status === "cancelado" && pedidoRows[0].status_pagamento === "pago";

    await conexao.query("UPDATE pedidos SET status = ? WHERE id = ?", [status, id]);

    // Entrou em cancelado vindo de outro estado: devolve cada insumo usado
    // pelos itens (agrupado por insumo) e registra a devolução.
    if (status === "cancelado" && statusAnterior !== "cancelado") {
      // Lê as movimentações de SAÍDA do pedido, e não a ficha técnica atual:
      // a baixa foi o que de fato saiu do estoque. Se o gestor editar a
      // receita depois da venda, reconstituir pelo JOIN devolvia quantidade
      // errada (ou nada) e o insumo sumia do estoque para sempre.
      const [usos] = await conexao.query<LinhaUso[]>(
        `SELECT insumo_id, SUM(quantidade) AS quantidade
         FROM movimentacoes_estoque
         WHERE pedido_id = ? AND tipo = 'saida'
         GROUP BY insumo_id`,
        [id]
      );
      for (const uso of usos) {
        await conexao.query(
          "UPDATE insumos SET quantidade_atual = quantidade_atual + ? WHERE id = ?",
          [uso.quantidade, uso.insumo_id]
        );
        await conexao.query(
          `INSERT INTO movimentacoes_estoque (insumo_id, tipo, quantidade, pedido_id, observacao)
           VALUES (?, 'entrada', ?, ?, 'Estorno por cancelamento do pedido')`,
          [uso.insumo_id, uso.quantidade, id]
        );
      }
    }

    if (estornarPagamento) {
      await conexao.query(
        "UPDATE pedidos SET status_pagamento = 'estornado' WHERE id = ?",
        [id]
      );
    }

    await conexao.commit();

    // Auditoria depois do commit: se falhasse antes, o status já teria mudado
    // sem registro. O inverso (log de algo que não mudou) é bem menos grave.
    await registrar(req, {
      acao: "atualizar",
      tabela: "pedidos",
      registroId: id,
      descricao: `Moveu o pedido #${id} de "${rotulo(statusAnterior)}" para "${rotulo(status)}"`,
      antes: { status: statusAnterior, status_pagamento: pedidoRows[0].status_pagamento },
      depois: {
        status,
        status_pagamento: estornarPagamento ? "estornado" : pedidoRows[0].status_pagamento,
      },
    });

    res.json({
      id,
      status,
      status_pagamento: estornarPagamento ? "estornado" : pedidoRows[0].status_pagamento,
    });
  } catch (err) {
    await conexao.rollback();
    throw err;
  } finally {
    conexao.release();
  }
}

export async function atualizarPagamento(req: RequisicaoAutenticada, res: Response) {
  const id = Number(req.params.id);
  const { status_pagamento } = req.body;

  const validos = ["pendente", "pago", "estornado"];
  if (!validos.includes(status_pagamento)) {
    return res.status(400).json({ erro: "Status de pagamento inválido. Use: pendente, pago ou estornado." });
  }

  const [anteriores] = await pool.query<LinhaStatus[]>(
    "SELECT status, status_pagamento FROM pedidos WHERE id = ?",
    [id]
  );
  const anterior = anteriores[0];
  if (!anterior) {
    return res.status(404).json({ erro: "Pedido não encontrado." });
  }

  // Cancelar um pedido que estava pago estorna o pagamento (feito na troca de
  // status). Se aqui ainda coubesse marcar como pago, o resumo voltaria a
  // contar dinheiro de encomenda devolvida.
  if (anterior.status === "cancelado" && status_pagamento !== "estornado") {
    return res.status(409).json({
      erro: "Pedido cancelado só aceita pagamento estornado.",
    });
  }
  if (anterior.status_pagamento === status_pagamento) {
    return res.json({ id, status_pagamento });
  }

  const [result] = await pool.query<ResultSetHeader>(
    "UPDATE pedidos SET status_pagamento = ? WHERE id = ?",
    [status_pagamento, id]
  );
  if (result.affectedRows === 0) {
    return res.status(404).json({ erro: "Pedido não encontrado." });
  }

  await registrar(req, {
    acao: "atualizar",
    tabela: "pedidos",
    registroId: id,
    descricao: `Pagamento do pedido #${id}: ${anterior.status_pagamento} → ${status_pagamento}`,
    antes: { status_pagamento: anterior.status_pagamento },
    depois: { status_pagamento },
  });

  res.json({ id, status_pagamento });
}
