import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface BrandStatus {
  id: string;
  name: string;
  order: number;
  color: string;
  created_at: string;
}

export interface Brand {
  id: string;
  name: string;
  description: string;
  status_id: string;
  responsible: string;
  value: number;
  deadline: string | null;
  order: number;
  created_at: string;
  updated_at: string;
  status?: BrandStatus;
}

export interface BrandHistory {
  id: string;
  brand_id: string;
  from_status_id: string | null;
  to_status_id: string;
  moved_at: string;
  moved_by: string | null;
  from_status?: BrandStatus;
  to_status?: BrandStatus;
}

// Brand Statuses Hooks
export function useBrandStatuses() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['brand-statuses'],
    enabled: !!user,
    queryFn: async () => {
      if (!user) throw new Error('Não autenticado');
      
      const { data, error } = await supabase
        .from('brand_statuses')
        .select('*')
        .order('order', { ascending: true });
      
      if (error) throw error;
      return data as BrandStatus[];
    }
  });
}

export function useCreateBrandStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (status: Omit<BrandStatus, 'id' | 'created_at'>) => {
      console.log('Criando status:', status);
      const { data, error } = await supabase
        .from('brand_statuses')
        .insert(status)
        .select()
        .single();
      
      if (error) {
        console.error('Erro ao criar status:', error);
        throw error;
      }
      console.log('Status criado com sucesso:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brand-statuses'] });
    }
  });
}

export function useUpdateBrandStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (status: Partial<BrandStatus> & { id: string }) => {
      const { data, error } = await supabase
        .from('brand_statuses')
        .update(status)
        .eq('id', status.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brand-statuses'] });
    }
  });
}

export function useDeleteBrandStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (statusId: string) => {
      const { error } = await supabase
        .from('brand_statuses')
        .delete()
        .eq('id', statusId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brand-statuses'] });
    }
  });
}

// Brands Hooks
export function useBrands() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['brands'],
    enabled: !!user,
    queryFn: async () => {
      if (!user) throw new Error('Não autenticado');
      
      const { data, error } = await supabase
        .from('brands')
        .select(`
          *,
          status:brand_statuses(*)
        `)
        .order('order', { ascending: true });
      
      if (error) throw error;
      return data as Brand[];
    }
  });
}

export function useCreateBrand() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (brand: Omit<Brand, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('brands')
        .insert(brand)
        .select(`
          *,
          status:brand_statuses(*)
        `)
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    }
  });
}

export function useUpdateBrand() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (brand: Partial<Brand> & { id: string }) => {
      const { data, error } = await supabase
        .from('brands')
        .update({ ...brand, updated_at: new Date().toISOString() })
        .eq('id', brand.id)
        .select(`
          *,
          status:brand_statuses(*)
        `)
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    }
  });
}

export function useDeleteBrand() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (brandId: string) => {
      const { error } = await supabase
        .from('brands')
        .delete()
        .eq('id', brandId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    }
  });
}

// Brand History Hooks
export function useBrandHistory(brandId?: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['brand-history', brandId],
    enabled: !!user && !!brandId,
    queryFn: async () => {
      if (!user || !brandId) throw new Error('Parâmetros inválidos');
      
      const { data, error } = await supabase
        .from('brand_history')
        .select(`
          *,
          from_status:brand_statuses!brand_history_from_status_id_fkey(*),
          to_status:brand_statuses!brand_history_to_status_id_fkey(*)
        `)
        .eq('brand_id', brandId)
        .order('moved_at', { ascending: false });
      
      if (error) throw error;
      return data as BrandHistory[];
    }
  });
}

export function useMoveBrand() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ 
      brandId, 
      fromStatusId, 
      toStatusId 
    }: { 
      brandId: string; 
      fromStatusId: string | null; 
      toStatusId: string; 
    }) => {
      // Update brand status
      const { error: updateError } = await supabase
        .from('brands')
        .update({ 
          status_id: toStatusId,
          updated_at: new Date().toISOString()
        })
        .eq('id', brandId);
      
      if (updateError) throw updateError;
      
      // Add to history
      const { error: historyError } = await supabase
        .from('brand_history')
        .insert({
          brand_id: brandId,
          from_status_id: fromStatusId,
          to_status_id: toStatusId,
          moved_by: user?.id || null
        });
      
      if (historyError) throw historyError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      queryClient.invalidateQueries({ queryKey: ['brand-history'] });
    }
  });
}