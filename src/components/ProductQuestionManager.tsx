import React, { useState } from 'react';
import { Plus, GripVertical, CreditCard as Edit, Trash2, Package, ArrowUp, ArrowDown } from 'lucide-react';
import Card from './ui/Card';
import Button from './ui/Button';
import Badge from './ui/Badge';
import Modal from './ui/Modal';
import Select from './ui/Select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './ui/Table';
import QuestionForm from './forms/QuestionForm';
import QuestionDetailsModal from './QuestionDetailsModal';
import ConfirmDialog from './ui/ConfirmDialog';
import { useProducts, useQuestions, useDeleteQuestion, useUpdateQuestion } from '../hooks/useSupabase';
import { useToast } from '../hooks/useToast';
import type { Product, Question } from '../types';

interface ProductQuestionManagerProps {
  selectedEdition?: string;
}

export default function ProductQuestionManager({ selectedEdition }: ProductQuestionManagerProps) {
  const { data: products = [] } = useProducts();
  const { data: questions = [] } = useQuestions();
  const deleteQuestion = useDeleteQuestion();
  const updateQuestion = useUpdateQuestion();
  const { showToast } = useToast();

  const [selectedProduct, setSelectedProduct] = useState<string>('general');
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [viewingQuestion, setViewingQuestion] = useState<Question | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; question: Question | null }>({
    isOpen: false,
    question: null
  });

  // Filtrar perguntas por produto selecionado
  const filteredQuestions = questions.filter(question => {
    if (selectedProduct === 'general') {
      return !question.product_id;
    }
    return question.product_id === selectedProduct;
  }).sort((a, b) => a.order_index - b.order_index);

  const productOptions = [
    { value: 'general', label: 'Perguntas Gerais' },
    ...products.map(product => ({
      value: product.id,
      label: `${product.name} - ${product.brand}`
    }))
  ];

  const getQuestionTypeLabel = (type: string) => {
    const types = {
      'multiple_choice': 'Múltipla Escolha',
      'emoji_rating': 'Avaliação',
      'text': 'Texto Livre',
      'boolean': 'Sim/Não'
    };
    return types[type as keyof typeof types] || type;
  };

  const getQuestionTypeColor = (type: string) => {
    const colors = {
      'multiple_choice': 'info',
      'emoji_rating': 'warning',
      'text': 'default',
      'boolean': 'success'
    };
    return colors[type as keyof typeof colors] || 'default';
  };

  const handleMoveQuestion = async (questionId: string, direction: 'up' | 'down') => {
    const currentIndex = filteredQuestions.findIndex(q => q.id === questionId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= filteredQuestions.length) return;

    const currentQuestion = filteredQuestions[currentIndex];
    const targetQuestion = filteredQuestions[newIndex];

    try {
      // Trocar as posições
      await updateQuestion.mutateAsync({
        id: currentQuestion.id,
        order_index: targetQuestion.order_index
      });

      await updateQuestion.mutateAsync({
        id: targetQuestion.id,
        order_index: currentQuestion.order_index
      });

      showToast('Ordem atualizada com sucesso!', 'success');
    } catch (error) {
      showToast('Erro ao atualizar ordem', 'error');
    }
  };

  const handleDeleteQuestion = async () => {
    if (!deleteDialog.question) return;

    try {
      await deleteQuestion.mutateAsync(deleteDialog.question.id);
      showToast('Pergunta excluída com sucesso!', 'success');
      setDeleteDialog({ isOpen: false, question: null });
    } catch (error) {
      showToast('Erro ao excluir pergunta', 'error');
    }
  };

  const handleNewQuestion = () => {
    setEditingQuestion(null);
    setShowQuestionForm(true);
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setShowQuestionForm(true);
  };

  const selectedProductData = products.find(p => p.id === selectedProduct);

  return (
    <div className="space-y-6">
      {/* Header com seletor de produto */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <Select
            label="Produto"
            value={selectedProduct}
            onChange={setSelectedProduct}
            options={productOptions}
          />
        </div>
        <Button onClick={handleNewQuestion}>
          <Plus className="w-4 h-4" />
          Nova Pergunta
        </Button>
      </div>

      {/* Informações do produto selecionado */}
      {selectedProduct !== 'general' && selectedProductData && (
        <Card>
          <div className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <Package className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">{selectedProductData.name}</h3>
              <Badge variant="info">{selectedProductData.brand}</Badge>
            </div>
            {selectedProductData.description && (
              <p className="text-sm text-gray-600">{selectedProductData.description}</p>
            )}
          </div>
        </Card>
      )}

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <div className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{filteredQuestions.length}</p>
              <p className="text-sm text-gray-600">Total</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {filteredQuestions.filter(q => q.is_active).length}
              </p>
              <p className="text-sm text-gray-600">Ativas</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {filteredQuestions.filter(q => q.is_required).length}
              </p>
              <p className="text-sm text-gray-600">Obrigatórias</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {filteredQuestions.filter(q => q.question_type === 'emoji_rating').length}
              </p>
              <p className="text-sm text-gray-600">Avaliações</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Lista de perguntas */}
      <Card>
        <div className="p-6 pb-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Perguntas - {selectedProduct === 'general' ? 'Gerais' : selectedProductData?.name}
          </h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ordem</TableHead>
              <TableHead>Pergunta</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredQuestions.map((question, index) => (
              <TableRow key={question.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-gray-400" />
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMoveQuestion(question.id, 'up')}
                        disabled={index === 0}
                        className="p-1 h-6"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMoveQuestion(question.id, 'down')}
                        disabled={index === filteredQuestions.length - 1}
                        className="p-1 h-6"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </Button>
                    </div>
                    <span className="font-medium text-blue-600">#{question.order_index}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium text-gray-900 max-w-xs truncate">
                      {question.question_text}
                    </div>
                    <div className="text-sm text-gray-500 flex gap-2">
                      {question.is_required && (
                        <Badge variant="error" size="sm">Obrigatória</Badge>
                      )}
                      {question.options && question.options.length > 0 && (
                        <Badge variant="info" size="sm">{question.options.length} opções</Badge>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="info">{question.category?.name}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getQuestionTypeColor(question.question_type) as any}>
                    {getQuestionTypeLabel(question.question_type)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={question.is_active ? 'success' : 'default'}>
                    {question.is_active ? 'Ativa' : 'Inativa'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewingQuestion(question)}
                    >
                      Ver
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditQuestion(question)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteDialog({ isOpen: true, question })}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredQuestions.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma pergunta encontrada
            </h3>
            <p className="text-gray-600 mb-4">
              {selectedProduct === 'general' 
                ? 'Comece criando perguntas gerais que se aplicam a todos os produtos'
                : `Comece criando perguntas específicas para ${selectedProductData?.name}`
              }
            </p>
            <Button onClick={handleNewQuestion}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeira Pergunta
            </Button>
          </div>
        )}
      </Card>

      {/* Question Form Modal */}
      <Modal
        isOpen={showQuestionForm}
        onClose={() => {
          setShowQuestionForm(false);
          setEditingQuestion(null);
        }}
        title={editingQuestion ? 'Editar Pergunta' : 'Nova Pergunta'}
        size="lg"
      >
        <QuestionForm
          question={editingQuestion}
          defaultProductId={selectedProduct === 'general' ? undefined : selectedProduct}
          onSuccess={() => {
            setShowQuestionForm(false);
            setEditingQuestion(null);
          }}
          onCancel={() => {
            setShowQuestionForm(false);
            setEditingQuestion(null);
          }}
        />
      </Modal>

      {/* Question Details Modal */}
      <QuestionDetailsModal
        question={viewingQuestion}
        isOpen={!!viewingQuestion}
        onClose={() => setViewingQuestion(null)}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, question: null })}
        onConfirm={handleDeleteQuestion}
        title="Excluir Pergunta"
        message={`Tem certeza que deseja excluir a pergunta "${deleteDialog.question?.question_text}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        variant="danger"
      />
    </div>
  );
}