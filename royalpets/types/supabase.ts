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
      costumes: {
        Row: {
          category: string
          created_at: string | null
          description_en: string | null
          description_nl: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name_en: string
          name_nl: string
          prompt_template: string | null
          slug: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description_en?: string | null
          description_nl?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name_en: string
          name_nl: string
          prompt_template?: string | null
          slug: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description_en?: string | null
          description_nl?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name_en?: string
          name_nl?: string
          prompt_template?: string | null
          slug?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          amount_subtotal: number
          amount_total: number
          created_at: string | null
          currency: string | null
          customer_email: string
          customer_name: string | null
          download_expires_at: string | null
          download_urls: Json | null
          id: string
          metadata: Json | null
          notes: string | null
          portrait_id: string | null
          print_partner_order_id: string | null
          product_tier: Database["public"]["Enums"]["product_tier"]
          session_id: string | null
          shipping_address: Json | null
          shipping_carrier: string | null
          shipping_estimated_delivery: string | null
          shipping_tracking_number: string | null
          status: Database["public"]["Enums"]["order_status"] | null
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          tax_amount: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount_subtotal: number
          amount_total: number
          created_at?: string | null
          currency?: string | null
          customer_email: string
          customer_name?: string | null
          download_expires_at?: string | null
          download_urls?: Json | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          portrait_id?: string | null
          print_partner_order_id?: string | null
          product_tier: Database["public"]["Enums"]["product_tier"]
          session_id?: string | null
          shipping_address?: Json | null
          shipping_carrier?: string | null
          shipping_estimated_delivery?: string | null
          shipping_tracking_number?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          tax_amount: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount_subtotal?: number
          amount_total?: number
          created_at?: string | null
          currency?: string | null
          customer_email?: string
          customer_name?: string | null
          download_expires_at?: string | null
          download_urls?: Json | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          portrait_id?: string | null
          print_partner_order_id?: string | null
          product_tier?: Database["public"]["Enums"]["product_tier"]
          session_id?: string | null
          shipping_address?: Json | null
          shipping_carrier?: string | null
          shipping_estimated_delivery?: string | null
          shipping_tracking_number?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          tax_amount?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_portrait_id_fkey"
            columns: ["portrait_id"]
            isOneToOne: false
            referencedRelation: "portraits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      portraits: {
        Row: {
          costume_id: string | null
          created_at: string | null
          expires_at: string | null
          generated_images: Json | null
          generation_error: string | null
          id: string
          is_favorite: boolean | null
          metadata: Json | null
          original_image_path: string
          original_image_url: string
          pet_name: string | null
          pet_type: Database["public"]["Enums"]["pet_type"] | null
          selected_image_index: number | null
          session_id: string | null
          status: Database["public"]["Enums"]["portrait_status"] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          costume_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          generated_images?: Json | null
          generation_error?: string | null
          id?: string
          is_favorite?: boolean | null
          metadata?: Json | null
          original_image_path: string
          original_image_url: string
          pet_name?: string | null
          pet_type?: Database["public"]["Enums"]["pet_type"] | null
          selected_image_index?: number | null
          session_id?: string | null
          status?: Database["public"]["Enums"]["portrait_status"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          costume_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          generated_images?: Json | null
          generation_error?: string | null
          id?: string
          is_favorite?: boolean | null
          metadata?: Json | null
          original_image_path?: string
          original_image_url?: string
          pet_name?: string | null
          pet_type?: Database["public"]["Enums"]["pet_type"] | null
          selected_image_index?: number | null
          session_id?: string | null
          status?: Database["public"]["Enums"]["portrait_status"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portraits_costume_id_fkey"
            columns: ["costume_id"]
            isOneToOne: false
            referencedRelation: "costumes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portraits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          avatar_url: string | null
          city: string | null
          country: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          is_admin: boolean | null
          phone: string | null
          postal_code: string | null
          updated_at: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          is_admin?: boolean | null
          phone?: string | null
          postal_code?: string | null
          updated_at?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_admin?: boolean | null
          phone?: string | null
          postal_code?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      set_config: {
        Args: {
          parameter: string
          value: string
        }
        Returns: string
      }
    }
    Enums: {
      order_status: "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded"
      pet_type: "dog" | "cat" | "other"
      portrait_status: "pending" | "generating" | "completed" | "failed"
      product_tier: "digital_basic" | "digital_premium" | "print_digital" | "canvas_deluxe"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
