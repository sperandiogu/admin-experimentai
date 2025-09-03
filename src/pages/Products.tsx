import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Package } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Pagination from '../components/ui/Pagination';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import ProductForm from '../components/forms/ProductForm';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '../hooks/useSupabase';
import { useToast } from '../hooks/useToast';
import { Product } from '../types';

export default function Products() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; product: Product | null }>({
    isOpen: false,
    product: null
  });

  const itemsPerPage = 10;
  const { data: products = [], isLoading } = useProducts();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const { showToast } = useToast();

  // Filter products based on search term
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginate filtered products
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const handleCreateProduct = async (productData: Omit<Product, 'id' | 'created_at'>) => {
    try {
      await createProduct.mutateAsync(productData);
      setIsModalOpen(false);
      showToast('Produto criado com sucesso!', 'success');
    } catch (error) {
      showToast('Erro ao criar produto', 'error');
    }
  };

  const handleUpdateProduct = async (productData: Omit<Product, 'id' | 'created_at'>) => {
    if (!editingProduct) return;
    
    try {
      await updateProduct.mutateAsync({
        id: editingProduct.id,
        ...productData
      });
      setIsModalOpen(false);
      setEditingProduct(null);
      showToast('Produto atualizado com sucesso!', 'success');
    } catch (error) {
      showToast('Erro ao atualizar produto', 'error');
    }
  };

  const handleDeleteProduct = async () => {
    if (!deleteConfirm.product) return;

    try {
      await deleteProduct.mutateAsync(deleteConfirm.product.id);
      setDeleteConfirm({ isOpen: false, product: null });
      showToast('Produto excluído com sucesso!', 'success');
    } catch (error) {
      showToast('Erro ao excluir produto', 'error');
    }
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Package className="w-8 h-8 text-indigo-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
            <p className="text-gray-600">Gerencie o catálogo de produtos</p>
          </div>
        </div>
        <Button onClick={openCreateModal} className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Novo Produto</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Produtos</p>
              <p className="text-2xl font-bold text-gray-900">{products.length}</p>
            </div>
            <Package className="w-8 h-8 text-blue-600" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Categorias</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(products.map(p => p.category).filter(Boolean)).size}
              </p>
            </div>
            <Package className="w-8 h-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Marcas</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(products.map(p => p.brand).filter(Boolean)).size}
              </p>
            </div>
            <Package className="w-8 h-8 text-purple-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Com Imagem</p>
              <p className="text-2xl font-bold text-gray-900">
                {products.filter(p => p.image_url).length}
              </p>
            </div>
            <Package className="w-8 h-8 text-orange-600" />
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar produtos por nome, marca ou categoria..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10"
            />
          </div>
        </div>
      </Card>

      {/* Products Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-left">Produto</TableHead>
                <TableHead className="text-left">Marca</TableHead>
                <TableHead className="text-left">Categoria</TableHead>
                <TableHead className="text-left">Descrição</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Package className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        {product.sku && (
                          <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-gray-900">{product.brand || '-'}</span>
                  </TableCell>
                  <TableCell>
                    {product.category && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {product.category}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <p className="text-gray-600 max-w-xs truncate">
                      {product.description || '-'}
                    </p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(product)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteConfirm({ isOpen: true, product })}
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
        </div>

        {paginatedProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm 
                ? 'Tente ajustar os filtros de busca'
                : 'Comece criando seu primeiro produto'
              }
            </p>
            {!searchTerm && (
              <Button onClick={openCreateModal}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Produto
              </Button>
            )}
          </div>
        )}

        {totalPages > 1 && (
          <div className="border-t border-gray-200 px-6 py-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              totalItems={filteredProducts.length}
            />
          </div>
        )}
      </Card>

      {/* Product Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingProduct ? 'Editar Produto' : 'Novo Produto'}
        size="lg"
      >
        <ProductForm
          product={editingProduct}
          onSuccess={editingProduct ? handleUpdateProduct : handleCreateProduct}
          onCancel={closeModal}
        />
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, product: null })}
        onConfirm={handleDeleteProduct}
        title="Excluir Produto"
        message={`Tem certeza que deseja excluir o produto "${deleteConfirm.product?.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
      />
    </div>
  );
}