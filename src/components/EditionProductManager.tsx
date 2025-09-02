import React, { useState } from 'react';
import { Plus, Minus, Package, Search } from 'lucide-react';
import Card from './ui/Card';
import Button from './ui/Button';
import Badge from './ui/Badge';
import { useProducts, useEditionProducts, useAddProductToEdition, useRemoveProductFromEdition } from '../hooks/useSupabase';
import type { Product, Edition } from '../types';

interface EditionProductManagerProps {
  edition: Edition;
  onClose: () => void;
}

export default function EditionProductManager({ edition, onClose }: EditionProductManagerProps) {
  const { data: allProducts } = useProducts();
  const { data: editionProducts } = useEditionProducts(edition.edition_id);
  const addProduct = useAddProductToEdition();
  const removeProduct = useRemoveProductFromEdition();
  const [searchTerm, setSearchTerm] = useState('');

  const availableProducts = allProducts?.filter(product => 
    !editionProducts?.some(ep => ep.product_id === product.id) &&
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const selectedProducts = allProducts?.filter(product =>
    editionProducts?.some(ep => ep.product_id === product.id)
  ) || [];

  const handleAddProduct = async (productId: string) => {
    try {
      await addProduct.mutateAsync({
        edition_id: edition.edition_id,
        product_id: productId
      });
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
    }
  };

  const handleRemoveProduct = async (productId: string) => {
    try {
      await removeProduct.mutateAsync({
        edition_id: edition.edition_id,
        product_id: productId
      });
    } catch (error) {
      console.error('Erro ao remover produto:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Produtos da Edição: {edition.edition}
          </h2>
          <p className="text-gray-600">Gerencie os produtos incluídos nesta edição</p>
        </div>
        <Button variant="secondary" onClick={onClose}>
          Fechar
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Selected Products */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-gray-900">
              Produtos Selecionados ({selectedProducts.length})
            </h3>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {selectedProducts.map((product) => (
              <div key={product.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
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
                    <div className="font-medium text-gray-900">{product.name}</div>
                    <div className="text-sm text-gray-600">{product.brand}</div>
                  </div>
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleRemoveProduct(product.id)}
                  disabled={removeProduct.isPending}
                >
                  <Minus className="w-4 h-4" />
                </Button>
              </div>
            ))}
            
            {selectedProducts.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Nenhum produto selecionado
              </div>
            )}
          </div>
        </Card>

        {/* Available Products */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Produtos Disponíveis</h3>
          </div>
          
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {availableProducts.map((product) => (
              <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
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
                    <div className="font-medium text-gray-900">{product.name}</div>
                    <div className="text-sm text-gray-600">{product.brand}</div>
                    {product.category && (
                      <Badge variant="info" size="sm">{product.category}</Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleAddProduct(product.id)}
                  disabled={addProduct.isPending}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            ))}
            
            {availableProducts.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'Nenhum produto encontrado' : 'Todos os produtos já foram adicionados'}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}