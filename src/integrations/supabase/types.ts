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
          company_id: string
          company_uuid: string | null
          division_id: string
          division_uuid: string | null
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
          company_id: string
          company_uuid?: string | null
          division_id: string
          division_uuid?: string | null
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
          company_id?: string
          company_uuid?: string | null
          division_id?: string
          division_uuid?: string | null
          guid?: string
          name?: string
          parent?: string
          uom?: string
        }
        Relationships: [
          {
            foreignKeyName: "mst_attendance_type_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "mst_company"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "mst_attendance_type_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "mst_division"
            referencedColumns: ["division_id"]
          },
        ]
      }
      mst_company: {
        Row: {
          company_id: string
          company_name: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          company_id: string
          company_name: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          company_name?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      mst_cost_category: {
        Row: {
          allocate_non_revenue: number | null
          allocate_revenue: number | null
          company_id: string
          company_uuid: string | null
          division_id: string
          division_uuid: string | null
          guid: string
          name: string
        }
        Insert: {
          allocate_non_revenue?: number | null
          allocate_revenue?: number | null
          company_id: string
          company_uuid?: string | null
          division_id: string
          division_uuid?: string | null
          guid: string
          name?: string
        }
        Update: {
          allocate_non_revenue?: number | null
          allocate_revenue?: number | null
          company_id?: string
          company_uuid?: string | null
          division_id?: string
          division_uuid?: string | null
          guid?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "mst_cost_category_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "mst_company"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "mst_cost_category_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "mst_division"
            referencedColumns: ["division_id"]
          },
        ]
      }
      mst_cost_centre: {
        Row: {
          _parent: string
          category: string
          company_id: string
          company_uuid: string | null
          division_id: string
          division_uuid: string | null
          guid: string
          name: string
          parent: string
        }
        Insert: {
          _parent?: string
          category?: string
          company_id: string
          company_uuid?: string | null
          division_id: string
          division_uuid?: string | null
          guid: string
          name?: string
          parent?: string
        }
        Update: {
          _parent?: string
          category?: string
          company_id?: string
          company_uuid?: string | null
          division_id?: string
          division_uuid?: string | null
          guid?: string
          name?: string
          parent?: string
        }
        Relationships: [
          {
            foreignKeyName: "mst_cost_centre_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "mst_company"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "mst_cost_centre_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "mst_division"
            referencedColumns: ["division_id"]
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
          company_id: string
          company_uuid: string | null
          date_of_birth: string | null
          date_of_joining: string | null
          date_of_release: string | null
          designation: string
          division_id: string
          division_uuid: string | null
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
          company_id: string
          company_uuid?: string | null
          date_of_birth?: string | null
          date_of_joining?: string | null
          date_of_release?: string | null
          designation?: string
          division_id: string
          division_uuid?: string | null
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
          company_id?: string
          company_uuid?: string | null
          date_of_birth?: string | null
          date_of_joining?: string | null
          date_of_release?: string | null
          designation?: string
          division_id?: string
          division_uuid?: string | null
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
            foreignKeyName: "mst_employee_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "mst_company"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "mst_employee_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "mst_division"
            referencedColumns: ["division_id"]
          },
        ]
      }
      mst_godown: {
        Row: {
          _parent: string
          address: string
          company_id: string
          company_uuid: string | null
          division_id: string
          division_uuid: string | null
          guid: string
          name: string
          parent: string
        }
        Insert: {
          _parent?: string
          address?: string
          company_id: string
          company_uuid?: string | null
          division_id: string
          division_uuid?: string | null
          guid: string
          name?: string
          parent?: string
        }
        Update: {
          _parent?: string
          address?: string
          company_id?: string
          company_uuid?: string | null
          division_id?: string
          division_uuid?: string | null
          guid?: string
          name?: string
          parent?: string
        }
        Relationships: [
          {
            foreignKeyName: "mst_godown_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "mst_company"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "mst_godown_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "mst_division"
            referencedColumns: ["division_id"]
          },
        ]
      }
      mst_group: {
        Row: {
          _parent: string
          affects_gross_profit: number | null
          company_id: string
          company_uuid: string | null
          division_id: string
          division_uuid: string | null
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
          company_id: string
          company_uuid?: string | null
          division_id: string
          division_uuid?: string | null
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
          company_id?: string
          company_uuid?: string | null
          division_id?: string
          division_uuid?: string | null
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
            foreignKeyName: "mst_group_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "mst_company"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "mst_group_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "mst_division"
            referencedColumns: ["division_id"]
          },
        ]
      }
      mst_gst_effective_rate: {
        Row: {
          _item: string
          applicable_from: string | null
          company_id: string
          company_uuid: string | null
          division_id: string
          division_uuid: string | null
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
          company_id: string
          company_uuid?: string | null
          division_id: string
          division_uuid?: string | null
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
          company_id?: string
          company_uuid?: string | null
          division_id?: string
          division_uuid?: string | null
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
            foreignKeyName: "mst_gst_effective_rate_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "mst_company"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "mst_gst_effective_rate_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "mst_division"
            referencedColumns: ["division_id"]
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
          closing_balance: number | null
          company_id: string
          company_uuid: string | null
          description: string
          division_id: string
          division_uuid: string | null
          email: string
          gst_duty_head: string
          gst_registration_type: string
          gst_supply_type: string
          gstn: string
          guid: string
          is_deemedpositive: number | null
          is_revenue: number | null
          it_pan: string
          mailing_address: string
          mailing_country: string
          mailing_name: string
          mailing_pincode: string
          mailing_state: string
          name: string
          notes: string
          opening_balance: number | null
          parent: string
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
          closing_balance?: number | null
          company_id: string
          company_uuid?: string | null
          description?: string
          division_id: string
          division_uuid?: string | null
          email?: string
          gst_duty_head?: string
          gst_registration_type?: string
          gst_supply_type?: string
          gstn?: string
          guid: string
          is_deemedpositive?: number | null
          is_revenue?: number | null
          it_pan?: string
          mailing_address?: string
          mailing_country?: string
          mailing_name?: string
          mailing_pincode?: string
          mailing_state?: string
          name?: string
          notes?: string
          opening_balance?: number | null
          parent?: string
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
          closing_balance?: number | null
          company_id?: string
          company_uuid?: string | null
          description?: string
          division_id?: string
          division_uuid?: string | null
          email?: string
          gst_duty_head?: string
          gst_registration_type?: string
          gst_supply_type?: string
          gstn?: string
          guid?: string
          is_deemedpositive?: number | null
          is_revenue?: number | null
          it_pan?: string
          mailing_address?: string
          mailing_country?: string
          mailing_name?: string
          mailing_pincode?: string
          mailing_state?: string
          name?: string
          notes?: string
          opening_balance?: number | null
          parent?: string
          tax_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "mst_ledger_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "mst_company"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "mst_ledger_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "mst_division"
            referencedColumns: ["division_id"]
          },
        ]
      }
      mst_opening_batch_allocation: {
        Row: {
          _godown: string
          _item: string
          company_id: string
          company_uuid: string | null
          division_id: string
          division_uuid: string | null
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
          company_id: string
          company_uuid?: string | null
          division_id: string
          division_uuid?: string | null
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
          company_id?: string
          company_uuid?: string | null
          division_id?: string
          division_uuid?: string | null
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
            foreignKeyName: "mst_opening_batch_allocation_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "mst_company"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "mst_opening_batch_allocation_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "mst_division"
            referencedColumns: ["division_id"]
          },
        ]
      }
      mst_opening_bill_allocation: {
        Row: {
          _ledger: string
          bill_credit_period: number
          bill_date: string | null
          company_id: string
          company_uuid: string | null
          division_id: string
          division_uuid: string | null
          is_advance: number | null
          ledger: string
          name: string
          opening_balance: number | null
        }
        Insert: {
          _ledger?: string
          bill_credit_period?: number
          bill_date?: string | null
          company_id: string
          company_uuid?: string | null
          division_id: string
          division_uuid?: string | null
          is_advance?: number | null
          ledger?: string
          name?: string
          opening_balance?: number | null
        }
        Update: {
          _ledger?: string
          bill_credit_period?: number
          bill_date?: string | null
          company_id?: string
          company_uuid?: string | null
          division_id?: string
          division_uuid?: string | null
          is_advance?: number | null
          ledger?: string
          name?: string
          opening_balance?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "mst_opening_bill_allocation_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "mst_company"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "mst_opening_bill_allocation_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "mst_division"
            referencedColumns: ["division_id"]
          },
        ]
      }
      mst_payhead: {
        Row: {
          _parent: string
          calculation_period: string
          calculation_type: string
          company_id: string
          company_uuid: string | null
          division_id: string
          division_uuid: string | null
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
          company_id: string
          company_uuid?: string | null
          division_id: string
          division_uuid?: string | null
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
          company_id?: string
          company_uuid?: string | null
          division_id?: string
          division_uuid?: string | null
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
            foreignKeyName: "mst_payhead_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "mst_company"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "mst_payhead_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "mst_division"
            referencedColumns: ["division_id"]
          },
        ]
      }
      mst_stock_group: {
        Row: {
          _parent: string
          company_id: string
          company_uuid: string | null
          division_id: string
          division_uuid: string | null
          guid: string
          name: string
          parent: string
        }
        Insert: {
          _parent?: string
          company_id: string
          company_uuid?: string | null
          division_id: string
          division_uuid?: string | null
          guid: string
          name?: string
          parent?: string
        }
        Update: {
          _parent?: string
          company_id?: string
          company_uuid?: string | null
          division_id?: string
          division_uuid?: string | null
          guid?: string
          name?: string
          parent?: string
        }
        Relationships: [
          {
            foreignKeyName: "mst_stock_group_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "mst_company"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "mst_stock_group_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "mst_division"
            referencedColumns: ["division_id"]
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
          closing_balance: number | null
          closing_rate: number | null
          closing_value: number | null
          company_id: string
          company_uuid: string | null
          conversion: number
          costing_method: string
          description: string
          division_id: string
          division_uuid: string | null
          gst_hsn_code: string | null
          gst_hsn_description: string | null
          gst_rate: number | null
          gst_taxability: string | null
          gst_type_of_supply: string | null
          guid: string
          name: string
          notes: string
          opening_balance: number | null
          opening_rate: number | null
          opening_value: number | null
          parent: string
          part_number: string
          uom: string
        }
        Insert: {
          _alternate_uom?: string
          _parent?: string
          _uom?: string
          alias?: string
          alternate_uom?: string
          closing_balance?: number | null
          closing_rate?: number | null
          closing_value?: number | null
          company_id: string
          company_uuid?: string | null
          conversion?: number
          costing_method?: string
          description?: string
          division_id: string
          division_uuid?: string | null
          gst_hsn_code?: string | null
          gst_hsn_description?: string | null
          gst_rate?: number | null
          gst_taxability?: string | null
          gst_type_of_supply?: string | null
          guid: string
          name?: string
          notes?: string
          opening_balance?: number | null
          opening_rate?: number | null
          opening_value?: number | null
          parent?: string
          part_number?: string
          uom?: string
        }
        Update: {
          _alternate_uom?: string
          _parent?: string
          _uom?: string
          alias?: string
          alternate_uom?: string
          closing_balance?: number | null
          closing_rate?: number | null
          closing_value?: number | null
          company_id?: string
          company_uuid?: string | null
          conversion?: number
          costing_method?: string
          description?: string
          division_id?: string
          division_uuid?: string | null
          gst_hsn_code?: string | null
          gst_hsn_description?: string | null
          gst_rate?: number | null
          gst_taxability?: string | null
          gst_type_of_supply?: string | null
          guid?: string
          name?: string
          notes?: string
          opening_balance?: number | null
          opening_rate?: number | null
          opening_value?: number | null
          parent?: string
          part_number?: string
          uom?: string
        }
        Relationships: [
          {
            foreignKeyName: "mst_stock_item_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "mst_company"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "mst_stock_item_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "mst_division"
            referencedColumns: ["division_id"]
          },
        ]
      }
      mst_stockitem_standard_cost: {
        Row: {
          _item: string
          company_id: string
          company_uuid: string | null
          date: string | null
          division_id: string
          division_uuid: string | null
          item: string
          rate: number | null
        }
        Insert: {
          _item?: string
          company_id: string
          company_uuid?: string | null
          date?: string | null
          division_id: string
          division_uuid?: string | null
          item?: string
          rate?: number | null
        }
        Update: {
          _item?: string
          company_id?: string
          company_uuid?: string | null
          date?: string | null
          division_id?: string
          division_uuid?: string | null
          item?: string
          rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "mst_stockitem_standard_cost_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "mst_company"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "mst_stockitem_standard_cost_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "mst_division"
            referencedColumns: ["division_id"]
          },
        ]
      }
      mst_stockitem_standard_price: {
        Row: {
          _item: string
          company_id: string
          company_uuid: string | null
          date: string | null
          division_id: string
          division_uuid: string | null
          item: string
          rate: number | null
        }
        Insert: {
          _item?: string
          company_id: string
          company_uuid?: string | null
          date?: string | null
          division_id: string
          division_uuid?: string | null
          item?: string
          rate?: number | null
        }
        Update: {
          _item?: string
          company_id?: string
          company_uuid?: string | null
          date?: string | null
          division_id?: string
          division_uuid?: string | null
          item?: string
          rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "mst_stockitem_standard_price_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "mst_company"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "mst_stockitem_standard_price_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "mst_division"
            referencedColumns: ["division_id"]
          },
        ]
      }
      mst_uom: {
        Row: {
          additional_units: string
          base_units: string
          company_id: string
          company_uuid: string | null
          conversion: number
          division_id: string
          division_uuid: string | null
          formalname: string
          guid: string
          is_simple_unit: number
          name: string
        }
        Insert: {
          additional_units: string
          base_units: string
          company_id: string
          company_uuid?: string | null
          conversion: number
          division_id: string
          division_uuid?: string | null
          formalname?: string
          guid: string
          is_simple_unit: number
          name?: string
        }
        Update: {
          additional_units?: string
          base_units?: string
          company_id?: string
          company_uuid?: string | null
          conversion?: number
          division_id?: string
          division_uuid?: string | null
          formalname?: string
          guid?: string
          is_simple_unit?: number
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "mst_uom_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "mst_company"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "mst_uom_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "mst_division"
            referencedColumns: ["division_id"]
          },
        ]
      }
      mst_vouchertype: {
        Row: {
          _parent: string
          affects_stock: number | null
          company_id: string
          company_uuid: string | null
          division_id: string
          division_uuid: string | null
          guid: string
          is_deemedpositive: number | null
          name: string
          numbering_method: string
          parent: string
        }
        Insert: {
          _parent?: string
          affects_stock?: number | null
          company_id: string
          company_uuid?: string | null
          division_id: string
          division_uuid?: string | null
          guid: string
          is_deemedpositive?: number | null
          name?: string
          numbering_method?: string
          parent?: string
        }
        Update: {
          _parent?: string
          affects_stock?: number | null
          company_id?: string
          company_uuid?: string | null
          division_id?: string
          division_uuid?: string | null
          guid?: string
          is_deemedpositive?: number | null
          name?: string
          numbering_method?: string
          parent?: string
        }
        Relationships: [
          {
            foreignKeyName: "mst_vouchertype_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "mst_company"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "mst_vouchertype_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "mst_division"
            referencedColumns: ["division_id"]
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
          company_id: string
          company_uuid: string | null
          created_at: string | null
          division_id: string
          division_uuid: string | null
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
          company_id: string
          company_uuid?: string | null
          created_at?: string | null
          division_id: string
          division_uuid?: string | null
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
          company_id?: string
          company_uuid?: string | null
          created_at?: string | null
          division_id?: string
          division_uuid?: string | null
          guid?: string
          is_deemedpositive?: number | null
          is_reserved?: number | null
          is_revenue?: number | null
          name?: string
          parent?: string
          primary_group?: string
          sort_position?: number | null
        }
        Relationships: []
      }
      tally_mst_ledger: {
        Row: {
          closing_balance: number | null
          company_id: string
          company_uuid: string | null
          created_at: string | null
          division_id: string
          division_uuid: string | null
          guid: string
          name: string
          opening_balance: number | null
          parent: string
        }
        Insert: {
          closing_balance?: number | null
          company_id: string
          company_uuid?: string | null
          created_at?: string | null
          division_id: string
          division_uuid?: string | null
          guid: string
          name: string
          opening_balance?: number | null
          parent?: string
        }
        Update: {
          closing_balance?: number | null
          company_id?: string
          company_uuid?: string | null
          created_at?: string | null
          division_id?: string
          division_uuid?: string | null
          guid?: string
          name?: string
          opening_balance?: number | null
          parent?: string
        }
        Relationships: []
      }
      tally_mst_stock_item: {
        Row: {
          company_id: string
          company_uuid: string | null
          created_at: string | null
          division_id: string
          division_uuid: string | null
          guid: string
          name: string
          parent: string
          unit: string | null
        }
        Insert: {
          company_id: string
          company_uuid?: string | null
          created_at?: string | null
          division_id: string
          division_uuid?: string | null
          guid: string
          name: string
          parent?: string
          unit?: string | null
        }
        Update: {
          company_id?: string
          company_uuid?: string | null
          created_at?: string | null
          division_id?: string
          division_uuid?: string | null
          guid?: string
          name?: string
          parent?: string
          unit?: string | null
        }
        Relationships: []
      }
      tally_trn_voucher: {
        Row: {
          company_id: string
          company_uuid: string | null
          created_at: string | null
          date: string | null
          division_id: string
          division_uuid: string | null
          guid: string
          narration: string | null
          voucher_number: string | null
          voucher_type: string | null
        }
        Insert: {
          company_id: string
          company_uuid?: string | null
          created_at?: string | null
          date?: string | null
          division_id: string
          division_uuid?: string | null
          guid: string
          narration?: string | null
          voucher_number?: string | null
          voucher_type?: string | null
        }
        Update: {
          company_id?: string
          company_uuid?: string | null
          created_at?: string | null
          date?: string | null
          division_id?: string
          division_uuid?: string | null
          guid?: string
          narration?: string | null
          voucher_number?: string | null
          voucher_type?: string | null
        }
        Relationships: []
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
          amount_forex: number
          company_id: string
          company_uuid: string | null
          currency: string
          division_id: string
          division_uuid: string | null
          guid: string
          ledger: string
        }
        Insert: {
          _ledger?: string
          amount?: number
          amount_forex?: number
          company_id: string
          company_uuid?: string | null
          currency?: string
          division_id: string
          division_uuid?: string | null
          guid?: string
          ledger?: string
        }
        Update: {
          _ledger?: string
          amount?: number
          amount_forex?: number
          company_id?: string
          company_uuid?: string | null
          currency?: string
          division_id?: string
          division_uuid?: string | null
          guid?: string
          ledger?: string
        }
        Relationships: [
          {
            foreignKeyName: "trn_accounting_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "mst_company"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "trn_accounting_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "mst_division"
            referencedColumns: ["division_id"]
          },
        ]
      }
      trn_attendance: {
        Row: {
          _attendancetype_name: string
          _employee_name: string
          attendancetype_name: string
          company_id: string
          company_uuid: string | null
          division_id: string
          division_uuid: string | null
          employee_name: string
          guid: string
          time_value: number
          type_value: number
        }
        Insert: {
          _attendancetype_name?: string
          _employee_name?: string
          attendancetype_name?: string
          company_id: string
          company_uuid?: string | null
          division_id: string
          division_uuid?: string | null
          employee_name?: string
          guid?: string
          time_value?: number
          type_value?: number
        }
        Update: {
          _attendancetype_name?: string
          _employee_name?: string
          attendancetype_name?: string
          company_id?: string
          company_uuid?: string | null
          division_id?: string
          division_uuid?: string | null
          employee_name?: string
          guid?: string
          time_value?: number
          type_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "trn_attendance_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "mst_company"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "trn_attendance_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "mst_division"
            referencedColumns: ["division_id"]
          },
        ]
      }
      trn_bank: {
        Row: {
          _ledger: string
          amount: number
          bank_name: string
          bankers_date: string | null
          company_id: string
          company_uuid: string | null
          division_id: string
          division_uuid: string | null
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
          company_id: string
          company_uuid?: string | null
          division_id: string
          division_uuid?: string | null
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
          company_id?: string
          company_uuid?: string | null
          division_id?: string
          division_uuid?: string | null
          guid?: string
          instrument_date?: string | null
          instrument_number?: string
          ledger?: string
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "trn_bank_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "mst_company"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "trn_bank_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "mst_division"
            referencedColumns: ["division_id"]
          },
        ]
      }
      trn_batch: {
        Row: {
          _destination_godown: string
          _godown: string
          _item: string
          amount: number
          company_id: string
          company_uuid: string | null
          destination_godown: string | null
          division_id: string
          division_uuid: string | null
          godown: string | null
          guid: string
          item: string
          name: string
          quantity: number
          tracking_number: string | null
        }
        Insert: {
          _destination_godown?: string
          _godown?: string
          _item?: string
          amount?: number
          company_id: string
          company_uuid?: string | null
          destination_godown?: string | null
          division_id: string
          division_uuid?: string | null
          godown?: string | null
          guid?: string
          item?: string
          name?: string
          quantity?: number
          tracking_number?: string | null
        }
        Update: {
          _destination_godown?: string
          _godown?: string
          _item?: string
          amount?: number
          company_id?: string
          company_uuid?: string | null
          destination_godown?: string | null
          division_id?: string
          division_uuid?: string | null
          godown?: string | null
          guid?: string
          item?: string
          name?: string
          quantity?: number
          tracking_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trn_batch_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "mst_company"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "trn_batch_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "mst_division"
            referencedColumns: ["division_id"]
          },
        ]
      }
      trn_bill: {
        Row: {
          _ledger: string
          amount: number
          bill_credit_period: number
          billtype: string
          company_id: string
          company_uuid: string | null
          division_id: string
          division_uuid: string | null
          guid: string
          ledger: string
          name: string
        }
        Insert: {
          _ledger?: string
          amount?: number
          bill_credit_period?: number
          billtype?: string
          company_id: string
          company_uuid?: string | null
          division_id: string
          division_uuid?: string | null
          guid?: string
          ledger?: string
          name?: string
        }
        Update: {
          _ledger?: string
          amount?: number
          bill_credit_period?: number
          billtype?: string
          company_id?: string
          company_uuid?: string | null
          division_id?: string
          division_uuid?: string | null
          guid?: string
          ledger?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "trn_bill_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "mst_company"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "trn_bill_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "mst_division"
            referencedColumns: ["division_id"]
          },
        ]
      }
      trn_closingstock_ledger: {
        Row: {
          _ledger: string
          company_id: string
          company_uuid: string | null
          division_id: string
          division_uuid: string | null
          ledger: string
          stock_date: string | null
          stock_value: number
        }
        Insert: {
          _ledger?: string
          company_id: string
          company_uuid?: string | null
          division_id: string
          division_uuid?: string | null
          ledger?: string
          stock_date?: string | null
          stock_value?: number
        }
        Update: {
          _ledger?: string
          company_id?: string
          company_uuid?: string | null
          division_id?: string
          division_uuid?: string | null
          ledger?: string
          stock_date?: string | null
          stock_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "trn_closingstock_ledger_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "mst_company"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "trn_closingstock_ledger_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "mst_division"
            referencedColumns: ["division_id"]
          },
        ]
      }
      trn_cost_category_centre: {
        Row: {
          _costcategory: string
          _costcentre: string
          _ledger: string
          amount: number
          company_id: string
          company_uuid: string | null
          costcategory: string
          costcentre: string
          division_id: string
          division_uuid: string | null
          guid: string
          ledger: string
        }
        Insert: {
          _costcategory?: string
          _costcentre?: string
          _ledger?: string
          amount?: number
          company_id: string
          company_uuid?: string | null
          costcategory?: string
          costcentre?: string
          division_id: string
          division_uuid?: string | null
          guid?: string
          ledger?: string
        }
        Update: {
          _costcategory?: string
          _costcentre?: string
          _ledger?: string
          amount?: number
          company_id?: string
          company_uuid?: string | null
          costcategory?: string
          costcentre?: string
          division_id?: string
          division_uuid?: string | null
          guid?: string
          ledger?: string
        }
        Relationships: [
          {
            foreignKeyName: "trn_cost_category_centre_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "mst_company"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "trn_cost_category_centre_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "mst_division"
            referencedColumns: ["division_id"]
          },
        ]
      }
      trn_cost_centre: {
        Row: {
          _costcentre: string
          _ledger: string
          amount: number
          company_id: string
          company_uuid: string | null
          costcentre: string
          division_id: string
          division_uuid: string | null
          guid: string
          ledger: string
        }
        Insert: {
          _costcentre?: string
          _ledger?: string
          amount?: number
          company_id: string
          company_uuid?: string | null
          costcentre?: string
          division_id: string
          division_uuid?: string | null
          guid?: string
          ledger?: string
        }
        Update: {
          _costcentre?: string
          _ledger?: string
          amount?: number
          company_id?: string
          company_uuid?: string | null
          costcentre?: string
          division_id?: string
          division_uuid?: string | null
          guid?: string
          ledger?: string
        }
        Relationships: [
          {
            foreignKeyName: "trn_cost_centre_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "mst_company"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "trn_cost_centre_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "mst_division"
            referencedColumns: ["division_id"]
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
          company_id: string
          company_uuid: string | null
          costcategory: string
          costcentre: string
          division_id: string
          division_uuid: string | null
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
          company_id: string
          company_uuid?: string | null
          costcategory?: string
          costcentre?: string
          division_id: string
          division_uuid?: string | null
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
          company_id?: string
          company_uuid?: string | null
          costcategory?: string
          costcentre?: string
          division_id?: string
          division_uuid?: string | null
          guid?: string
          item?: string
          ledger?: string
        }
        Relationships: [
          {
            foreignKeyName: "trn_cost_inventory_category_centre_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "mst_company"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "trn_cost_inventory_category_centre_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "mst_division"
            referencedColumns: ["division_id"]
          },
        ]
      }
      trn_employee: {
        Row: {
          _category: string
          _employee_name: string
          amount: number
          category: string
          company_id: string
          company_uuid: string | null
          division_id: string
          division_uuid: string | null
          employee_name: string
          employee_sort_order: number
          guid: string
        }
        Insert: {
          _category?: string
          _employee_name?: string
          amount?: number
          category?: string
          company_id: string
          company_uuid?: string | null
          division_id: string
          division_uuid?: string | null
          employee_name?: string
          employee_sort_order?: number
          guid?: string
        }
        Update: {
          _category?: string
          _employee_name?: string
          amount?: number
          category?: string
          company_id?: string
          company_uuid?: string | null
          division_id?: string
          division_uuid?: string | null
          employee_name?: string
          employee_sort_order?: number
          guid?: string
        }
        Relationships: [
          {
            foreignKeyName: "trn_employee_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "mst_company"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "trn_employee_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "mst_division"
            referencedColumns: ["division_id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "trn_inventory_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "mst_company"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "trn_inventory_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "mst_division"
            referencedColumns: ["division_id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "trn_voucher_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "mst_company"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "trn_voucher_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "mst_division"
            referencedColumns: ["division_id"]
          },
        ]
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
