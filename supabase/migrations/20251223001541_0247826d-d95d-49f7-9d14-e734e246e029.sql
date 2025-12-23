-- Inserir produtos/insumos base
INSERT INTO estoque_produtos (user_id, nome, categoria, unidade_medida, custo_medio, estoque_atual, estoque_minimo, ativo) VALUES
('00000000-0000-0000-0000-000000000000', 'Toxina Botulínica', 'Injetáveis', 'U', 7.70, 1000, 100, true),
('00000000-0000-0000-0000-000000000000', 'Ácido Hialurônico', 'Injetáveis', 'ml', 400.00, 50, 10, true),
('00000000-0000-0000-0000-000000000000', 'Bioestimulador Elleva', 'Injetáveis', 'un', 1100.00, 20, 5, true),
('00000000-0000-0000-0000-000000000000', 'Fenol Concentrado', 'Peeling', 'sessão', 3200.00, 10, 2, true),
('00000000-0000-0000-0000-000000000000', 'ATA (Ácido Tricloroacético)', 'Peeling', 'sessão', 80.00, 20, 5, true),
('00000000-0000-0000-0000-000000000000', 'Ácido Retinóico', 'Peeling', 'sessão', 10.00, 30, 10, true),
('00000000-0000-0000-0000-000000000000', 'Kit Cirúrgico', 'Material Cirúrgico', 'un', 250.00, 50, 10, true),
('00000000-0000-0000-0000-000000000000', 'Fenol Atenuado', 'Peeling', 'sessão', 250.00, 15, 3, true);

-- Atualizar tratamentos existentes com dados da planilha
UPDATE tratamentos SET preco_padrao = 3800.00, custo_estimado = 250.00, e_cirurgico = true, unidade_medida = 'sessão', custo_cirurgico = 250.00, descricao = 'Remoção de gordura bucal' WHERE nome ILIKE '%bichectomia%';
UPDATE tratamentos SET preco_padrao = 220.00, custo_estimado = 0.00, e_cirurgico = false, unidade_medida = 'sessão', custo_cirurgico = 0.00, descricao = 'Consulta médica' WHERE nome ILIKE '%consulta%' AND nome NOT ILIKE '%cremes%';
UPDATE tratamentos SET preco_padrao = 14000.00, custo_estimado = 3450.00, e_cirurgico = true, unidade_medida = 'sessão', custo_cirurgico = 250.00, descricao = 'Procedimento cirúrgico com fenol' WHERE nome ILIKE '%fenol%' AND nome NOT ILIKE '%laser%';
UPDATE tratamentos SET preco_padrao = 12000.00, custo_estimado = 250.00, e_cirurgico = true, unidade_medida = 'sessão', custo_cirurgico = 250.00, descricao = 'Procedimento cirúrgico de lifting de pescoço' WHERE nome ILIKE '%lifting%pescoço%';
UPDATE tratamentos SET preco_padrao = 4800.00, custo_estimado = 250.00, e_cirurgico = true, unidade_medida = 'sessão', custo_cirurgico = 250.00, descricao = 'Lipoaspiração de papada' WHERE nome ILIKE '%lipo%papada%';
UPDATE tratamentos SET preco_padrao = 1400.00, custo_estimado = 480.00, e_cirurgico = false, unidade_medida = 'ml', custo_cirurgico = 0.00, descricao = 'Preenchimento facial com ácido hialurônico' WHERE nome ILIKE '%preenchimento%facial%';
UPDATE tratamentos SET preco_padrao = 1800.00, custo_estimado = 480.00, e_cirurgico = false, unidade_medida = 'ml', custo_cirurgico = 0.00, descricao = 'Preenchimento labial com ácido hialurônico' WHERE nome ILIKE '%preenchimento%labial%';
UPDATE tratamentos SET preco_padrao = 1200.00, custo_estimado = 580.50, e_cirurgico = false, unidade_medida = 'U', custo_cirurgico = 0.00, descricao = 'Aplicação de toxina em toda face' WHERE nome ILIKE '%toxina%full%face%';

-- Inserir tratamentos que não existem ainda
INSERT INTO tratamentos (nome, preco_padrao, custo_estimado, descricao, e_cirurgico, unidade_medida, custo_cirurgico)
SELECT 'Suspensão Facial', 12000.00, 2750.50, 'Procedimento cirúrgico de suspensão facial', true, 'sessão', 250.00
WHERE NOT EXISTS (SELECT 1 FROM tratamentos WHERE nome ILIKE '%suspensão%facial%');

INSERT INTO tratamentos (nome, preco_padrao, custo_estimado, descricao, e_cirurgico, unidade_medida, custo_cirurgico)
SELECT 'Toxina Botulínica - Sorriso Gengival', 700.00, 157.00, 'Correção de sorriso gengival com toxina', false, 'U', 0.00
WHERE NOT EXISTS (SELECT 1 FROM tratamentos WHERE nome ILIKE '%sorriso%gengival%');

INSERT INTO tratamentos (nome, preco_padrao, custo_estimado, descricao, e_cirurgico, unidade_medida, custo_cirurgico)
SELECT 'Toxina Botulínica - Bruxismo', 1800.00, 850.00, 'Tratamento de bruxismo com toxina', false, 'U', 0.00
WHERE NOT EXISTS (SELECT 1 FROM tratamentos WHERE nome ILIKE '%bruxismo%');

INSERT INTO tratamentos (nome, preco_padrao, custo_estimado, descricao, e_cirurgico, unidade_medida, custo_cirurgico)
SELECT 'Rinomodelação', 1800.00, 480.00, 'Rinomodelação com ácido hialurônico', false, 'ml', 0.00
WHERE NOT EXISTS (SELECT 1 FROM tratamentos WHERE nome ILIKE '%rinomodelação%');

INSERT INTO tratamentos (nome, preco_padrao, custo_estimado, descricao, e_cirurgico, unidade_medida, custo_cirurgico)
SELECT 'Bioestimulador de Colágeno - Elleva', 2500.00, 1180.00, 'Bioestimulação de colágeno com Elleva', false, 'un', 0.00
WHERE NOT EXISTS (SELECT 1 FROM tratamentos WHERE nome ILIKE '%elleva%');

INSERT INTO tratamentos (nome, preco_padrao, custo_estimado, descricao, e_cirurgico, unidade_medida, custo_cirurgico)
SELECT 'Blefarofulguraçao', 400.00, 80.00, 'Procedimento de blefarofulguraçao por sessão', false, 'sessão', 0.00
WHERE NOT EXISTS (SELECT 1 FROM tratamentos WHERE nome ILIKE '%blefarofulgura%');

INSERT INTO tratamentos (nome, preco_padrao, custo_estimado, descricao, e_cirurgico, unidade_medida, custo_cirurgico)
SELECT 'Gerenciamento de Pele - Fenol Atenuado', 1200.00, 330.00, 'Peeling com fenol atenuado', false, 'sessão', 0.00
WHERE NOT EXISTS (SELECT 1 FROM tratamentos WHERE nome ILIKE '%fenol atenuado%');

INSERT INTO tratamentos (nome, preco_padrao, custo_estimado, descricao, e_cirurgico, unidade_medida, custo_cirurgico)
SELECT 'Gerenciamento de Pele - ATA', 800.00, 80.00, 'Peeling com ATA', false, 'sessão', 0.00
WHERE NOT EXISTS (SELECT 1 FROM tratamentos WHERE nome ILIKE '%ata%' AND nome ILIKE '%pele%');

INSERT INTO tratamentos (nome, preco_padrao, custo_estimado, descricao, e_cirurgico, unidade_medida, custo_cirurgico)
SELECT 'Gerenciamento de Pele - Ácido Retinóico', 300.00, 90.00, 'Peeling com ácido retinóico', false, 'sessão', 0.00
WHERE NOT EXISTS (SELECT 1 FROM tratamentos WHERE nome ILIKE '%retinóico%');