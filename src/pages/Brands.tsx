import React from 'react';
import { Building2 } from 'lucide-react';
import KanbanBoard from '../components/brands/KanbanBoard';

export default function Brands() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Building2 className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Marcas</h1>
          <p className="text-gray-600">
            Gerencie seu pipeline de marcas com visualização Kanban interativa
          </p>
        </div>
      </div>

      {/* Kanban Board */}
      <KanbanBoard />
    </div>
  );
}