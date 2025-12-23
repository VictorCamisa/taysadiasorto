-- Inserir categorias de deduções da receita bruta (ISS, PIS, COFINS)
INSERT INTO categorias (nome_sintetico, nome_analitico, tipo, natureza_dre) VALUES
  ('Impostos sobre Serviços', 'ISS', 'despesa', 'deducao'),
  ('Impostos sobre Serviços', 'PIS', 'despesa', 'deducao'),
  ('Impostos sobre Serviços', 'COFINS', 'despesa', 'deducao');

-- Inserir categoria para provisão de IRPJ/CSLL
INSERT INTO categorias (nome_sintetico, nome_analitico, tipo, natureza_dre) VALUES
  ('Impostos sobre Lucro', 'IRPJ', 'despesa', 'imposto_lucro'),
  ('Impostos sobre Lucro', 'CSLL', 'despesa', 'imposto_lucro');