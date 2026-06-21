import React, { useState, useEffect } from 'react';
import { GetVendas } from "../../wailsjs/go/main/App";
import { main } from "../../wailsjs/go/models";

interface RelatorioVendasProps {
  username: string;
}

interface ProductSummary {
  productName: string;
  quantity: number;
  total: number;
  count: number;
}

interface CustomerSummary {
  customerName: string;
  total: number;
  count: number;
}

export const RelatorioVendas: React.FC<RelatorioVendasProps> = ({ username }) => {
  const [vendaList, setVendaList] = useState<main.Venda[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = () => {
    setIsLoading(true);
    GetVendas()
      .then((data) => setVendaList(data || []))
      .catch((err) => console.error("Erro ao buscar vendas:", err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const totalVendas = vendaList.length;
  const receitaTotal = vendaList.reduce((sum, v) => sum + v.total, 0);
  const totalProdutos = vendaList.reduce((sum, v) => sum + v.quantidade, 0);
  const ticketMedio = totalVendas > 0 ? receitaTotal / totalVendas : 0;

  const productSummary: Record<string, ProductSummary> = {};
  const customerSummary: Record<string, CustomerSummary> = {};

  vendaList.forEach((v) => {
    if (!productSummary[v.produto_nome]) {
      productSummary[v.produto_nome] = { productName: v.produto_nome, quantity: 0, total: 0, count: 0 };
    }
    productSummary[v.produto_nome].quantity += v.quantidade;
    productSummary[v.produto_nome].total += v.total;
    productSummary[v.produto_nome].count += 1;

    if (!customerSummary[v.cliente_nome]) {
      customerSummary[v.cliente_nome] = { customerName: v.cliente_nome, total: 0, count: 0 };
    }
    customerSummary[v.cliente_nome].total += v.total;
    customerSummary[v.cliente_nome].count += 1;
  });

  const topProducts = Object.values(productSummary).sort((a, b) => b.total - a.total);
  const topCustomers = Object.values(customerSummary).sort((a, b) => b.total - a.total);

  return (
    <div className="space-y-8">

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total de Vendas</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{totalVendas}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Receita Total</span>
          </div>
          <p className="text-2xl font-bold text-emerald-600">R$ {formatCurrency(receitaTotal)}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ticket Médio</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">R$ {formatCurrency(ticketMedio)}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Produtos Vendidos</span>
          </div>
          <p className="text-2xl font-bold text-amber-600">{totalProdutos}</p>
        </div>
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Top Products */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Vendas por Produto</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                  <th className="pb-3">Produto</th>
                  <th className="pb-3 text-right">Qtd</th>
                  <th className="pb-3 text-right">Vendas</th>
                  <th className="pb-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {topProducts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-slate-400 text-xs">Nenhum dado disponível.</td>
                  </tr>
                ) : (
                  topProducts.map((p) => (
                    <tr key={p.productName} className="hover:bg-slate-50 transition-all duration-150">
                      <td className="py-3 text-slate-600 font-medium">{p.productName}</td>
                      <td className="py-3 text-right text-slate-600 font-mono">{p.quantity}</td>
                      <td className="py-3 text-right text-slate-600 font-mono">{p.count}</td>
                      <td className="py-3 text-right text-emerald-600 font-mono font-semibold">R$ {formatCurrency(p.total)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Customers */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Vendas por Cliente</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                  <th className="pb-3">Cliente</th>
                  <th className="pb-3 text-right">Compras</th>
                  <th className="pb-3 text-right">Total Gasto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {topCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-10 text-center text-slate-400 text-xs">Nenhum dado disponível.</td>
                  </tr>
                ) : (
                  topCustomers.map((c) => (
                    <tr key={c.customerName} className="hover:bg-slate-50 transition-all duration-150">
                      <td className="py-3 text-slate-600 font-medium">{c.customerName}</td>
                      <td className="py-3 text-right text-slate-600 font-mono">{c.count}</td>
                      <td className="py-3 text-right text-emerald-600 font-mono font-semibold">R$ {formatCurrency(c.total)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* All Sales Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-slate-900">Todas as Vendas</h2>
          <button
            onClick={fetchData}
            disabled={isLoading}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg border border-slate-200 transition-all duration-200 disabled:opacity-50"
            title="Atualizar"
          >
            <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.228 9H18.01" />
            </svg>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <th className="pb-3 pl-4">Data/Hora</th>
                <th className="pb-3">Cliente</th>
                <th className="pb-3">Produto</th>
                <th className="pb-3 text-right">Qtd</th>
                <th className="pb-3 text-right">Preço Un.</th>
                <th className="pb-3 pr-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {vendaList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400 text-xs">
                    <svg className="w-8 h-8 mx-auto mb-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 14l6-6m-5.5.5h.01M14.5 9.5h.01M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2zM7 5V3m10 2V3" />
                    </svg>
                    Nenhuma venda registrada.
                  </td>
                </tr>
              ) : (
                vendaList.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50 transition-all duration-150">
                    <td className="py-3 pl-4 text-slate-600 font-mono text-xs">{v.data_venda}</td>
                    <td className="py-3 text-slate-600">{v.cliente_nome}</td>
                    <td className="py-3 text-slate-600">{v.produto_nome}</td>
                    <td className="py-3 text-right text-slate-600 font-mono">{v.quantidade}</td>
                    <td className="py-3 text-right text-slate-600 font-mono">R$ {formatCurrency(v.preco_unitario)}</td>
                    <td className="py-3 pr-4 text-right text-emerald-600 font-mono font-semibold">R$ {formatCurrency(v.total)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {vendaList.length > 0 && (
          <p className="mt-3 text-right text-[10px] text-slate-400">
            {vendaList.length} venda{vendaList.length !== 1 ? 's' : ''} registrada{vendaList.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

    </div>
  );
};
