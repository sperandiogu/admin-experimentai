/*
  # Remover e recriar políticas RLS para tabelas de feedback

  1. Remove políticas existentes
  2. Cria novas políticas permissivas
  3. Garante acesso adequado às tabelas
*/

-- Remove todas as políticas existentes das tabelas de feedback
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON questions;
DROP POLICY IF EXISTS "Allow public read access" ON questions;
DROP POLICY IF EXISTS "Allow all operations for public users" ON questions;

DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON question_categories;
DROP POLICY IF EXISTS "Allow public read access" ON question_categories;
DROP POLICY IF EXISTS "Allow all operations for public users" ON question_categories;

DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON question_options;
DROP POLICY IF EXISTS "Allow public read access" ON question_options;
DROP POLICY IF EXISTS "Allow all operations for public users" ON question_options;

-- Cria políticas simples e permissivas para questions
CREATE POLICY "allow_all_questions" ON questions
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Cria políticas simples e permissivas para question_categories
CREATE POLICY "allow_all_question_categories" ON question_categories
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Cria políticas simples e permissivas para question_options
CREATE POLICY "allow_all_question_options" ON question_options
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);