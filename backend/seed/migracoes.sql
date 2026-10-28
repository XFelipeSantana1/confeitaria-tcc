-- Migrations: mudancas de estrutura em bases que JA existem.
--
-- O schema.sql monta a base do zero e nao e reaplicavel (CREATE TABLE sem IF
-- NOT EXISTS morre na segunda vez). Aqui cada migration e um passo isolado e
-- idempotente, para rodar quantas vezes for preciso.
--
-- O MySQL nao tem "CREATE INDEX IF NOT EXISTS", entao os indices usam o
-- information_schema: se o nome ja existir, nao faz nada.

-- ----------------------------------------------------------------
-- 001 - Trilha de auditoria (registros)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS registros (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id      INT                 NULL,
    usuario_nome    VARCHAR(120)        NOT NULL,
    acao            ENUM('criar','atualizar','excluir','mover','entrar','sair')
                                             NOT NULL,
    tabela          VARCHAR(40)         NOT NULL,
    registro_id     INT                 NULL,
    descricao       VARCHAR(255)        NOT NULL,
    antes           JSON                NULL,
    depois          JSON                NULL,
    criado_em       DATETIME(3)         NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    CONSTRAINT fk_registros_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
                                             ON DELETE SET NULL
) ENGINE=InnoDB;

-- Indice so no criado_em: a tela de log sempre pergunta "os mais recentes",
-- e sem indice o LIMIT vira varredura da tabela inteira (cresce sem parar).
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.statistics
    WHERE table_schema = DATABASE() AND table_name = 'registros'
      AND index_name = 'idx_registros_criado_em') > 0,
  'SELECT 1',
  'CREATE INDEX idx_registros_criado_em ON registros (criado_em)'
));
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.statistics
    WHERE table_schema = DATABASE() AND table_name = 'registros'
      AND index_name = 'idx_registros_tabela') > 0,
  'SELECT 1',
  'CREATE INDEX idx_registros_tabela ON registros (tabela, registro_id)'
));
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Foto do perfil do gestor. A coluna entra aqui (e nao so no schema.sql)
-- porque quem ja tem a base criada precisa do mesmo resultado que quem roda o
-- schema do zero: os dois caminhos tem que deixar a tabela igual.
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name = 'usuarios'
      AND column_name = 'imagem_url') > 0,
  'SELECT 1',
  'ALTER TABLE usuarios ADD COLUMN imagem_url VARCHAR(255) NULL AFTER senha_hash'
));
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
