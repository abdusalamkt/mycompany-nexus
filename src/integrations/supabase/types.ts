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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      accommodation_properties: {
        Row: {
          address: string | null
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          name: string
          notes: string | null
          person_type: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          name: string
          notes?: string | null
          person_type?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          name?: string
          notes?: string | null
          person_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      accommodations: {
        Row: {
          capacity: number | null
          created_at: string
          created_by: string | null
          employee_id: string | null
          id: string
          is_active: boolean
          location: string | null
          name: string
          notes: string | null
          occupants: string | null
          person_type: string
          property_id: string | null
          property_name: string | null
          room_number: string | null
          updated_at: string
          worker_id: string | null
        }
        Insert: {
          capacity?: number | null
          created_at?: string
          created_by?: string | null
          employee_id?: string | null
          id?: string
          is_active?: boolean
          location?: string | null
          name: string
          notes?: string | null
          occupants?: string | null
          person_type?: string
          property_id?: string | null
          property_name?: string | null
          room_number?: string | null
          updated_at?: string
          worker_id?: string | null
        }
        Update: {
          capacity?: number | null
          created_at?: string
          created_by?: string | null
          employee_id?: string | null
          id?: string
          is_active?: boolean
          location?: string | null
          name?: string
          notes?: string | null
          occupants?: string | null
          person_type?: string
          property_id?: string | null
          property_name?: string | null
          room_number?: string | null
          updated_at?: string
          worker_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accommodations_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accommodations_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "accommodation_properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accommodations_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          actor_name: string | null
          created_at: string
          id: string
          module: string
          new_value: Json | null
          old_value: Json | null
          record_id: string | null
          record_label: string | null
          source_table: string | null
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          actor_name?: string | null
          created_at?: string
          id?: string
          module: string
          new_value?: Json | null
          old_value?: Json | null
          record_id?: string | null
          record_label?: string | null
          source_table?: string | null
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          actor_name?: string | null
          created_at?: string
          id?: string
          module?: string
          new_value?: Json | null
          old_value?: Json | null
          record_id?: string | null
          record_label?: string | null
          source_table?: string | null
        }
        Relationships: []
      }
      certificates: {
        Row: {
          certificate_number: string | null
          certificate_type: string
          created_at: string
          created_by: string | null
          employee_id: string | null
          expiry_date: string | null
          file_name: string | null
          file_path: string | null
          holder_name: string | null
          holder_type: string
          id: string
          issue_date: string | null
          issuing_authority: string | null
          notes: string | null
          status: string
          title: string
          updated_at: string
          worker_id: string | null
        }
        Insert: {
          certificate_number?: string | null
          certificate_type?: string
          created_at?: string
          created_by?: string | null
          employee_id?: string | null
          expiry_date?: string | null
          file_name?: string | null
          file_path?: string | null
          holder_name?: string | null
          holder_type?: string
          id?: string
          issue_date?: string | null
          issuing_authority?: string | null
          notes?: string | null
          status?: string
          title: string
          updated_at?: string
          worker_id?: string | null
        }
        Update: {
          certificate_number?: string | null
          certificate_type?: string
          created_at?: string
          created_by?: string | null
          employee_id?: string | null
          expiry_date?: string | null
          file_name?: string | null
          file_path?: string | null
          holder_name?: string | null
          holder_type?: string
          id?: string
          issue_date?: string | null
          issuing_authority?: string | null
          notes?: string | null
          status?: string
          title?: string
          updated_at?: string
          worker_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "certificates_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      company_policies: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          description: string | null
          effective_date: string | null
          file_name: string | null
          file_path: string | null
          id: string
          is_published: boolean
          title: string
          updated_at: string
          version: string
        }
        Insert: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          effective_date?: string | null
          file_name?: string | null
          file_path?: string | null
          id?: string
          is_published?: boolean
          title: string
          updated_at?: string
          version?: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          effective_date?: string | null
          file_name?: string | null
          file_path?: string | null
          id?: string
          is_published?: boolean
          title?: string
          updated_at?: string
          version?: string
        }
        Relationships: []
      }
      company_resources: {
        Row: {
          brand: string
          created_at: string
          created_by: string | null
          description: string | null
          external_url: string | null
          file_name: string | null
          file_path: string | null
          file_size: number | null
          id: string
          notification_department_id: string | null
          resource_type: string
          title: string
          updated_at: string
        }
        Insert: {
          brand: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          external_url?: string | null
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          notification_department_id?: string | null
          resource_type?: string
          title: string
          updated_at?: string
        }
        Update: {
          brand?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          external_url?: string | null
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          notification_department_id?: string | null
          resource_type?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_resources_notification_department_id_fkey"
            columns: ["notification_department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      department_resources: {
        Row: {
          created_at: string
          created_by: string | null
          department_id: string | null
          description: string | null
          external_url: string | null
          file_path: string | null
          id: string
          resource_type: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          department_id?: string | null
          description?: string | null
          external_url?: string | null
          file_path?: string | null
          id?: string
          resource_type: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          department_id?: string | null
          description?: string | null
          external_url?: string | null
          file_path?: string | null
          id?: string
          resource_type?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "department_resources_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          category: string
          created_at: string
          description: string | null
          employee_id: string | null
          expiry_date: string | null
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          linked_department_ids: string[]
          linked_employee_ids: string[]
          mime_type: string | null
          owner_user_id: string | null
          title: string
          updated_at: string
          uploaded_by: string | null
          visibility: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          employee_id?: string | null
          expiry_date?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          linked_department_ids?: string[]
          linked_employee_ids?: string[]
          mime_type?: string | null
          owner_user_id?: string | null
          title: string
          updated_at?: string
          uploaded_by?: string | null
          visibility?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          employee_id?: string | null
          expiry_date?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          linked_department_ids?: string[]
          linked_employee_ids?: string[]
          mime_type?: string | null
          owner_user_id?: string | null
          title?: string
          updated_at?: string
          uploaded_by?: string | null
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_job_descriptions: {
        Row: {
          description: string | null
          employee_id: string
          file_name: string | null
          file_path: string | null
          updated_at: string
        }
        Insert: {
          description?: string | null
          employee_id: string
          file_name?: string | null
          file_path?: string | null
          updated_at?: string
        }
        Update: {
          description?: string | null
          employee_id?: string
          file_name?: string | null
          file_path?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_job_descriptions_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: true
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          address: string | null
          contract_end_date: string | null
          created_at: string
          created_by: string | null
          date_of_birth: string | null
          department_id: string | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relation: string | null
          emirates_id: string | null
          emirates_id_expiry: string | null
          employee_code: string | null
          employment_type: string
          extension_number: string | null
          full_name: string
          gender: string | null
          id: string
          insurance_expiry: string | null
          job_title: string | null
          joining_date: string | null
          nationality: string | null
          notes: string | null
          passport_expiry: string | null
          passport_number: string | null
          phone: string | null
          photo_url: string | null
          salary: number | null
          status: string
          updated_at: string
          visa_expiry: string | null
          visa_number: string | null
        }
        Insert: {
          address?: string | null
          contract_end_date?: string | null
          created_at?: string
          created_by?: string | null
          date_of_birth?: string | null
          department_id?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relation?: string | null
          emirates_id?: string | null
          emirates_id_expiry?: string | null
          employee_code?: string | null
          employment_type?: string
          extension_number?: string | null
          full_name: string
          gender?: string | null
          id?: string
          insurance_expiry?: string | null
          job_title?: string | null
          joining_date?: string | null
          nationality?: string | null
          notes?: string | null
          passport_expiry?: string | null
          passport_number?: string | null
          phone?: string | null
          photo_url?: string | null
          salary?: number | null
          status?: string
          updated_at?: string
          visa_expiry?: string | null
          visa_number?: string | null
        }
        Update: {
          address?: string | null
          contract_end_date?: string | null
          created_at?: string
          created_by?: string | null
          date_of_birth?: string | null
          department_id?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relation?: string | null
          emirates_id?: string | null
          emirates_id_expiry?: string | null
          employee_code?: string | null
          employment_type?: string
          extension_number?: string | null
          full_name?: string
          gender?: string | null
          id?: string
          insurance_expiry?: string | null
          job_title?: string | null
          joining_date?: string | null
          nationality?: string | null
          notes?: string | null
          passport_expiry?: string | null
          passport_number?: string | null
          phone?: string | null
          photo_url?: string | null
          salary?: number | null
          status?: string
          updated_at?: string
          visa_expiry?: string | null
          visa_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      leaves: {
        Row: {
          created_at: string
          created_by: string | null
          department_id: string | null
          employee_id: string | null
          end_date: string
          extended_end_date: string | null
          handover: string | null
          id: string
          leave_type: string
          legacy_status: string | null
          original_end_date: string
          person_name: string
          person_type: string
          remarks: string | null
          start_date: string
          status: string
          updated_at: string
          worker_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          department_id?: string | null
          employee_id?: string | null
          end_date: string
          extended_end_date?: string | null
          handover?: string | null
          id?: string
          leave_type?: string
          legacy_status?: string | null
          original_end_date: string
          person_name: string
          person_type?: string
          remarks?: string | null
          start_date: string
          status?: string
          updated_at?: string
          worker_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          department_id?: string | null
          employee_id?: string | null
          end_date?: string
          extended_end_date?: string | null
          handover?: string | null
          id?: string
          leave_type?: string
          legacy_status?: string | null
          original_end_date?: string
          person_name?: string
          person_type?: string
          remarks?: string | null
          start_date?: string
          status?: string
          updated_at?: string
          worker_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leaves_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leaves_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leaves_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      news_categories: {
        Row: {
          name: string
        }
        Insert: {
          name: string
        }
        Update: {
          name?: string
        }
        Relationships: []
      }
      news_posts: {
        Row: {
          attachment_mime_type: string | null
          attachment_name: string | null
          attachment_path: string | null
          attachment_size: number | null
          attachments: Json
          author_id: string | null
          body: string
          category: string
          created_at: string
          id: string
          is_published: boolean
          published_at: string | null
          summary: string | null
          title: string
          updated_at: string
        }
        Insert: {
          attachment_mime_type?: string | null
          attachment_name?: string | null
          attachment_path?: string | null
          attachment_size?: number | null
          attachments?: Json
          author_id?: string | null
          body: string
          category?: string
          created_at?: string
          id?: string
          is_published?: boolean
          published_at?: string | null
          summary?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          attachment_mime_type?: string | null
          attachment_name?: string | null
          attachment_path?: string | null
          attachment_size?: number | null
          attachments?: Json
          author_id?: string | null
          body?: string
          category?: string
          created_at?: string
          id?: string
          is_published?: boolean
          published_at?: string | null
          summary?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      org_chart_nodes: {
        Row: {
          chart_id: string
          created_at: string
          description: string | null
          employee_id: string | null
          extra_parent_ids: string[]
          id: string
          node_type: string
          parent_id: string | null
          person_name: string
          role_title: string | null
          sort_order: number
          updated_at: string
          worker_id: string | null
        }
        Insert: {
          chart_id: string
          created_at?: string
          description?: string | null
          employee_id?: string | null
          extra_parent_ids?: string[]
          id?: string
          node_type?: string
          parent_id?: string | null
          person_name: string
          role_title?: string | null
          sort_order?: number
          updated_at?: string
          worker_id?: string | null
        }
        Update: {
          chart_id?: string
          created_at?: string
          description?: string | null
          employee_id?: string | null
          extra_parent_ids?: string[]
          id?: string
          node_type?: string
          parent_id?: string | null
          person_name?: string
          role_title?: string | null
          sort_order?: number
          updated_at?: string
          worker_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "org_chart_nodes_chart_id_fkey"
            columns: ["chart_id"]
            isOneToOne: false
            referencedRelation: "org_charts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "org_chart_nodes_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "org_chart_nodes_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "org_chart_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "org_chart_nodes_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      org_charts: {
        Row: {
          created_at: string
          created_by: string | null
          created_by_name: string | null
          department_id: string | null
          description: string | null
          id: string
          is_published: boolean
          name: string
          revision_number: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          created_by_name?: string | null
          department_id?: string | null
          description?: string | null
          id?: string
          is_published?: boolean
          name: string
          revision_number?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          created_by_name?: string | null
          department_id?: string | null
          description?: string | null
          id?: string
          is_published?: boolean
          name?: string
          revision_number?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_charts_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          module: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          module: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          module?: string
        }
        Relationships: []
      }
      portal_notice_reads: {
        Row: {
          notice_id: string
          read_at: string
          user_id: string
        }
        Insert: {
          notice_id: string
          read_at?: string
          user_id: string
        }
        Update: {
          notice_id?: string
          read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "portal_notice_reads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_notification_recipients: {
        Row: {
          created_at: string
          created_by: string | null
          event_type: string
          id: string
          role_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          event_type: string
          id?: string
          role_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          event_type?: string
          id?: string
          role_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portal_notification_recipients_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_notification_recipients_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_notifications: {
        Row: {
          body: string | null
          created_at: string
          created_by: string | null
          dedupe_key: string | null
          event_date: string
          id: string
          is_read: boolean
          link: string | null
          recipient_user_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          created_by?: string | null
          dedupe_key?: string | null
          event_date?: string
          id?: string
          is_read?: boolean
          link?: string | null
          recipient_user_id?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          created_by?: string | null
          dedupe_key?: string | null
          event_date?: string
          id?: string
          is_read?: boolean
          link?: string | null
          recipient_user_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "portal_notifications_recipient_user_id_fkey"
            columns: ["recipient_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_staff_accounts: {
        Row: {
          employee_id: string | null
          linked_at: string
          linked_by: string | null
          user_id: string
          worker_id: string | null
        }
        Insert: {
          employee_id?: string | null
          linked_at?: string
          linked_by?: string | null
          user_id: string
          worker_id?: string | null
        }
        Update: {
          employee_id?: string | null
          linked_at?: string
          linked_by?: string | null
          user_id?: string
          worker_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portal_staff_accounts_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: true
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_staff_accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_staff_accounts_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: true
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_upload_events: {
        Row: {
          category: string
          created_at: string
          id: string
          route: string
          section: string
          source_id: string
          source_table: string
          title: string
          uploader_department: string
          uploader_name: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          route: string
          section: string
          source_id: string
          source_table: string
          title: string
          uploader_department: string
          uploader_name: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          route?: string
          section?: string
          source_id?: string
          source_table?: string
          title?: string
          uploader_department?: string
          uploader_name?: string
        }
        Relationships: []
      }
      portal_upload_reads: {
        Row: {
          event_id: string
          read_at: string
          user_id: string
        }
        Insert: {
          event_id: string
          read_at?: string
          user_id: string
        }
        Update: {
          event_id?: string
          read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "portal_upload_reads_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "portal_upload_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_upload_reads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_workflow_events: {
        Row: {
          body: string | null
          created_at: string
          id: string
          link: string
          recipient_id: string
          source_id: string
          title: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string
          recipient_id: string
          source_id: string
          title: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string
          recipient_id?: string
          source_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "portal_workflow_events_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          department_id: string | null
          email: string
          employee_code: string | null
          full_name: string | null
          id: string
          job_title: string | null
          last_login_at: string | null
          phone: string | null
          status: Database["public"]["Enums"]["user_status"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          department_id?: string | null
          email: string
          employee_code?: string | null
          full_name?: string | null
          id: string
          job_title?: string | null
          last_login_at?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          department_id?: string | null
          email?: string
          employee_code?: string | null
          full_name?: string | null
          id?: string
          job_title?: string | null
          last_login_at?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          created_at: string
          permission_id: string
          role_id: string
        }
        Insert: {
          created_at?: string
          permission_id: string
          role_id: string
        }
        Update: {
          created_at?: string
          permission_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_system: boolean
          name: string
          rank: number
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_system?: boolean
          name: string
          rank?: number
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_system?: boolean
          name?: string
          rank?: number
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      staff_files: {
        Row: {
          category: string
          created_at: string
          employee_id: string
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          mime_type: string | null
        }
        Insert: {
          category: string
          created_at?: string
          employee_id: string
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          employee_id?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_files_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      travel_visas: {
        Row: {
          created_at: string
          created_by: string | null
          destination: string
          employee_id: string | null
          expiry_date: string | null
          id: string
          issue_date: string | null
          notes: string | null
          person_name: string
          status: string
          updated_at: string
          visa_type: string | null
          worker_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          destination: string
          employee_id?: string | null
          expiry_date?: string | null
          id?: string
          issue_date?: string | null
          notes?: string | null
          person_name: string
          status?: string
          updated_at?: string
          visa_type?: string | null
          worker_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          destination?: string
          employee_id?: string | null
          expiry_date?: string | null
          id?: string
          issue_date?: string | null
          notes?: string | null
          person_name?: string
          status?: string
          updated_at?: string
          visa_type?: string | null
          worker_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "travel_visas_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "travel_visas_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      user_permissions: {
        Row: {
          created_at: string
          granted: boolean
          permission_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          granted?: boolean
          permission_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          granted?: boolean
          permission_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          role_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          role_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          role_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_allocations: {
        Row: {
          allocated_to: string
          created_at: string
          created_by: string | null
          department_id: string | null
          employee_id: string | null
          end_date: string | null
          id: string
          notes: string | null
          plate_number: string | null
          start_date: string | null
          updated_at: string
          vehicle: string
          worker_id: string | null
        }
        Insert: {
          allocated_to: string
          created_at?: string
          created_by?: string | null
          department_id?: string | null
          employee_id?: string | null
          end_date?: string | null
          id?: string
          notes?: string | null
          plate_number?: string | null
          start_date?: string | null
          updated_at?: string
          vehicle: string
          worker_id?: string | null
        }
        Update: {
          allocated_to?: string
          created_at?: string
          created_by?: string | null
          department_id?: string | null
          employee_id?: string | null
          end_date?: string | null
          id?: string
          notes?: string | null
          plate_number?: string | null
          start_date?: string | null
          updated_at?: string
          vehicle?: string
          worker_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_allocations_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_allocations_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_allocations_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      worker_files: {
        Row: {
          category: string
          created_at: string
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          mime_type: string | null
          worker_id: string
        }
        Insert: {
          category: string
          created_at?: string
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          worker_id: string
        }
        Update: {
          category?: string
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "worker_files_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      workers: {
        Row: {
          category: string | null
          contract_end_date: string | null
          created_at: string
          created_by: string | null
          department_id: string | null
          emirates_id: string | null
          emirates_id_expiry: string | null
          employment_type: string
          full_name: string
          id: string
          insurance_expiry: string | null
          joining_date: string | null
          labour_card_expiry: string | null
          labour_card_number: string | null
          nationality: string | null
          notes: string | null
          passport_expiry: string | null
          passport_number: string | null
          phone: string | null
          photo_url: string | null
          site: string | null
          status: string
          trade: string | null
          updated_at: string
          visa_expiry: string | null
          visa_number: string | null
          worker_code: string | null
        }
        Insert: {
          category?: string | null
          contract_end_date?: string | null
          created_at?: string
          created_by?: string | null
          department_id?: string | null
          emirates_id?: string | null
          emirates_id_expiry?: string | null
          employment_type?: string
          full_name: string
          id?: string
          insurance_expiry?: string | null
          joining_date?: string | null
          labour_card_expiry?: string | null
          labour_card_number?: string | null
          nationality?: string | null
          notes?: string | null
          passport_expiry?: string | null
          passport_number?: string | null
          phone?: string | null
          photo_url?: string | null
          site?: string | null
          status?: string
          trade?: string | null
          updated_at?: string
          visa_expiry?: string | null
          visa_number?: string | null
          worker_code?: string | null
        }
        Update: {
          category?: string | null
          contract_end_date?: string | null
          created_at?: string
          created_by?: string | null
          department_id?: string | null
          emirates_id?: string | null
          emirates_id_expiry?: string | null
          employment_type?: string
          full_name?: string
          id?: string
          insurance_expiry?: string | null
          joining_date?: string | null
          labour_card_expiry?: string | null
          labour_card_number?: string | null
          nationality?: string | null
          notes?: string | null
          passport_expiry?: string | null
          passport_number?: string | null
          phone?: string | null
          photo_url?: string | null
          site?: string | null
          status?: string
          trade?: string | null
          updated_at?: string
          visa_expiry?: string | null
          visa_number?: string | null
          worker_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workers_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      ai_my_staff_record: { Args: never; Returns: Json }
      bump_org_chart_revision: { Args: { _chart_id: string }; Returns: number }
      has_permission: {
        Args: { _code: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: { _role_slug: string; _user_id: string }
        Returns: boolean
      }
      is_active_user: { Args: { _user_id: string }; Returns: boolean }
      my_notification_feed: {
        Args: never
        Returns: {
          body: string
          event_date: string
          id: string
          is_read: boolean
          link: string
          title: string
          type: string
        }[]
      }
      my_permissions: {
        Args: never
        Returns: {
          code: string
        }[]
      }
      portal_accommodation_directory: {
        Args: never
        Returns: {
          employee: Json
          id: string
          notes: string
          person_type: string
          property: Json
          property_id: string
          property_name: string
          room_number: string
        }[]
      }
      portal_accommodation_properties: {
        Args: never
        Returns: {
          address: string
          id: string
          is_active: boolean
          name: string
          person_type: string
        }[]
      }
      portal_bulk_import_v7: {
        Args: { _kind: string; _rows: Json }
        Returns: number
      }
      portal_can_read_staff_photo: { Args: { _path: string }; Returns: boolean }
      portal_can_view_private_staff: { Args: never; Returns: boolean }
      portal_delete_person: {
        Args: { _confirmation: string; _id: string; _kind: string }
        Returns: undefined
      }
      portal_department_access: {
        Args: { _department_id: string }
        Returns: boolean
      }
      portal_document_access: { Args: { _id: string }; Returns: boolean }
      portal_document_link_options: { Args: never; Returns: Json }
      portal_document_row_access: {
        Args: {
          _category: string
          _employee_id: string
          _linked_department_ids: string[]
          _linked_employee_ids: string[]
          _owner_user_id: string
          _uploaded_by: string
          _visibility: string
        }
        Returns: boolean
      }
      portal_import_date: { Args: { _value: string }; Returns: string }
      portal_is_hr_admin: { Args: { _user?: string }; Returns: boolean }
      portal_is_resource_file: { Args: { _path: string }; Returns: boolean }
      portal_job_description_access: { Args: never; Returns: boolean }
      portal_legacy_notification_feed: {
        Args: never
        Returns: {
          body: string
          event_date: string
          id: string
          is_read: boolean
          link: string
          title: string
          type: string
        }[]
      }
      portal_link_staff: {
        Args: { _staff_id: string; _staff_kind: string; _user_id: string }
        Returns: undefined
      }
      portal_mark_all_notifications_read: { Args: never; Returns: number }
      portal_mark_notices_read: { Args: { _ids: string[] }; Returns: undefined }
      portal_may_delete_document_file: {
        Args: { _path: string }
        Returns: boolean
      }
      portal_may_read_company_file: {
        Args: { _path: string }
        Returns: boolean
      }
      portal_may_read_document_file: {
        Args: { _path: string }
        Returns: boolean
      }
      portal_my_department: { Args: never; Returns: string }
      portal_my_important_dates: {
        Args: never
        Returns: {
          document_type: string
          expiry_date: string
          staff_kind: string
          staff_name: string
        }[]
      }
      portal_owns_staff: {
        Args: { _id: string; _kind: string }
        Returns: boolean
      }
      portal_passport_register: {
        Args: never
        Returns: {
          full_name: string
          passport_expiry: string
          passport_number: string
          staff_code: string
          staff_id: string
          staff_kind: string
        }[]
      }
      portal_private_staff: {
        Args: { _all?: boolean }
        Returns: {
          department_id: string
          emirates_id_expiry: string
          full_name: string
          insurance_expiry: string
          labour_card_expiry: string
          passport_expiry: string
          passport_number: string
          staff_code: string
          staff_id: string
          staff_kind: string
          visa_expiry: string
        }[]
      }
      portal_save_accommodation: {
        Args: {
          _employee_id: string
          _id: string
          _notes: string
          _property_id: string
          _room_number: string
        }
        Returns: string
      }
      portal_save_accommodation_property: {
        Args: { _address: string; _id: string; _name: string }
        Returns: string
      }
      portal_save_accommodation_property_v7: {
        Args: {
          _address: string
          _id: string
          _name: string
          _person_type: string
        }
        Returns: string
      }
      portal_save_accommodation_v7: {
        Args: {
          _id: string
          _notes: string
          _person_id: string
          _person_type: string
          _property_id: string
          _room_number: string
        }
        Returns: string
      }
      portal_set_user_permissions: {
        Args: { _overrides: Json; _user_id: string }
        Returns: undefined
      }
      portal_staff_directory: {
        Args: never
        Returns: {
          department_id: string
          department_name: string
          job_title: string
          linked_user_id: string
          staff_code: string
          staff_id: string
          staff_kind: string
          staff_name: string
        }[]
      }
      portal_staff_identity: {
        Args: { _all?: boolean }
        Returns: {
          department_id: string
          full_name: string
          job_title: string
          phone: string
          photo_url: string
          staff_code: string
          staff_id: string
          staff_kind: string
        }[]
      }
      portal_sync_notifications: { Args: never; Returns: undefined }
      portal_travel_register: {
        Args: never
        Returns: {
          destination: string
          employee: Json
          employee_id: string
          expiry_date: string
          id: string
          issue_date: string
          notes: string
          status: string
          visa_type: string
        }[]
      }
      portal_unread_notification_count: { Args: never; Returns: number }
      portal_update_worker_site: {
        Args: { _id: string; _site: string }
        Returns: undefined
      }
      portal_vehicle_register: {
        Args: never
        Returns: {
          employee: Json
          end_date: string
          id: string
          notes: string
          plate_number: string
          start_date: string
          vehicle: string
        }[]
      }
      portal_worker_directory_v6: {
        Args: never
        Returns: {
          category: string
          department_id: string
          employment_type: string
          full_name: string
          id: string
          phone: string
          photo_url: string
          site: string
          status: string
          trade: string
          worker_code: string
        }[]
      }
      portal_workflow_notices: {
        Args: never
        Returns: {
          body: string
          event_date: string
          id: string
          is_read: boolean
          link: string
          title: string
          type: string
        }[]
      }
      staff_directory: {
        Args: never
        Returns: {
          department_id: string
          email: string
          employee_code: string
          employment_type: string
          extension_number: string
          full_name: string
          id: string
          job_title: string
          phone: string
          photo_url: string
          status: string
        }[]
      }
      worker_directory: {
        Args: never
        Returns: {
          department_id: string
          employment_type: string
          full_name: string
          id: string
          phone: string
          photo_url: string
          site: string
          status: string
          trade: string
          worker_code: string
        }[]
      }
    }
    Enums: {
      user_status: "active" | "inactive" | "suspended"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      user_status: ["active", "inactive", "suspended"],
    },
  },
} as const
