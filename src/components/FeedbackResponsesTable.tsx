import React, { useState } from 'react';
import { Search, Eye, User, Package, Calendar, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import Card from './ui/Card';
import Button from './ui/Button';
import Badge from './ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './ui/Table';
import Pagination from './ui/Pagination';
import { useFeedbackSessions } from '../hooks/useSupabase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { FeedbackSession } from '../types';

interface FeedbackResponsesTableProps {
  onViewDetails: (session: FeedbackSession) => void;
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

const statusIcons = {
  'in_progress': Clock,
  'completed': CheckCircle,
  'abandoned': XCircle
};

export default function FeedbackResponsesTable({ onViewDetails }: FeedbackResponsesTableProps) {
  const { data: sessions = [], isLoading } = useFeedbackSessions();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  const itemsPerPage = 10;

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = 
      session.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.box?.theme?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.edition?.edition?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || session.session_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredSessions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSessions = filteredSessions.slice(startIndex, startIndex + itemsPerPage);

  const sessionStats = {
    total: sessions.length,
    completed: sessions.filter(s => s.session_status === 'completed').length,
    inProgress: sessions.filter(s => s.session_status === 'in_progress').length,
    abandoned: sessions.filter(s => s.session_status === 'abandoned').length
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <div className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{sessionStats.total}</p>
              <p className="text-sm text-gray-600">Total</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{sessionStats.completed}</p>
              <p className="text-sm text-gray-600">Concluídos</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{sessionStats.inProgress}</p>
              <p className="text-sm text-gray-600">Em Progresso</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{sessionStats.abandoned}</p>
              <p className="text-sm text-gray-600">Abandonados</p>
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
                placeholder="Buscar por email, cliente, caixa ou edição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="">Todos os status</option>
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Sessions Table */}
      <Card>
        <div className="p-6 pb-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sessões de Feedback</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Caixa/Edição</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Iniciado</TableHead>
              <TableHead>Concluído</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedSessions.map((session) => {
              const StatusIcon = statusIcons[session.session_status as keyof typeof statusIcons];
              return (
                <TableRow key={session.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium text-gray-900 flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        {session.customer?.name || 'Visitante'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {session.customer?.email || session.user_email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {session.box && (
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{session.box.theme}</span>
                        </div>
                      )}
                      {session.edition && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{session.edition.edition}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusColors[session.session_status as keyof typeof statusColors]}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {statusLabels[session.session_status as keyof typeof statusLabels]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(session.started_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    {session.completed_at ? (
                      format(new Date(session.completed_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDetails(session)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {paginatedSessions.length === 0 && (
          <div className="text-center py-12">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Nenhuma sessão encontrada</h3>
            <p className="text-gray-500 mt-1">
              {searchTerm ? 'Tente ajustar os filtros de busca' : 'As sessões de feedback aparecerão aqui quando forem criadas'}
            </p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="border-t border-gray-200 px-6 py-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              totalItems={filteredSessions.length}
            />
          </div>
        )}
      </Card>
    </div>
  );
}