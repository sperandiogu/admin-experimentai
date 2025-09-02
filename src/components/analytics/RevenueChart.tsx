import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../utils/formatters';

interface RevenueChartProps {
  data: Array<{ month: string; revenue: number }>;
}

export default function RevenueChart({ data }: RevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="month" 
          stroke="#6b7280"
          fontSize={12}
        />
        <YAxis 
          stroke="#6b7280"
          fontSize={12}
          tickFormatter={(value) => formatCurrency(value)}
        />
        <Tooltip 
          formatter={(value: number) => [formatCurrency(value), 'Receita']}
          labelStyle={{ color: '#374151' }}
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
        />
        <Line 
          type="monotone" 
          dataKey="revenue" 
          stroke="#3b82f6" 
          strokeWidth={3}
          dot={{ fill: '#3b82f6', strokeWidth: 2, r: 5 }}
          activeDot={{ r: 7, stroke: '#3b82f6', strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}