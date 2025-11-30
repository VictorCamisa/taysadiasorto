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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          created_at: string
          description: string
          id: string
          lead_id: string | null
          opportunity_id: string | null
          title: string
          type: Database["public"]["Enums"]["activity_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          lead_id?: string | null
          opportunity_id?: string | null
          title: string
          type: Database["public"]["Enums"]["activity_type"]
          user_id: string
        }
        Update: {
          created_at?: string
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
          created_at: string
          id: string
          lead_id: string | null
          notes: string | null
          opportunity_id: string | null
          procedure: string
          status: string
          type: Database["public"]["Enums"]["appointment_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          appointment_date: string
          client_name: string
          created_at?: string
          id?: string
          lead_id?: string | null
          notes?: string | null
          opportunity_id?: string | null
          procedure: string
          status?: string
          type?: Database["public"]["Enums"]["appointment_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          appointment_date?: string
          client_name?: string
          created_at?: string
          id?: string
          lead_id?: string | null
          notes?: string | null
          opportunity_id?: string | null
          procedure?: string
          status?: string
          type?: Database["public"]["Enums"]["appointment_type"]
          updated_at?: string
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
          created_at: string
          id: string
          lead_ids: string[]
          message: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          lead_ids?: string[]
          message: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          lead_ids?: string[]
          message?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      estoque_compras: {
        Row: {
          conta_financeira_id: string | null
          created_at: string
          data_compra: string
          forma_pagamento_id: string | null
          fornecedor_id: string | null
          id: string
          numero_nf: string | null
          observacoes: string | null
          updated_at: string
          user_id: string
          valor_total: number
        }
        Insert: {
          conta_financeira_id?: string | null
          created_at?: string
          data_compra: string
          forma_pagamento_id?: string | null
          fornecedor_id?: string | null
          id?: string
          numero_nf?: string | null
          observacoes?: string | null
          updated_at?: string
          user_id: string
          valor_total?: number
        }
        Update: {
          conta_financeira_id?: string | null
          created_at?: string
          data_compra?: string
          forma_pagamento_id?: string | null
          fornecedor_id?: string | null
          id?: string
          numero_nf?: string | null
          observacoes?: string | null
          updated_at?: string
          user_id?: string
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "estoque_compras_conta_financeira_fk"
            columns: ["conta_financeira_id"]
            isOneToOne: false
            referencedRelation: "financeiro_contas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estoque_compras_conta_financeira_id_fkey"
            columns: ["conta_financeira_id"]
            isOneToOne: false
            referencedRelation: "financeiro_contas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estoque_compras_forma_pagamento_fk"
            columns: ["forma_pagamento_id"]
            isOneToOne: false
            referencedRelation: "financeiro_formas_pagamento"
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
            foreignKeyName: "estoque_compras_fornecedor_fk"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "financeiro_fornecedores"
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
          created_at: string
          id: string
          produto_id: string
          quantidade: number
          valor_total: number | null
          valor_unitario: number
        }
        Insert: {
          compra_id: string
          created_at?: string
          id?: string
          produto_id: string
          quantidade?: number
          valor_total?: number | null
          valor_unitario?: number
        }
        Update: {
          compra_id?: string
          created_at?: string
          id?: string
          produto_id?: string
          quantidade?: number
          valor_total?: number | null
          valor_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: "estoque_compras_itens_compra_fk"
            columns: ["compra_id"]
            isOneToOne: false
            referencedRelation: "estoque_compras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estoque_compras_itens_compra_id_fkey"
            columns: ["compra_id"]
            isOneToOne: false
            referencedRelation: "estoque_compras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estoque_compras_itens_produto_fk"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "estoque_produtos"
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
      estoque_produtos: {
        Row: {
          ativo: boolean
          categoria: string
          created_at: string
          custo_medio: number
          estoque_atual: number
          estoque_minimo: number
          fornecedor_id: string | null
          id: string
          lote: string | null
          nome: string
          unidade_medida: string
          updated_at: string
          user_id: string
          validade: string | null
        }
        Insert: {
          ativo?: boolean
          categoria: string
          created_at?: string
          custo_medio?: number
          estoque_atual?: number
          estoque_minimo?: number
          fornecedor_id?: string | null
          id?: string
          lote?: string | null
          nome: string
          unidade_medida: string
          updated_at?: string
          user_id: string
          validade?: string | null
        }
        Update: {
          ativo?: boolean
          categoria?: string
          created_at?: string
          custo_medio?: number
          estoque_atual?: number
          estoque_minimo?: number
          fornecedor_id?: string | null
          id?: string
          lote?: string | null
          nome?: string
          unidade_medida?: string
          updated_at?: string
          user_id?: string
          validade?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "estoque_produtos_fornecedor_fk"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "financeiro_fornecedores"
            referencedColumns: ["id"]
          },
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
          ativa: boolean | null
          created_at: string | null
          id: string
          nome: string
          saldo_atual: number | null
          saldo_inicial: number | null
          tipo: Database["public"]["Enums"]["conta_financeira_tipo"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ativa?: boolean | null
          created_at?: string | null
          id?: string
          nome: string
          saldo_atual?: number | null
          saldo_inicial?: number | null
          tipo: Database["public"]["Enums"]["conta_financeira_tipo"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ativa?: boolean | null
          created_at?: string | null
          id?: string
          nome?: string
          saldo_atual?: number | null
          saldo_inicial?: number | null
          tipo?: Database["public"]["Enums"]["conta_financeira_tipo"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      financeiro_contas_pagar: {
        Row: {
          categoria_id: string | null
          compra_id: string | null
          conta_financeira_id: string | null
          created_at: string | null
          data_pagamento: string | null
          descricao: string
          forma_pagamento_id: string | null
          fornecedor_id: string | null
          id: string
          observacoes: string | null
          status: Database["public"]["Enums"]["conta_pagar_status"] | null
          updated_at: string | null
          user_id: string
          valor: number
          vencimento: string
        }
        Insert: {
          categoria_id?: string | null
          compra_id?: string | null
          conta_financeira_id?: string | null
          created_at?: string | null
          data_pagamento?: string | null
          descricao: string
          forma_pagamento_id?: string | null
          fornecedor_id?: string | null
          id?: string
          observacoes?: string | null
          status?: Database["public"]["Enums"]["conta_pagar_status"] | null
          updated_at?: string | null
          user_id: string
          valor: number
          vencimento: string
        }
        Update: {
          categoria_id?: string | null
          compra_id?: string | null
          conta_financeira_id?: string | null
          created_at?: string | null
          data_pagamento?: string | null
          descricao?: string
          forma_pagamento_id?: string | null
          fornecedor_id?: string | null
          id?: string
          observacoes?: string | null
          status?: Database["public"]["Enums"]["conta_pagar_status"] | null
          updated_at?: string | null
          user_id?: string
          valor?: number
          vencimento?: string
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
            foreignKeyName: "financeiro_contas_pagar_compra_id_fkey"
            columns: ["compra_id"]
            isOneToOne: false
            referencedRelation: "estoque_compras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_contas_pagar_conta_financeira_id_fkey"
            columns: ["conta_financeira_id"]
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
          id: string
          nome: string
          permite_parcelamento: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ativa?: boolean | null
          created_at?: string | null
          id?: string
          nome: string
          permite_parcelamento?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ativa?: boolean | null
          created_at?: string | null
          id?: string
          nome?: string
          permite_parcelamento?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      financeiro_fornecedores: {
        Row: {
          ativo: boolean | null
          cnpj_cpf: string | null
          created_at: string | null
          id: string
          nome: string
          observacoes: string | null
          telefone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ativo?: boolean | null
          cnpj_cpf?: string | null
          created_at?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          telefone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ativo?: boolean | null
          cnpj_cpf?: string | null
          created_at?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
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
          conta_destino_id: string | null
          conta_financeira_id: string | null
          conta_origem_id: string | null
          conta_pagar_id: string | null
          created_at: string | null
          custo_tratamento: number | null
          data: string
          forma_pagamento_id: string | null
          fornecedor_id: string | null
          id: string
          margem: number | null
          observacoes: string | null
          origem_id: string | null
          quantidade: number | null
          tipo: Database["public"]["Enums"]["lancamento_tipo"]
          tratamento_id: string | null
          updated_at: string | null
          user_id: string
          valor_entrada: number | null
          valor_saida: number | null
        }
        Insert: {
          categoria_id?: string | null
          cliente?: string | null
          conta_destino_id?: string | null
          conta_financeira_id?: string | null
          conta_origem_id?: string | null
          conta_pagar_id?: string | null
          created_at?: string | null
          custo_tratamento?: number | null
          data: string
          forma_pagamento_id?: string | null
          fornecedor_id?: string | null
          id?: string
          margem?: number | null
          observacoes?: string | null
          origem_id?: string | null
          quantidade?: number | null
          tipo: Database["public"]["Enums"]["lancamento_tipo"]
          tratamento_id?: string | null
          updated_at?: string | null
          user_id: string
          valor_entrada?: number | null
          valor_saida?: number | null
        }
        Update: {
          categoria_id?: string | null
          cliente?: string | null
          conta_destino_id?: string | null
          conta_financeira_id?: string | null
          conta_origem_id?: string | null
          conta_pagar_id?: string | null
          created_at?: string | null
          custo_tratamento?: number | null
          data?: string
          forma_pagamento_id?: string | null
          fornecedor_id?: string | null
          id?: string
          margem?: number | null
          observacoes?: string | null
          origem_id?: string | null
          quantidade?: number | null
          tipo?: Database["public"]["Enums"]["lancamento_tipo"]
          tratamento_id?: string | null
          updated_at?: string | null
          user_id?: string
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
            foreignKeyName: "financeiro_lancamentos_conta_destino_id_fkey"
            columns: ["conta_destino_id"]
            isOneToOne: false
            referencedRelation: "financeiro_contas"
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
            foreignKeyName: "financeiro_lancamentos_conta_origem_id_fkey"
            columns: ["conta_origem_id"]
            isOneToOne: false
            referencedRelation: "financeiro_contas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_lancamentos_conta_pagar_id_fkey"
            columns: ["conta_pagar_id"]
            isOneToOne: false
            referencedRelation: "financeiro_contas_pagar"
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
          id: string
          nome: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ativa?: boolean | null
          created_at?: string | null
          id?: string
          nome: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ativa?: boolean | null
          created_at?: string | null
          id?: string
          nome?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      financeiro_tratamentos: {
        Row: {
          ativo: boolean
          contraindicacoes: string | null
          created_at: string
          custo_operacional: number
          custo_total: number
          grupo: string
          id: string
          lucro_sessao: number | null
          margem_bruta: number | null
          margem_contribuicao: number | null
          nome: string
          observacoes: string | null
          preco_venda: number
          profissional_executor: string | null
          tempo_execucao_minutos: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ativo?: boolean
          contraindicacoes?: string | null
          created_at?: string
          custo_operacional?: number
          custo_total?: number
          grupo: string
          id?: string
          lucro_sessao?: number | null
          margem_bruta?: number | null
          margem_contribuicao?: number | null
          nome: string
          observacoes?: string | null
          preco_venda?: number
          profissional_executor?: string | null
          tempo_execucao_minutos?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ativo?: boolean
          contraindicacoes?: string | null
          created_at?: string
          custo_operacional?: number
          custo_total?: number
          grupo?: string
          id?: string
          lucro_sessao?: number | null
          margem_bruta?: number | null
          margem_contribuicao?: number | null
          nome?: string
          observacoes?: string | null
          preco_venda?: number
          profissional_executor?: string | null
          tempo_execucao_minutos?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          created_at: string
          id: string
          last_contact: string
          mensagem_enviada_em: string | null
          name: string
          notes: string | null
          origin: string
          phone: string
          procedure: string
          status: Database["public"]["Enums"]["lead_status"]
          tags: string[] | null
          updated_at: string
          user_id: string
          value: number
        }
        Insert: {
          created_at?: string
          id?: string
          last_contact?: string
          mensagem_enviada_em?: string | null
          name: string
          notes?: string | null
          origin: string
          phone: string
          procedure: string
          status?: Database["public"]["Enums"]["lead_status"]
          tags?: string[] | null
          updated_at?: string
          user_id?: string
          value?: number
        }
        Update: {
          created_at?: string
          id?: string
          last_contact?: string
          mensagem_enviada_em?: string | null
          name?: string
          notes?: string | null
          origin?: string
          phone?: string
          procedure?: string
          status?: Database["public"]["Enums"]["lead_status"]
          tags?: string[] | null
          updated_at?: string
          user_id?: string
          value?: number
        }
        Relationships: []
      }
      opportunities: {
        Row: {
          client_name: string
          created_at: string
          estimated_value: number
          id: string
          lead_id: string | null
          mensagem_enviada_em: string | null
          notes: string | null
          origin: string | null
          phone: string
          procedure: string
          status: Database["public"]["Enums"]["opportunity_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          client_name: string
          created_at?: string
          estimated_value?: number
          id?: string
          lead_id?: string | null
          mensagem_enviada_em?: string | null
          notes?: string | null
          origin?: string | null
          phone: string
          procedure: string
          status?: Database["public"]["Enums"]["opportunity_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          client_name?: string
          created_at?: string
          estimated_value?: number
          id?: string
          lead_id?: string | null
          mensagem_enviada_em?: string | null
          notes?: string | null
          origin?: string | null
          phone?: string
          procedure?: string
          status?: Database["public"]["Enums"]["opportunity_status"]
          updated_at?: string
          user_id?: string
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
      opportunity_clinical_data: {
        Row: {
          allergies: string | null
          created_at: string
          id: string
          last_evaluation: string | null
          medical_notes: string | null
          opportunity_id: string
          updated_at: string
        }
        Insert: {
          allergies?: string | null
          created_at?: string
          id?: string
          last_evaluation?: string | null
          medical_notes?: string | null
          opportunity_id: string
          updated_at?: string
        }
        Update: {
          allergies?: string | null
          created_at?: string
          id?: string
          last_evaluation?: string | null
          medical_notes?: string | null
          opportunity_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "opportunity_clinical_data_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: true
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunity_history: {
        Row: {
          action: string
          created_at: string
          id: string
          notes: string | null
          opportunity_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          notes?: string | null
          opportunity_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          notes?: string | null
          opportunity_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "opportunity_history_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunity_objections: {
        Row: {
          created_at: string
          description: string | null
          id: string
          opportunity_id: string
          type: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          opportunity_id: string
          type: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          opportunity_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "opportunity_objections_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunity_photos: {
        Row: {
          created_at: string
          description: string | null
          id: string
          opportunity_id: string
          photo_type: string | null
          photo_url: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          opportunity_id: string
          photo_type?: string | null
          photo_url: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          opportunity_id?: string
          photo_type?: string | null
          photo_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "opportunity_photos_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunity_procedures: {
        Row: {
          created_at: string
          id: string
          name: string
          notes: string | null
          opportunity_id: string
          procedure_date: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          opportunity_id: string
          procedure_date: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          opportunity_id?: string
          procedure_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "opportunity_procedures_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunity_task_comments: {
        Row: {
          comment: string
          created_at: string
          id: string
          task_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          comment: string
          created_at?: string
          id?: string
          task_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string
          created_at?: string
          id?: string
          task_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_task"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "opportunity_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunity_tasks: {
        Row: {
          completed: boolean
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          opportunity_id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          opportunity_id: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          opportunity_id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_opportunity"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
          username?: string | null
        }
        Relationships: []
      }
      segments: {
        Row: {
          created_at: string
          filters: Json
          id: string
          leads_count: number
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          filters?: Json
          id?: string
          leads_count?: number
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          filters?: Json
          id?: string
          leads_count?: number
          name?: string
          updated_at?: string
          user_id?: string
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
          quantidade: number
          tratamento_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          custo_total?: number | null
          custo_unitario?: number | null
          id?: string
          produto_id: string
          quantidade: number
          tratamento_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          custo_total?: number | null
          custo_unitario?: number | null
          id?: string
          produto_id?: string
          quantidade?: number
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
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      activity_type:
        | "lead"
        | "status"
        | "contact"
        | "appointment"
        | "note"
        | "email"
        | "call"
      appointment_type: "avaliacao" | "procedimento" | "retorno" | "consulta"
      categoria_tipo:
        | "fixa"
        | "variavel"
        | "impostos"
        | "estruturais"
        | "comissoes"
        | "marketing"
        | "servicos"
      conta_financeira_tipo:
        | "caixa_fisico"
        | "conta_bancaria"
        | "cartao"
        | "conta_socio"
      conta_pagar_status: "aberto" | "pago" | "atrasado" | "cancelado"
      lancamento_tipo: "receita" | "despesa" | "transferencia" | "ajuste"
      lead_status: "novo" | "avaliacao" | "proposta" | "perdido" | "fechou"
      opportunity_status: "lead_novo" | "avaliacao" | "proposta" | "fechou"
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
      activity_type: [
        "lead",
        "status",
        "contact",
        "appointment",
        "note",
        "email",
        "call",
      ],
      appointment_type: ["avaliacao", "procedimento", "retorno", "consulta"],
      categoria_tipo: [
        "fixa",
        "variavel",
        "impostos",
        "estruturais",
        "comissoes",
        "marketing",
        "servicos",
      ],
      conta_financeira_tipo: [
        "caixa_fisico",
        "conta_bancaria",
        "cartao",
        "conta_socio",
      ],
      conta_pagar_status: ["aberto", "pago", "atrasado", "cancelado"],
      lancamento_tipo: ["receita", "despesa", "transferencia", "ajuste"],
      lead_status: ["novo", "avaliacao", "proposta", "perdido", "fechou"],
      opportunity_status: ["lead_novo", "avaliacao", "proposta", "fechou"],
    },
  },
} as const
