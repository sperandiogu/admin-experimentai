/*
  # Sistema de Feedbacks - Tabelas e Políticas

  1. Novas Tabelas
    - `question_categories`
      - `id` (uuid, primary key)
      - `name` (text, nome da categoria)
      - `description` (text, descrição opcional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `questions`
      - `id` (uuid, primary key)
      - `category_id` (uuid, foreign key para question_categories)
      - `product_id` (uuid, foreign key para products, opcional)
      - `question_text` (text, texto da pergunta)
      - `question_type` (text, tipo: multiple_choice, rating, text, yes_no)
      - `is_required` (boolean, se é obrigatória)
      - `order_index` (integer, ordem de exibição)
      - `is_active` (boolean, se está ativa)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `question_options`
      - `id` (uuid, primary key)
      - `question_id` (uuid, foreign key para questions)
      - `option_text` (text, texto da opção)
      - `option_value` (integer, valor numérico)
      - `order_index` (integer, ordem da opção)
      - `created_at` (timestamp)

  2. Segurança
    - Habilitar RLS em todas as tabelas
    - Políticas para permitir todas as operações para usuários autenticados
*/

-- Criar tabela de categorias de perguntas
CREATE TABLE IF NOT EXISTS question_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Criar tabela de perguntas
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES question_categories(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  question_type text NOT NULL CHECK (question_type IN ('multiple_choice', 'rating', 'text', 'yes_no')),
  is_required boolean DEFAULT false,
  order_index integer NOT NULL DEFAULT 1,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Criar tabela de opções de perguntas
CREATE TABLE IF NOT EXISTS question_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  option_text text NOT NULL,
  option_value integer NOT NULL,
  order_index integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE question_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_options ENABLE ROW LEVEL SECURITY;

-- Políticas para question_categories
CREATE POLICY "Permitir todas as operações para usuários autenticados - question_categories"
  ON question_categories
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Políticas para questions
CREATE POLICY "Permitir todas as operações para usuários autenticados - questions"
  ON questions
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Políticas para question_options
CREATE POLICY "Permitir todas as operações para usuários autenticados - question_options"
  ON question_options
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_questions_category_id ON questions(category_id);
CREATE INDEX IF NOT EXISTS idx_questions_product_id ON questions(product_id);
CREATE INDEX IF NOT EXISTS idx_questions_order_index ON questions(order_index);
CREATE INDEX IF NOT EXISTS idx_question_options_question_id ON question_options(question_id);
CREATE INDEX IF NOT EXISTS idx_question_options_order_index ON question_options(order_index);

-- Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar triggers para atualizar updated_at
CREATE TRIGGER update_question_categories_updated_at 
  BEFORE UPDATE ON question_categories 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at 
  BEFORE UPDATE ON questions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();