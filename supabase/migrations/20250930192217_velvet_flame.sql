/*
  # Corrigir políticas RLS para brands

  1. Mudanças nas Políticas
    - Remove políticas que requerem usuários autenticados no Supabase
    - Adiciona políticas que permitem acesso público
    - Mantém RLS habilitado para segurança futura

  2. Tabelas Afetadas
    - `brands` - permite operações públicas (SELECT, INSERT, UPDATE, DELETE)

  3. Justificativa
    - A aplicação usa Firebase para autenticação, não Supabase
    - Usuários não estão autenticados no contexto Supabase
    - Políticas anteriores exigiam auth.uid() que sempre retorna null
*/

-- Drop existing policies for brands
DROP POLICY IF EXISTS "Authenticated users can create brands" ON brands;
DROP POLICY IF EXISTS "Authenticated users can delete brands" ON brands;
DROP POLICY IF EXISTS "Authenticated users can update brands" ON brands;
DROP POLICY IF EXISTS "Authenticated users can view brands" ON brands;

-- Create new public policies for brands
CREATE POLICY "Allow public read access to brands"
  ON brands
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access to brands"
  ON brands
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update access to brands"
  ON brands
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to brands"
  ON brands
  FOR DELETE
  TO public
  USING (true);