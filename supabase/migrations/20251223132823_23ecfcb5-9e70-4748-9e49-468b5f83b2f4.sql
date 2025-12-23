-- Fix function search_path security
CREATE OR REPLACE FUNCTION update_crm_agendamentos_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;