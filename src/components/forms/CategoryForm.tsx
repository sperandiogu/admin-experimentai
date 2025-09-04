import React, { useState } from 'react';
import { Tag } from 'lucide-react';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import { useCreateQuestionCategory, useUpdateQuestionCategory } from '../../hooks/useSupabase';
import { useToast } from '../../hooks/useToast';
import type { QuestionCategory } from '../../types';

interface CategoryFormProps {
  category?: QuestionCategory;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CategoryForm({ category, onSuccess, onCancel }: CategoryFormProps) {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    description: category?.description || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const createCategory = useCreateQuestionCategory();
  const updateCategory = useUpdateQuestionCategory();
  const { showToast } = useToast();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome da categoria é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      if (category) {
        await updateCategory.mutateAsync({
          id: category.id,
          ...formData
        });
        showToast('Categoria atualizada com sucesso!', 'success');
      } else {
        await createCategory.mutateAsync(formData);
        showToast('Categoria criada com sucesso!', 'success');
      }
      onSuccess();
    } catch (error) {
      showToast('Erro ao salvar categoria', 'error');
    }
  };

  const isLoading = createCategory.isPending || updateCategory.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Nome da Categoria"
        value={formData.name}
        onChange={(value) => setFormData({ ...formData, name: value })}
        required
        error={errors.name}
        placeholder="Ex: Qualidade do Produto, Atendimento"
      />

      <Textarea
        label="Descrição"
        value={formData.description}
        onChange={(value) => setFormData({ ...formData, description: value })}
        placeholder="Descrição opcional da categoria..."
        rows={3}
      />

      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? 'Salvando...' : category ? 'Atualizar Categoria' : 'Criar Categoria'}
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