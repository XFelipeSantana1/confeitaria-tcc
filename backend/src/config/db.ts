import "dotenv/config";
import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  // Charset da CONEXÃO, e não da tabela. As tabelas já são `utf8mb4` (tem emoji
  // e acento composto), mas sem isto o mysql2 negocia latin1 com o servidor:
  // "Pão de mel" entrava como "PÃ£o de mel" e a vitrine mostrava lixo no lugar
  // dos acentos. Found by re-seeding with the default client and comparing the
  // bytes: o `Content-Type` da resposta já dizia utf-8, o que provava que o
  // erro estava na leitura e não na escrita.
  charset: "utf8mb4_general_ci",
});

export default pool;
