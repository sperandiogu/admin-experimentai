import React, { useState, useEffect } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { useQuestionCategories, useProducts, useCreateQuestion, useUpdateQuestion, useCreateQuestionOption, useUpdateQuestionOption, useDeleteQuestionOption } from '../../hooks/useSupabase';
import { useToast } from '../../hooks/useToast';
import type { Question, QuestionOption } from '../../types';

interface QuestionFormProps {
  question?: Question;
  onSuccess: () => void;
  onCancel: () => void;
}

const questionTypeOptions = [
  { value: 'multiple_choice', label: 'Múltipla Escolha' },
  { value: 'emoji_rating', label: 'Avaliação (1-5)' },
  { value: 'text', label: 'Texto Livre' },
  { value: 'boolean', label: 'Sim/Não' }
];

export default function QuestionForm({ question, onSuccess, onCancel }: QuestionFormProps) {
  const { data: categories = [] } = useQuestionCategories();
  const { data: products = [] } = useProducts();
  const createQuestion = useCreateQuestion();
  const updateQuestion = useUpdateQuestion();
  const createOption = useCreateQuestionOption();
  const updateOption = useUpdateQuestionOption();
  const deleteOption = useDeleteQuestionOption();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    category_id: question?.category_id || '',
    product_id: question?.product_id || '',
    question_text: question?.question_text || '',
    question_type: question?.question_type || 'multiple_choice',
    is_required: question?.is_required || false,
    order_index: question?.order_index || 1,
    is_active: question?.is_active !== undefined ? question.is_active : true
  });

  const [options, setOptions] = useState<Partial<QuestionOption>[]>(
    question?.options || []
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  const categoryOptions = categories.map(cat => ({
    value: cat.id,
    label: cat.name
  }));

  const productOptions = [
    { value: '', label: 'Pergunta geral (todos os produtos)' },
    ...products.map(product => ({
      value: product.id,
      label: `${product.name} - ${product.brand}`
    }))
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.category_id) {
      newErrors.category_id = 'Categoria é obrigatória';
    }

    if (!formData.question_text.trim()) {
      newErrors.question_text = 'Texto da pergunta é obrigatório';
    }

    if (formData.order_index < 1) {
      newErrors.order_index = 'Ordem deve ser maior que 0';
    }

    if ((formData.question_type === 'multiple_choice' || formData.question_type === 'rating') && options.length === 0) {
      newErrors.options = 'Adicione pelo menos uma opção';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      let questionId: string;

      if (question) {
        const updatedQuestion = await updateQuestion.mutateAsync({
          id: question.id,
          ...formData,
          product_id: formData.product_id || null
        });
        questionId = updatedQuestion.id;
      } else {
        const newQuestion = await createQuestion.mutateAsync({
          ...formData,
          product_id: formData.product_id || null
        });
        questionId = newQuestion.id;
      }

      // Handle options for multiple choice and rating questions
      if (formData.question_type === 'multiple_choice' || formData.question_type === 'rating') {
        // Delete removed options
        if (question?.options) {
          const removedOptions = question.options.filter(
            existingOption => !options.some(option => option.id === existingOption.id)
          );
          
          for (const removedOption of removedOptions) {
            await deleteOption.mutateAsync({ id: removedOption.id, questionId });
          }
        }

        // Create or update options
        for (let i = 0; i < options.length; i++) {
          const option = options[i];
          const optionData = {
            question_id: questionId,
            option_text: option.option_text || '',
            option_value: option.option_value || i + 1,
            order_index: i + 1
          };

          if (option.id) {
            await updateOption.mutateAsync({
              id: option.id,
              ...optionData
            });
          } else {
            await createOption.mutateAsync(optionData);
          }
        }
      }

      showToast(question ? 'Pergunta atualizada com sucesso!' : 'Pergunta criada com sucesso!', 'success');
      onSuccess();
    } catch (error) {
      showToast('Erro ao salvar pergunta', 'error');
    }
  };

  const addOption = () => {
    setOptions([...options, {
      option_text: '',
      option_value: options.length + 1,
      order_index: options.length + 1
    }]);
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const updateOptionText = (index: number, text: string) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], option_text: text };
    setOptions(newOptions);
  };

  const updateOptionValue = (index: number, value: number) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], option_value: value };
    setOptions(newOptions);
  };

  // Auto-generate rating options when type changes to rating
  useEffect(() => {
    if (formData.question_type === 'emoji_rating' && options.length === 0) {
      setOptions([
        { option_text: 'Muito Ruim', option_value: 1, order_index: 1 },
        { option_text: 'Ruim', option_value: 2, order_index: 2 },
        { option_text: 'Regular', option_value: 3, order_index: 3 },
        { option_text: 'Bom', option_value: 4, order_index: 4 },
        { option_text: 'Excelente', option_value: 5, order_index: 5 }
      ]);
    } else if (formData.question_type === 'boolean' && options.length === 0) {
      setOptions([
        { option_text: 'Sim', option_value: 1, order_index: 1 },
        { option_text: 'Não', option_value: 0, order_index: 2 }
      ]);
    } else if (formData.question_type === 'text') {
      setOptions([]);
    }
  }, [formData.question_type]);

  const isLoading = createQuestion.isPending || updateQuestion.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Categoria"
          value={formData.category_id}
          onChange={(value) => setFormData({ ...formData, category_id: value })}
          options={categoryOptions}
          placeholder="Selecione uma categoria"
          required
          error={errors.category_id}
        />

        <Select
          label="Produto"
          value={formData.product_id}
          onChange={(value) => setFormData({ ...formData, product_id: value })}
          options={productOptions}
          placeholder="Selecione um produto ou deixe geral"
        />
      </div>

      <Textarea
        label="Texto da Pergunta"
        value={formData.question_text}
        onChange={(value) => setFormData({ ...formData, question_text: value })}
        required
        error={errors.question_text}
        placeholder="Digite a pergunta que será feita aos clientes..."
        rows={3}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select
          label="Tipo de Pergunta"
          value={formData.question_type}
          onChange={(value) => setFormData({ ...formData, question_type: value })}
          options={questionTypeOptions}
          required
        />

        <Input
          label="Ordem de Exibição"
          type="number"
          value={formData.order_index.toString()}
          onChange={(value) => setFormData({ ...formData, order_index: parseInt(value) || 1 })}
          required
          error={errors.order_index}
          placeholder="1"
        />

        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Configurações</label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.is_required}
                onChange={(e) => setFormData({ ...formData, is_required: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Pergunta obrigatória</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Pergunta ativa</span>
            </label>
          </div>
        </div>
      </div>

      {/* Options Section */}
      {(formData.question_type === 'multiple_choice' || formData.question_type === 'emoji_rating' || formData.question_type === 'boolean') && (
        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Opções de Resposta
              </h3>
              {formData.question_type === 'multiple_choice' && (
                <Button type="button" variant="secondary" size="sm" onClick={addOption}>
                  <Plus className="w-4 h-4" />
                  Adicionar Opção
                </Button>
              )}
            </div>

            {errors.options && (
              <p className="text-sm text-red-600 mb-4">{errors.options}</p>
            )}

            <div className="space-y-3">
              {options.map((option, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <GripVertical className="w-4 h-4 text-gray-400" />
                  
                  <div className="flex-1">
                    <Input
                      value={option.option_text || ''}
                      onChange={(value) => updateOptionText(index, value)}
                      placeholder="Texto da opção"
                      required
                    />
                  </div>

                  <div className="w-20">
                    <Input
                      type="number"
                      value={option.option_value?.toString() || ''}
                      onChange={(value) => updateOptionValue(index, parseInt(value) || 0)}
                      placeholder="Valor"
                      required
                    />
                  </div>

                  {formData.question_type === 'multiple_choice' && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOption(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? 'Salvando...' : question ? 'Atualizar Pergunta' : 'Criar Pergunta'}
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