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
            referencedRelation: "categorias"
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
      clientes: {
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
            referencedRelation: "financeiro_contas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estoque_compras_forma_pagamento_id_fkey"
            columns: ["forma_pagamento_id"]
            isOneToOne: false
            referencedRelation: "financeiro_formas_pagamento"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estoque_compras_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "financeiro_fornecedores"
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
            referencedRelation: "financeiro_lancamentos"
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
            referencedRelation: "financeiro_fornecedores"
            referencedColumns: ["id"]
          },
        ]
      }
      financeiro_categorias: {
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
      financeiro_contas: {
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
            referencedRelation: "financeiro_categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_contas_pagar_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "financeiro_categorias_dropdown"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_contas_pagar_conta_id_fkey"
            columns: ["conta_id"]
            isOneToOne: false
            referencedRelation: "financeiro_contas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_contas_pagar_forma_pagamento_id_fkey"
            columns: ["forma_pagamento_id"]
            isOneToOne: false
            referencedRelation: "financeiro_formas_pagamento"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_contas_pagar_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "financeiro_fornecedores"
            referencedColumns: ["id"]
          },
        ]
      }
      financeiro_formas_pagamento: {
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
      financeiro_fornecedores: {
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
      financeiro_lancamentos: {
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
            referencedRelation: "financeiro_categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_lancamentos_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "financeiro_categorias_dropdown"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_lancamentos_conta_financeira_id_fkey"
            columns: ["conta_financeira_id"]
            isOneToOne: false
            referencedRelation: "financeiro_contas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_lancamentos_conta_id_fkey"
            columns: ["conta_id"]
            isOneToOne: false
            referencedRelation: "financeiro_contas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_lancamentos_forma_pagamento_id_fkey"
            columns: ["forma_pagamento_id"]
            isOneToOne: false
            referencedRelation: "financeiro_formas_pagamento"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_lancamentos_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "financeiro_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_lancamentos_lancamento_pai_id_fkey"
            columns: ["lancamento_pai_id"]
            isOneToOne: false
            referencedRelation: "financeiro_lancamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_lancamentos_origem_id_fkey"
            columns: ["origem_id"]
            isOneToOne: false
            referencedRelation: "financeiro_origens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_lancamentos_tratamento_id_fkey"
            columns: ["tratamento_id"]
            isOneToOne: false
            referencedRelation: "financeiro_tratamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      financeiro_origens: {
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
      financeiro_tratamentos: {
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
      fornecedores: {
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
            referencedRelation: "transacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      transacoes: {
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
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacoes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacoes_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacoes_tratamento_id_fkey"
            columns: ["tratamento_id"]
            isOneToOne: false
            referencedRelation: "tratamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      tratamentos: {
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
            referencedRelation: "financeiro_tratamentos"
            referencedColumns: ["id"]
          },
        ]
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
      recalcular_saldo_conta: { Args: { p_conta_id: string }; Returns: number }
      uuid_default: { Args: never; Returns: string }
    }
    Enums: {
      activity_type: "call" | "email" | "meeting" | "note"
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
