-- Função que cria lançamento financeiro quando conta a pagar é marcada como paga
CREATE OR REPLACE FUNCTION public.criar_lancamento_ao_pagar_conta()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Verifica se o status mudou para 'pago' e se ainda não existe um lançamento vinculado
  IF NEW.status = 'pago' AND (OLD.status IS NULL OR OLD.status != 'pago') THEN
    -- Cria o lançamento financeiro automaticamente
    INSERT INTO public.financeiro_lancamentos (
      user_id,
      tipo,
      data,
      valor_saida,
      categoria_id,
      forma_pagamento_id,
      conta_financeira_id,
      fornecedor_id,
      observacoes,
      cliente,
      conta_pagar_id
    ) VALUES (
      NEW.user_id,
      'despesa',
      COALESCE(NEW.data_pagamento, CURRENT_DATE),
      NEW.valor,
      NEW.categoria_id,
      NEW.forma_pagamento_id,
      NEW.conta_financeira_id,
      NEW.fornecedor_id,
      CONCAT('Pagamento automático: ', NEW.descricao, 
             CASE WHEN NEW.observacoes IS NOT NULL 
             THEN CONCAT(' | ', NEW.observacoes) 
             ELSE '' END),
      NEW.descricao,
      NEW.id
    );
    
    -- Atualiza o saldo da conta financeira (se especificada)
    IF NEW.conta_financeira_id IS NOT NULL THEN
      UPDATE public.financeiro_contas
      SET saldo_atual = saldo_atual - NEW.valor,
          updated_at = NOW()
      WHERE id = NEW.conta_financeira_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Remove o trigger se já existir
DROP TRIGGER IF EXISTS trigger_criar_lancamento_ao_pagar ON public.financeiro_contas_pagar;

-- Cria o trigger que executa após UPDATE na tabela de contas a pagar
CREATE TRIGGER trigger_criar_lancamento_ao_pagar
  AFTER UPDATE ON public.financeiro_contas_pagar
  FOR EACH ROW
  EXECUTE FUNCTION public.criar_lancamento_ao_pagar_conta();