import React, { useState } from 'react';
import { Calendar, Package, Eye, Filter } from 'lucide-react';
import Card from './ui/Card';
import Button from './ui/Button';
import Badge from './ui/Badge';
import Select from './ui/Select';
import { useEditions, useQuestions, useProducts } from '../hooks/useSupabase';
import QuestionDetailsModal from './QuestionDetailsModal';
import type { Question, Edition, Product } from '../types';

export default function EditionQuestionView() {
  const { data: editions = [] } = useEditions();
  const { data: questions = [] } = useQuestions();
  const { data: products = [] } = useProducts();
  const [selectedEdition, setSelectedEdition] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [viewingQuestion, setViewingQuestion] = useState<Question | null>(null);

  const editionOptions = [
    { value: '', label: 'Todas as Edições' },
    ...editions.map(edition => ({
      value: edition.edition_id,
      label: edition.edition
    }))
  ];

  const categoryOptions = [
    { value: '', label: 'Todas as Categorias' },
    ...Array.from(new Set(questions.map(q => q.category?.name).filter(Boolean))).map(name => ({
      value: name!,
      label: name!
    }))
  ];

  // Agrupar perguntas por produto
  const questionsByProduct = questions.reduce((acc, question) => {
    const productKey = question.product_id || 'general';
    if (!acc[productKey]) {
      acc[productKey] = [];
    }
    acc[productKey].push(question);
    return acc;
  }, {} as Record<string, Question[]>);

  // Filtrar por categoria se selecionada
  const filteredQuestionsByProduct = Object.keys(questionsByProduct).reduce((acc, productKey) => {
    const filtered = questionsByProduct[productKey].filter(question => {
      if (selectedCategory && question.category?.name !== selectedCategory) {
        return false;
      }
      return true;
    });
    if (filtered.length > 0) {
      acc[productKey] = filtered.sort((a, b) => a.order_index - b.order_index);
    }
    return acc;
  }, {} as Record<string, Question[]>);

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

  const getProductInfo = (productId: string) => {
    if (productId === 'general') {
      return { name: 'Perguntas Gerais', brand: 'Aplicam-se a todos os produtos' };
    }
    const product = products.find(p => p.id === productId);
    return product ? { name: product.name, brand: product.brand } : { name: 'Produto não encontrado', brand: '' };
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Edição"
              value={selectedEdition}
              onChange={setSelectedEdition}
              options={editionOptions}
            />
            <Select
              label="Categoria"
              value={selectedCategory}
              onChange={setSelectedCategory}
              options={categoryOptions}
            />
            <div className="flex items-end">
              <Button variant="secondary" className="w-full">
                <Filter className="w-4 h-4" />
                Aplicar Filtros
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <div className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {Object.keys(filteredQuestionsByProduct).length}
              </p>
              <p className="text-sm text-gray-600">Produtos</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {Object.values(filteredQuestionsByProduct).flat().length}
              </p>
              <p className="text-sm text-gray-600">Perguntas</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {Object.values(filteredQuestionsByProduct).flat().filter(q => q.is_active).length}
              </p>
              <p className="text-sm text-gray-600">Ativas</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {Object.values(filteredQuestionsByProduct).flat().filter(q => q.is_required).length}
              </p>
              <p className="text-sm text-gray-600">Obrigatórias</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Perguntas agrupadas por produto */}
      {Object.entries(filteredQuestionsByProduct).map(([productKey, productQuestions]) => {
        const productInfo = getProductInfo(productKey);
        
        return (
          <Card key={productKey}>
            <div className="p-6">
              {/* Header do produto */}
              <div className="flex items-center gap-3 mb-4">
                <Package className="w-6 h-6 text-blue-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{productInfo.name}</h3>
                  <p className="text-sm text-gray-600">{productInfo.brand}</p>
                </div>
                <Badge variant="info">{productQuestions.length} perguntas</Badge>
              </div>

              {/* Lista de perguntas */}
              <div className="space-y-3">
                {productQuestions.map((question, index) => (
                  <div key={question.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <span className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                        {index + 1}
                      </span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-2">
                            {question.question_text}
                          </h4>
                          
                          <div className="flex flex-wrap gap-2 mb-2">
                            <Badge variant="info">{question.category?.name}</Badge>
                            <Badge variant={getQuestionTypeColor(question.question_type) as any}>
                              {getQuestionTypeLabel(question.question_type)}
                            </Badge>
                            <Badge variant={question.is_active ? 'success' : 'default'}>
                              {question.is_active ? 'Ativa' : 'Inativa'}
                            </Badge>
                            {question.is_required && (
                              <Badge variant="warning">Obrigatória</Badge>
                            )}
                          </div>

                          {/* Opções de resposta (preview) */}
                          {question.options && question.options.length > 0 && (
                            <div className="mt-3">
                              <p className="text-xs font-medium text-gray-600 mb-1">
                                Opções de resposta:
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {question.options.slice(0, 3).map((option) => (
                                  <span 
                                    key={option.id}
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-50 text-blue-700"
                                  >
                                    {option.option_label}
                                  </span>
                                ))}
                                {question.options.length > 3 && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                                    +{question.options.length - 3} mais
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setViewingQuestion(question)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        );
      })}

      {Object.keys(filteredQuestionsByProduct).length === 0 && (
        <Card>
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Nenhuma pergunta encontrada</h3>
            <p className="text-gray-500 mt-1">
              Ajuste os filtros ou crie perguntas para os produtos
            </p>
          </div>
        </Card>
      )}

      {/* Question Details Modal */}
      <QuestionDetailsModal
        question={viewingQuestion}
        isOpen={!!viewingQuestion}
        onClose={() => setViewingQuestion(null)}
      />
    </div>
  );
}