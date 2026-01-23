export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          created_at: string | null
          description: string
          id: string
          lead_id: string | null
          opportunity_id: string | null
          title: string
          type: Database["public"]["Enums"]["activity_type"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          lead_id?: string | null
          opportunity_id?: string | null
          title: string
          type: Database["public"]["Enums"]["activity_type"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          lead_id?: string | null
          opportunity_id?: string | null
          title?: string
          type?: Database["public"]["Enums"]["activity_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_agent_conversations: {
        Row: {
          agent_id: string
          created_at: string
          id: string
          is_active: boolean | null
          message_count: number | null
          session_id: string | null
          summary: string | null
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          agent_id: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          message_count?: number | null
          session_id?: string | null
          summary?: string | null
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          agent_id?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          message_count?: number | null
          session_id?: string | null
          summary?: string | null
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_agent_conversations_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_agent_document_chunks: {
        Row: {
          agent_id: string
          chunk_index: number
          content: string
          created_at: string
          document_id: string
          embedding: string | null
          id: string
          metadata: Json | null
        }
        Insert: {
          agent_id: string
          chunk_index: number
          content: string
          created_at?: string
          document_id: string
          embedding?: string | null
          id?: string
          metadata?: Json | null
        }
        Update: {
          agent_id?: string
          chunk_index?: number
          content?: string
          created_at?: string
          document_id?: string
          embedding?: string | null
          id?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_agent_document_chunks_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_agent_document_chunks_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "ai_agent_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_agent_documents: {
        Row: {
          agent_id: string
          chunk_count: number | null
          content: string | null
          created_at: string
          error_message: string | null
          file_path: string | null
          id: string
          metadata: Json | null
          name: string
          source_url: string | null
          status: string | null
          type: string
          updated_at: string
        }
        Insert: {
          agent_id: string
          chunk_count?: number | null
          content?: string | null
          created_at?: string
          error_message?: string | null
          file_path?: string | null
          id?: string
          metadata?: Json | null
          name: string
          source_url?: string | null
          status?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          agent_id?: string
          chunk_count?: number | null
          content?: string | null
          created_at?: string
          error_message?: string | null
          file_path?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          source_url?: string | null
          status?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_agent_documents_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_agent_memory: {
        Row: {
          access_count: number | null
          agent_id: string
          content: string
          created_at: string
          embedding: string | null
          id: string
          importance: number | null
          last_accessed_at: string | null
          memory_type: string
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          access_count?: number | null
          agent_id: string
          content: string
          created_at?: string
          embedding?: string | null
          id?: string
          importance?: number | null
          last_accessed_at?: string | null
          memory_type?: string
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          access_count?: number | null
          agent_id?: string
          content?: string
          created_at?: string
          embedding?: string | null
          id?: string
          importance?: number | null
          last_accessed_at?: string | null
          memory_type?: string
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_agent_memory_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_agent_messages: {
        Row: {
          agent_id: string
          content: string
          conversation_id: string
          created_at: string
          id: string
          metadata: Json | null
          model_used: string | null
          role: string
          sources: Json | null
          tokens_used: number | null
        }
        Insert: {
          agent_id: string
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          metadata?: Json | null
          model_used?: string | null
          role: string
          sources?: Json | null
          tokens_used?: number | null
        }
        Update: {
          agent_id?: string
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          model_used?: string | null
          role?: string
          sources?: Json | null
          tokens_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_agent_messages_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_agent_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_agent_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_agents: {
        Row: {
          avatar_url: string | null
          created_at: string
          db_connection_enabled: boolean | null
          db_tables_access: string[] | null
          description: string | null
          id: string
          is_active: boolean | null
          is_public: boolean | null
          max_tokens: number | null
          memory_enabled: boolean | null
          memory_window: number | null
          model: string
          name: string
          public_slug: string | null
          rag_enabled: boolean | null
          rag_max_results: number | null
          rag_similarity_threshold: number | null
          system_prompt: string
          temperature: number | null
          total_conversations: number | null
          total_messages: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          db_connection_enabled?: boolean | null
          db_tables_access?: string[] | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          max_tokens?: number | null
          memory_enabled?: boolean | null
          memory_window?: number | null
          model?: string
          name: string
          public_slug?: string | null
          rag_enabled?: boolean | null
          rag_max_results?: number | null
          rag_similarity_threshold?: number | null
          system_prompt?: string
          temperature?: number | null
          total_conversations?: number | null
          total_messages?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          db_connection_enabled?: boolean | null
          db_tables_access?: string[] | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          max_tokens?: number | null
          memory_enabled?: boolean | null
          memory_window?: number | null
          model?: string
          name?: string
          public_slug?: string | null
          rag_enabled?: boolean | null
          rag_max_results?: number | null
          rag_similarity_threshold?: number | null
          system_prompt?: string
          temperature?: number | null
          total_conversations?: number | null
          total_messages?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      anamneses: {
        Row: {
          alergias: string | null
          antecedentes_familiares: string | null
          cirurgias_anteriores: string | null
          contraindicacoes: string | null
          created_at: string | null
          data_anamnese: string
          expectativas: string | null
          habitos: string | null
          historico_medico: string | null
          id: string
          medicamentos_uso: string | null
          observacoes: string | null
          paciente_id: string
          queixa_principal: string | null
          updated_at: string | null
        }
        Insert: {
          alergias?: string | null
          antecedentes_familiares?: string | null
          cirurgias_anteriores?: string | null
          contraindicacoes?: string | null
          created_at?: string | null
          data_anamnese?: string
          expectativas?: string | null
          habitos?: string | null
          historico_medico?: string | null
          id?: string
          medicamentos_uso?: string | null
          observacoes?: string | null
          paciente_id: string
          queixa_principal?: string | null
          updated_at?: string | null
        }
        Update: {
          alergias?: string | null
          antecedentes_familiares?: string | null
          cirurgias_anteriores?: string | null
          contraindicacoes?: string | null
          created_at?: string | null
          data_anamnese?: string
          expectativas?: string | null
          habitos?: string | null
          historico_medico?: string | null
          id?: string
          medicamentos_uso?: string | null
          observacoes?: string | null
          paciente_id?: string
          queixa_principal?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "anamneses_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          appointment_date: string
          client_name: string
          created_at: string | null
          id: string
          lead_id: string | null
          notes: string | null
          opportunity_id: string | null
          procedure: string
          status: string | null
          type: Database["public"]["Enums"]["appointment_type"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          appointment_date: string
          client_name: string
          created_at?: string | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          opportunity_id?: string | null
          procedure: string
          status?: string | null
          type?: Database["public"]["Enums"]["appointment_type"] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          appointment_date?: string
          client_name?: string
          created_at?: string | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          opportunity_id?: string | null
          procedure?: string
          status?: string | null
          type?: Database["public"]["Enums"]["appointment_type"] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          acao: string
          created_at: string | null
          dados_anteriores: Json | null
          dados_novos: Json | null
          id: string
          ip_address: string | null
          registro_id: string | null
          tabela: string
          user_id: string | null
        }
        Insert: {
          acao: string
          created_at?: string | null
          dados_anteriores?: Json | null
          dados_novos?: Json | null
          id?: string
          ip_address?: string | null
          registro_id?: string | null
          tabela: string
          user_id?: string | null
        }
        Update: {
          acao?: string
          created_at?: string | null
          dados_anteriores?: Json | null
          dados_novos?: Json | null
          id?: string
          ip_address?: string | null
          registro_id?: string | null
          tabela?: string
          user_id?: string | null
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          created_at: string | null
          id: string
          lead_ids: string[] | null
          message: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          lead_ids?: string[] | null
          message: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          lead_ids?: string[] | null
          message?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      categorias: {
        Row: {
          data_atualizacao: string | null
          data_criacao: string | null
          id: string
          natureza_dre: string | null
          nome_analitico: string | null
          nome_sintetico: string
          tipo: string
        }
        Insert: {
          data_atualizacao?: string | null
          data_criacao?: string | null
          id?: string
          natureza_dre?: string | null
          nome_analitico?: string | null
          nome_sintetico: string
          tipo: string
        }
        Update: {
          data_atualizacao?: string | null
          data_criacao?: string | null
          id?: string
          natureza_dre?: string | null
          nome_analitico?: string | null
          nome_sintetico?: string
          tipo?: string
        }
        Relationships: []
      }
      categorias_old: {
        Row: {
          categoria_pai_id: string | null
          id: string
          nome: string
          tipo: string
        }
        Insert: {
          categoria_pai_id?: string | null
          id?: string
          nome: string
          tipo: string
        }
        Update: {
          categoria_pai_id?: string | null
          id?: string
          nome?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "categorias_categoria_pai_id_fkey"
            columns: ["categoria_pai_id"]
            isOneToOne: false
            referencedRelation: "categorias_old"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_conversations: {
        Row: {
          created_at: string | null
          id: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes_fornecedores: {
        Row: {
          cpf_cnpj: string | null
          data_atualizacao: string | null
          data_criacao: string | null
          id: string
          nome: string
          tipo: string
        }
        Insert: {
          cpf_cnpj?: string | null
          data_atualizacao?: string | null
          data_criacao?: string | null
          id?: string
          nome: string
          tipo: string
        }
        Update: {
          cpf_cnpj?: string | null
          data_atualizacao?: string | null
          data_criacao?: string | null
          id?: string
          nome?: string
          tipo?: string
        }
        Relationships: []
      }
      clientes_old: {
        Row: {
          cpf_cnpj: string | null
          data_criacao: string
          id: string
          nome: string
        }
        Insert: {
          cpf_cnpj?: string | null
          data_criacao?: string
          id?: string
          nome: string
        }
        Update: {
          cpf_cnpj?: string | null
          data_criacao?: string
          id?: string
          nome?: string
        }
        Relationships: []
      }
      contas_financeiras: {
        Row: {
          data_atualizacao: string | null
          data_criacao: string | null
          id: string
          nome: string
          saldo_atual: number | null
          saldo_inicial: number | null
          tipo: string
        }
        Insert: {
          data_atualizacao?: string | null
          data_criacao?: string | null
          id?: string
          nome: string
          saldo_atual?: number | null
          saldo_inicial?: number | null
          tipo?: string
        }
        Update: {
          data_atualizacao?: string | null
          data_criacao?: string | null
          id?: string
          nome?: string
          saldo_atual?: number | null
          saldo_inicial?: number | null
          tipo?: string
        }
        Relationships: []
      }
      contratos_paciente: {
        Row: {
          arquivo_url: string | null
          created_at: string
          data_assinatura: string | null
          descricao: string | null
          id: string
          paciente_id: string
          status: string
          tipo: string
          titulo: string
          updated_at: string
        }
        Insert: {
          arquivo_url?: string | null
          created_at?: string
          data_assinatura?: string | null
          descricao?: string | null
          id?: string
          paciente_id: string
          status?: string
          tipo: string
          titulo: string
          updated_at?: string
        }
        Update: {
          arquivo_url?: string | null
          created_at?: string
          data_assinatura?: string | null
          descricao?: string | null
          id?: string
          paciente_id?: string
          status?: string
          tipo?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contratos_paciente_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_agendamentos: {
        Row: {
          created_at: string | null
          data_agendamento: string | null
          data_previsao_fechamento: string | null
          data_proxima_acao: string | null
          data_ultimo_contato: string | null
          duracao_minutos: number | null
          id: string
          motivo_cancelamento: string | null
          observacoes: string | null
          origem_id: string | null
          paciente_id: string
          prioridade: string | null
          proxima_acao: string | null
          responsavel: string | null
          status: string
          tratamento_id: string | null
          updated_at: string | null
          valor_previsto: number | null
          valor_realizado: number | null
        }
        Insert: {
          created_at?: string | null
          data_agendamento?: string | null
          data_previsao_fechamento?: string | null
          data_proxima_acao?: string | null
          data_ultimo_contato?: string | null
          duracao_minutos?: number | null
          id?: string
          motivo_cancelamento?: string | null
          observacoes?: string | null
          origem_id?: string | null
          paciente_id: string
          prioridade?: string | null
          proxima_acao?: string | null
          responsavel?: string | null
          status?: string
          tratamento_id?: string | null
          updated_at?: string | null
          valor_previsto?: number | null
          valor_realizado?: number | null
        }
        Update: {
          created_at?: string | null
          data_agendamento?: string | null
          data_previsao_fechamento?: string | null
          data_proxima_acao?: string | null
          data_ultimo_contato?: string | null
          duracao_minutos?: number | null
          id?: string
          motivo_cancelamento?: string | null
          observacoes?: string | null
          origem_id?: string | null
          paciente_id?: string
          prioridade?: string | null
          proxima_acao?: string | null
          responsavel?: string | null
          status?: string
          tratamento_id?: string | null
          updated_at?: string | null
          valor_previsto?: number | null
          valor_realizado?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_agendamentos_origem_id_fkey"
            columns: ["origem_id"]
            isOneToOne: false
            referencedRelation: "origens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_agendamentos_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_agendamentos_tratamento_id_fkey"
            columns: ["tratamento_id"]
            isOneToOne: false
            referencedRelation: "tratamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_interacoes: {
        Row: {
          agendamento_id: string
          created_at: string | null
          data_contato: string | null
          id: string
          observacao: string | null
          tipo: string
        }
        Insert: {
          agendamento_id: string
          created_at?: string | null
          data_contato?: string | null
          id?: string
          observacao?: string | null
          tipo: string
        }
        Update: {
          agendamento_id?: string
          created_at?: string | null
          data_contato?: string | null
          id?: string
          observacao?: string | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_interacoes_agendamento_id_fkey"
            columns: ["agendamento_id"]
            isOneToOne: false
            referencedRelation: "crm_agendamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      documentos_legais: {
        Row: {
          arquivo_url: string | null
          created_at: string | null
          data_vigencia: string | null
          descricao: string | null
          id: string
          tipo: string
          titulo: string
          updated_at: string | null
          vigente: boolean | null
        }
        Insert: {
          arquivo_url?: string | null
          created_at?: string | null
          data_vigencia?: string | null
          descricao?: string | null
          id?: string
          tipo: string
          titulo: string
          updated_at?: string | null
          vigente?: boolean | null
        }
        Update: {
          arquivo_url?: string | null
          created_at?: string | null
          data_vigencia?: string | null
          descricao?: string | null
          id?: string
          tipo?: string
          titulo?: string
          updated_at?: string | null
          vigente?: boolean | null
        }
        Relationships: []
      }
      estoque_compras: {
        Row: {
          conta_financeira_id: string | null
          created_at: string | null
          data_compra: string
          forma_pagamento_id: string | null
          fornecedor_id: string | null
          id: string
          numero_nf: string | null
          observacoes: string | null
          updated_at: string | null
          user_id: string
          valor_total: number | null
        }
        Insert: {
          conta_financeira_id?: string | null
          created_at?: string | null
          data_compra?: string
          forma_pagamento_id?: string | null
          fornecedor_id?: string | null
          id?: string
          numero_nf?: string | null
          observacoes?: string | null
          updated_at?: string | null
          user_id: string
          valor_total?: number | null
        }
        Update: {
          conta_financeira_id?: string | null
          created_at?: string | null
          data_compra?: string
          forma_pagamento_id?: string | null
          fornecedor_id?: string | null
          id?: string
          numero_nf?: string | null
          observacoes?: string | null
          updated_at?: string | null
          user_id?: string
          valor_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "estoque_compras_conta_financeira_id_fkey"
            columns: ["conta_financeira_id"]
            isOneToOne: false
            referencedRelation: "financeiro_contas_old"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estoque_compras_forma_pagamento_id_fkey"
            columns: ["forma_pagamento_id"]
            isOneToOne: false
            referencedRelation: "financeiro_formas_pagamento_old"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estoque_compras_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "financeiro_fornecedores_old"
            referencedColumns: ["id"]
          },
        ]
      }
      estoque_compras_itens: {
        Row: {
          compra_id: string
          created_at: string | null
          id: string
          produto_id: string
          quantidade: number
          valor_total: number | null
          valor_unitario: number
        }
        Insert: {
          compra_id: string
          created_at?: string | null
          id?: string
          produto_id: string
          quantidade?: number
          valor_total?: number | null
          valor_unitario?: number
        }
        Update: {
          compra_id?: string
          created_at?: string | null
          id?: string
          produto_id?: string
          quantidade?: number
          valor_total?: number | null
          valor_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: "estoque_compras_itens_compra_id_fkey"
            columns: ["compra_id"]
            isOneToOne: false
            referencedRelation: "estoque_compras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estoque_compras_itens_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "estoque_produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      estoque_movimentacoes: {
        Row: {
          compra_id: string | null
          created_at: string | null
          data: string
          id: string
          lancamento_id: string | null
          observacoes: string | null
          origem: string
          produto_id: string
          quantidade: number
          tipo: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          compra_id?: string | null
          created_at?: string | null
          data?: string
          id?: string
          lancamento_id?: string | null
          observacoes?: string | null
          origem: string
          produto_id: string
          quantidade: number
          tipo: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          compra_id?: string | null
          created_at?: string | null
          data?: string
          id?: string
          lancamento_id?: string | null
          observacoes?: string | null
          origem?: string
          produto_id?: string
          quantidade?: number
          tipo?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "estoque_movimentacoes_compra_id_fkey"
            columns: ["compra_id"]
            isOneToOne: false
            referencedRelation: "estoque_compras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estoque_movimentacoes_lancamento_id_fkey"
            columns: ["lancamento_id"]
            isOneToOne: false
            referencedRelation: "financeiro_lancamentos_old"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estoque_movimentacoes_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "estoque_produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      estoque_produtos: {
        Row: {
          ativo: boolean | null
          categoria: string
          created_at: string | null
          custo_medio: number | null
          estoque_atual: number | null
          estoque_minimo: number | null
          fornecedor_id: string | null
          id: string
          lote: string | null
          nome: string
          unidade_medida: string
          updated_at: string | null
          user_id: string
          validade: string | null
        }
        Insert: {
          ativo?: boolean | null
          categoria: string
          created_at?: string | null
          custo_medio?: number | null
          estoque_atual?: number | null
          estoque_minimo?: number | null
          fornecedor_id?: string | null
          id?: string
          lote?: string | null
          nome: string
          unidade_medida?: string
          updated_at?: string | null
          user_id: string
          validade?: string | null
        }
        Update: {
          ativo?: boolean | null
          categoria?: string
          created_at?: string | null
          custo_medio?: number | null
          estoque_atual?: number | null
          estoque_minimo?: number | null
          fornecedor_id?: string | null
          id?: string
          lote?: string | null
          nome?: string
          unidade_medida?: string
          updated_at?: string | null
          user_id?: string
          validade?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "estoque_produtos_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "financeiro_fornecedores_old"
            referencedColumns: ["id"]
          },
        ]
      }
      exames_paciente: {
        Row: {
          arquivo_url: string | null
          created_at: string
          data_exame: string
          id: string
          laboratorio: string | null
          nome: string
          observacoes: string | null
          paciente_id: string
          resultado: string | null
          tipo: string
        }
        Insert: {
          arquivo_url?: string | null
          created_at?: string
          data_exame?: string
          id?: string
          laboratorio?: string | null
          nome: string
          observacoes?: string | null
          paciente_id: string
          resultado?: string | null
          tipo?: string
        }
        Update: {
          arquivo_url?: string | null
          created_at?: string
          data_exame?: string
          id?: string
          laboratorio?: string | null
          nome?: string
          observacoes?: string | null
          paciente_id?: string
          resultado?: string | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "exames_paciente_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
        ]
      }
      financeiro_categorias_old: {
        Row: {
          ativa: boolean | null
          categoria_analitica: string | null
          categoria_sintetica: string
          created_at: string | null
          id: string
          tipo: Database["public"]["Enums"]["categoria_tipo"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ativa?: boolean | null
          categoria_analitica?: string | null
          categoria_sintetica: string
          created_at?: string | null
          id?: string
          tipo: Database["public"]["Enums"]["categoria_tipo"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ativa?: boolean | null
          categoria_analitica?: string | null
          categoria_sintetica?: string
          created_at?: string | null
          id?: string
          tipo?: Database["public"]["Enums"]["categoria_tipo"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      financeiro_contas_old: {
        Row: {
          agencia: string | null
          ativa: boolean | null
          banco: string | null
          conta: string | null
          created_at: string | null
          id: string
          nome: string
          saldo_atual: number | null
          saldo_inicial: number | null
          tipo: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          agencia?: string | null
          ativa?: boolean | null
          banco?: string | null
          conta?: string | null
          created_at?: string | null
          id?: string
          nome: string
          saldo_atual?: number | null
          saldo_inicial?: number | null
          tipo?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          agencia?: string | null
          ativa?: boolean | null
          banco?: string | null
          conta?: string | null
          created_at?: string | null
          id?: string
          nome?: string
          saldo_atual?: number | null
          saldo_inicial?: number | null
          tipo?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      financeiro_contas_pagar: {
        Row: {
          categoria_id: string | null
          conta_id: string | null
          created_at: string | null
          data_pagamento: string | null
          data_vencimento: string
          descricao: string
          forma_pagamento_id: string | null
          fornecedor_id: string | null
          id: string
          numero_documento: string | null
          observacoes: string | null
          status: string | null
          updated_at: string | null
          user_id: string
          valor: number
        }
        Insert: {
          categoria_id?: string | null
          conta_id?: string | null
          created_at?: string | null
          data_pagamento?: string | null
          data_vencimento: string
          descricao: string
          forma_pagamento_id?: string | null
          fornecedor_id?: string | null
          id?: string
          numero_documento?: string | null
          observacoes?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
          valor: number
        }
        Update: {
          categoria_id?: string | null
          conta_id?: string | null
          created_at?: string | null
          data_pagamento?: string | null
          data_vencimento?: string
          descricao?: string
          forma_pagamento_id?: string | null
          fornecedor_id?: string | null
          id?: string
          numero_documento?: string | null
          observacoes?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "financeiro_contas_pagar_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "financeiro_categorias_dropdown"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_contas_pagar_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "financeiro_categorias_old"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_contas_pagar_conta_id_fkey"
            columns: ["conta_id"]
            isOneToOne: false
            referencedRelation: "financeiro_contas_old"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_contas_pagar_forma_pagamento_id_fkey"
            columns: ["forma_pagamento_id"]
            isOneToOne: false
            referencedRelation: "financeiro_formas_pagamento_old"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_contas_pagar_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "financeiro_fornecedores_old"
            referencedColumns: ["id"]
          },
        ]
      }
      financeiro_formas_pagamento_old: {
        Row: {
          ativa: boolean | null
          created_at: string | null
          dias_recebimento: number | null
          id: string
          nome: string
          taxa_percentual: number | null
          tipo: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ativa?: boolean | null
          created_at?: string | null
          dias_recebimento?: number | null
          id?: string
          nome: string
          taxa_percentual?: number | null
          tipo?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ativa?: boolean | null
          created_at?: string | null
          dias_recebimento?: number | null
          id?: string
          nome?: string
          taxa_percentual?: number | null
          tipo?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      financeiro_fornecedores_old: {
        Row: {
          ativo: boolean | null
          cep: string | null
          cidade: string | null
          cnpj: string | null
          created_at: string | null
          email: string | null
          endereco: string | null
          estado: string | null
          id: string
          nome: string
          observacoes: string | null
          razao_social: string | null
          telefone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ativo?: boolean | null
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          created_at?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          razao_social?: string | null
          telefone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ativo?: boolean | null
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          created_at?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          razao_social?: string | null
          telefone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      financeiro_lancamentos_old: {
        Row: {
          categoria_id: string | null
          cliente: string | null
          conta_financeira_id: string | null
          conta_id: string | null
          created_at: string | null
          custo_tratamento: number | null
          data: string
          data_pagamento: string | null
          data_vencimento: string | null
          descricao: string | null
          forma_pagamento_id: string | null
          fornecedor_id: string | null
          id: string
          lancamento_pai_id: string | null
          margem: number | null
          observacoes: string | null
          origem_id: string | null
          parcela_atual: number | null
          quantidade: number | null
          status: string | null
          tipo: string
          total_parcelas: number | null
          tratamento_id: string | null
          updated_at: string | null
          user_id: string
          valor: number
          valor_entrada: number | null
          valor_saida: number | null
        }
        Insert: {
          categoria_id?: string | null
          cliente?: string | null
          conta_financeira_id?: string | null
          conta_id?: string | null
          created_at?: string | null
          custo_tratamento?: number | null
          data?: string
          data_pagamento?: string | null
          data_vencimento?: string | null
          descricao?: string | null
          forma_pagamento_id?: string | null
          fornecedor_id?: string | null
          id?: string
          lancamento_pai_id?: string | null
          margem?: number | null
          observacoes?: string | null
          origem_id?: string | null
          parcela_atual?: number | null
          quantidade?: number | null
          status?: string | null
          tipo: string
          total_parcelas?: number | null
          tratamento_id?: string | null
          updated_at?: string | null
          user_id: string
          valor?: number
          valor_entrada?: number | null
          valor_saida?: number | null
        }
        Update: {
          categoria_id?: string | null
          cliente?: string | null
          conta_financeira_id?: string | null
          conta_id?: string | null
          created_at?: string | null
          custo_tratamento?: number | null
          data?: string
          data_pagamento?: string | null
          data_vencimento?: string | null
          descricao?: string | null
          forma_pagamento_id?: string | null
          fornecedor_id?: string | null
          id?: string
          lancamento_pai_id?: string | null
          margem?: number | null
          observacoes?: string | null
          origem_id?: string | null
          parcela_atual?: number | null
          quantidade?: number | null
          status?: string | null
          tipo?: string
          total_parcelas?: number | null
          tratamento_id?: string | null
          updated_at?: string | null
          user_id?: string
          valor?: number
          valor_entrada?: number | null
          valor_saida?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "financeiro_lancamentos_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "financeiro_categorias_dropdown"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_lancamentos_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "financeiro_categorias_old"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_lancamentos_conta_financeira_id_fkey"
            columns: ["conta_financeira_id"]
            isOneToOne: false
            referencedRelation: "financeiro_contas_old"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_lancamentos_conta_id_fkey"
            columns: ["conta_id"]
            isOneToOne: false
            referencedRelation: "financeiro_contas_old"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_lancamentos_forma_pagamento_id_fkey"
            columns: ["forma_pagamento_id"]
            isOneToOne: false
            referencedRelation: "financeiro_formas_pagamento_old"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_lancamentos_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "financeiro_fornecedores_old"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_lancamentos_lancamento_pai_id_fkey"
            columns: ["lancamento_pai_id"]
            isOneToOne: false
            referencedRelation: "financeiro_lancamentos_old"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_lancamentos_origem_id_fkey"
            columns: ["origem_id"]
            isOneToOne: false
            referencedRelation: "financeiro_origens_old"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_lancamentos_tratamento_id_fkey"
            columns: ["tratamento_id"]
            isOneToOne: false
            referencedRelation: "financeiro_tratamentos_old"
            referencedColumns: ["id"]
          },
        ]
      }
      financeiro_origens_old: {
        Row: {
          ativa: boolean | null
          created_at: string | null
          descricao: string | null
          id: string
          nome: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ativa?: boolean | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ativa?: boolean | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      financeiro_tratamentos_old: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          custo_estimado: number | null
          descricao: string | null
          duracao_minutos: number | null
          grupo: string | null
          id: string
          nome: string
          preco: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          custo_estimado?: number | null
          descricao?: string | null
          duracao_minutos?: number | null
          grupo?: string | null
          id?: string
          nome: string
          preco?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          custo_estimado?: number | null
          descricao?: string | null
          duracao_minutos?: number | null
          grupo?: string | null
          id?: string
          nome?: string
          preco?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      formas_pagamento: {
        Row: {
          data_atualizacao: string | null
          data_criacao: string | null
          dias_recebimento: number | null
          id: string
          nome: string
          taxa_percentual: number | null
        }
        Insert: {
          data_atualizacao?: string | null
          data_criacao?: string | null
          dias_recebimento?: number | null
          id?: string
          nome: string
          taxa_percentual?: number | null
        }
        Update: {
          data_atualizacao?: string | null
          data_criacao?: string | null
          dias_recebimento?: number | null
          id?: string
          nome?: string
          taxa_percentual?: number | null
        }
        Relationships: []
      }
      fornecedores_old: {
        Row: {
          cpf_cnpj: string | null
          data_criacao: string
          id: string
          nome: string
        }
        Insert: {
          cpf_cnpj?: string | null
          data_criacao?: string
          id?: string
          nome: string
        }
        Update: {
          cpf_cnpj?: string | null
          data_criacao?: string
          id?: string
          nome?: string
        }
        Relationships: []
      }
      fotos_paciente: {
        Row: {
          categoria: string
          created_at: string
          data_foto: string
          descricao: string | null
          id: string
          paciente_id: string
          url: string
        }
        Insert: {
          categoria?: string
          created_at?: string
          data_foto?: string
          descricao?: string | null
          id?: string
          paciente_id: string
          url: string
        }
        Update: {
          categoria?: string
          created_at?: string
          data_foto?: string
          descricao?: string | null
          id?: string
          paciente_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "fotos_paciente_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          source: string | null
          status: Database["public"]["Enums"]["lead_status"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["lead_status"] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["lead_status"] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      lgpd_consentimentos: {
        Row: {
          aceito: boolean
          created_at: string | null
          data_aceite: string | null
          data_revogacao: string | null
          id: string
          ip_address: string | null
          paciente_id: string
          termo_id: string
        }
        Insert: {
          aceito?: boolean
          created_at?: string | null
          data_aceite?: string | null
          data_revogacao?: string | null
          id?: string
          ip_address?: string | null
          paciente_id: string
          termo_id: string
        }
        Update: {
          aceito?: boolean
          created_at?: string | null
          data_aceite?: string | null
          data_revogacao?: string | null
          id?: string
          ip_address?: string | null
          paciente_id?: string
          termo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lgpd_consentimentos_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lgpd_consentimentos_termo_id_fkey"
            columns: ["termo_id"]
            isOneToOne: false
            referencedRelation: "lgpd_termos"
            referencedColumns: ["id"]
          },
        ]
      }
      lgpd_termos: {
        Row: {
          conteudo: string
          created_at: string | null
          id: string
          tipo: string
          titulo: string
          updated_at: string | null
          versao: string
          vigente: boolean | null
        }
        Insert: {
          conteudo: string
          created_at?: string | null
          id?: string
          tipo: string
          titulo: string
          updated_at?: string | null
          versao: string
          vigente?: boolean | null
        }
        Update: {
          conteudo?: string
          created_at?: string | null
          id?: string
          tipo?: string
          titulo?: string
          updated_at?: string | null
          versao?: string
          vigente?: boolean | null
        }
        Relationships: []
      }
      materiais: {
        Row: {
          custo_unitario: number | null
          id: string
          nome: string
          unidade_medida: string | null
        }
        Insert: {
          custo_unitario?: number | null
          id?: string
          nome: string
          unidade_medida?: string | null
        }
        Update: {
          custo_unitario?: number | null
          id?: string
          nome?: string
          unidade_medida?: string | null
        }
        Relationships: []
      }
      opportunities: {
        Row: {
          created_at: string | null
          expected_close_date: string | null
          id: string
          lead_id: string | null
          notes: string | null
          status: Database["public"]["Enums"]["opportunity_status"] | null
          title: string
          updated_at: string | null
          user_id: string
          value: number | null
        }
        Insert: {
          created_at?: string | null
          expected_close_date?: string | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          status?: Database["public"]["Enums"]["opportunity_status"] | null
          title: string
          updated_at?: string | null
          user_id: string
          value?: number | null
        }
        Update: {
          created_at?: string | null
          expected_close_date?: string | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          status?: Database["public"]["Enums"]["opportunity_status"] | null
          title?: string
          updated_at?: string | null
          user_id?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      orcamento_itens: {
        Row: {
          categoria_id: string | null
          created_at: string | null
          id: string
          orcamento_id: string
          tipo: string
          tratamento_id: string | null
          updated_at: string | null
          valor_orcado: number
        }
        Insert: {
          categoria_id?: string | null
          created_at?: string | null
          id?: string
          orcamento_id: string
          tipo: string
          tratamento_id?: string | null
          updated_at?: string | null
          valor_orcado?: number
        }
        Update: {
          categoria_id?: string | null
          created_at?: string | null
          id?: string
          orcamento_id?: string
          tipo?: string
          tratamento_id?: string | null
          updated_at?: string | null
          valor_orcado?: number
        }
        Relationships: [
          {
            foreignKeyName: "orcamento_itens_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orcamento_itens_orcamento_id_fkey"
            columns: ["orcamento_id"]
            isOneToOne: false
            referencedRelation: "orcamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orcamento_itens_tratamento_id_fkey"
            columns: ["tratamento_id"]
            isOneToOne: false
            referencedRelation: "tratamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      orcamentos: {
        Row: {
          created_at: string | null
          id: string
          nome: string
          observacoes: string | null
          periodo_fim: string
          periodo_inicio: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          periodo_fim: string
          periodo_inicio: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          periodo_fim?: string
          periodo_inicio?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      origens: {
        Row: {
          data_atualizacao: string | null
          data_criacao: string | null
          descricao: string | null
          id: string
          nome: string
        }
        Insert: {
          data_atualizacao?: string | null
          data_criacao?: string | null
          descricao?: string | null
          id?: string
          nome: string
        }
        Update: {
          data_atualizacao?: string | null
          data_criacao?: string | null
          descricao?: string | null
          id?: string
          nome?: string
        }
        Relationships: []
      }
      pacientes: {
        Row: {
          ativo: boolean | null
          cep: string | null
          cidade: string | null
          contato_emergencia_parentesco: string | null
          contato_emergencia_telefone: string | null
          cpf: string | null
          created_at: string | null
          data_nascimento: string | null
          email: string | null
          endereco: string | null
          endereco_profissional: string | null
          estado: string | null
          estado_civil: string | null
          foto_url: string | null
          id: string
          indicado_por: string | null
          instagram: string | null
          nacionalidade: string | null
          naturalidade: string | null
          nome: string
          observacoes: string | null
          primeiro_atendimento: string | null
          profissao: string | null
          responsavel_cep: string | null
          responsavel_cpf: string | null
          responsavel_data_nascimento: string | null
          responsavel_email: string | null
          responsavel_endereco: string | null
          responsavel_estado_civil: string | null
          responsavel_nacionalidade: string | null
          responsavel_naturalidade: string | null
          responsavel_nome: string | null
          responsavel_parentesco: string | null
          responsavel_profissao: string | null
          responsavel_rg: string | null
          responsavel_rg_orgao: string | null
          responsavel_sexo: string | null
          responsavel_telefone: string | null
          rg: string | null
          rg_orgao_expedidor: string | null
          sexo: string | null
          telefone: string | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          cep?: string | null
          cidade?: string | null
          contato_emergencia_parentesco?: string | null
          contato_emergencia_telefone?: string | null
          cpf?: string | null
          created_at?: string | null
          data_nascimento?: string | null
          email?: string | null
          endereco?: string | null
          endereco_profissional?: string | null
          estado?: string | null
          estado_civil?: string | null
          foto_url?: string | null
          id?: string
          indicado_por?: string | null
          instagram?: string | null
          nacionalidade?: string | null
          naturalidade?: string | null
          nome: string
          observacoes?: string | null
          primeiro_atendimento?: string | null
          profissao?: string | null
          responsavel_cep?: string | null
          responsavel_cpf?: string | null
          responsavel_data_nascimento?: string | null
          responsavel_email?: string | null
          responsavel_endereco?: string | null
          responsavel_estado_civil?: string | null
          responsavel_nacionalidade?: string | null
          responsavel_naturalidade?: string | null
          responsavel_nome?: string | null
          responsavel_parentesco?: string | null
          responsavel_profissao?: string | null
          responsavel_rg?: string | null
          responsavel_rg_orgao?: string | null
          responsavel_sexo?: string | null
          responsavel_telefone?: string | null
          rg?: string | null
          rg_orgao_expedidor?: string | null
          sexo?: string | null
          telefone?: string | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          cep?: string | null
          cidade?: string | null
          contato_emergencia_parentesco?: string | null
          contato_emergencia_telefone?: string | null
          cpf?: string | null
          created_at?: string | null
          data_nascimento?: string | null
          email?: string | null
          endereco?: string | null
          endereco_profissional?: string | null
          estado?: string | null
          estado_civil?: string | null
          foto_url?: string | null
          id?: string
          indicado_por?: string | null
          instagram?: string | null
          nacionalidade?: string | null
          naturalidade?: string | null
          nome?: string
          observacoes?: string | null
          primeiro_atendimento?: string | null
          profissao?: string | null
          responsavel_cep?: string | null
          responsavel_cpf?: string | null
          responsavel_data_nascimento?: string | null
          responsavel_email?: string | null
          responsavel_endereco?: string | null
          responsavel_estado_civil?: string | null
          responsavel_nacionalidade?: string | null
          responsavel_naturalidade?: string | null
          responsavel_nome?: string | null
          responsavel_parentesco?: string | null
          responsavel_profissao?: string | null
          responsavel_rg?: string | null
          responsavel_rg_orgao?: string | null
          responsavel_sexo?: string | null
          responsavel_telefone?: string | null
          rg?: string | null
          rg_orgao_expedidor?: string | null
          sexo?: string | null
          telefone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      pipeline_checklist_items: {
        Row: {
          ativo: boolean
          created_at: string
          descricao: string | null
          etapa: string
          id: string
          obrigatorio: boolean
          ordem: number
          titulo: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          etapa: string
          id?: string
          obrigatorio?: boolean
          ordem?: number
          titulo: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          etapa?: string
          id?: string
          obrigatorio?: boolean
          ordem?: number
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      pipeline_checklist_progress: {
        Row: {
          agendamento_id: string
          checklist_item_id: string
          concluido: boolean
          concluido_em: string | null
          concluido_por: string | null
          created_at: string
          id: string
          observacao: string | null
          updated_at: string
        }
        Insert: {
          agendamento_id: string
          checklist_item_id: string
          concluido?: boolean
          concluido_em?: string | null
          concluido_por?: string | null
          created_at?: string
          id?: string
          observacao?: string | null
          updated_at?: string
        }
        Update: {
          agendamento_id?: string
          checklist_item_id?: string
          concluido?: boolean
          concluido_em?: string | null
          concluido_por?: string | null
          created_at?: string
          id?: string
          observacao?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_checklist_progress_agendamento_id_fkey"
            columns: ["agendamento_id"]
            isOneToOne: false
            referencedRelation: "crm_agendamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pipeline_checklist_progress_checklist_item_id_fkey"
            columns: ["checklist_item_id"]
            isOneToOne: false
            referencedRelation: "pipeline_checklist_items"
            referencedColumns: ["id"]
          },
        ]
      }
      planos_tratamento: {
        Row: {
          created_at: string
          id: string
          itens: Json
          paciente_id: string
          pdf_url: string | null
          status: string | null
          updated_at: string
          valor_total: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          itens?: Json
          paciente_id: string
          pdf_url?: string | null
          status?: string | null
          updated_at?: string
          valor_total?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          itens?: Json
          paciente_id?: string
          pdf_url?: string | null
          status?: string | null
          updated_at?: string
          valor_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "planos_tratamento_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          ativo: boolean | null
          cargo: string | null
          created_at: string | null
          crm: string | null
          email: string | null
          especialidade: string | null
          foto_url: string | null
          id: string
          nome: string
          telefone: string | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          cargo?: string | null
          created_at?: string | null
          crm?: string | null
          email?: string | null
          especialidade?: string | null
          foto_url?: string | null
          id: string
          nome: string
          telefone?: string | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          cargo?: string | null
          created_at?: string | null
          crm?: string | null
          email?: string | null
          especialidade?: string | null
          foto_url?: string | null
          id?: string
          nome?: string
          telefone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      prontuarios: {
        Row: {
          created_at: string | null
          data_atendimento: string
          descricao_procedimento: string | null
          evolucao: string | null
          fotos_antes: string[] | null
          fotos_depois: string[] | null
          id: string
          observacoes_clinicas: string | null
          paciente_id: string
          proximos_passos: string | null
          tratamento_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data_atendimento?: string
          descricao_procedimento?: string | null
          evolucao?: string | null
          fotos_antes?: string[] | null
          fotos_depois?: string[] | null
          id?: string
          observacoes_clinicas?: string | null
          paciente_id: string
          proximos_passos?: string | null
          tratamento_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data_atendimento?: string
          descricao_procedimento?: string | null
          evolucao?: string | null
          fotos_antes?: string[] | null
          fotos_depois?: string[] | null
          id?: string
          observacoes_clinicas?: string | null
          paciente_id?: string
          proximos_passos?: string | null
          tratamento_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prontuarios_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prontuarios_tratamento_id_fkey"
            columns: ["tratamento_id"]
            isOneToOne: false
            referencedRelation: "tratamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      receituario_digital: {
        Row: {
          created_at: string
          data_prescricao: string
          id: string
          medicamentos: string
          orientacoes: string | null
          paciente_id: string
          posologia: string
          validade_dias: number | null
        }
        Insert: {
          created_at?: string
          data_prescricao?: string
          id?: string
          medicamentos: string
          orientacoes?: string | null
          paciente_id: string
          posologia: string
          validade_dias?: number | null
        }
        Update: {
          created_at?: string
          data_prescricao?: string
          id?: string
          medicamentos?: string
          orientacoes?: string | null
          paciente_id?: string
          posologia?: string
          validade_dias?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "receituario_digital_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
        ]
      }
      solicitacoes_acesso: {
        Row: {
          aprovado_por: string | null
          created_at: string | null
          email: string
          id: string
          motivo_rejeicao: string | null
          nome: string
          senha_hash: string
          status: string
          telefone: string | null
          updated_at: string | null
        }
        Insert: {
          aprovado_por?: string | null
          created_at?: string | null
          email: string
          id?: string
          motivo_rejeicao?: string | null
          nome: string
          senha_hash: string
          status?: string
          telefone?: string | null
          updated_at?: string | null
        }
        Update: {
          aprovado_por?: string | null
          created_at?: string | null
          email?: string
          id?: string
          motivo_rejeicao?: string | null
          nome?: string
          senha_hash?: string
          status?: string
          telefone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      td_fluxo_de_caixa: {
        Row: {
          categoria_id: string | null
          cliente_fornecedor_id: string | null
          conta_financeira_id: string | null
          custo_material: number | null
          data_atualizacao: string | null
          data_criacao: string | null
          data_lancamento: string
          data_pagamento: string | null
          data_vencimento: string | null
          descricao: string | null
          forma_pagamento_id: string | null
          id: string
          observacoes: string | null
          origem_id: string | null
          parcela_atual: number | null
          status: string
          tipo: string
          total_parcelas: number | null
          tratamento_id: string | null
          valor: number
        }
        Insert: {
          categoria_id?: string | null
          cliente_fornecedor_id?: string | null
          conta_financeira_id?: string | null
          custo_material?: number | null
          data_atualizacao?: string | null
          data_criacao?: string | null
          data_lancamento: string
          data_pagamento?: string | null
          data_vencimento?: string | null
          descricao?: string | null
          forma_pagamento_id?: string | null
          id?: string
          observacoes?: string | null
          origem_id?: string | null
          parcela_atual?: number | null
          status: string
          tipo: string
          total_parcelas?: number | null
          tratamento_id?: string | null
          valor: number
        }
        Update: {
          categoria_id?: string | null
          cliente_fornecedor_id?: string | null
          conta_financeira_id?: string | null
          custo_material?: number | null
          data_atualizacao?: string | null
          data_criacao?: string | null
          data_lancamento?: string
          data_pagamento?: string | null
          data_vencimento?: string | null
          descricao?: string | null
          forma_pagamento_id?: string | null
          id?: string
          observacoes?: string | null
          origem_id?: string | null
          parcela_atual?: number | null
          status?: string
          tipo?: string
          total_parcelas?: number | null
          tratamento_id?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "td_fluxo_de_caixa_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "td_fluxo_de_caixa_cliente_fornecedor_id_fkey"
            columns: ["cliente_fornecedor_id"]
            isOneToOne: false
            referencedRelation: "clientes_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "td_fluxo_de_caixa_conta_financeira_id_fkey"
            columns: ["conta_financeira_id"]
            isOneToOne: false
            referencedRelation: "contas_financeiras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "td_fluxo_de_caixa_forma_pagamento_id_fkey"
            columns: ["forma_pagamento_id"]
            isOneToOne: false
            referencedRelation: "formas_pagamento"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "td_fluxo_de_caixa_origem_id_fkey"
            columns: ["origem_id"]
            isOneToOne: false
            referencedRelation: "origens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "td_fluxo_de_caixa_tratamento_id_fkey"
            columns: ["tratamento_id"]
            isOneToOne: false
            referencedRelation: "tratamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      transacao_materiais: {
        Row: {
          material_id: string
          quantidade: number
          transacao_id: number
        }
        Insert: {
          material_id: string
          quantidade: number
          transacao_id: number
        }
        Update: {
          material_id?: string
          quantidade?: number
          transacao_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "transacao_materiais_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materiais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacao_materiais_transacao_id_fkey"
            columns: ["transacao_id"]
            isOneToOne: false
            referencedRelation: "transacoes_old"
            referencedColumns: ["id"]
          },
        ]
      }
      transacoes_old: {
        Row: {
          categoria_id: string | null
          cliente_id: string | null
          data_atualizacao: string
          data_criacao: string
          data_transacao: string
          descricao: string | null
          forma_pagamento: string | null
          fornecedor_id: string | null
          id: number
          status: string
          tipo: string
          tratamento_id: string | null
          valor: number
        }
        Insert: {
          categoria_id?: string | null
          cliente_id?: string | null
          data_atualizacao?: string
          data_criacao?: string
          data_transacao: string
          descricao?: string | null
          forma_pagamento?: string | null
          fornecedor_id?: string | null
          id?: number
          status: string
          tipo: string
          tratamento_id?: string | null
          valor: number
        }
        Update: {
          categoria_id?: string | null
          cliente_id?: string | null
          data_atualizacao?: string
          data_criacao?: string
          data_transacao?: string
          descricao?: string | null
          forma_pagamento?: string | null
          fornecedor_id?: string | null
          id?: number
          status?: string
          tipo?: string
          tratamento_id?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "transacoes_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias_old"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacoes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes_old"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacoes_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores_old"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacoes_tratamento_id_fkey"
            columns: ["tratamento_id"]
            isOneToOne: false
            referencedRelation: "tratamentos_old"
            referencedColumns: ["id"]
          },
        ]
      }
      tratamentos: {
        Row: {
          custo_cirurgico: number | null
          custo_estimado: number | null
          data_atualizacao: string | null
          data_criacao: string | null
          descricao: string | null
          e_cirurgico: boolean | null
          id: string
          nome: string
          preco_padrao: number | null
          unidade_medida: string | null
        }
        Insert: {
          custo_cirurgico?: number | null
          custo_estimado?: number | null
          data_atualizacao?: string | null
          data_criacao?: string | null
          descricao?: string | null
          e_cirurgico?: boolean | null
          id?: string
          nome: string
          preco_padrao?: number | null
          unidade_medida?: string | null
        }
        Update: {
          custo_cirurgico?: number | null
          custo_estimado?: number | null
          data_atualizacao?: string | null
          data_criacao?: string | null
          descricao?: string | null
          e_cirurgico?: boolean | null
          id?: string
          nome?: string
          preco_padrao?: number | null
          unidade_medida?: string | null
        }
        Relationships: []
      }
      tratamentos_ficha_tecnica: {
        Row: {
          created_at: string | null
          custo_total: number | null
          custo_unitario: number | null
          id: string
          produto_id: string
          quantidade_utilizada: number
          tratamento_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          custo_total?: number | null
          custo_unitario?: number | null
          id?: string
          produto_id: string
          quantidade_utilizada?: number
          tratamento_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          custo_total?: number | null
          custo_unitario?: number | null
          id?: string
          produto_id?: string
          quantidade_utilizada?: number
          tratamento_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tratamentos_ficha_tecnica_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "estoque_produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tratamentos_ficha_tecnica_tratamento_id_fkey"
            columns: ["tratamento_id"]
            isOneToOne: false
            referencedRelation: "tratamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      tratamentos_old: {
        Row: {
          descricao: string | null
          id: string
          nome: string
          preco_padrao: number | null
        }
        Insert: {
          descricao?: string | null
          id?: string
          nome: string
          preco_padrao?: number | null
        }
        Update: {
          descricao?: string | null
          id?: string
          nome?: string
          preco_padrao?: number | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      financeiro_categorias_dropdown: {
        Row: {
          categoria_analitica: string | null
          categoria_sintetica: string | null
          id: string | null
          nome_completo: string | null
          tipo: Database["public"]["Enums"]["categoria_tipo"] | null
        }
        Insert: {
          categoria_analitica?: string | null
          categoria_sintetica?: string | null
          id?: string | null
          nome_completo?: never
          tipo?: Database["public"]["Enums"]["categoria_tipo"] | null
        }
        Update: {
          categoria_analitica?: string | null
          categoria_sintetica?: string | null
          id?: string | null
          nome_completo?: never
          tipo?: Database["public"]["Enums"]["categoria_tipo"] | null
        }
        Relationships: []
      }
      financeiro_categorias_sinteticas: {
        Row: {
          categoria_sintetica: string | null
          tipo: Database["public"]["Enums"]["categoria_tipo"] | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_email_exists: { Args: { check_email: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      obter_custo_tratamento: {
        Args: { p_tratamento_id: string }
        Returns: number
      }
      recalcular_saldo_conta: { Args: { p_conta_id: string }; Returns: number }
      search_agent_memory: {
        Args: {
          p_agent_id: string
          p_embedding: string
          p_match_count?: number
          p_user_id: string
        }
        Returns: {
          content: string
          id: string
          importance: number
          memory_type: string
          similarity: number
        }[]
      }
      search_document_chunks: {
        Args: {
          p_agent_id: string
          p_embedding: string
          p_match_count?: number
          p_match_threshold?: number
        }
        Returns: {
          content: string
          document_name: string
          id: string
          metadata: Json
          similarity: number
        }[]
      }
      uuid_default: { Args: never; Returns: string }
    }
    Enums: {
      activity_type: "call" | "email" | "meeting" | "note"
      app_role: "admin" | "medico" | "estagiario" | "recepcionista"
      appointment_type: "consultation" | "procedure" | "return"
      categoria_tipo: "receita" | "despesa"
      lead_status: "new" | "contacted" | "qualified" | "converted" | "lost"
      opportunity_status:
        | "prospecting"
        | "proposal"
        | "negotiation"
        | "won"
        | "lost"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      activity_type: ["call", "email", "meeting", "note"],
      app_role: ["admin", "medico", "estagiario", "recepcionista"],
      appointment_type: ["consultation", "procedure", "return"],
      categoria_tipo: ["receita", "despesa"],
      lead_status: ["new", "contacted", "qualified", "converted", "lost"],
      opportunity_status: [
        "prospecting",
        "proposal",
        "negotiation",
        "won",
        "lost",
      ],
    },
  },
} as const
