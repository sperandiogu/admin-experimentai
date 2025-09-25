import React from 'react';
import { MessageSquare, Tag, Package, Star, CheckCircle, X } from 'lucide-react';
import Modal from './ui/Modal';
import Badge from './ui/Badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Question } from '../types';

interface QuestionDetailsModalProps {
  question: Question | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function QuestionDetailsModal({ question, isOpen, onClose }: QuestionDetailsModalProps) {
  if (!question) return null;

  const getQuestionTypeLabel = (type: string) => {
    const types = {
      'multiple_choice': 'Múltipla Escolha',
      'emoji_rating': 'Avaliação',
      'text': 'Texto Livre',
      'boolean': 'Sim/Não'
    };
    return types[type as keyof typeof types] || type;
  };

  const getQuestionTypeIcon = (type: string) => {
    const icons = {
      'multiple_choice': CheckCircle,
      'emoji_rating': Star,
      'text': MessageSquare,
      'boolean': CheckCircle
    };
    return icons[type as keyof typeof icons] || MessageSquare;
  };

  const TypeIcon = getQuestionTypeIcon(question.question_type);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalhes da Pergunta"
      size="lg"
    >
      <div className="space-y-6">
        {/* Question Header */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <TypeIcon className="w-6 h-6 text-blue-600 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {question.question_text}
              </h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="info">{getQuestionTypeLabel(question.question_type)}</Badge>
                <Badge variant={question.is_active ? 'success' : 'default'}>
                  {question.is_active ? 'Ativa' : 'Inativa'}
                </Badge>
                {question.is_required && (
                  <Badge variant="warning">Obrigatória</Badge>
                <span className="text-sm font-medium text-blue-600">Valor: {option.option_value}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Question Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Categoria
              </h4>
              <p className="text-gray-700">{question.category?.name}</p>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Produto
              </h4>
              <p className="text-gray-700">
                {question.product ? `${question.product.name} - ${question.product.brand}` : 'Pergunta geral'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Ordem de Exibição</h4>
              <p className="text-gray-700">{question.order_index}</p>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Data de Criação</h4>
              <p className="text-gray-700">
                {format(new Date(question.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
              </p>
            </div>
          </div>
        </div>

        {/* Options */}
        {question.options && question.options.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Opções de Resposta</h4>
            <div className="space-y-2">
              {question.options
                .sort((a, b) => a.order_index - b.order_index)
                .map((option, index) => (
                  <div key={option.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <span className="text-gray-900">{option.option_text}</span>
                    </div>
                    <span className="text-gray-900">{option.option_label}</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Question Type Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Informações do Tipo</h4>
          <div className="text-sm text-gray-600">
            {question.question_type === 'multiple_choice' && (
              <p>Os clientes poderão selecionar uma das opções disponíveis.</p>
            )}
            {question.question_type === 'emoji_rating' && (
              <p>Os clientes avaliarão usando uma escala de valores numéricos.</p>
            )}
            {question.question_type === 'text' && (
              <p>Os clientes poderão escrever uma resposta em texto livre.</p>
            )}
            {question.question_type === 'boolean' && (
              <p>Os clientes responderão com Sim ou Não.</p>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}