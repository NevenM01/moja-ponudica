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
      company_profiles: {
        Row: {
          adresa: string
          created_at: string
          email: string | null
          iban: string | null
          id: string
          logo_url: string | null
          naziv_firme: string
          oib: string
          telefon: string | null
          tenant_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          adresa: string
          created_at?: string
          email?: string | null
          iban?: string | null
          id?: string
          logo_url?: string | null
          naziv_firme: string
          oib: string
          telefon?: string | null
          tenant_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          adresa?: string
          created_at?: string
          email?: string | null
          iban?: string | null
          id?: string
          logo_url?: string | null
          naziv_firme?: string
          oib?: string
          telefon?: string | null
          tenant_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          id: string
          invited_by: string
          status: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          id?: string
          invited_by: string
          status?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          id?: string
          invited_by?: string
          status?: string
        }
        Relationships: []
      }
      offer_item_groups: {
        Row: {
          created_at: string
          id: string
          naziv: string
          offer_id: string
          opis: string | null
          redni_broj: number
          tenant_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          naziv: string
          offer_id: string
          opis?: string | null
          redni_broj?: number
          tenant_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          naziv?: string
          offer_id?: string
          opis?: string | null
          redni_broj?: number
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "offer_item_groups_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_item_groups_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      offer_items: {
        Row: {
          cijena: number
          created_at: string
          group_id: string | null
          id: string
          is_optional: boolean
          jedinica: string
          kolicina: number
          offer_id: string
          opis: string
          tenant_id: string | null
          ukupno: number
        }
        Insert: {
          cijena?: number
          created_at?: string
          group_id?: string | null
          id?: string
          is_optional?: boolean
          jedinica?: string
          kolicina?: number
          offer_id: string
          opis: string
          tenant_id?: string | null
          ukupno?: number
        }
        Update: {
          cijena?: number
          created_at?: string
          group_id?: string | null
          id?: string
          is_optional?: boolean
          jedinica?: string
          kolicina?: number
          offer_id?: string
          opis?: string
          tenant_id?: string | null
          ukupno?: number
        }
        Relationships: [
          {
            foreignKeyName: "offer_items_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "offer_item_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_items_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      offer_template_groups: {
        Row: {
          created_at: string
          id: string
          naziv: string
          opis: string | null
          redni_broj: number
          template_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          naziv: string
          opis?: string | null
          redni_broj?: number
          template_id: string
        }
        Update: {
          created_at?: string
          id?: string
          naziv?: string
          opis?: string | null
          redni_broj?: number
          template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "offer_template_groups_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "offer_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      offer_template_items: {
        Row: {
          cijena: number
          created_at: string
          group_id: string | null
          id: string
          is_optional: boolean
          jedinica: string
          kolicina: number
          opis: string
          template_id: string
        }
        Insert: {
          cijena?: number
          created_at?: string
          group_id?: string | null
          id?: string
          is_optional?: boolean
          jedinica?: string
          kolicina?: number
          opis: string
          template_id: string
        }
        Update: {
          cijena?: number
          created_at?: string
          group_id?: string | null
          id?: string
          is_optional?: boolean
          jedinica?: string
          kolicina?: number
          opis?: string
          template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "offer_template_items_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "offer_template_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_template_items_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "offer_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      offer_templates: {
        Row: {
          created_at: string
          id: string
          napomena: string | null
          naziv: string
          tenant_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          napomena?: string | null
          naziv: string
          tenant_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          napomena?: string | null
          naziv?: string
          tenant_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "offer_templates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      offers: {
        Row: {
          accepted_at: string | null
          client_adresa: string | null
          client_naziv: string
          client_oib: string | null
          created_at: string
          id: string
          napomena: string | null
          objekat_naziv: string | null
          objekat_opis: string | null
          offer_number: string
          rejected_at: string | null
          share_token: string | null
          status: string | null
          tenant_id: string | null
          ukupno: number
          updated_at: string
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          client_adresa?: string | null
          client_naziv: string
          client_oib?: string | null
          created_at?: string
          id?: string
          napomena?: string | null
          objekat_naziv?: string | null
          objekat_opis?: string | null
          offer_number: string
          rejected_at?: string | null
          share_token?: string | null
          status?: string | null
          tenant_id?: string | null
          ukupno?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          client_adresa?: string | null
          client_naziv?: string
          client_oib?: string | null
          created_at?: string
          id?: string
          napomena?: string | null
          objekat_naziv?: string | null
          objekat_opis?: string | null
          offer_number?: string
          rejected_at?: string | null
          share_token?: string | null
          status?: string | null
          tenant_id?: string | null
          ukupno?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "offers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          last_sign_in_at: string | null
          tenant_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          last_sign_in_at?: string | null
          tenant_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          last_sign_in_at?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          accent_color: string | null
          background_style: string | null
          created_at: string | null
          id: string
          logo_url: string | null
          naziv: string
          primary_color: string | null
          slug: string
          trial_ends_at: string | null
        }
        Insert: {
          accent_color?: string | null
          background_style?: string | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          naziv: string
          primary_color?: string | null
          slug: string
          trial_ends_at?: string | null
        }
        Update: {
          accent_color?: string | null
          background_style?: string | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          naziv?: string
          primary_color?: string | null
          slug?: string
          trial_ends_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_tenant_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
