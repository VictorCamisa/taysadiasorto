-- Add admin role to user "Venda de Solucoes"
INSERT INTO public.user_roles (user_id, role) 
VALUES ('51888fd6-5614-47fe-9cff-5cb18642021f', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;