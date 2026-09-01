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
      audit_logs: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          created_at: string
          id: string
          module: string
          new_value: Json | null
          old_value: Json | null
          record_id: string | null
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          id?: string
          module: string
          new_value?: Json | null
          old_value?: Json | null
          record_id?: string | null
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          id?: string
          module?: string
          new_value?: Json | null
          old_value?: Json | null
          record_id?: string | null
        }
        Relationships: []
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
      news_posts: {
        Row: {
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
      workers: {
        Row: {
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
      has_permission: {
        Args: { _code: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: { _role_slug: string; _user_id: string }
        Returns: boolean
      }
      is_active_user: { Args: { _user_id: string }; Returns: boolean }
      my_permissions: {
        Args: never
        Returns: {
          code: string
        }[]
      }
      staff_directory: {
        Args: never
        Returns: {
          department_id: string
          email: string
          employee_code: string
          employment_type: string
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
      user_status: ["active", "inactive", "suspended"],
    },
  },
} as const
