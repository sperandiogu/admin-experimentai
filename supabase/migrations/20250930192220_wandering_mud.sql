/*
  # Corrigir políticas RLS para brand_history

  1. Mudanças nas Políticas
    - Remove políticas que requerem usuários autenticados no Supabase
    - Adiciona políticas que permitem acesso público
    - Mantém RLS habilitado para segurança futura

  2. Tabelas Afetadas
    - `brand_history` - permite operações públicas (SELECT, INSERT)

  3. Justificativa
    - A aplicação usa Firebase para autenticação, não Supabase
    - Usuários não estão autenticados no contexto Supabase
    - Políticas anteriores exigiam auth.uid() que sempre retorna null
*/

-- Drop existing policies for brand_history
DROP POLICY IF EXISTS "Authenticated users can create brand history" ON brand_history;
DROP POLICY IF EXISTS "Authenticated users can view brand history" ON brand_history;

-- Create new public policies for brand_history
CREATE POLICY "Allow public read access to brand_history"
  ON brand_history
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access to brand_history"
  ON brand_history
  FOR INSERT
  TO public
  WITH CHECK (true);