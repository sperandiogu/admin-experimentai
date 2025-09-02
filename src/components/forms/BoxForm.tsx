import React, { useState } from 'react';
import { Package } from 'lucide-react';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import { useCreateBox, useUpdateBox } from '../../hooks/useSupabase';
import type { Box } from '../../types';

interface BoxFormProps {
  box?: Box;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function BoxForm({ box, onSuccess, onCancel }: BoxFormProps) {
  const [formData, setFormData] = useState({
    theme: box?.theme || '',
    description: box?.description || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const createBox = useCreateBox();
  const updateBox = useUpdateBox();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.theme.trim()) {
      newErrors.theme = 'Tema é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      if (box) {
        await updateBox.mutateAsync({
          id: box.id,
          ...formData
        });
      } else {
        await createBox.mutateAsync(formData);
      }
      onSuccess();
    } catch (error) {
      console.error('Erro ao salvar caixa:', error);
    }
  };

  const isLoading = createBox.isPending || updateBox.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Tema da Caixa"
        value={formData.theme}
        onChange={(value) => setFormData({ ...formData, theme: value })}
        required
        error={errors.theme}
        placeholder="Ex: Skincare Coreano, Maquiagem Verão"
      />

      <Textarea
        label="Descrição"
        value={formData.description}
        onChange={(value) => setFormData({ ...formData, description: value })}
        placeholder="Descrição detalhada do tema da caixa..."
        rows={4}
      />

      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? 'Salvando...' : box ? 'Atualizar Caixa' : 'Criar Caixa'}
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