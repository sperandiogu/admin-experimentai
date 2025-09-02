import React, { useState } from 'react';
import { Calendar, Package } from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { useCreateEdition, useUpdateEdition } from '../../hooks/useSupabase';
import type { Edition } from '../../types';

interface EditionFormProps {
  edition?: Edition;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function EditionForm({ edition, onSuccess, onCancel }: EditionFormProps) {
  const [formData, setFormData] = useState({
    edition: edition?.edition || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const createEdition = useCreateEdition();
  const updateEdition = useUpdateEdition();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.edition.trim()) {
      newErrors.edition = 'Nome da edição é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      if (edition) {
        await updateEdition.mutateAsync({
          edition_id: edition.edition_id,
          ...formData
        });
      } else {
        await createEdition.mutateAsync(formData);
      }
      onSuccess();
    } catch (error) {
      console.error('Erro ao salvar edição:', error);
    }
  };

  const isLoading = createEdition.isPending || updateEdition.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Nome da Edição"
        value={formData.edition}
        onChange={(value) => setFormData({ ...formData, edition: value })}
        required
        error={errors.edition}
        placeholder="Ex: Janeiro 2025, Verão 2025"
      />

      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? 'Salvando...' : edition ? 'Atualizar Edição' : 'Criar Edição'}
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