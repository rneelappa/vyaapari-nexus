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
      approval_actions: {
        Row: {
          action: string
          approval_request_id: string
          approver_id: string
          comments: string | null
          created_at: string
          id: string
          level_number: number
        }
        Insert: {
          action: string
          approval_request_id: string
          approver_id: string
          comments?: string | null
          created_at?: string
          id?: string
          level_number: number
        }
        Update: {
          action?: string
          approval_request_id?: string
          approver_id?: string
          comments?: string | null
          created_at?: string
          id?: string
          level_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "approval_actions_approval_request_id_fkey"
            columns: ["approval_request_id"]
            isOneToOne: false
            referencedRelation: "approval_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      approval_requests: {
        Row: {
          company_id: string
          created_at: string
          current_level: number
          division_id: string | null
          entity_data: Json
          entity_id: string
          entity_type: string
          id: string
          request_reason: string | null
          requested_amount: number | null
          requested_by: string
          status: string
          updated_at: string
          workflow_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          current_level?: number
          division_id?: string | null
          entity_data: Json
          entity_id: string
          entity_type: string
          id?: string
          request_reason?: string | null
          requested_amount?: number | null
          requested_by: string
          status?: string
          updated_at?: string
          workflow_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          current_level?: number
          division_id?: string | null
          entity_data?: Json
          entity_id?: string
          entity_type?: string
          id?: string
          request_reason?: string | null
          requested_amount?: number | null
          requested_by?: string
          status?: string
          updated_at?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "approval_requests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "vyaapari_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_requests_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "vyaapari_divisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_requests_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "approval_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      approval_workflows: {
        Row: {
          amount_threshold: number | null
          approval_levels: Json
          company_id: string
          created_at: string
          created_by: string
          division_id: string | null
          entity_type: string
          id: string
          is_active: boolean
          updated_at: string
          workflow_name: string
        }
        Insert: {
          amount_threshold?: number | null
          approval_levels: Json
          company_id: string
          created_at?: string
          created_by: string
          division_id?: string | null
          entity_type: string
          id?: string
          is_active?: boolean
          updated_at?: string
          workflow_name: string
        }
        Update: {
          amount_threshold?: number | null
          approval_levels?: Json
          company_id?: string
          created_at?: string
          created_by?: string
          division_id?: string | null
          entity_type?: string
          id?: string
          is_active?: boolean
          updated_at?: string
          workflow_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "approval_workflows_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "vyaapari_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_workflows_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "vyaapari_divisions"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_entries: {
        Row: {
          amount: number
          budget_name: string
          category: string | null
          company_id: string
          created_at: string
          division_id: string | null
          id: string
          period_end: string
          period_start: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          budget_name: string
          category?: string | null
          company_id: string
          created_at?: string
          division_id?: string | null
          id?: string
          period_end: string
          period_start: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          budget_name?: string
          category?: string | null
          company_id?: string
          created_at?: string
          division_id?: string | null
          id?: string
          period_end?: string
          period_start?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_entries_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "vyaapari_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_entries_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "vyaapari_divisions"
            referencedColumns: ["id"]
          },
        ]
      }
      cash_flow_entries: {
        Row: {
          amount: number
          category: string | null
          company_id: string
          created_at: string
          division_id: string | null
          entry_date: string
          entry_name: string
          entry_type: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          category?: string | null
          company_id: string
          created_at?: string
          division_id?: string | null
          entry_date: string
          entry_name: string
          entry_type: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string | null
          company_id?: string
          created_at?: string
          division_id?: string | null
          entry_date?: string
          entry_name?: string
          entry_type?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cash_flow_entries_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "vyaapari_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_flow_entries_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "vyaapari_divisions"
            referencedColumns: ["id"]
          },
        ]
      }
      chart_of_accounts: {
        Row: {
          account_code: string
          account_name: string
          account_type: string
          company_id: string
          created_at: string
          current_balance: number
          division_id: string | null
          id: string
          is_active: boolean
          opening_balance: number | null
          parent_account_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_code: string
          account_name: string
          account_type: string
          company_id: string
          created_at?: string
          current_balance?: number
          division_id?: string | null
          id?: string
          is_active?: boolean
          opening_balance?: number | null
          parent_account_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_code?: string
          account_name?: string
          account_type?: string
          company_id?: string
          created_at?: string
          current_balance?: number
          division_id?: string | null
          id?: string
          is_active?: boolean
          opening_balance?: number | null
          parent_account_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chart_of_accounts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "vyaapari_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chart_of_accounts_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "vyaapari_divisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chart_of_accounts_parent_account_id_fkey"
            columns: ["parent_account_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      currencies: {
        Row: {
          company_id: string
          created_at: string
          currency_code: string
          currency_name: string
          currency_symbol: string
          exchange_rate: number
          id: string
          is_active: boolean
          is_base_currency: boolean
          last_updated: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          currency_code: string
          currency_name: string
          currency_symbol: string
          exchange_rate?: number
          id?: string
          is_active?: boolean
          is_base_currency?: boolean
          last_updated?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          currency_code?: string
          currency_name?: string
          currency_symbol?: string
          exchange_rate?: number
          id?: string
          is_active?: boolean
          is_base_currency?: boolean
          last_updated?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "currencies_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "vyaapari_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      demo_products: {
        Row: {
          category: string | null
          company_id: string | null
          created_at: string
          description: string | null
          division_id: string | null
          id: string
          name: string
          price: number | null
          stock_quantity: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          company_id?: string | null
          created_at?: string
          description?: string | null
          division_id?: string | null
          id?: string
          name: string
          price?: number | null
          stock_quantity?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          company_id?: string | null
          created_at?: string
          description?: string | null
          division_id?: string | null
          id?: string
          name?: string
          price?: number | null
          stock_quantity?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "demo_products_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "vyaapari_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "demo_products_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "vyaapari_divisions"
            referencedColumns: ["id"]
          },
        ]
      }
      import_files: {
        Row: {
          created_at: string
          error_message: string | null
          file_size: number | null
          file_type: string | null
          filename: string
          id: string
          session_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          file_size?: number | null
          file_type?: string | null
          filename: string
          id?: string
          session_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          file_size?: number | null
          file_type?: string | null
          filename?: string
          id?: string
          session_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "import_files_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "import_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      import_sessions: {
        Row: {
          company_id: string | null
          created_at: string
          id: string
          session_name: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          id?: string
          session_name: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          id?: string
          session_name?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "import_sessions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "vyaapari_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      import_sheets: {
        Row: {
          created_at: string
          data: Json | null
          file_id: string
          id: string
          processed_rows: number | null
          row_count: number | null
          sheet_name: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          file_id: string
          id?: string
          processed_rows?: number | null
          row_count?: number | null
          sheet_name: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          file_id?: string
          id?: string
          processed_rows?: number | null
          row_count?: number | null
          sheet_name?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "import_sheets_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "import_files"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_entries: {
        Row: {
          company_id: string
          created_at: string
          description: string | null
          division_id: string | null
          entry_date: string
          id: string
          reference: string | null
          total_credit: number
          total_debit: number
          updated_at: string
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          description?: string | null
          division_id?: string | null
          entry_date: string
          id?: string
          reference?: string | null
          total_credit?: number
          total_debit?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          description?: string | null
          division_id?: string | null
          entry_date?: string
          id?: string
          reference?: string | null
          total_credit?: number
          total_debit?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_entries_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "vyaapari_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_entries_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "vyaapari_divisions"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_entry_lines: {
        Row: {
          account_id: string
          created_at: string
          credit_amount: number
          debit_amount: number
          description: string | null
          id: string
          journal_entry_id: string
        }
        Insert: {
          account_id: string
          created_at?: string
          credit_amount?: number
          debit_amount?: number
          description?: string | null
          id?: string
          journal_entry_id: string
        }
        Update: {
          account_id?: string
          created_at?: string
          credit_amount?: number
          debit_amount?: number
          description?: string | null
          id?: string
          journal_entry_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_entry_lines_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_entry_lines_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company_id: string | null
          created_at: string
          division_id: string | null
          email: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          division_id?: string | null
          email: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          division_id?: string | null
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "vyaapari_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "vyaapari_divisions"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_invoices: {
        Row: {
          company_id: string
          created_at: string
          division_id: string | null
          id: string
          invoice_date: string
          invoice_number: string
          supplier_name: string
          tax_amount: number
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          division_id?: string | null
          id?: string
          invoice_date: string
          invoice_number: string
          supplier_name: string
          tax_amount?: number
          total_amount?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          division_id?: string | null
          id?: string
          invoice_date?: string
          invoice_number?: string
          supplier_name?: string
          tax_amount?: number
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_invoices_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "vyaapari_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_invoices_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "vyaapari_divisions"
            referencedColumns: ["id"]
          },
        ]
      }
      recurring_transactions: {
        Row: {
          company_id: string
          created_at: string
          created_by: string
          division_id: string | null
          end_date: string | null
          frequency: string
          frequency_interval: number
          id: string
          is_active: boolean
          last_generated: string | null
          next_run_date: string | null
          start_date: string | null
          template_data: Json
          template_name: string
          transaction_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by: string
          division_id?: string | null
          end_date?: string | null
          frequency: string
          frequency_interval?: number
          id?: string
          is_active?: boolean
          last_generated?: string | null
          next_run_date?: string | null
          start_date?: string | null
          template_data: Json
          template_name: string
          transaction_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string
          division_id?: string | null
          end_date?: string | null
          frequency?: string
          frequency_interval?: number
          id?: string
          is_active?: boolean
          last_generated?: string | null
          next_run_date?: string | null
          start_date?: string | null
          template_data?: Json
          template_name?: string
          transaction_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurring_transactions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "vyaapari_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_transactions_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "vyaapari_divisions"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          company_id: string
          created_at: string
          division_id: string | null
          id: string
          report_data: Json | null
          report_name: string
          report_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          division_id?: string | null
          id?: string
          report_data?: Json | null
          report_name: string
          report_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          division_id?: string | null
          id?: string
          report_data?: Json | null
          report_name?: string
          report_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "vyaapari_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "vyaapari_divisions"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_invoices: {
        Row: {
          company_id: string
          created_at: string
          customer_name: string
          division_id: string | null
          id: string
          invoice_date: string
          invoice_number: string
          tax_amount: number
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          customer_name: string
          division_id?: string | null
          id?: string
          invoice_date: string
          invoice_number: string
          tax_amount?: number
          total_amount?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          customer_name?: string
          division_id?: string | null
          id?: string
          invoice_date?: string
          invoice_number?: string
          tax_amount?: number
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_invoices_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "vyaapari_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_invoices_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "vyaapari_divisions"
            referencedColumns: ["id"]
          },
        ]
      }
      tally_groups: {
        Row: {
          company_id: string
          created_at: string
          division_id: string | null
          group_name: string
          group_type: string
          id: string
          parent_group: string | null
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          division_id?: string | null
          group_name: string
          group_type: string
          id?: string
          parent_group?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          division_id?: string | null
          group_name?: string
          group_type?: string
          id?: string
          parent_group?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tally_groups_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "vyaapari_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tally_groups_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "vyaapari_divisions"
            referencedColumns: ["id"]
          },
        ]
      }
      tally_ledgers: {
        Row: {
          company_id: string
          created_at: string
          division_id: string | null
          group_name: string | null
          id: string
          ledger_name: string
          ledger_type: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          division_id?: string | null
          group_name?: string | null
          id?: string
          ledger_name: string
          ledger_type: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          division_id?: string | null
          group_name?: string | null
          id?: string
          ledger_name?: string
          ledger_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tally_ledgers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "vyaapari_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tally_ledgers_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "vyaapari_divisions"
            referencedColumns: ["id"]
          },
        ]
      }
      tally_sync_jobs: {
        Row: {
          completed_at: string | null
          config: Json
          created_at: string
          division_id: string
          errors: Json | null
          id: string
          processed_records: number
          progress: number
          started_at: string | null
          status: string
          sync_type: string
          total_records: number
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          config?: Json
          created_at?: string
          division_id: string
          errors?: Json | null
          id?: string
          processed_records?: number
          progress?: number
          started_at?: string | null
          status?: string
          sync_type: string
          total_records?: number
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          config?: Json
          created_at?: string
          division_id?: string
          errors?: Json | null
          id?: string
          processed_records?: number
          progress?: number
          started_at?: string | null
          status?: string
          sync_type?: string
          total_records?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tally_sync_jobs_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "vyaapari_divisions"
            referencedColumns: ["id"]
          },
        ]
      }
      tally_sync_memory_logs: {
        Row: {
          batch_number: number | null
          id: string
          job_id: string
          memory_available_mb: number
          memory_peak_mb: number
          memory_used_mb: number
          timestamp: string
        }
        Insert: {
          batch_number?: number | null
          id?: string
          job_id: string
          memory_available_mb: number
          memory_peak_mb: number
          memory_used_mb: number
          timestamp?: string
        }
        Update: {
          batch_number?: number | null
          id?: string
          job_id?: string
          memory_available_mb?: number
          memory_peak_mb?: number
          memory_used_mb?: number
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "tally_sync_memory_logs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "sync_job_dashboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tally_sync_memory_logs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "tally_sync_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      tally_sync_progress: {
        Row: {
          batch_number: number
          batch_size: number
          created_at: string
          error_count: number
          errors: Json | null
          id: string
          job_id: string
          memory_usage_mb: number | null
          processed_count: number
          processing_time_ms: number | null
          status: string
          updated_at: string
        }
        Insert: {
          batch_number: number
          batch_size: number
          created_at?: string
          error_count?: number
          errors?: Json | null
          id?: string
          job_id: string
          memory_usage_mb?: number | null
          processed_count?: number
          processing_time_ms?: number | null
          status: string
          updated_at?: string
        }
        Update: {
          batch_number?: number
          batch_size?: number
          created_at?: string
          error_count?: number
          errors?: Json | null
          id?: string
          job_id?: string
          memory_usage_mb?: number | null
          processed_count?: number
          processing_time_ms?: number | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tally_sync_progress_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "sync_job_dashboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tally_sync_progress_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "tally_sync_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      tally_xml_imports: {
        Row: {
          company_id: string | null
          completed_at: string | null
          created_at: string
          division_id: string | null
          error_message: string | null
          file_name: string
          file_size: number | null
          import_id: string
          import_type: string
          processed_records: number | null
          started_at: string | null
          status: string
          total_records: number
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          completed_at?: string | null
          created_at?: string
          division_id?: string | null
          error_message?: string | null
          file_name: string
          file_size?: number | null
          import_id?: string
          import_type: string
          processed_records?: number | null
          started_at?: string | null
          status?: string
          total_records?: number
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          completed_at?: string | null
          created_at?: string
          division_id?: string | null
          error_message?: string | null
          file_name?: string
          file_size?: number | null
          import_id?: string
          import_type?: string
          processed_records?: number | null
          started_at?: string | null
          status?: string
          total_records?: number
          updated_at?: string
        }
        Relationships: []
      }
      ui_fields: {
        Row: {
          created_at: string
          field_label: string
          field_name: string
          field_type: string
          id: string
          is_required: boolean
          is_visible: boolean
          module_id: string
          sort_order: number | null
          updated_at: string
          user_id: string
          validation_rules: Json | null
        }
        Insert: {
          created_at?: string
          field_label: string
          field_name: string
          field_type?: string
          id?: string
          is_required?: boolean
          is_visible?: boolean
          module_id: string
          sort_order?: number | null
          updated_at?: string
          user_id: string
          validation_rules?: Json | null
        }
        Update: {
          created_at?: string
          field_label?: string
          field_name?: string
          field_type?: string
          id?: string
          is_required?: boolean
          is_visible?: boolean
          module_id?: string
          sort_order?: number | null
          updated_at?: string
          user_id?: string
          validation_rules?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "ui_fields_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "ui_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      ui_modules: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          is_active: boolean
          name: string
          path: string
          sort_order: number | null
          table_name: string | null
          title: string
          updated_at: string
          user_id: string
          view_type: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          path: string
          sort_order?: number | null
          table_name?: string | null
          title: string
          updated_at?: string
          user_id: string
          view_type?: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          path?: string
          sort_order?: number | null
          table_name?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          view_type?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          company_id: string | null
          created_at: string
          division_id: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          division_id?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          division_id?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "vyaapari_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "vyaapari_divisions"
            referencedColumns: ["id"]
          },
        ]
      }
      vyaapari_companies: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          domain: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          domain?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          domain?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      vyaapari_divisions: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          parent_division_id: string | null
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          parent_division_id?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          parent_division_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vyaapari_divisions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "vyaapari_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vyaapari_divisions_parent_division_id_fkey"
            columns: ["parent_division_id"]
            isOneToOne: false
            referencedRelation: "vyaapari_divisions"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_users: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          id: string
          role: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          role?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          role?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_users_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          description: string | null
          division_id: string | null
          id: string
          is_default: boolean
          name: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          division_id?: string | null
          id?: string
          is_default?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          division_id?: string | null
          id?: string
          is_default?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspaces_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "vyaapari_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspaces_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "vyaapari_divisions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      sync_job_dashboard: {
        Row: {
          avg_memory_usage: number | null
          avg_processing_time_ms: number | null
          company_name: string | null
          completed_at: string | null
          created_at: string | null
          division_id: string | null
          division_name: string | null
          error_count: number | null
          estimated_completion: string | null
          id: string | null
          processed_records: number | null
          progress: number | null
          started_at: string | null
          status: string | null
          sync_type: string | null
          total_records: number | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tally_sync_jobs_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "vyaapari_divisions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      cleanup_old_sync_jobs: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      fetch_erp_document_detail: {
        Args: { p_id: number }
        Returns: {
          address_lines: Json
          company_id: string
          date: string
          division_id: string
          id: number
          item_lines: Json
          ledger_lines: Json
          party_name: string
          reference: string
          total_credit: number
          total_debit: number
          total_item_amount: number
          vchtype: string
          vouchernumber: string
        }[]
      }
      fetch_master_rows: {
        Args: {
          p_company_id: string
          p_division_id: string
          p_limit?: number
          p_master_type: string
          p_search?: string
          p_table_name?: string
        }
        Returns: Json
      }
      get_sync_job_stats: {
        Args: { p_job_id: string }
        Returns: {
          avg_memory_usage: number
          avg_processing_time_ms: number
          error_count: number
          estimated_completion: string
          job_id: string
          processed_records: number
          progress: number
          status: string
          total_records: number
        }[]
      }
      get_table_data: {
        Args: { table_name: string }
        Returns: Json
      }
      get_user_role_info: {
        Args: { _user_id: string }
        Returns: {
          company_id: string
          company_name: string
          division_id: string
          division_name: string
          role: Database["public"]["Enums"]["app_role"]
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      log_sync_memory_usage: {
        Args: {
          p_batch_number?: number
          p_job_id: string
          p_memory_available_mb: number
          p_memory_peak_mb: number
          p_memory_used_mb: number
        }
        Returns: undefined
      }
      pause_jobs_approaching_timeout: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      resolve_sync_target: {
        Args: { p_company_id: string; p_division_id: string }
        Returns: {
          active_system: string
          config_source: string
          extras: Json
          rollout_active: boolean
          shadow_mode: boolean
          tally_url: string
        }[]
      }
      resume_paused_jobs: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      update_sync_job_progress: {
        Args: { p_errors?: Json; p_job_id: string; p_processed_records: number }
        Returns: undefined
      }
      validate_voucher_data: {
        Args: { p_data: Json; p_header?: Json; p_ledger_lines?: Json }
        Returns: Json
      }
    }
    Enums: {
      app_role: "user" | "administrator" | "super_admin"
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
      app_role: ["user", "administrator", "super_admin"],
    },
  },
} as const
