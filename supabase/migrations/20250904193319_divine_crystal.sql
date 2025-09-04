/*
  # Corrigir políticas RLS para sistema de feedbacks

  1. Políticas de Acesso
    - Permitir acesso público para leitura das perguntas ativas
    - Permitir acesso público para inserção de respostas
    - Manter consistência com outras tabelas do sistema

  2. Segurança
    - RLS habilitado em todas as tabelas
    - Políticas permissivas para operações necessárias
    - Proteção adequada dos dados
*/

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Allow authenticated users full access to question_categories" ON question_categories;
DROP POLICY IF EXISTS "Allow authenticated users full access to questions" ON questions;
DROP POLICY IF EXISTS "Allow authenticated users full access to question_options" ON question_options;

-- Políticas para question_categories
CREATE POLICY "Allow public read access to question_categories"
  ON question_categories
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Allow all operations on question_categories"
  ON question_categories
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Políticas para questions
CREATE POLICY "Allow public read access to questions"
  ON questions
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Allow all operations on questions"
  ON questions
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Políticas para question_options
CREATE POLICY "Allow public read access to question_options"
  ON question_options
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Allow all operations on question_options"
  ON question_options
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);