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
      companies: {
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
      config: {
        Row: {
          name: string
          value: string | null
        }
        Insert: {
          name: string
          value?: string | null
        }
        Update: {
          name?: string
          value?: string | null
        }
        Relationships: []
      }
      divisions: {
        Row: {
          budget: number | null
          company_id: string
          created_at: string
          created_by: string | null
          description: string | null
          employee_count: number | null
          id: string
          is_active: boolean
          manager_name: string | null
          name: string
          parent_division_id: string | null
          performance_score: number | null
          status: string | null
          tally_company_id: string | null
          tally_enabled: boolean | null
          tally_url: string | null
          updated_at: string
        }
        Insert: {
          budget?: number | null
          company_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          employee_count?: number | null
          id?: string
          is_active?: boolean
          manager_name?: string | null
          name: string
          parent_division_id?: string | null
          performance_score?: number | null
          status?: string | null
          tally_company_id?: string | null
          tally_enabled?: boolean | null
          tally_url?: string | null
          updated_at?: string
        }
        Update: {
          budget?: number | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          employee_count?: number | null
          id?: string
          is_active?: boolean
          manager_name?: string | null
          name?: string
          parent_division_id?: string | null
          performance_score?: number | null
          status?: string | null
          tally_company_id?: string | null
          tally_enabled?: boolean | null
          tally_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "divisions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "divisions_parent_division_id_fkey"
            columns: ["parent_division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_divisions_company_id"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      drive_items: {
        Row: {
          created_at: string
          created_by: string
          file_type: string | null
          id: string
          name: string
          parent_path: string | null
          path: string
          size: number | null
          storage_path: string | null
          type: Database["public"]["Enums"]["drive_item_type"]
          updated_at: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          created_by: string
          file_type?: string | null
          id?: string
          name: string
          parent_path?: string | null
          path: string
          size?: number | null
          storage_path?: string | null
          type: Database["public"]["Enums"]["drive_item_type"]
          updated_at?: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          created_by?: string
          file_type?: string | null
          id?: string
          name?: string
          parent_path?: string | null
          path?: string
          size?: number | null
          storage_path?: string | null
          type?: Database["public"]["Enums"]["drive_item_type"]
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "drive_items_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          avatar_url: string | null
          content: string
          created_at: string
          id: string
          user_id: string
          user_name: string
          workspace_id: string
        }
        Insert: {
          avatar_url?: string | null
          content: string
          created_at?: string
          id?: string
          user_id: string
          user_name: string
          workspace_id: string
        }
        Update: {
          avatar_url?: string | null
          content?: string
          created_at?: string
          id?: string
          user_id?: string
          user_name?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      mst_attendance_type: {
        Row: {
          _parent: string
          _uom: string
          attendance_period: string
          attendance_type: string
          company_id: string | null
          division_id: string | null
          guid: string
          name: string
          parent: string
          uom: string
        }
        Insert: {
          _parent?: string
          _uom?: string
          attendance_period?: string
          attendance_type?: string
          company_id?: string | null
          division_id?: string | null
          guid: string
          name?: string
          parent?: string
          uom?: string
        }
        Update: {
          _parent?: string
          _uom?: string
          attendance_period?: string
          attendance_type?: string
          company_id?: string | null
          division_id?: string | null
          guid?: string
          name?: string
          parent?: string
          uom?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_mst_attendance_type_company"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_mst_attendance_type_company_id"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_mst_attendance_type_division"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_mst_attendance_type_division_id"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
        ]
      }
      mst_company: {
        Row: {
          company_id: string
          company_name: string
          created_at: string | null
          updated_at: string | null
          vyaapari_company_id: string | null
          vyaapari_division_id: string | null
        }
        Insert: {
          company_id: string
          company_name: string
          created_at?: string | null
          updated_at?: string | null
          vyaapari_company_id?: string | null
          vyaapari_division_id?: string | null
        }
        Update: {
          company_id?: string
          company_name?: string
          created_at?: string | null
          updated_at?: string | null
          vyaapari_company_id?: string | null
          vyaapari_division_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_mst_company_vyaapari_company"
            columns: ["vyaapari_company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_mst_company_vyaapari_division"
            columns: ["vyaapari_division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
        ]
      }
      mst_cost_category: {
        Row: {
          allocate_non_revenue: number | null
          allocate_revenue: number | null
          company_id: string | null
          division_id: string | null
          guid: string
          name: string
        }
        Insert: {
          allocate_non_revenue?: number | null
          allocate_revenue?: number | null
          company_id?: string | null
          division_id?: string | null
          guid: string
          name?: string
        }
        Update: {
          allocate_non_revenue?: number | null
          allocate_revenue?: number | null
          company_id?: string | null
          division_id?: string | null
          guid?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_mst_cost_category_company"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_mst_cost_category_company_id"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_mst_cost_category_division"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_mst_cost_category_division_id"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
        ]
      }
      mst_cost_centre: {
        Row: {
          _parent: string
          category: string
          company_id: string | null
          division_id: string | null
          guid: string
          name: string
          parent: string
        }
        Insert: {
          _parent?: string
          category?: string
          company_id?: string | null
          division_id?: string | null
          guid: string
          name?: string
          parent?: string
        }
        Update: {
          _parent?: string
          category?: string
          company_id?: string | null
          division_id?: string | null
          guid?: string
          name?: string
          parent?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_mst_cost_centre_company"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_mst_cost_centre_company_id"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_mst_cost_centre_division"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_mst_cost_centre_division_id"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
        ]
      }
      mst_division: {
        Row: {
          company_id: string
          created_at: string | null
          division_id: string
          division_name: string
          tally_url: string
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          division_id: string
          division_name: string
          tally_url: string
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          division_id?: string
          division_name?: string
          tally_url?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mst_division_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "mst_company"
            referencedColumns: ["company_id"]
          },
        ]
      }
      mst_employee: {
        Row: {
          _parent: string
          aadhar: string
          address: string
          blood_group: string
          company_id: string | null
          date_of_birth: string | null
          date_of_joining: string | null
          date_of_release: string | null
          designation: string
          division_id: string | null
          email: string
          father_mother_name: string
          function_role: string
          gender: string
          guid: string
          id_number: string
          location: string
          mobile: string
          name: string
          pan: string
          parent: string
          pf_joining_date: string | null
          pf_number: string
          pf_relieving_date: string | null
          pr_account_number: string
          spouse_name: string
          uan: string
        }
        Insert: {
          _parent?: string
          aadhar?: string
          address?: string
          blood_group?: string
          company_id?: string | null
          date_of_birth?: string | null
          date_of_joining?: string | null
          date_of_release?: string | null
          designation?: string
          division_id?: string | null
          email?: string
          father_mother_name?: string
          function_role?: string
          gender?: string
          guid: string
          id_number?: string
          location?: string
          mobile?: string
          name?: string
          pan?: string
          parent?: string
          pf_joining_date?: string | null
          pf_number?: string
          pf_relieving_date?: string | null
          pr_account_number?: string
          spouse_name?: string
          uan?: string
        }
        Update: {
          _parent?: string
          aadhar?: string
          address?: string
          blood_group?: string
          company_id?: string | null
          date_of_birth?: string | null
          date_of_joining?: string | null
          date_of_release?: string | null
          designation?: string
          division_id?: string | null
          email?: string
          father_mother_name?: string
          function_role?: string
          gender?: string
          guid?: string
          id_number?: string
          location?: string
          mobile?: string
          name?: string
          pan?: string
          parent?: string
          pf_joining_date?: string | null
          pf_number?: string
          pf_relieving_date?: string | null
          pr_account_number?: string
          spouse_name?: string
          uan?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_mst_employee_company"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_mst_employee_company_id"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_mst_employee_division"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_mst_employee_division_id"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
        ]
      }
      mst_godown: {
        Row: {
          _parent: string
          address: string
          capacity: number | null
          capacity_unit: string | null
          company_id: string | null
          contact_number: string | null
          division_id: string | null
          godown_type: string | null
          guid: string
          location_code: string | null
          manager_name: string | null
          name: string
          parent: string
          storage_type: string | null
        }
        Insert: {
          _parent?: string
          address?: string
          capacity?: number | null
          capacity_unit?: string | null
          company_id?: string | null
          contact_number?: string | null
          division_id?: string | null
          godown_type?: string | null
          guid: string
          location_code?: string | null
          manager_name?: string | null
          name?: string
          parent?: string
          storage_type?: string | null
        }
        Update: {
          _parent?: string
          address?: string
          capacity?: number | null
          capacity_unit?: string | null
          company_id?: string | null
          contact_number?: string | null
          division_id?: string | null
          godown_type?: string | null
          guid?: string
          location_code?: string | null
          manager_name?: string | null
          name?: string
          parent?: string
          storage_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_mst_godown_company"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_mst_godown_company_id"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_mst_godown_division"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_mst_godown_division_id"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
        ]
      }
      mst_group: {
        Row: {
          _parent: string
          affects_gross_profit: number | null
          company_id: string | null
          division_id: string | null
          guid: string
          id: number
          is_deemedpositive: number | null
          is_reserved: number | null
          is_revenue: number | null
          name: string
          parent: string
          primary_group: string
          sort_position: number | null
        }
        Insert: {
          _parent?: string
          affects_gross_profit?: number | null
          company_id?: string | null
          division_id?: string | null
          guid: string
          id?: never
          is_deemedpositive?: number | null
          is_reserved?: number | null
          is_revenue?: number | null
          name?: string
          parent?: string
          primary_group?: string
          sort_position?: number | null
        }
        Update: {
          _parent?: string
          affects_gross_profit?: number | null
          company_id?: string | null
          division_id?: string | null
          guid?: string
          id?: never
          is_deemedpositive?: number | null
          is_reserved?: number | null
          is_revenue?: number | null
          name?: string
          parent?: string
          primary_group?: string
          sort_position?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_mst_group_company"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_mst_group_company_id"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_mst_group_division"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_mst_group_division_id"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
        ]
      }
      mst_gst_effective_rate: {
        Row: {
          _item: string
          applicable_from: string | null
          company_id: string | null
          division_id: string | null
          hsn_code: string
          hsn_description: string
          is_rcm_applicable: number | null
          item: string
          nature_of_goods: string
          nature_of_transaction: string
          rate: number | null
          supply_type: string
          taxability: string
        }
        Insert: {
          _item?: string
          applicable_from?: string | null
          company_id?: string | null
          division_id?: string | null
          hsn_code?: string
          hsn_description?: string
          is_rcm_applicable?: number | null
          item?: string
          nature_of_goods?: string
          nature_of_transaction?: string
          rate?: number | null
          supply_type?: string
          taxability?: string
        }
        Update: {
          _item?: string
          applicable_from?: string | null
          company_id?: string | null
          division_id?: string | null
          hsn_code?: string
          hsn_description?: string
          is_rcm_applicable?: number | null
          item?: string
          nature_of_goods?: string
          nature_of_transaction?: string
          rate?: number | null
          supply_type?: string
          taxability?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_mst_gst_effective_rate_company"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_mst_gst_effective_rate_company_id"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_mst_gst_effective_rate_division"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_mst_gst_effective_rate_division_id"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
        ]
      }
      mst_ledger: {
        Row: {
          _parent: string
          alias: string
          bank_account_holder: string
          bank_account_number: string
          bank_branch: string
          bank_ifsc: string
          bank_name: string
          bank_swift: string
          bill_credit_period: number
          buyer_category: string | null
          buyer_type: string | null
          closing_balance: number | null
          company_id: string | null
          credit_days: number | null
          credit_limit: number | null
          description: string
          division_id: string | null
          email: string
          excise_registration_number: string | null
          gst_duty_head: string
          gst_registration_type: string
          gst_supply_type: string
          gstn: string
          guid: string
          id: number
          income_tax_number: string | null
          is_deemedpositive: number | null
          is_revenue: number | null
          it_pan: string
          ledger_contact: string | null
          ledger_fax: string | null
          ledger_mobile: string | null
          ledger_website: string | null
          mailing_address: string
          mailing_country: string
          mailing_name: string
          mailing_pincode: string
          mailing_state: string
          name: string
          notes: string
          opening_balance: number | null
          parent: string
          sales_tax_number: string | null
          service_tax_number: string | null
          tax_rate: number | null
        }
        Insert: {
          _parent?: string
          alias?: string
          bank_account_holder?: string
          bank_account_number?: string
          bank_branch?: string
          bank_ifsc?: string
          bank_name?: string
          bank_swift?: string
          bill_credit_period?: number
          buyer_category?: string | null
          buyer_type?: string | null
          closing_balance?: number | null
          company_id?: string | null
          credit_days?: number | null
          credit_limit?: number | null
          description?: string
          division_id?: string | null
          email?: string
          excise_registration_number?: string | null
          gst_duty_head?: string
          gst_registration_type?: string
          gst_supply_type?: string
          gstn?: string
          guid: string
          id?: never
          income_tax_number?: string | null
          is_deemedpositive?: number | null
          is_revenue?: number | null
          it_pan?: string
          ledger_contact?: string | null
          ledger_fax?: string | null
          ledger_mobile?: string | null
          ledger_website?: string | null
          mailing_address?: string
          mailing_country?: string
          mailing_name?: string
          mailing_pincode?: string
          mailing_state?: string
          name?: string
          notes?: string
          opening_balance?: number | null
          parent?: string
          sales_tax_number?: string | null
          service_tax_number?: string | null
          tax_rate?: number | null
        }
        Update: {
          _parent?: string
          alias?: string
          bank_account_holder?: string
          bank_account_number?: string
          bank_branch?: string
          bank_ifsc?: string
          bank_name?: string
          bank_swift?: string
          bill_credit_period?: number
          buyer_category?: string | null
          buyer_type?: string | null
          closing_balance?: number | null
          company_id?: string | null
          credit_days?: number | null
          credit_limit?: number | null
          description?: string
          division_id?: string | null
          email?: string
          excise_registration_number?: string | null
          gst_duty_head?: string
          gst_registration_type?: string
          gst_supply_type?: string
          gstn?: string
          guid?: string
          id?: never
          income_tax_number?: string | null
          is_deemedpositive?: number | null
          is_revenue?: number | null
          it_pan?: string
          ledger_contact?: string | null
          ledger_fax?: string | null
          ledger_mobile?: string | null
          ledger_website?: string | null
          mailing_address?: string
          mailing_country?: string
          mailing_name?: string
          mailing_pincode?: string
          mailing_state?: string
          name?: string
          notes?: string
          opening_balance?: number | null
          parent?: string
          sales_tax_number?: string | null
          service_tax_number?: string | null
          tax_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_mst_ledger_company"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_mst_ledger_company_id"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_mst_ledger_division"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_mst_ledger_division_id"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
        ]
      }
      mst_opening_batch_allocation: {
        Row: {
          _godown: string
          _item: string
          company_id: string | null
          division_id: string | null
          godown: string
          item: string
          manufactured_on: string | null
          name: string
          opening_balance: number | null
          opening_rate: number | null
          opening_value: number | null
        }
        Insert: {
          _godown?: string
          _item?: string
          company_id?: string | null
          division_id?: string | null
          godown?: string
          item?: string
          manufactured_on?: string | null
          name?: string
          opening_balance?: number | null
          opening_rate?: number | null
          opening_value?: number | null
        }
        Update: {
          _godown?: string
          _item?: string
          company_id?: string | null
          division_id?: string | null
          godown?: string
          item?: string
          manufactured_on?: string | null
          name?: string
          opening_balance?: number | null
          opening_rate?: number | null
          opening_value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_mst_opening_batch_allocation_company"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_mst_opening_batch_allocation_company_id"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_mst_opening_batch_allocation_division"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_mst_opening_batch_allocation_division_id"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
        ]
      }
      mst_opening_bill_allocation: {
        Row: {
          _ledger: string
          bill_credit_period: number
          bill_date: string | null
          company_id: string | null
          division_id: string | null
          is_advance: number | null
          ledger: string
          name: string
          opening_balance: number | null
        }
        Insert: {
          _ledger?: string
          bill_credit_period?: number
          bill_date?: string | null
          company_id?: string | null
          division_id?: string | null
          is_advance?: number | null
          ledger?: string
          name?: string
          opening_balance?: number | null
        }
        Update: {
          _ledger?: string
          bill_credit_period?: number
          bill_date?: string | null
          company_id?: string | null
          division_id?: string | null
          is_advance?: number | null
          ledger?: string
          name?: string
          opening_balance?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_mst_opening_bill_allocation_company"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_mst_opening_bill_allocation_company_id"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_mst_opening_bill_allocation_division"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_mst_opening_bill_allocation_division_id"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
        ]
      }
      mst_payhead: {
        Row: {
          _parent: string
          calculation_period: string
          calculation_type: string
          company_id: string | null
          division_id: string | null
          guid: string
          income_type: string
          leave_type: string
          name: string
          parent: string
          pay_type: string
          payslip_name: string
        }
        Insert: {
          _parent?: string
          calculation_period?: string
          calculation_type?: string
          company_id?: string | null
          division_id?: string | null
          guid: string
          income_type?: string
          leave_type?: string
          name?: string
          parent?: string
          pay_type?: string
          payslip_name?: string
        }
        Update: {
          _parent?: string
          calculation_period?: string
          calculation_type?: string
          company_id?: string | null
          division_id?: string | null
          guid?: string
          income_type?: string
          leave_type?: string
          name?: string
          parent?: string
          pay_type?: string
          payslip_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_mst_payhead_company"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_mst_payhead_company_id"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_mst_payhead_division"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_mst_payhead_division_id"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
        ]
      }
      mst_stock_group: {
        Row: {
          _parent: string
          company_id: string | null
          division_id: string | null
          guid: string
          name: string
          parent: string
        }
        Insert: {
          _parent?: string
          company_id?: string | null
          division_id?: string | null
          guid: string
          name?: string
          parent?: string
        }
        Update: {
          _parent?: string
          company_id?: string | null
          division_id?: string | null
          guid?: string
          name?: string
          parent?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_mst_stock_group_company"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_mst_stock_group_company_id"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_mst_stock_group_division"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_mst_stock_group_division_id"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
        ]
      }
      mst_stock_item: {
        Row: {
          _alternate_uom: string
          _parent: string
          _uom: string
          alias: string
          alternate_uom: string
          brand: string | null
          closing_balance: number | null
          closing_rate: number | null
          closing_value: number | null
          color: string | null
          company_id: string | null
          conversion: number
          costing_method: string
          description: string
          division_id: string | null
          gst_hsn_code: string | null
          gst_hsn_description: string | null
          gst_rate: number | null
          gst_taxability: string | null
          gst_type_of_supply: string | null
          guid: string
          item_category: string | null
          item_classification: string | null
          manufacturer: string | null
          maximum_level: number | null
          minimum_level: number | null
          model: string | null
          name: string
          notes: string
          opening_balance: number | null
          opening_rate: number | null
          opening_value: number | null
          parent: string
          part_number: string
          reorder_level: number | null
          shelf_life_days: number | null
          size: string | null
          uom: string
          volume: number | null
          volume_unit: string | null
          weight: number | null
          weight_unit: string | null
        }
        Insert: {
          _alternate_uom?: string
          _parent?: string
          _uom?: string
          alias?: string
          alternate_uom?: string
          brand?: string | null
          closing_balance?: number | null
          closing_rate?: number | null
          closing_value?: number | null
          color?: string | null
          company_id?: string | null
          conversion?: number
          costing_method?: string
          description?: string
          division_id?: string | null
          gst_hsn_code?: string | null
          gst_hsn_description?: string | null
          gst_rate?: number | null
          gst_taxability?: string | null
          gst_type_of_supply?: string | null
          guid: string
          item_category?: string | null
          item_classification?: string | null
          manufacturer?: string | null
          maximum_level?: number | null
          minimum_level?: number | null
          model?: string | null
          name?: string
          notes?: string
          opening_balance?: number | null
          opening_rate?: number | null
          opening_value?: number | null
          parent?: string
          part_number?: string
          reorder_level?: number | null
          shelf_life_days?: number | null
          size?: string | null
          uom?: string
          volume?: number | null
          volume_unit?: string | null
          weight?: number | null
          weight_unit?: string | null
        }
        Update: {
          _alternate_uom?: string
          _parent?: string
          _uom?: string
          alias?: string
          alternate_uom?: string
          brand?: string | null
          closing_balance?: number | null
          closing_rate?: number | null
          closing_value?: number | null
          color?: string | null
          company_id?: string | null
          conversion?: number
          costing_method?: string
          description?: string
          division_id?: string | null
          gst_hsn_code?: string | null
          gst_hsn_description?: string | null
          gst_rate?: number | null
          gst_taxability?: string | null
          gst_type_of_supply?: string | null
          guid?: string
          item_category?: string | null
          item_classification?: string | null
          manufacturer?: string | null
          maximum_level?: number | null
          minimum_level?: number | null
          model?: string | null
          name?: string
          notes?: string
          opening_balance?: number | null
          opening_rate?: number | null
          opening_value?: number | null
          parent?: string
          part_number?: string
          reorder_level?: number | null
          shelf_life_days?: number | null
          size?: string | null
          uom?: string
          volume?: number | null
          volume_unit?: string | null
          weight?: number | null
          weight_unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_mst_stock_item_company"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_mst_stock_item_company_id"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_mst_stock_item_division"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_mst_stock_item_division_id"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
        ]
      }
      mst_stockitem_standard_cost: {
        Row: {
          _item: string
          company_id: string | null
          date: string | null
          division_id: string | null
          item: string
          rate: number | null
        }
        Insert: {
          _item?: string
          company_id?: string | null
          date?: string | null
          division_id?: string | null
          item?: string
          rate?: number | null
        }
        Update: {
          _item?: string
          company_id?: string | null
          date?: string | null
          division_id?: string | null
          item?: string
          rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_mst_stockitem_standard_cost_company"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_mst_stockitem_standard_cost_company_id"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_mst_stockitem_standard_cost_division"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_mst_stockitem_standard_cost_division_id"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
        ]
      }
      mst_stockitem_standard_price: {
        Row: {
          _item: string
          company_id: string | null
          date: string | null
          division_id: string | null
          item: string
          rate: number | null
        }
        Insert: {
          _item?: string
          company_id?: string | null
          date?: string | null
          division_id?: string | null
          item?: string
          rate?: number | null
        }
        Update: {
          _item?: string
          company_id?: string | null
          date?: string | null
          division_id?: string | null
          item?: string
          rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_mst_stockitem_standard_price_company"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_mst_stockitem_standard_price_company_id"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_mst_stockitem_standard_price_division"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_mst_stockitem_standard_price_division_id"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
        ]
      }
      mst_uom: {
        Row: {
          additional_units: string
          base_units: string
          company_id: string | null
          conversion: number
          division_id: string | null
          formalname: string
          guid: string
          is_simple_unit: number
          name: string
        }
        Insert: {
          additional_units: string
          base_units: string
          company_id?: string | null
          conversion: number
          division_id?: string | null
          formalname?: string
          guid: string
          is_simple_unit: number
          name?: string
        }
        Update: {
          additional_units?: string
          base_units?: string
          company_id?: string | null
          conversion?: number
          division_id?: string | null
          formalname?: string
          guid?: string
          is_simple_unit?: number
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_mst_uom_company"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_mst_uom_company_id"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_mst_uom_division"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_mst_uom_division_id"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
        ]
      }
      mst_vouchertype: {
        Row: {
          _parent: string
          affects_stock: number | null
          company_id: string | null
          division_id: string | null
          guid: string
          is_deemedpositive: number | null
          name: string
          numbering_method: string
          parent: string
        }
        Insert: {
          _parent?: string
          affects_stock?: number | null
          company_id?: string | null
          division_id?: string | null
          guid: string
          is_deemedpositive?: number | null
          name?: string
          numbering_method?: string
          parent?: string
        }
        Update: {
          _parent?: string
          affects_stock?: number | null
          company_id?: string | null
          division_id?: string | null
          guid?: string
          is_deemedpositive?: number | null
          name?: string
          numbering_method?: string
          parent?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_mst_vouchertype_company"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_mst_vouchertype_company_id"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_mst_vouchertype_division"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_mst_vouchertype_division_id"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
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
          avatar_url?: string | null
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
          avatar_url?: string | null
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
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
        ]
      }
      tally_mst_group: {
        Row: {
          _parent: string
          affects_gross_profit: number | null
          company_id: string | null
          created_at: string | null
          division_id: string | null
          guid: string
          is_deemedpositive: number | null
          is_reserved: number | null
          is_revenue: number | null
          name: string
          parent: string
          primary_group: string
          sort_position: number | null
        }
        Insert: {
          _parent?: string
          affects_gross_profit?: number | null
          company_id?: string | null
          created_at?: string | null
          division_id?: string | null
          guid: string
          is_deemedpositive?: number | null
          is_reserved?: number | null
          is_revenue?: number | null
          name?: string
          parent?: string
          primary_group?: string
          sort_position?: number | null
        }
        Update: {
          _parent?: string
          affects_gross_profit?: number | null
          company_id?: string | null
          created_at?: string | null
          division_id?: string | null
          guid?: string
          is_deemedpositive?: number | null
          is_reserved?: number | null
          is_revenue?: number | null
          name?: string
          parent?: string
          primary_group?: string
          sort_position?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_tally_mst_group_company"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tally_mst_group_company_id"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tally_mst_group_division"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tally_mst_group_division_id"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
        ]
      }
      tally_mst_ledger: {
        Row: {
          closing_balance: number | null
          company_id: string | null
          created_at: string | null
          division_id: string | null
          guid: string
          name: string
          opening_balance: number | null
          parent: string
        }
        Insert: {
          closing_balance?: number | null
          company_id?: string | null
          created_at?: string | null
          division_id?: string | null
          guid: string
          name: string
          opening_balance?: number | null
          parent?: string
        }
        Update: {
          closing_balance?: number | null
          company_id?: string | null
          created_at?: string | null
          division_id?: string | null
          guid?: string
          name?: string
          opening_balance?: number | null
          parent?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_tally_mst_ledger_company"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tally_mst_ledger_company_id"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tally_mst_ledger_division"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tally_mst_ledger_division_id"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
        ]
      }
      tally_mst_stock_item: {
        Row: {
          company_id: string | null
          created_at: string | null
          division_id: string | null
          guid: string
          name: string
          parent: string
          unit: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          division_id?: string | null
          guid: string
          name: string
          parent?: string
          unit?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          division_id?: string | null
          guid?: string
          name?: string
          parent?: string
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_tally_mst_stock_item_company"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tally_mst_stock_item_company_id"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tally_mst_stock_item_division"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tally_mst_stock_item_division_id"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
        ]
      }
      tally_trn_voucher: {
        Row: {
          altered_by: string | null
          altered_on: string | null
          basic_amount: number | null
          company_id: string | null
          consignment_note: string | null
          created_at: string | null
          currency: string | null
          date: string | null
          discount_amount: number | null
          division_id: string | null
          due_date: string | null
          exchange_rate: number | null
          final_amount: number | null
          guid: string
          is_cancelled: number | null
          is_optional: number | null
          narration: string | null
          net_amount: number | null
          order_reference: string | null
          party_ledger_name: string | null
          persistedview: number | null
          receipt_reference: string | null
          reference: string | null
          tax_amount: number | null
          total_amount: number | null
          voucher_number: string | null
          voucher_number_prefix: string | null
          voucher_number_suffix: string | null
          voucher_type: string | null
        }
        Insert: {
          altered_by?: string | null
          altered_on?: string | null
          basic_amount?: number | null
          company_id?: string | null
          consignment_note?: string | null
          created_at?: string | null
          currency?: string | null
          date?: string | null
          discount_amount?: number | null
          division_id?: string | null
          due_date?: string | null
          exchange_rate?: number | null
          final_amount?: number | null
          guid: string
          is_cancelled?: number | null
          is_optional?: number | null
          narration?: string | null
          net_amount?: number | null
          order_reference?: string | null
          party_ledger_name?: string | null
          persistedview?: number | null
          receipt_reference?: string | null
          reference?: string | null
          tax_amount?: number | null
          total_amount?: number | null
          voucher_number?: string | null
          voucher_number_prefix?: string | null
          voucher_number_suffix?: string | null
          voucher_type?: string | null
        }
        Update: {
          altered_by?: string | null
          altered_on?: string | null
          basic_amount?: number | null
          company_id?: string | null
          consignment_note?: string | null
          created_at?: string | null
          currency?: string | null
          date?: string | null
          discount_amount?: number | null
          division_id?: string | null
          due_date?: string | null
          exchange_rate?: number | null
          final_amount?: number | null
          guid?: string
          is_cancelled?: number | null
          is_optional?: number | null
          narration?: string | null
          net_amount?: number | null
          order_reference?: string | null
          party_ledger_name?: string | null
          persistedview?: number | null
          receipt_reference?: string | null
          reference?: string | null
          tax_amount?: number | null
          total_amount?: number | null
          voucher_number?: string | null
          voucher_number_prefix?: string | null
          voucher_number_suffix?: string | null
          voucher_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_tally_trn_voucher_company"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tally_trn_voucher_company_id"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tally_trn_voucher_division"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tally_trn_voucher_division_id"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assignee_avatar: string | null
          assignee_id: string | null
          assignee_name: string | null
          created_at: string
          created_by: string
          description: string | null
          due_date: string | null
          id: string
          priority: Database["public"]["Enums"]["task_priority"]
          status: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          assignee_avatar?: string | null
          assignee_id?: string | null
          assignee_name?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["task_priority"]
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          assignee_avatar?: string | null
          assignee_id?: string | null
          assignee_name?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["task_priority"]
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      trn_accounting: {
        Row: {
          _ledger: string
          amount: number
          amount_cleared: number | null
          amount_forex: number
          bill_allocations: string | null
          company_id: string | null
          cost_category: string | null
          cost_centre: string | null
          currency: string
          division_id: string | null
          guid: string
          is_deemed_positive: number | null
          is_party_ledger: number | null
          ledger: string
          voucher_date: string | null
          voucher_guid: string | null
          voucher_number: string | null
          voucher_type: string | null
        }
        Insert: {
          _ledger?: string
          amount?: number
          amount_cleared?: number | null
          amount_forex?: number
          bill_allocations?: string | null
          company_id?: string | null
          cost_category?: string | null
          cost_centre?: string | null
          currency?: string
          division_id?: string | null
          guid?: string
          is_deemed_positive?: number | null
          is_party_ledger?: number | null
          ledger?: string
          voucher_date?: string | null
          voucher_guid?: string | null
          voucher_number?: string | null
          voucher_type?: string | null
        }
        Update: {
          _ledger?: string
          amount?: number
          amount_cleared?: number | null
          amount_forex?: number
          bill_allocations?: string | null
          company_id?: string | null
          cost_category?: string | null
          cost_centre?: string | null
          currency?: string
          division_id?: string | null
          guid?: string
          is_deemed_positive?: number | null
          is_party_ledger?: number | null
          ledger?: string
          voucher_date?: string | null
          voucher_guid?: string | null
          voucher_number?: string | null
          voucher_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_trn_accounting_company"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_trn_accounting_company_id"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_trn_accounting_division"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_trn_accounting_division_id"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
        ]
      }
      trn_address_details: {
        Row: {
          address_line1: string
          address_line2: string
          address_line3: string
          address_line4: string
          address_type: string
          city: string
          company_id: string | null
          contact_person: string
          country: string
          created_at: string | null
          division_id: string | null
          email: string
          guid: string
          id: string
          phone: string
          pincode: string
          state: string
          voucher_guid: string
        }
        Insert: {
          address_line1?: string
          address_line2?: string
          address_line3?: string
          address_line4?: string
          address_type?: string
          city?: string
          company_id?: string | null
          contact_person?: string
          country?: string
          created_at?: string | null
          division_id?: string | null
          email?: string
          guid: string
          id?: string
          phone?: string
          pincode?: string
          state?: string
          voucher_guid: string
        }
        Update: {
          address_line1?: string
          address_line2?: string
          address_line3?: string
          address_line4?: string
          address_type?: string
          city?: string
          company_id?: string | null
          contact_person?: string
          country?: string
          created_at?: string | null
          division_id?: string | null
          email?: string
          guid?: string
          id?: string
          phone?: string
          pincode?: string
          state?: string
          voucher_guid?: string
        }
        Relationships: []
      }
      trn_attendance: {
        Row: {
          _attendancetype_name: string
          _employee_name: string
          attendancetype_name: string
          company_id: string | null
          division_id: string | null
          employee_name: string
          guid: string
          time_value: number
          type_value: number
        }
        Insert: {
          _attendancetype_name?: string
          _employee_name?: string
          attendancetype_name?: string
          company_id?: string | null
          division_id?: string | null
          employee_name?: string
          guid?: string
          time_value?: number
          type_value?: number
        }
        Update: {
          _attendancetype_name?: string
          _employee_name?: string
          attendancetype_name?: string
          company_id?: string | null
          division_id?: string | null
          employee_name?: string
          guid?: string
          time_value?: number
          type_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_trn_attendance_company"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_trn_attendance_company_id"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_trn_attendance_division"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_trn_attendance_division_id"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
        ]
      }
      trn_bank: {
        Row: {
          _ledger: string
          amount: number
          bank_name: string
          bankers_date: string | null
          company_id: string | null
          division_id: string | null
          guid: string
          instrument_date: string | null
          instrument_number: string
          ledger: string
          transaction_type: string
        }
        Insert: {
          _ledger?: string
          amount?: number
          bank_name?: string
          bankers_date?: string | null
          company_id?: string | null
          division_id?: string | null
          guid?: string
          instrument_date?: string | null
          instrument_number?: string
          ledger?: string
          transaction_type?: string
        }
        Update: {
          _ledger?: string
          amount?: number
          bank_name?: string
          bankers_date?: string | null
          company_id?: string | null
          division_id?: string | null
          guid?: string
          instrument_date?: string | null
          instrument_number?: string
          ledger?: string
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_trn_bank_company"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_trn_bank_company_id"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_trn_bank_division"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_trn_bank_division_id"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
        ]
      }
      trn_batch: {
        Row: {
          _destination_godown: string
          _godown: string
          _item: string
          actual_quantity: number | null
          additional_details: string | null
          amount: number
          batch_serial_number: string | null
          billed_quantity: number | null
          company_id: string | null
          destination_godown: string | null
          discount_amount: number | null
          discount_percent: number | null
          division_id: string | null
          expiry_date: string | null
          godown: string | null
          guid: string
          item: string
          manufactured_date: string | null
          name: string
          quantity: number
          rate: number | null
          tracking_number: string | null
          voucher_date: string | null
          voucher_guid: string | null
          voucher_number: string | null
          voucher_type: string | null
        }
        Insert: {
          _destination_godown?: string
          _godown?: string
          _item?: string
          actual_quantity?: number | null
          additional_details?: string | null
          amount?: number
          batch_serial_number?: string | null
          billed_quantity?: number | null
          company_id?: string | null
          destination_godown?: string | null
          discount_amount?: number | null
          discount_percent?: number | null
          division_id?: string | null
          expiry_date?: string | null
          godown?: string | null
          guid?: string
          item?: string
          manufactured_date?: string | null
          name?: string
          quantity?: number
          rate?: number | null
          tracking_number?: string | null
          voucher_date?: string | null
          voucher_guid?: string | null
          voucher_number?: string | null
          voucher_type?: string | null
        }
        Update: {
          _destination_godown?: string
          _godown?: string
          _item?: string
          actual_quantity?: number | null
          additional_details?: string | null
          amount?: number
          batch_serial_number?: string | null
          billed_quantity?: number | null
          company_id?: string | null
          destination_godown?: string | null
          discount_amount?: number | null
          discount_percent?: number | null
          division_id?: string | null
          expiry_date?: string | null
          godown?: string | null
          guid?: string
          item?: string
          manufactured_date?: string | null
          name?: string
          quantity?: number
          rate?: number | null
          tracking_number?: string | null
          voucher_date?: string | null
          voucher_guid?: string | null
          voucher_number?: string | null
          voucher_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_trn_batch_company"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_trn_batch_company_id"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_trn_batch_division"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_trn_batch_division_id"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
        ]
      }
      trn_bill: {
        Row: {
          _ledger: string
          amount: number
          bill_credit_period: number
          billtype: string
          company_id: string | null
          division_id: string | null
          guid: string
          ledger: string
          name: string
        }
        Insert: {
          _ledger?: string
          amount?: number
          bill_credit_period?: number
          billtype?: string
          company_id?: string | null
          division_id?: string | null
          guid?: string
          ledger?: string
          name?: string
        }
        Update: {
          _ledger?: string
          amount?: number
          bill_credit_period?: number
          billtype?: string
          company_id?: string | null
          division_id?: string | null
          guid?: string
          ledger?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_trn_bill_company"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_trn_bill_company_id"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_trn_bill_division"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_trn_bill_division_id"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
        ]
      }
      trn_category_allocation: {
        Row: {
          allocation_amount: number | null
          allocation_percentage: number | null
          company_id: string | null
          cost_category: string
          cost_centre: string
          created_at: string | null
          division_id: string | null
          guid: string
          id: string
          voucher_guid: string
        }
        Insert: {
          allocation_amount?: number | null
          allocation_percentage?: number | null
          company_id?: string | null
          cost_category?: string
          cost_centre?: string
          created_at?: string | null
          division_id?: string | null
          guid: string
          id?: string
          voucher_guid: string
        }
        Update: {
          allocation_amount?: number | null
          allocation_percentage?: number | null
          company_id?: string | null
          cost_category?: string
          cost_centre?: string
          created_at?: string | null
          division_id?: string | null
          guid?: string
          id?: string
          voucher_guid?: string
        }
        Relationships: []
      }
      trn_closingstock_ledger: {
        Row: {
          _ledger: string
          company_id: string | null
          division_id: string | null
          ledger: string
          stock_date: string | null
          stock_value: number
        }
        Insert: {
          _ledger?: string
          company_id?: string | null
          division_id?: string | null
          ledger?: string
          stock_date?: string | null
          stock_value?: number
        }
        Update: {
          _ledger?: string
          company_id?: string | null
          division_id?: string | null
          ledger?: string
          stock_date?: string | null
          stock_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_trn_closingstock_ledger_company"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_trn_closingstock_ledger_company_id"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_trn_closingstock_ledger_division"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_trn_closingstock_ledger_division_id"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
        ]
      }
      trn_cost_category_centre: {
        Row: {
          _costcategory: string
          _costcentre: string
          _ledger: string
          amount: number
          company_id: string | null
          costcategory: string
          costcentre: string
          division_id: string | null
          guid: string
          ledger: string
        }
        Insert: {
          _costcategory?: string
          _costcentre?: string
          _ledger?: string
          amount?: number
          company_id?: string | null
          costcategory?: string
          costcentre?: string
          division_id?: string | null
          guid?: string
          ledger?: string
        }
        Update: {
          _costcategory?: string
          _costcentre?: string
          _ledger?: string
          amount?: number
          company_id?: string | null
          costcategory?: string
          costcentre?: string
          division_id?: string | null
          guid?: string
          ledger?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_trn_cost_category_centre_company"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_trn_cost_category_centre_company_id"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_trn_cost_category_centre_division"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_trn_cost_category_centre_division_id"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
        ]
      }
      trn_cost_centre: {
        Row: {
          _costcentre: string
          _ledger: string
          amount: number
          company_id: string | null
          costcentre: string
          division_id: string | null
          guid: string
          ledger: string
        }
        Insert: {
          _costcentre?: string
          _ledger?: string
          amount?: number
          company_id?: string | null
          costcentre?: string
          division_id?: string | null
          guid?: string
          ledger?: string
        }
        Update: {
          _costcentre?: string
          _ledger?: string
          amount?: number
          company_id?: string | null
          costcentre?: string
          division_id?: string | null
          guid?: string
          ledger?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_trn_cost_centre_company"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_trn_cost_centre_company_id"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_trn_cost_centre_division"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_trn_cost_centre_division_id"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
        ]
      }
      trn_cost_inventory_category_centre: {
        Row: {
          _costcategory: string
          _costcentre: string
          _item: string
          _ledger: string
          amount: number
          company_id: string | null
          costcategory: string
          costcentre: string
          division_id: string | null
          guid: string
          item: string
          ledger: string
        }
        Insert: {
          _costcategory?: string
          _costcentre?: string
          _item?: string
          _ledger?: string
          amount?: number
          company_id?: string | null
          costcategory?: string
          costcentre?: string
          division_id?: string | null
          guid?: string
          item?: string
          ledger?: string
        }
        Update: {
          _costcategory?: string
          _costcentre?: string
          _item?: string
          _ledger?: string
          amount?: number
          company_id?: string | null
          costcategory?: string
          costcentre?: string
          division_id?: string | null
          guid?: string
          item?: string
          ledger?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_trn_cost_inventory_category_centre_company"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_trn_cost_inventory_category_centre_company_id"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_trn_cost_inventory_category_centre_division"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_trn_cost_inventory_category_centre_division_id"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
        ]
      }
      trn_due_date: {
        Row: {
          bill_name: string
          company_id: string | null
          created_at: string | null
          credit_period: number | null
          division_id: string | null
          due_date: string | null
          guid: string
          id: string
          overdue_days: number | null
          voucher_guid: string
        }
        Insert: {
          bill_name?: string
          company_id?: string | null
          created_at?: string | null
          credit_period?: number | null
          division_id?: string | null
          due_date?: string | null
          guid: string
          id?: string
          overdue_days?: number | null
          voucher_guid: string
        }
        Update: {
          bill_name?: string
          company_id?: string | null
          created_at?: string | null
          credit_period?: number | null
          division_id?: string | null
          due_date?: string | null
          guid?: string
          id?: string
          overdue_days?: number | null
          voucher_guid?: string
        }
        Relationships: []
      }
      trn_employee: {
        Row: {
          _category: string
          _employee_name: string
          amount: number
          category: string
          company_id: string | null
          division_id: string | null
          employee_name: string
          employee_sort_order: number
          guid: string
        }
        Insert: {
          _category?: string
          _employee_name?: string
          amount?: number
          category?: string
          company_id?: string | null
          division_id?: string | null
          employee_name?: string
          employee_sort_order?: number
          guid?: string
        }
        Update: {
          _category?: string
          _employee_name?: string
          amount?: number
          category?: string
          company_id?: string | null
          division_id?: string | null
          employee_name?: string
          employee_sort_order?: number
          guid?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_trn_employee_company"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_trn_employee_company_id"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_trn_employee_division"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_trn_employee_division_id"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
        ]
      }
      trn_gst_details: {
        Row: {
          cess_amount: number | null
          cess_rate: number | null
          cgst_amount: number | null
          cgst_rate: number | null
          company_id: string | null
          created_at: string | null
          division_id: string | null
          gst_class: string
          gst_registration_type: string
          guid: string
          hsn_code: string
          hsn_description: string
          id: string
          igst_amount: number | null
          igst_rate: number | null
          reverse_charge_applicable: number | null
          sgst_amount: number | null
          sgst_rate: number | null
          taxable_amount: number | null
          voucher_guid: string
        }
        Insert: {
          cess_amount?: number | null
          cess_rate?: number | null
          cgst_amount?: number | null
          cgst_rate?: number | null
          company_id?: string | null
          created_at?: string | null
          division_id?: string | null
          gst_class?: string
          gst_registration_type?: string
          guid: string
          hsn_code?: string
          hsn_description?: string
          id?: string
          igst_amount?: number | null
          igst_rate?: number | null
          reverse_charge_applicable?: number | null
          sgst_amount?: number | null
          sgst_rate?: number | null
          taxable_amount?: number | null
          voucher_guid: string
        }
        Update: {
          cess_amount?: number | null
          cess_rate?: number | null
          cgst_amount?: number | null
          cgst_rate?: number | null
          company_id?: string | null
          created_at?: string | null
          division_id?: string | null
          gst_class?: string
          gst_registration_type?: string
          guid?: string
          hsn_code?: string
          hsn_description?: string
          id?: string
          igst_amount?: number | null
          igst_rate?: number | null
          reverse_charge_applicable?: number | null
          sgst_amount?: number | null
          sgst_rate?: number | null
          taxable_amount?: number | null
          voucher_guid?: string
        }
        Relationships: []
      }
      trn_inventory: {
        Row: {
          _godown: string
          _item: string
          additional_amount: number
          amount: number
          company_id: string
          discount_amount: number
          division_id: string
          godown: string | null
          guid: string
          item: string
          order_duedate: string | null
          order_number: string | null
          quantity: number
          rate: number
          tracking_number: string | null
        }
        Insert: {
          _godown?: string
          _item?: string
          additional_amount?: number
          amount?: number
          company_id: string
          discount_amount?: number
          division_id: string
          godown?: string | null
          guid?: string
          item?: string
          order_duedate?: string | null
          order_number?: string | null
          quantity?: number
          rate?: number
          tracking_number?: string | null
        }
        Update: {
          _godown?: string
          _item?: string
          additional_amount?: number
          amount?: number
          company_id?: string
          discount_amount?: number
          division_id?: string
          godown?: string | null
          guid?: string
          item?: string
          order_duedate?: string | null
          order_number?: string | null
          quantity?: number
          rate?: number
          tracking_number?: string | null
        }
        Relationships: []
      }
      trn_inventory_accounting: {
        Row: {
          _ledger: string
          additional_allocation_type: string
          amount: number
          company_id: string
          division_id: string
          guid: string
          ledger: string
        }
        Insert: {
          _ledger?: string
          additional_allocation_type?: string
          amount?: number
          company_id: string
          division_id: string
          guid?: string
          ledger?: string
        }
        Update: {
          _ledger?: string
          additional_allocation_type?: string
          amount?: number
          company_id?: string
          division_id?: string
          guid?: string
          ledger?: string
        }
        Relationships: [
          {
            foreignKeyName: "trn_inventory_accounting_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "mst_company"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "trn_inventory_accounting_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "mst_division"
            referencedColumns: ["division_id"]
          },
        ]
      }
      trn_party_details: {
        Row: {
          company_id: string | null
          created_at: string | null
          division_id: string | null
          gstin: string
          guid: string
          id: string
          party_address: string
          party_country: string
          party_ledger_name: string
          party_name: string
          party_pincode: string
          party_state: string
          place_of_supply: string
          voucher_guid: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          division_id?: string | null
          gstin?: string
          guid: string
          id?: string
          party_address?: string
          party_country?: string
          party_ledger_name?: string
          party_name?: string
          party_pincode?: string
          party_state?: string
          place_of_supply?: string
          voucher_guid: string
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          division_id?: string | null
          gstin?: string
          guid?: string
          id?: string
          party_address?: string
          party_country?: string
          party_ledger_name?: string
          party_name?: string
          party_pincode?: string
          party_state?: string
          place_of_supply?: string
          voucher_guid?: string
        }
        Relationships: []
      }
      trn_payhead: {
        Row: {
          _category: string
          _employee_name: string
          _payhead_name: string
          amount: number
          category: string
          company_id: string
          division_id: string
          employee_name: string
          employee_sort_order: number
          guid: string
          payhead_name: string
          payhead_sort_order: number
        }
        Insert: {
          _category?: string
          _employee_name?: string
          _payhead_name?: string
          amount?: number
          category?: string
          company_id: string
          division_id: string
          employee_name?: string
          employee_sort_order?: number
          guid?: string
          payhead_name?: string
          payhead_sort_order?: number
        }
        Update: {
          _category?: string
          _employee_name?: string
          _payhead_name?: string
          amount?: number
          category?: string
          company_id?: string
          division_id?: string
          employee_name?: string
          employee_sort_order?: number
          guid?: string
          payhead_name?: string
          payhead_sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "trn_payhead_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "mst_company"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "trn_payhead_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "mst_division"
            referencedColumns: ["division_id"]
          },
        ]
      }
      trn_reference: {
        Row: {
          company_id: string | null
          created_at: string | null
          division_id: string | null
          guid: string
          id: string
          reference_amount: number | null
          reference_date: string | null
          reference_name: string
          reference_number: string
          voucher_guid: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          division_id?: string | null
          guid: string
          id?: string
          reference_amount?: number | null
          reference_date?: string | null
          reference_name?: string
          reference_number?: string
          voucher_guid: string
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          division_id?: string | null
          guid?: string
          id?: string
          reference_amount?: number | null
          reference_date?: string | null
          reference_name?: string
          reference_number?: string
          voucher_guid?: string
        }
        Relationships: []
      }
      trn_shipping_details: {
        Row: {
          buyer_address: string
          buyer_name: string
          buyer_state: string
          company_id: string | null
          consignee_address: string
          consignee_country: string
          consignee_name: string
          consignee_pincode: string
          consignee_state: string
          created_at: string | null
          dispatch_state: string
          division_id: string | null
          guid: string
          id: string
          ship_to_state: string
          voucher_guid: string
        }
        Insert: {
          buyer_address?: string
          buyer_name?: string
          buyer_state?: string
          company_id?: string | null
          consignee_address?: string
          consignee_country?: string
          consignee_name?: string
          consignee_pincode?: string
          consignee_state?: string
          created_at?: string | null
          dispatch_state?: string
          division_id?: string | null
          guid: string
          id?: string
          ship_to_state?: string
          voucher_guid: string
        }
        Update: {
          buyer_address?: string
          buyer_name?: string
          buyer_state?: string
          company_id?: string | null
          consignee_address?: string
          consignee_country?: string
          consignee_name?: string
          consignee_pincode?: string
          consignee_state?: string
          created_at?: string | null
          dispatch_state?: string
          division_id?: string | null
          guid?: string
          id?: string
          ship_to_state?: string
          voucher_guid?: string
        }
        Relationships: []
      }
      trn_tax_details: {
        Row: {
          company_id: string | null
          created_at: string | null
          division_id: string | null
          guid: string
          id: string
          tax_amount: number | null
          tax_ledger: string
          tax_name: string
          tax_rate: number | null
          tax_type: string
          voucher_guid: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          division_id?: string | null
          guid: string
          id?: string
          tax_amount?: number | null
          tax_ledger?: string
          tax_name?: string
          tax_rate?: number | null
          tax_type?: string
          voucher_guid: string
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          division_id?: string | null
          guid?: string
          id?: string
          tax_amount?: number | null
          tax_ledger?: string
          tax_name?: string
          tax_rate?: number | null
          tax_type?: string
          voucher_guid?: string
        }
        Relationships: []
      }
      trn_voucher: {
        Row: {
          _party_name: string
          _voucher_type: string
          company_id: string
          date: string
          division_id: string
          guid: string
          is_accounting_voucher: number | null
          is_inventory_voucher: number | null
          is_invoice: number | null
          is_order_voucher: number | null
          narration: string
          party_name: string
          place_of_supply: string
          reference_date: string | null
          reference_number: string
          voucher_number: string
          voucher_type: string
        }
        Insert: {
          _party_name?: string
          _voucher_type?: string
          company_id: string
          date: string
          division_id: string
          guid: string
          is_accounting_voucher?: number | null
          is_inventory_voucher?: number | null
          is_invoice?: number | null
          is_order_voucher?: number | null
          narration?: string
          party_name: string
          place_of_supply: string
          reference_date?: string | null
          reference_number?: string
          voucher_number?: string
          voucher_type: string
        }
        Update: {
          _party_name?: string
          _voucher_type?: string
          company_id?: string
          date?: string
          division_id?: string
          guid?: string
          is_accounting_voucher?: number | null
          is_inventory_voucher?: number | null
          is_invoice?: number | null
          is_order_voucher?: number | null
          narration?: string
          party_name?: string
          place_of_supply?: string
          reference_date?: string | null
          reference_number?: string
          voucher_number?: string
          voucher_type?: string
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
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_members: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          avatar_url: string | null
          id: string
          role: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          avatar_url?: string | null
          id?: string
          role?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          avatar_url?: string | null
          id?: string
          role?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_members_workspace_id_fkey"
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
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspaces_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_company_access: {
        Args: { _user_id: string }
        Returns: {
          company_id: string
          division_id: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "company_admin"
        | "division_admin"
        | "workspace_member"
      drive_item_type: "folder" | "file"
      task_priority: "low" | "medium" | "high" | "urgent"
      task_status: "todo" | "in_progress" | "done"
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
      app_role: [
        "super_admin",
        "company_admin",
        "division_admin",
        "workspace_member",
      ],
      drive_item_type: ["folder", "file"],
      task_priority: ["low", "medium", "high", "urgent"],
      task_status: ["todo", "in_progress", "done"],
    },
  },
} as const
