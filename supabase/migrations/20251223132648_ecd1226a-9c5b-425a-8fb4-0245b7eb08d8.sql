-- Drop the old trigger if it exists on crm_agendamentos 
DROP TRIGGER IF EXISTS update_crm_agendamentos_updated_at ON crm_agendamentos;

-- Recreate the trigger to use the correct column name 'updated_at'
CREATE OR REPLACE FUNCTION update_crm_agendamentos_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_crm_agendamentos_updated_at
  BEFORE UPDATE ON crm_agendamentos
  FOR EACH ROW
  EXECUTE FUNCTION update_crm_agendamentos_timestamp();