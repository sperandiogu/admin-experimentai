import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useToast } from './hooks/useToast';
import Toast from './components/ui/Toast';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Products from './pages/Products';
import Editions from './pages/Editions';
import Orders from './pages/Orders';
import Invoices from './pages/Invoices';
import Boxes from './pages/Boxes';
import Settings from './pages/Settings';

export type Page =
  | 'dashboard'
  | 'customers'
  | 'products'
  | 'editions'
  | 'orders'
  | 'invoices'
  | 'boxes'
  | 'settings';

const queryClient = new QueryClient();

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toasts, removeToast } = useToast();

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'customers':
        return <Customers />;
      case 'products':
        return <Products />;
      case 'editions':
        return <Editions />;
      case 'orders':
        return <Orders />;
      case 'invoices':
        return <Invoices />;
      case 'boxes':
        return <Boxes />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar fixa no lado esquerdo */}
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* Conteúdo principal */}
      <div
        className="flex-1 flex flex-col transition-all duration-300 overflow-hidden"
      >
        <Header setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8 overflow-auto">
          <div className="w-full max-w-full mx-auto">
            {renderPage()}
          </div>
        </main>
      </div>

      {/* Toast notifications */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          type={toast.type}
          message={toast.message}
          isVisible={true}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;
