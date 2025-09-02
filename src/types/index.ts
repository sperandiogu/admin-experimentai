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