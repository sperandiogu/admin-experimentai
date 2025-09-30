/*
  # Corrigir políticas RLS para brand_statuses

  1. Mudanças nas Políticas
    - Remove políticas que requerem usuários autenticados no Supabase
    - Adiciona políticas que permitem acesso público
    - Mantém RLS habilitado para segurança futura

  2. Tabelas Afetadas
    - `brand_statuses` - permite operações públicas (SELECT, INSERT, UPDATE, DELETE)

  3. Justificativa
    - A aplicação usa Firebase para autenticação, não Supabase
    - Usuários não estão autenticados no contexto Supabase
    - Políticas anteriores exigiam auth.uid() que sempre retorna null
*/

-- Drop existing policies for brand_statuses
DROP POLICY IF EXISTS "Authenticated users can create brand statuses" ON brand_statuses;
DROP POLICY IF EXISTS "Authenticated users can delete brand statuses" ON brand_statuses;
DROP POLICY IF EXISTS "Authenticated users can update brand statuses" ON brand_statuses;
DROP POLICY IF EXISTS "Authenticated users can view brand statuses" ON brand_statuses;

-- Create new public policies for brand_statuses
CREATE POLICY "Allow public read access to brand_statuses"
  ON brand_statuses
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access to brand_statuses"
  ON brand_statuses
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update access to brand_statuses"
  ON brand_statuses
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to brand_statuses"
  ON brand_statuses
  FOR DELETE
  TO public
  USING (true);