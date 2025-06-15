export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      commissions: {
        Row: {
          commission_amount: number
          commission_percentage: number
          created_at: string
          id: string
          paid_at: string | null
          partner_id: string
          payment_id: string
          status: string | null
          stripe_transfer_id: string | null
          updated_at: string
        }
        Insert: {
          commission_amount: number
          commission_percentage: number
          created_at?: string
          id?: string
          paid_at?: string | null
          partner_id: string
          payment_id: string
          status?: string | null
          stripe_transfer_id?: string | null
          updated_at?: string
        }
        Update: {
          commission_amount?: number
          commission_percentage?: number
          created_at?: string
          id?: string
          paid_at?: string | null
          partner_id?: string
          payment_id?: string
          status?: string | null
          stripe_transfer_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "commissions_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      couple_photos: {
        Row: {
          couple_id: string
          created_at: string
          file_name: string | null
          file_size: number | null
          id: string
          photo_order: number
          photo_url: string
        }
        Insert: {
          couple_id: string
          created_at?: string
          file_name?: string | null
          file_size?: number | null
          id?: string
          photo_order: number
          photo_url: string
        }
        Update: {
          couple_id?: string
          created_at?: string
          file_name?: string | null
          file_size?: number | null
          id?: string
          photo_order?: number
          photo_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "couple_photos_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
        ]
      }
      couples: {
        Row: {
          couple_name: string
          created_at: string
          email: string
          id: string
          message: string | null
          music_url: string | null
          selected_plan: string
          start_date: string
          start_time: string | null
          updated_at: string
          url_slug: string
        }
        Insert: {
          couple_name: string
          created_at?: string
          email: string
          id?: string
          message?: string | null
          music_url?: string | null
          selected_plan: string
          start_date: string
          start_time?: string | null
          updated_at?: string
          url_slug: string
        }
        Update: {
          couple_name?: string
          created_at?: string
          email?: string
          id?: string
          message?: string | null
          music_url?: string | null
          selected_plan?: string
          start_date?: string
          start_time?: string | null
          updated_at?: string
          url_slug?: string
        }
        Relationships: []
      }
      partners: {
        Row: {
          commission_percentage: number | null
          created_at: string
          document: string | null
          email: string
          id: string
          name: string
          phone: string | null
          referral_code: string
          status: string | null
          stripe_account_id: string | null
          updated_at: string
        }
        Insert: {
          commission_percentage?: number | null
          created_at?: string
          document?: string | null
          email: string
          id?: string
          name: string
          phone?: string | null
          referral_code: string
          status?: string | null
          stripe_account_id?: string | null
          updated_at?: string
        }
        Update: {
          commission_percentage?: number | null
          created_at?: string
          document?: string | null
          email?: string
          id?: string
          name?: string
          phone?: string | null
          referral_code?: string
          status?: string | null
          stripe_account_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          couple_id: string | null
          created_at: string
          currency: string
          external_reference: string | null
          form_data: Json | null
          id: string
          partner_id: string | null
          payment_method: string | null
          plan_type: string
          referral_code: string | null
          status: string
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          couple_id?: string | null
          created_at?: string
          currency?: string
          external_reference?: string | null
          form_data?: Json | null
          id?: string
          partner_id?: string | null
          payment_method?: string | null
          plan_type: string
          referral_code?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          couple_id?: string | null
          created_at?: string
          currency?: string
          external_reference?: string | null
          form_data?: Json | null
          id?: string
          partner_id?: string | null
          payment_method?: string | null
          plan_type?: string
          referral_code?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
