import React, { useState } from 'react';
import { Plus, Search, MessageSquare, Edit, Trash2, Eye, Filter, Package, Tag } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import QuestionForm from '../components/forms/QuestionForm';
import CategoryForm from '../components/forms/CategoryForm';
import QuestionDetailsModal from '../components/QuestionDetailsModal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { useQuestions, useQuestionCategories, useDeleteQuestion, useDeleteQuestionCategory } from '../hooks/useSupabase';
import { useToast } from '../hooks/useToast';
import type { Question, QuestionCategory } from '../types';

export default function Feedbacks() {
  const { data: questions = [], isLoading: questionsLoading } = useQuestions();
  const { data: categories = [], isLoading: categoriesLoading } = useQuestionCategories();
  const deleteQuestion = useDeleteQuestion();
  const deleteCategory = useDeleteQuestionCategory();
  const { showToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [productFilter, setProductFilter] = useState('');
  const [activeTab, setActiveTab] = useState<'questions' | 'categories'>('questions');
  
  // Question modals
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [viewingQuestion, setViewingQuestion] = useState<Question | null>(null);
  const [deleteQuestionDialog, setDeleteQuestionDialog] = useState<{ isOpen: boolean; question: Question | null }>({
    isOpen: false,
    question: null
  });

  // Category modals
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<QuestionCategory | null>(null);
  const [deleteCategoryDialog, setDeleteCategoryDialog] = useState<{ isOpen: boolean; category: QuestionCategory | null }>({
    isOpen: false,
    category: null
  });

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.question_text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || question.category_id === categoryFilter;
    const matchesProduct = !productFilter || 
      (productFilter === 'no-product' ? !question.product_id : question.product_id === productFilter);
    return matchesSearch && matchesCategory && matchesProduct;
  });

  const questionStats = {
    total: questions.length,
    active: questions.filter(q => q.is_active).length,
    byProduct: questions.filter(q => q.product_id).length,
    general: questions.filter(q => !q.product_id).length
  };

  const handleDeleteQuestion = async () => {
    if (!deleteQuestionDialog.question) return;

    try {
      await deleteQuestion.mutateAsync(deleteQuestionDialog.question.id);
      showToast('Pergunta excluída com sucesso!', 'success');
      setDeleteQuestionDialog({ isOpen: false, question: null });
    } catch (error) {
      showToast('Erro ao excluir pergunta', 'error');
    }
  };

  const handleDeleteCategory = async () => {
    if (!deleteCategoryDialog.category) return;

    try {
      await deleteCategory.mutateAsync(deleteCategoryDialog.category.id);
      showToast('Categoria excluída com sucesso!', 'success');
      setDeleteCategoryDialog({ isOpen: false, category: null });
    } catch (error) {
      showToast('Erro ao excluir categoria', 'error');
    }
  };

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

  if (questionsLoading || categoriesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sistema de Feedbacks</h1>
          <p className="text-gray-600 mt-1">Gerencie perguntas e categorias de feedback</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => setShowCategoryForm(true)}
          >
            <Tag className="w-4 h-4" />
            Nova Categoria
          </Button>
          <Button onClick={() => setShowQuestionForm(true)}>
            <Plus className="w-4 h-4" />
            Nova Pergunta
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('questions')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'questions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <MessageSquare className="w-4 h-4 inline mr-2" />
            Perguntas ({questions.length})
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'categories'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Tag className="w-4 h-4 inline mr-2" />
            Categorias ({categories.length})
          </button>
        </nav>
      </div>

      {activeTab === 'questions' && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <div className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{questionStats.total}</p>
                  <p className="text-sm text-gray-600">Total</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{questionStats.active}</p>
                  <p className="text-sm text-gray-600">Ativas</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{questionStats.byProduct}</p>
                  <p className="text-sm text-gray-600">Por Produto</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{questionStats.general}</p>
                  <p className="text-sm text-gray-600">Gerais</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <div className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar perguntas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">Todas as categorias</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
                <select
                  value={productFilter}
                  onChange={(e) => setProductFilter(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">Todos os produtos</option>
                  <option value="no-product">Perguntas gerais</option>
                  {Array.from(new Set(questions.filter(q => q.product).map(q => q.product!.id))).map((productId) => {
                    const product = questions.find(q => q.product?.id === productId)?.product;
                    return product ? (
                      <option key={productId} value={productId}>{product.name}</option>
                    ) : null;
                  })}
                </select>
              </div>
            </div>
          </Card>

          {/* Questions Table */}
          <Card>
            <div className="p-6 pb-0">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Lista de Perguntas</h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pergunta</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuestions.map((question) => (
                  <TableRow key={question.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900 max-w-xs truncate">
                          {question.question_text}
                        </div>
                        <div className="text-sm text-gray-500">
                          Ordem: {question.order_index}
                          {question.is_required && (
                            <Badge variant="error" size="sm" className="ml-2">Obrigatória</Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="info">{question.category?.name}</Badge>
                    </TableCell>
                    <TableCell>
                      {question.product ? (
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{question.product.name}</span>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">Geral</span>
                      )}
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
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingQuestion(question);
                            setShowQuestionForm(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteQuestionDialog({ isOpen: true, question })}
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
          </Card>
        </>
      )}

      {activeTab === 'categories' && (
        <Card>
          <div className="p-6 pb-0">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Categorias de Perguntas</h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Perguntas</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <div className="font-medium text-gray-900">{category.name}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-gray-600 max-w-xs truncate">
                      {category.description || '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="info">
                      {questions.filter(q => q.category_id === category.id).length}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingCategory(category);
                          setShowCategoryForm(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteCategoryDialog({ isOpen: true, category })}
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
        </Card>
      )}

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

      {/* Category Form Modal */}
      <Modal
        isOpen={showCategoryForm}
        onClose={() => {
          setShowCategoryForm(false);
          setEditingCategory(null);
        }}
        title={editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
        size="md"
      >
        <CategoryForm
          category={editingCategory}
          onSuccess={() => {
            setShowCategoryForm(false);
            setEditingCategory(null);
          }}
          onCancel={() => {
            setShowCategoryForm(false);
            setEditingCategory(null);
          }}
        />
      </Modal>

      {/* Question Details Modal */}
      <QuestionDetailsModal
        question={viewingQuestion}
        isOpen={!!viewingQuestion}
        onClose={() => setViewingQuestion(null)}
      />

      {/* Delete Question Dialog */}
      <ConfirmDialog
        isOpen={deleteQuestionDialog.isOpen}
        onClose={() => setDeleteQuestionDialog({ isOpen: false, question: null })}
        onConfirm={handleDeleteQuestion}
        title="Excluir Pergunta"
        message={`Tem certeza que deseja excluir a pergunta "${deleteQuestionDialog.question?.question_text}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        variant="danger"
      />

      {/* Delete Category Dialog */}
      <ConfirmDialog
        isOpen={deleteCategoryDialog.isOpen}
        onClose={() => setDeleteCategoryDialog({ isOpen: false, category: null })}
        onConfirm={handleDeleteCategory}
        title="Excluir Categoria"
        message={`Tem certeza que deseja excluir a categoria "${deleteCategoryDialog.category?.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        variant="danger"
      />
    </div>
  );
}