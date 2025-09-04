import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Customer, Product, Edition, Box, Order, Invoice, ProductEdition, WebhookConfig, Question, QuestionCategory, QuestionOption } from '../types';

// Customers
export function useCustomers() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      if (!user) throw new Error('Não autenticado');
      
      const { data, error } = await supabase
        .from('customer')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });
}

// Products
export function useProducts() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      if (!user) throw new Error('Não autenticado');
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });
}

// Editions
export function useEditions() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['editions'],
    queryFn: async () => {
      if (!user) throw new Error('Não autenticado');
      
      const { data, error } = await supabase
        .from('edition')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });
}

// Boxes
export function useBoxes() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['boxes'],
    queryFn: async () => {
      if (!user) throw new Error('Não autenticado');
      
      const { data, error } = await supabase
        .from('boxes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });
}

// Edition Products
export function useEditionProducts(editionId: string) {
  return useQuery({
    queryKey: ['edition-products', editionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_edition')
        .select('*')
        .eq('edition_id', editionId);
      
      if (error) throw error;
      return data;
    }
  });
}

// Webhook Configs
export function useWebhookConfigs() {
  return useQuery({
    queryKey: ['webhook-configs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('webhook_config')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });
}

// Orders
export function useOrders() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      if (!user) throw new Error('Não autenticado');
      
      const { data, error } = await supabase
        .from('order')
        .select(`
          *,
          customer:customer_id(name, email),
          edition:edition(edition),
          invoice:invoice_id(amount, status)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });
}

// Invoices
export function useInvoices() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      if (!user) throw new Error('Não autenticado');
      
      const { data, error } = await supabase
        .from('invoice')
        .select(`
          *,
          customer:customer_id(name, email)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });
}

// Dashboard stats
export function useDashboardStats() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      if (!user) throw new Error('Não autenticado');
      
      const [customers, orders, invoices, products] = await Promise.all([
        supabase.from('customer').select('*', { count: 'exact' }),
        supabase.from('order').select('*', { count: 'exact' }),
        supabase.from('invoice').select('*', { count: 'exact' }),
        supabase.from('products').select('*', { count: 'exact' })
      ]);

      const totalRevenue = await supabase
        .from('invoice')
        .select('amount')
        .eq('status', 'paid');

      const revenue = totalRevenue.data?.reduce((sum, invoice) => sum + ((invoice.amount || 0) / 100), 0) || 0;

      return {
        totalCustomers: customers.count || 0,
        totalOrders: orders.count || 0,
        totalInvoices: invoices.count || 0,
        totalProducts: products.count || 0,
        totalRevenue: revenue
      };
    }
  });
}

// Mutations
export function useCreateCustomer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (customer: any) => {
      const { data, error } = await supabase
        .from('customer')
        .insert(customer)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    }
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (customer: Partial<Customer> & { customer_id: string }) => {
      const { data, error } = await supabase
        .from('customer')
        .update(customer)
        .eq('customer_id', customer.customer_id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    }
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (customerId: string) => {
      const { error } = await supabase
        .from('customer')
        .delete()
        .eq('customer_id', customerId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    }
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (product: any) => {
      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (product: Partial<Product> & { id: string }) => {
      const { data, error } = await supabase
        .from('products')
        .update(product)
        .eq('id', product.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    }
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    }
  });
}

// Edition mutations
export function useCreateEdition() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (edition: Omit<Edition, 'edition_id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('edition')
        .insert(edition)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['editions'] });
    }
  });
}

export function useUpdateEdition() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (edition: Partial<Edition> & { edition_id: string }) => {
      const { data, error } = await supabase
        .from('edition')
        .update({ ...edition, updated_at: new Date().toISOString() })
        .eq('edition_id', edition.edition_id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['editions'] });
    }
  });
}

export function useDeleteEdition() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (editionId: string) => {
      const { error } = await supabase
        .from('edition')
        .delete()
        .eq('edition_id', editionId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['editions'] });
    }
  });
}

// Box mutations
export function useCreateBox() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (box: Omit<Box, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('boxes')
        .insert(box)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boxes'] });
    }
  });
}

export function useUpdateBox() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (box: Partial<Box> & { id: string }) => {
      const { data, error } = await supabase
        .from('boxes')
        .update({ ...box, updated_at: new Date().toISOString() })
        .eq('id', box.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boxes'] });
    }
  });
}

export function useDeleteBox() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (boxId: string) => {
      const { error } = await supabase
        .from('boxes')
        .delete()
        .eq('id', boxId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boxes'] });
    }
  });
}

// Product Edition mutations
export function useAddProductToEdition() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: ProductEdition) => {
      const { error } = await supabase
        .from('product_edition')
        .insert(data);
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['edition-products', variables.edition_id] });
    }
  });
}

export function useRemoveProductFromEdition() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: ProductEdition) => {
      const { error } = await supabase
        .from('product_edition')
        .delete()
        .eq('edition_id', data.edition_id)
        .eq('product_id', data.product_id);
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['edition-products', variables.edition_id] });
    }
  });
}

// Webhook Config mutations
export function useCreateWebhookConfig() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (config: { url: string }) => {
      const { data, error } = await supabase
        .from('webhook_config')
        .insert(config)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhook-configs'] });
    }
  });
}

export function useDeleteWebhookConfig() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('webhook_config')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhook-configs'] });
    }
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const { data, error } = await supabase
        .from('order')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('order_id', orderId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    }
  });
}

// Order tracking update
export function useUpdateOrderTracking() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ orderId, tracking_code, tracking_url }: { 
      orderId: string; 
      tracking_code: string; 
      tracking_url?: string; 
    }) => {
      const { data, error } = await supabase
        .from('order')
        .update({ 
          tracking_code, 
          tracking_url,
          updated_at: new Date().toISOString() 
        })
        .eq('order_id', orderId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    }
  });
}

// Invoice status update
export function useUpdateInvoiceStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ invoiceId, status }: { invoiceId: string; status: string }) => {
      const { data, error } = await supabase
        .from('invoice')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('invoice_id', invoiceId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    }
  });
}

// Questions
export function useQuestions() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['questions'],
    enabled: !!user,
    queryFn: async () => {
      if (!user) throw new Error('Não autenticado');
      
      const { data, error } = await supabase
        .from('questions')
        .select(`
          *,
          category:category_id(id, name),
          product:products(id, name, brand),
          options:question_options(*)
        `)
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });
}

// Question Categories
export function useQuestionCategories() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['question-categories'],
    enabled: !!user,
    queryFn: async () => {
      if (!user) throw new Error('Não autenticado');
      
      const { data, error } = await supabase
        .from('question_categories')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });
}

// Question Options
export function useQuestionOptions(questionId: string) {
  return useQuery({
    queryKey: ['question-options', questionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('question_options')
        .select('*')
        .eq('question_id', questionId)
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!questionId
  });
}

// Question mutations
export function useCreateQuestion() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (question: Omit<Question, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('questions')
        .insert(question)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
    }
  });
}

export function useUpdateQuestion() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (question: Partial<Question> & { id: string }) => {
      const { data, error } = await supabase
        .from('questions')
        .update({ ...question, updated_at: new Date().toISOString() })
        .eq('id', question.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
    }
  });
}

export function useDeleteQuestion() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (questionId: string) => {
      // First delete options
      await supabase
        .from('question_options')
        .delete()
        .eq('question_id', questionId);
      
      // Then delete question
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', questionId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
    }
  });
}

// Category mutations
export function useCreateQuestionCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (category: Omit<QuestionCategory, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('question_categories')
        .insert(category)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['question-categories'] });
    }
  });
}

export function useUpdateQuestionCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (category: Partial<QuestionCategory> & { id: string }) => {
      const { data, error } = await supabase
        .from('question_categories')
        .update({ ...category, updated_at: new Date().toISOString() })
        .eq('id', category.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['question-categories'] });
    }
  });
}

export function useDeleteQuestionCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (categoryId: string) => {
      const { error } = await supabase
        .from('question_categories')
        .delete()
        .eq('id', categoryId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['question-categories'] });
    }
  });
}

// Option mutations
export function useCreateQuestionOption() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (option: Omit<QuestionOption, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('question_options')
        .insert(option)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['question-options', variables.question_id] });
      queryClient.invalidateQueries({ queryKey: ['questions'] });
    }
  });
}

export function useUpdateQuestionOption() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (option: Partial<QuestionOption> & { id: string }) => {
      const { data, error } = await supabase
        .from('question_options')
        .update(option)
        .eq('id', option.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['question-options', data.question_id] });
      queryClient.invalidateQueries({ queryKey: ['questions'] });
    }
  });
}

export function useDeleteQuestionOption() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, questionId }: { id: string; questionId: string }) => {
      const { error } = await supabase
        .from('question_options')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['question-options', variables.questionId] });
      queryClient.invalidateQueries({ queryKey: ['questions'] });
    }
  });
}