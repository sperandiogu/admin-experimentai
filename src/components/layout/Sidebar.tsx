import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  Calendar, 
  ShoppingCart, 
  FileText,
  Box,
  Settings,
  X
} from 'lucide-react';
import type { Page } from '../../App';

interface SidebarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const navigation = [
  { name: 'Dashboard', icon: LayoutDashboard, page: 'dashboard' as Page },
  { name: 'Clientes', icon: Users, page: 'customers' as Page },
  { name: 'Produtos', icon: Package, page: 'products' as Page },
  { name: 'Caixas', icon: Box, page: 'boxes' as Page },
  { name: 'Edições', icon: Calendar, page: 'editions' as Page },
  { name: 'Pedidos', icon: ShoppingCart, page: 'orders' as Page },
  { name: 'Faturas', icon: FileText, page: 'invoices' as Page },
  { name: 'Configurações', icon: Settings, page: 'settings' as Page },
];

export default function Sidebar({ currentPage, setCurrentPage, isOpen, setIsOpen }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div 
            className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity duration-300"
            onClick={() => setIsOpen(false)}
          />
        </div>
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-gray-900">Admin Panel</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = currentPage === item.page;
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    setCurrentPage(item.page);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left font-medium transition-all duration-200
                    ${isActive 
                      ? 'bg-blue-50 text-blue-700 shadow-sm' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                  {item.name}
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              Clube de Assinatura Admin
            </div>
          </div>
        </div>
      </div>
    </>
  );
}