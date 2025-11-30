-- Drop existing restrictive policies on tratamentos_ficha_tecnica
DROP POLICY IF EXISTS "Users can view treatment items" ON tratamentos_ficha_tecnica;
DROP POLICY IF EXISTS "Users can insert treatment items" ON tratamentos_ficha_tecnica;
DROP POLICY IF EXISTS "Users can update treatment items" ON tratamentos_ficha_tecnica;
DROP POLICY IF EXISTS "Users can delete treatment items" ON tratamentos_ficha_tecnica;

-- Create permissive policies for tratamentos_ficha_tecnica (following the pattern of other tables)
CREATE POLICY "Treatment items are viewable by all users"
  ON tratamentos_ficha_tecnica
  FOR SELECT
  USING (true);

CREATE POLICY "Treatment items can be inserted by any user"
  ON tratamentos_ficha_tecnica
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Treatment items can be updated by any user"
  ON tratamentos_ficha_tecnica
  FOR UPDATE
  USING (true);

CREATE POLICY "Treatment items can be deleted by any user"
  ON tratamentos_ficha_tecnica
  FOR DELETE
  USING (true);