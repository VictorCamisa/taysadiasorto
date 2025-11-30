-- Fix RLS policies for estoque_produtos to allow full access
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view their own products" ON estoque_produtos;
DROP POLICY IF EXISTS "Users can create their own products" ON estoque_produtos;
DROP POLICY IF EXISTS "Users can update their own products" ON estoque_produtos;
DROP POLICY IF EXISTS "Users can delete their own products" ON estoque_produtos;

-- Create permissive policies allowing all operations
CREATE POLICY "Allow all select on estoque_produtos"
  ON estoque_produtos FOR SELECT
  USING (true);

CREATE POLICY "Allow all insert on estoque_produtos"
  ON estoque_produtos FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow all update on estoque_produtos"
  ON estoque_produtos FOR UPDATE
  USING (true);

CREATE POLICY "Allow all delete on estoque_produtos"
  ON estoque_produtos FOR DELETE
  USING (true);