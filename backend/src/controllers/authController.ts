import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import "dotenv/config";
import pool from "../config/db.js";
import { Request, Response } from "express";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { RequisicaoAutenticada } from "../middleware/auth.js";
import { ehDuplicado } from "../lib/erros.js";

/** O usuário como o banco devolve: nunca expõe `senha_hash` nas respostas. */
interface LinhaUsuario extends RowDataPacket {
  id: number;
  nome: string;
  email: string;
  cargo: "admin" | "gestor";
  ativo: number | boolean;
  senha_hash?: string;
  imagem_url: string | null;
}

/** Só o que vai para o cliente: sem hash, sem `ativo`. */
function publicar(usuario: LinhaUsuario): Omit<LinhaUsuario, "senha_hash" | "ativo"> {
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    cargo: usuario.cargo,
    imagem_url: usuario.imagem_url,
  };
}

interface LinhaTotal extends RowDataPacket {
  /** COUNT(*) volta string pelo driver — daí o Number() no uso. */
  total: number | string;
}

export async function login(req: Request, res: Response) {
  const { email, senha } = req.body;
  if (!email || !senha) {
    return res.status(400).json({ erro: "Email e senha são obrigatórios." });
  }

  const [rows] = await pool.query<LinhaUsuario[]>(
    "SELECT id, nome, email, cargo, senha_hash FROM usuarios WHERE email = ? AND ativo = TRUE",
    [email]
  );
  const usuario = rows[0];

  if (!usuario) {
    return res.status(401).json({ erro: "Credenciais inválidas." });
  }

  const senhaOk = await bcrypt.compare(senha, usuario.senha_hash ?? "");
  if (!senhaOk) {
    return res.status(401).json({ erro: "Credenciais inválidas." });
  }

  // O nome vai no token para a auditoria não precisar consultar o banco a cada
  // registro gravado (e para o log continuar legível se o usuário for apagado).
  const token = jwt.sign(
    { id: usuario.id, nome: usuario.nome, email: usuario.email, cargo: usuario.cargo },
    process.env.JWT_SECRET as string,
    { expiresIn: (process.env.JWT_EXPIRES_IN || "8h") as jwt.SignOptions["expiresIn"] }
  );

  res.json({ token, usuario: publicar(usuario) });
}

export async function registrar(req: RequisicaoAutenticada, res: Response) {
  const { nome, email, senha, cargo } = req.body;
  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: "Nome, email e senha são obrigatórios." });
  }
  // Mesma regra do PUT /auth/me: cadastro aceitava "a" e o perfil recusava.
  if (typeof senha !== "string" || senha.length < 6) {
    return res.status(400).json({ erro: "A senha precisa de ao menos 6 caracteres." });
  }

  if (typeof senha !== "string" || senha.length < 6) {
    return res.status(400).json({ erro: "A senha precisa de ao menos 6 caracteres." });
  }

  const cargoFinal = cargo || "gestor";
  if (!["admin", "gestor"].includes(cargoFinal)) {
    return res.status(400).json({ erro: "Cargo inválido. Use: admin ou gestor." });
  }

  // A partir do momento em que existe ao menos 1 usuário, criar novos
  // usuários exige estar logado como admin. A exceção é o bootstrap:
  // com a base vazia, o primeiro cadastro é livre (é assim que se cria
  // o admin inicial). Sem isso a rota ficaria aberta para sempre.
  const [existentes] = await pool.query<LinhaTotal[]>(
    "SELECT COUNT(*) AS total FROM usuarios"
  );
  if (Number(existentes[0]?.total ?? 0) > 0) {
    if (!req.usuario) {
      return res.status(401).json({ erro: "Apenas administradores podem cadastrar usuários." });
    }
    if (req.usuario.cargo !== "admin") {
      return res.status(403).json({ erro: "Apenas administradores podem cadastrar usuários." });
    }
  }

  const senha_hash = await bcrypt.hash(senha, 10);

  try {
    const [result] = await pool.query<ResultSetHeader>(
      "INSERT INTO usuarios (nome, email, senha_hash, cargo) VALUES (?, ?, ?, ?)",
      [nome, email, senha_hash, cargoFinal]
    );
    res.status(201).json({ id: result.insertId, nome, email, cargo: cargoFinal });
  } catch (erro: unknown) {
    if (ehDuplicado(erro)) {
      return res.status(409).json({ erro: "Já existe um usuário com esse email." });
    }
    throw erro;
  }
}

// GET /api/auth/me - retorna quem é o dono do token (o front usa isso
// para validar a sessão salva e exibir nome/cargo no painel).
export async function me(req: RequisicaoAutenticada, res: Response) {
  const [rows] = await pool.query<LinhaUsuario[]>(
    "SELECT id, nome, email, cargo, ativo, imagem_url FROM usuarios WHERE id = ?",
    [req.usuario!.id]
  );
  const usuario = rows[0];
  if (!usuario || !usuario.ativo) {
    return res.status(401).json({ erro: "Usuário não encontrado ou inativo." });
  }
  res.json(publicar(usuario));
}

// PUT /api/auth/me - o próprio usuário edita nome/email e troca a senha.
// Escopo travado no id do token (nunca edita outra pessoa). Troca de senha
// exige a senha atual; email duplicado vira 409.
export async function atualizarPerfil(req: RequisicaoAutenticada, res: Response) {
  const id = req.usuario!.id;
  const { nome, email, senha_atual, senha_nova, imagem_url } = req.body;

  if (nome !== undefined && (typeof nome !== "string" || nome.trim() === "")) {
    return res.status(400).json({ erro: "Nome inválido." });
  }
  if (email !== undefined && (typeof email !== "string" || !email.includes("@"))) {
    return res.status(400).json({ erro: "Email inválido." });
  }
  if (senha_nova !== undefined && (typeof senha_nova !== "string" || senha_nova.length < 6)) {
    return res.status(400).json({ erro: "A nova senha precisa de ao menos 6 caracteres." });
  }
  // Foto do perfil: caminho vindo do upload (começa com "/uploads/") ou null
  // para tirar a foto. Qualquer outra coisa é 400 — sem isso, dava para gravar
  // "javascript:..." no campo e sair num <img> com isso no src.
  let fotoFinal: string | null = null;
  if (imagem_url !== undefined) {
    if (imagem_url === null || imagem_url === "") {
      fotoFinal = null;
    } else if (typeof imagem_url !== "string" || !imagem_url.startsWith("/uploads/")) {
      return res.status(400).json({ erro: "Foto inválida: envie a imagem pelo botão de foto." });
    } else if (imagem_url.length > 255) {
      return res.status(400).json({ erro: "Caminho da foto longo demais." });
    } else {
      fotoFinal = imagem_url;
    }
  }

  try {
    let senha_hash: string | null = null;
    if (senha_nova !== undefined) {
      if (!senha_atual) {
        return res.status(400).json({ erro: "Informe a senha atual para trocar a senha." });
      }
      const [linhas] = await pool.query<LinhaUsuario[]>(
        "SELECT senha_hash FROM usuarios WHERE id = ?",
        [id]
      );
      if (!linhas[0]) return res.status(404).json({ erro: "Usuário não encontrado." });
      const confere = await bcrypt.compare(senha_atual, linhas[0].senha_hash ?? "");
      if (!confere) {
        return res.status(401).json({ erro: "Senha atual incorreta." });
      }
      senha_hash = await bcrypt.hash(senha_nova, 10);
    }

    const [result] = await pool.query<ResultSetHeader>(
      // `imagem_url` é o único campo que NÃO usa COALESCE: sem foto é para
      // REMOVER a foto (gravar NULL), e COALESCE transformaria isso em
      // "mantém a anterior" — a pessoa clicaria em remover e nada aconteceria.
      `UPDATE usuarios SET
         nome = COALESCE(?, nome),
         email = COALESCE(?, email),
         senha_hash = COALESCE(?, senha_hash),
         imagem_url = ?
       WHERE id = ? AND ativo = TRUE`,
      [
        nome !== undefined ? nome.trim() : null,
        email !== undefined ? email.trim() : null,
        senha_hash,
        fotoFinal,
        id,
      ]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ erro: "Usuário não encontrado." });
    }

    const [atualizado] = await pool.query<LinhaUsuario[]>(
      "SELECT id, nome, email, cargo, imagem_url FROM usuarios WHERE id = ?",
      [id]
    );
    res.json(publicar(atualizado[0]));
  } catch (erro: unknown) {
    if (ehDuplicado(erro)) {
      return res.status(409).json({ erro: "Já existe um usuário com esse email." });
    }
    throw erro;
  }
}