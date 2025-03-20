export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      analyses: {
        Row: {
          id: string
          user_id: string
          product_description: string
          ideal_user: Json | null
          outcomes: Json | null
          challenges: Json | null
          solutions: Json | null
          selected_model: string | null
          features: Json | null
          user_journey: Json | null
          analysis_results: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          product_description: string
          ideal_user?: Json | null
          outcomes?: Json | null
          challenges?: Json | null
          solutions?: Json | null
          selected_model?: string | null
          features?: Json | null
          user_journey?: Json | null
          analysis_results?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          product_description?: string
          ideal_user?: Json | null
          outcomes?: Json | null
          challenges?: Json | null
          solutions?: Json | null
          selected_model?: string | null
          features?: Json | null
          user_journey?: Json | null
          analysis_results?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
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
  }
}