import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      boxes: {
        Row: {
          id: string;
          theme: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          theme: string;
          description?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          theme?: string;
          description?: string;
          updated_at?: string;
        };
      };
      customer: {
        Row: {
          customer_id: string;
          name: string;
          phone: string | null;
          email: string;
          address: string | null;
          cpf: string | null;
          created_at: string;
          stripe_customer_id: string | null;
        };
        Insert: {
          customer_id?: string;
          name: string;
          phone?: string;
          email: string;
          address?: string;
          cpf?: string;
          created_at?: string;
          stripe_customer_id?: string;
        };
        Update: {
          customer_id?: string;
          name?: string;
          phone?: string;
          email?: string;
          address?: string;
          cpf?: string;
          stripe_customer_id?: string;
        };
      };
      edition: {
        Row: {
          edition_id: string;
          edition: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          edition_id?: string;
          edition: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          edition_id?: string;
          edition?: string;
          updated_at?: string;
        };
      };
      invoice: {
        Row: {
          invoice_id: string;
          customer_id: string | null;
          amount: number | null;
          status: string | null;
          payment_method: string | null;
          created_at: string;
          last_card_number: string | null;
          invoice_link: string | null;
          updated_at: string;
        };
        Insert: {
          invoice_id?: string;
          customer_id?: string;
          amount?: number;
          status?: string;
          payment_method?: string;
          created_at?: string;
          last_card_number?: string;
          invoice_link?: string;
          updated_at?: string;
        };
        Update: {
          invoice_id?: string;
          customer_id?: string;
          amount?: number;
          status?: string;
          payment_method?: string;
          last_card_number?: string;
          invoice_link?: string;
          updated_at?: string;
        };
      };
      order: {
        Row: {
          order_id: string;
          invoice_id: string | null;
          customer_id: string | null;
          edition: string | null;
          brand: string | null;
          amount: number | null;
          tracking_code: string | null;
          tracking_url: string | null;
          created_at: string;
          updated_at: string;
          status: string;
        };
        Insert: {
          order_id?: string;
          invoice_id?: string;
          customer_id?: string;
          edition?: string;
          brand?: string;
          amount?: number;
          tracking_code?: string;
          tracking_url?: string;
          created_at?: string;
          updated_at?: string;
          status?: string;
        };
        Update: {
          order_id?: string;
          invoice_id?: string;
          customer_id?: string;
          edition?: string;
          brand?: string;
          amount?: number;
          tracking_code?: string;
          tracking_url?: string;
          updated_at?: string;
          status?: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          brand: string;
          description: string | null;
          image_url: string | null;
          category: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          brand: string;
          description?: string;
          image_url?: string;
          category?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          brand?: string;
          description?: string;
          image_url?: string;
          category?: string;
        };
      };
      product_edition: {
        Row: {
          edition_id: string;
          product_id: string;
        };
        Insert: {
          edition_id: string;
          product_id: string;
        };
        Update: {
          edition_id?: string;
          product_id?: string;
        };
      };
      question_categories: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          updated_at?: string;
        };
      };
      question_options: {
        Row: {
          id: string;
          question_id: string;
          option_text: string;
          option_value: number;
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          question_id: string;
          option_text: string;
          option_value: number;
          order_index: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          question_id?: string;
          option_text?: string;
          option_value?: number;
          order_index?: number;
        };
      };
      questions: {
        Row: {
          id: string;
          category_id: string;
          product_id: string | null;
          question_text: string;
          question_type: string;
          is_required: boolean;
          order_index: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id: string;
          product_id?: string;
          question_text: string;
          question_type: string;
          is_required?: boolean;
          order_index: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string;
          product_id?: string;
          question_text?: string;
          question_type?: string;
          is_required?: boolean;
          order_index?: number;
          is_active?: boolean;
          updated_at?: string;
        };
      };
    };
  };
};