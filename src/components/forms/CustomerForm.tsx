import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, CreditCard } from 'lucide-react';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import { useCreateCustomer, useUpdateCustomer } from '../../hooks/useSupabase';
import type { Customer } from '../../types';

interface CustomerFormProps {
  customer?: Customer;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CustomerForm({ customer, onSuccess, onCancel }: CustomerFormProps) {
  const [formData, setFormData] = useState({
    name: customer?.name || '',
    email: customer?.email || '',
    phone: customer?.phone || '',
    address: customer?.address || '',
    cpf: customer?.cpf || '',
    stripe_customer_id: customer?.stripe_customer_id || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (formData.cpf && !/^\d{11}$/.test(formData.cpf.replace(/\D/g, ''))) {
      newErrors.cpf = 'CPF deve ter 11 dígitos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      if (customer) {
        await updateCustomer.mutateAsync({
          customer_id: customer.customer_id,
          ...formData
        });
      } else {
        await createCustomer.mutateAsync(formData);
      }
      onSuccess();
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
    }
  };

  const isLoading = createCustomer.isPending || updateCustomer.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Nome"
          value={formData.name}
          onChange={(value) => setFormData({ ...formData, name: value })}
          required
          error={errors.name}
          placeholder="Nome completo"
        />

        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={(value) => setFormData({ ...formData, email: value })}
          required
          error={errors.email}
          placeholder="email@exemplo.com"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Telefone"
          value={formData.phone}
          onChange={(value) => setFormData({ ...formData, phone: value })}
          placeholder="(11) 99999-9999"
        />

        <Input
          label="CPF"
          value={formData.cpf}
          onChange={(value) => setFormData({ ...formData, cpf: value })}
          error={errors.cpf}
          placeholder="000.000.000-00"
        />
      </div>

      <Textarea
        label="Endereço"
        value={formData.address}
        onChange={(value) => setFormData({ ...formData, address: value })}
        placeholder="Endereço completo para entrega"
        rows={3}
      />

      <Input
        label="Stripe Customer ID"
        value={formData.stripe_customer_id}
        onChange={(value) => setFormData({ ...formData, stripe_customer_id: value })}
        placeholder="cus_xxxxxxxxxx"
      />

      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? 'Salvando...' : customer ? 'Atualizar Cliente' : 'Criar Cliente'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}