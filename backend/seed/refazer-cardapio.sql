USE confeitaria_db;

-- -----------------------------------------------------------------------------
-- Recria o cardápio de exemplo em um banco que JÁ tem dados.
--
-- `schema.sql` + `seed.sql` só valem em base vazia. Para voltar o cardápio ao
-- estado de demonstração depois de mexer nele no painel, este arquivo apaga
-- só o conteúdo (nunca usuários, nem o histórico de auditoria) e reinsere.
--
-- A ordem de remoção respeita as chaves estrangeiras: produto_insumo primeiro
-- (aponta para produtos e insumos), depois produtos (aponta para categorias),
-- por último as categorias.
-- -----------------------------------------------------------------------------

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE produto_insumo;
TRUNCATE TABLE produtos;
TRUNCATE TABLE insumos;
TRUNCATE TABLE categorias;
SET FOREIGN_KEY_CHECKS = 1;

-- Recomeça do cardápio de demonstração. Rode de dentro desta pasta:
--
--   docker exec -i minha-api-mysql mysql --default-character-set=utf8mb4 \
--     -u api_user -p<SENHA> confeitaria_db < refazer-cardapio.sql
--
-- O `--default-character-set` NÃO é opcional. Sem ele o cliente fala latin1 com
-- o servidor e "Pão de mel" entra como "PÃ£o de mel" — foi exatamente o que
-- aconteceu na primeira vez que este cardápio foi carregado.
SOURCE seed.sql;
