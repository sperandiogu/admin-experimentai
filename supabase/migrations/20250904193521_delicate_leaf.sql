/*
  # Fix RLS policies for questions table

  1. Security Changes
    - Drop existing restrictive policies
    - Create simple policy allowing all operations for authenticated users
    - Ensure questions table is accessible for CRUD operations

  2. Tables affected
    - questions: Allow full access for authenticated users
    - question_categories: Allow full access for authenticated users  
    - question_options: Allow full access for authenticated users
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to questions" ON questions;
DROP POLICY IF EXISTS "Allow authenticated users to manage questions" ON questions;
DROP POLICY IF EXISTS "Users can manage questions" ON questions;

DROP POLICY IF EXISTS "Allow public read access to question_categories" ON question_categories;
DROP POLICY IF EXISTS "Allow authenticated users to manage question_categories" ON question_categories;

DROP POLICY IF EXISTS "Allow public read access to question_options" ON question_options;
DROP POLICY IF EXISTS "Allow authenticated users to manage question_options" ON question_options;

-- Create simple policies allowing all operations for authenticated users
CREATE POLICY "Allow all operations for authenticated users"
  ON questions
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users"
  ON question_categories
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users"
  ON question_options
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Also allow public read access for the frontend to work
CREATE POLICY "Allow public read access"
  ON questions
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public read access"
  ON question_categories
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public read access"
  ON question_options
  FOR SELECT
  TO public
  USING (true);