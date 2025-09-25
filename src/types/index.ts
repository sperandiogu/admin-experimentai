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
  option_label: string; // Mudança: option_text -> option_label conforme schema do banco
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

export interface FeedbackSession {
  id: string;
  customer_id?: string;
  box_id?: string;
  user_email?: string;
  session_status: 'in_progress' | 'completed' | 'abandoned';
  completion_badge?: string;
  final_message?: string;
  ip_address?: string;
  user_agent?: string;
  started_at: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  edition_id?: string;
  customer?: Customer;
  box?: Box;
  edition?: Edition;
}

export interface FeedbackAnswer {
  question_id: string;
  question_text: string;
  question_type: string;
  answer: any;
}

export interface ProductFeedback {
  id: string;
  feedback_session_id: string;
  product_id?: string;
  product_name: string;
  created_at: string;
  answers: FeedbackAnswer[];
}

export interface ExperimentaiFeedback {
  id: string;
  feedback_session_id: string;
  created_at: string;
  answers: FeedbackAnswer[];
}

export interface DeliveryFeedback {
  id: string;
  feedback_session_id: string;
  created_at: string;
  answers: FeedbackAnswer[];
}