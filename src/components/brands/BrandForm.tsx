import React, { useState } from 'react';
import { DollarSign, User, Calendar } from 'lucide-react';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { useCreateBrand, useUpdateBrand, useBrandStatuses, type Brand } from '../../hooks/useBrands';
import { useToast } from '../../hooks/useToast';

interface BrandFormProps {
  brand?: Brand;
  defaultStatusId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function BrandForm({ brand, defaultStatusId, onSuccess, onCancel }: BrandFormProps) {
  const { data: statuses = [] } = useBrandStatuses();
  const createBrand = useCreateBrand();
  const updateBrand = useUpdateBrand();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: brand?.name || '',
    description: brand?.description || '',
    status_id: brand?.status_id || defaultStatusId || '',
    responsible: brand?.responsible || '',
    value: brand?.value || 0,
    deadline: brand?.deadline ? new Date(brand.deadline).toISOString().split('T')[0] : '',
    order: brand?.order || 0
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const statusOptions = statuses.map(status => ({
    value: status.id,
    label: status.name
  }));

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.status_id) {
      newErrors.status_id = 'Status é obrigatório';
    }

    if (formData.value < 0) {
      newErrors.value = 'Valor não pode ser negativo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const brandData = {
        ...formData,
        deadline: formData.deadline || null
      };

      if (brand) {
        await updateBrand.mutateAsync({
          id: brand.id,
          ...brandData
        });
        showToast('Marca atualizada com sucesso!', 'success');
      } else {
        await createBrand.mutateAsync(brandData);
        showToast('Marca criada com sucesso!', 'success');
      }
      
      onSuccess();
    } catch (error) {
      showToast('Erro ao salvar marca', 'error');
    }
  };

  const isLoading = createBrand.isPending || updateBrand.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Nome da Marca"
          value={formData.name}
          onChange={(value) => setFormData({ ...formData, name: value })}
          required
          error={errors.name}
          placeholder="Ex: Nike, Adidas, Apple..."
        />

        <Select
          label="Status"
          value={formData.status_id}
          onChange={(value) => setFormData({ ...formData, status_id: value })}
          options={statusOptions}
          placeholder="Selecione um status"
          required
          error={errors.status_id}
        />
      </div>

      <Textarea
        label="Descrição/Observações"
        value={formData.description}
        onChange={(value) => setFormData({ ...formData, description: value })}
        placeholder="Adicione observações sobre a marca, negociação, etc..."
        rows={4}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="Responsável"
          value={formData.responsible}
          onChange={(value) => setFormData({ ...formData, responsible: value })}
          placeholder="Nome do responsável"
        />

        <Input
          label="Valor (R$)"
          type="number"
          step="0.01"
          min="0"
          value={formData.value.toString()}
          onChange={(value) => setFormData({ ...formData, value: parseFloat(value) || 0 })}
          error={errors.value}
          placeholder="0,00"
        />

        <Input
          label="Prazo/Deadline"
          type="date"
          value={formData.deadline}
          onChange={(value) => setFormData({ ...formData, deadline: value })}
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? 'Salvando...' : brand ? 'Atualizar Marca' : 'Criar Marca'}
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