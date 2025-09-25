import React from 'react';
import { User, Package, Calendar, Clock, CheckCircle, MessageSquare, Star, Hash } from 'lucide-react';
import Modal from './ui/Modal';
import Badge from './ui/Badge';
import Card from './ui/Card';
import { useFeedbackSessionDetails } from '../hooks/useSupabase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { FeedbackSession, FeedbackAnswer } from '../types';

interface FeedbackDetailsModalProps {
  session: FeedbackSession | null;
  isOpen: boolean;
  onClose: () => void;
}

const statusColors = {
  'in_progress': 'warning',
  'completed': 'success',
  'abandoned': 'error'
} as const;

const statusLabels = {
  'in_progress': 'Em Progresso',
  'completed': 'Concluído',
  'abandoned': 'Abandonado'
};

export default function FeedbackDetailsModal({ session, isOpen, onClose }: FeedbackDetailsModalProps) {
  const { data: sessionDetails, isLoading } = useFeedbackSessionDetails(session?.id || '');

  if (!session) return null;

  const renderAnswer = (answer: FeedbackAnswer) => {
    const getAnswerDisplay = () => {
      if (answer.question_type === 'emoji_rating') {
        const rating = Number(answer.answer);
        return (
          <div className="flex items-center gap-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">({rating}/5)</span>
          </div>
        );
      }
      
      if (answer.question_type === 'boolean') {
        return (
          <Badge variant={answer.answer ? 'success' : 'error'}>
            {answer.answer ? 'Sim' : 'Não'}
          </Badge>
        );
      }
      
      if (answer.question_type === 'multiple_choice') {
        return (
          <Badge variant="info">
            {answer.answer}
          </Badge>
        );
      }
      
      // Text answer
      return <p className="text-gray-900">{answer.answer}</p>;
    };

    return (
      <div key={answer.question_id} className="border-b border-gray-100 last:border-b-0 pb-4 last:pb-0">
        <div className="flex items-start gap-3">
          <MessageSquare className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <p className="font-medium text-gray-900">{answer.question_text}</p>
            <div>{getAnswerDisplay()}</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Detalhes da Sessão #${session.id.slice(0, 8)}`}
      size="xl"
    >
      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Session Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <Badge variant={statusColors[session.session_status as keyof typeof statusColors]} size="md">
                {statusLabels[session.session_status as keyof typeof statusLabels]}
              </Badge>
              <div className="text-right text-sm text-gray-500">
                ID: {session.id.slice(0, 8)}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                {(session.customer || session.user_email) && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {session.customer?.name || 'Visitante'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {session.customer?.email || session.user_email}
                      </p>
                    </div>
                  </div>
                )}

                {session.box && (
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{session.box.theme}</p>
                      {session.box.description && (
                        <p className="text-xs text-gray-500">{session.box.description}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {session.edition && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{session.edition.edition}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {format(new Date(session.started_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </p>
                    <p className="text-xs text-gray-500">Iniciado</p>
                  </div>
                </div>

                {session.completed_at && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {format(new Date(session.completed_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </p>
                      <p className="text-xs text-gray-500">Concluído</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Feedbacks */}
          {sessionDetails && (
            <div className="space-y-6">
              {/* Product Feedbacks */}
              {sessionDetails.productFeedbacks.map((productFeedback, index) => (
                <Card key={productFeedback.id}>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Package className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold text-gray-900">
                        Feedback do Produto: {productFeedback.product_name}
                      </h3>
                    </div>
                    <div className="space-y-4">
                      {productFeedback.answers.map((answer) => renderAnswer(answer))}
                    </div>
                  </div>
                </Card>
              ))}

              {/* Experimentai Feedback */}
              {sessionDetails.experimentaiFeedbacks.map((experimentaiFeedback, index) => (
                <Card key={experimentaiFeedback.id}>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Hash className="w-5 h-5 text-purple-600" />
                      <h3 className="font-semibold text-gray-900">Feedback da Experimentai</h3>
                    </div>
                    <div className="space-y-4">
                      {experimentaiFeedback.answers.map((answer) => renderAnswer(answer))}
                    </div>
                  </div>
                </Card>
              ))}

              {/* Delivery Feedback */}
              {sessionDetails.deliveryFeedbacks.map((deliveryFeedback, index) => (
                <Card key={deliveryFeedback.id}>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Package className="w-5 h-5 text-green-600" />
                      <h3 className="font-semibold text-gray-900">Feedback da Entrega</h3>
                    </div>
                    <div className="space-y-4">
                      {deliveryFeedback.answers.map((answer) => renderAnswer(answer))}
                    </div>
                  </div>
                </Card>
              ))}

              {/* Completion Badge and Final Message */}
              {session.completion_badge && (
                <Card>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-5 h-5 text-yellow-500" />
                      <h3 className="font-semibold text-gray-900">Conquista</h3>
                    </div>
                    <p className="text-gray-700">{session.completion_badge}</p>
                  </div>
                </Card>
              )}

              {session.final_message && (
                <Card>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="w-5 h-5 text-blue-500" />
                      <h3 className="font-semibold text-gray-900">Mensagem Final</h3>
                    </div>
                    <p className="text-gray-700">{session.final_message}</p>
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}