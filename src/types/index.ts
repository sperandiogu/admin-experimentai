export interface Customer {
  customer_id: string;
  name: string;
  phone?: string;
  email: string;
  address?: string;
  cpf?: string;
  created_at: string;
  stripe_customer_id?: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  description?: string;
  image_url?: string;
  category?: string;
  created_at: string;
}

export interface Edition {
  edition_id: string;
  edition: string;
  created_at: string;
  updated_at: string;
}

export interface Box {
  id: string;
  theme: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  order_id: string;
  invoice_id?: string;
  customer_id?: string;
  edition?: string;
  brand?: string;
  amount?: number;
  tracking_code?: string;
  tracking_url?: string;
  created_at: string;
  updated_at: string;
  status: string;
  customer?: Customer;
  edition_data?: Edition;
  invoice?: Invoice;
}

export interface Invoice {
  invoice_id: string;
  customer_id?: string;
  amount?: number;
  status?: string;
  payment_method?: string;
  created_at: string;
  last_card_number?: string;
  invoice_link?: string;
  updated_at: string;
  customer?: Customer;
}

export interface ProductEdition {
  edition_id: string;
  product_id: string;
}

export interface WebhookConfig {
  id: number;
  url: string;
  created_at: string;
}

export interface QuestionCategory {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface QuestionOption {
  id: string;
  question_id: string;
  option_text: string;
  option_value: number;
  order_index: number;
  created_at: string;
}

export interface Question {
  id: string;
  category_id: string;
  product_id?: string;
  question_text: string;
  question_type: 'multiple_choice' | 'emoji_rating' | 'text' | 'boolean';
  is_required: boolean;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: QuestionCategory;
  product?: Product;
  options?: QuestionOption[];
}