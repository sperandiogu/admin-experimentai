import React, { useState } from 'react';
import { Package, Tag, Image } from 'lucide-react';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { useCreateProduct, useUpdateProduct } from '../../hooks/useSupabase';
import type { Product } from '../../types';

interface ProductFormProps {
  product?: Product;
  onSuccess: () => void;
  onCancel: () => void;
}

const categoryOptions = [
  { value: 'skincare', label: 'Skincare' },
  { value: 'makeup', label: 'Maquiagem' },
  { value: 'haircare', label: 'Cabelo' },
  { value: 'fragrance', label: 'Perfumaria' },
  { value: 'wellness', label: 'Bem-estar' },
  { value: 'accessories', label: 'Acessórios' }
];

export default function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    brand: product?.brand || '',
    description: product?.description || '',
    image_url: product?.image_url || '',
    category: product?.category || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.brand.trim()) {
      newErrors.brand = 'Marca é obrigatória';
    }

    if (formData.image_url && !isValidUrl(formData.image_url)) {
      newErrors.image_url = 'URL da imagem inválida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      if (product) {
        await updateProduct.mutateAsync({
          id: product.id,
          ...formData
        });
      } else {
        await createProduct.mutateAsync(formData);
      }
      onSuccess();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
    }
  };

  const isLoading = createProduct.isPending || updateProduct.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Nome do Produto"
          value={formData.name}
          onChange={(value) => setFormData({ ...formData, name: value })}
          required
          error={errors.name}
          placeholder="Ex: Sérum Vitamina C"
        />

        <Input
          label="Marca"
          value={formData.brand}
          onChange={(value) => setFormData({ ...formData, brand: value })}
          required
          error={errors.brand}
          placeholder="Ex: The Ordinary"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Categoria"
          value={formData.category}
          onChange={(value) => setFormData({ ...formData, category: value })}
          options={categoryOptions}
          placeholder="Selecione uma categoria"
        />

        <Input
          label="URL da Imagem"
          value={formData.image_url}
          onChange={(value) => setFormData({ ...formData, image_url: value })}
          error={errors.image_url}
          placeholder="https://exemplo.com/imagem.jpg"
        />
      </div>

      <Textarea
        label="Descrição"
        value={formData.description}
        onChange={(value) => setFormData({ ...formData, description: value })}
        placeholder="Descrição detalhada do produto..."
        rows={4}
      />

      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? 'Salvando...' : product ? 'Atualizar Produto' : 'Criar Produto'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}