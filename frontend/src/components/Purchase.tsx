import React, { useState, useEffect } from 'react';
import { GetCompras, CreateCompra, GetProducts } from "../../wailsjs/go/main/App";
import { main } from "../../wailsjs/go/models";

export const Compras: React.FC = () => {
  const [compraList, setCompraList] = useState<main.Compra[]>([]);
  const [productList, setProductList] = useState<main.Product[]>([]);
  const [actionMsg, setActionMsg] = useState('');
  const [actionError, setActionError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [produtoId, setProdutoId] = useState('');
  const [produtoNome, setProdutoNome] = useState('');
  const [precoUnitario, setPrecoUnitario] = useState(0);
  const [quantidade, setQuantidade] = useState('');
  const [total, setTotal] = useState(0);

  const fetchData = () => {
    GetCompras()
      .then((data) => setCompraList(data || []))
      .catch((err) => console.error("Erro ao buscar compras:", err));
    GetProducts()
      .then((data) => setProductList(data || []))
      .catch((err) => console.error("Erro ao buscar produtos:", err));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setProdutoId('');
    setProdutoNome('');
    setPrecoUnitario(0);
    setQuantidade('');
    setTotal(0);
  };

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = parseInt(e.target.value);
    const product = productList.find((p) => p.id === id);
    if (product) {
      setProdutoId(String(product.id));
      setProdutoNome(product.name);
      setPrecoUnitario(product.price);
      const qty = parseInt(quantidade.replace(/\D/g, '')) || 0;
      setTotal(qty * product.price);
    } else {
      setProdutoId('');
      setProdutoNome('');
      setPrecoUnitario(0);
      setTotal(0);
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const qty = parseInt(e.target.value.replace(/\D/g, '')) || 0;
    setQuantidade(e.target.value.replace(/\D/g, ''));
    setTotal(qty * precoUnitario);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!produtoId || !quantidade || parseInt(quantidade) <= 0) {
      setActionError("Produto e quantidade são obrigatórios.");
      setActionMsg('');
      return;
    }

    setActionError('');
    setActionMsg('');
    setIsLoading(true);

    const now = new Date();
    const dataCompra = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const newCompra = new main.Compra({
      id: 0,
      produto_id: parseInt(produtoId),
      produto_nome: produtoNome,
      quantidade: parseInt(quantidade),
      preco_unitario: precoUnitario,
      total: total,
      data_compra: dataCompra,
    });

    CreateCompra(newCompra)
      .then((res: any) => {
        setIsLoading(false);
        if (res.success) {
          setActionMsg(res.message);
          resetForm();
          fetchData();
        } else {
          setActionError(res.message);
        }
      })
      .catch((err) => {
        setIsLoading(false);
        setActionError("Erro de comunicação com o servidor.");
        console.error(err);
      });
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

      {/* LEFT: Registration Form */}
      <div className="lg:col-span-4 bg-white border border-slate-200 backdrop-blur-xl rounded-2xl p-6 shadow-xl">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Nova Compra</h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Produto *
            </label>
            <select
              value={produtoId}
              onChange={handleProductChange}
              disabled={isLoading}
              className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl py-2 px-3 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 text-sm transition-all duration-200"
            >
              <option value="">Selecione um produto</option>
              {productList.map((p) => (
                <option key={p.id} value={p.id}>{p.name} - R$ {formatCurrency(p.price)} (Est: {p.quantity})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Preço Unitário (R$)
            </label>
            <input
              type="text"
              value={formatCurrency(precoUnitario)}
              readOnly
              className="w-full bg-slate-50 border border-slate-200 text-slate-500 rounded-xl py-2 px-3 text-sm font-mono cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Quantidade *
            </label>
            <input
              type="text"
              value={quantidade}
              onChange={handleQuantityChange}
              placeholder="0"
              disabled={isLoading}
              className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl py-2 px-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 text-sm transition-all duration-200 font-mono"
              autoComplete="off"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Total (R$)
            </label>
            <input
              type="text"
              value={formatCurrency(total)}
              readOnly
              className="w-full bg-slate-50 border border-slate-200 text-emerald-600 rounded-xl py-2 px-3 text-sm font-mono font-bold cursor-not-allowed"
            />
          </div>

          {actionError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs flex items-start space-x-2">
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{actionError}</span>
            </div>
          )}

          {actionMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-xl text-xs flex items-center space-x-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{actionMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold rounded-xl text-sm transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 shadow-md shadow-blue-200/50"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Salvando...</span>
              </>
            ) : (
              <span>Registrar Compra</span>
            )}
          </button>
        </form>
      </div>

      {/* RIGHT: Purchases List */}
      <div className="lg:col-span-8 bg-white border border-slate-200 backdrop-blur-xl rounded-2xl p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-slate-900">Compras Realizadas</h2>
          <button
            onClick={fetchData}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg border border-slate-200 transition-all duration-200"
            title="Atualizar lista"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.228 9H18.01" />
            </svg>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <th className="pb-3 pl-4">Data/Hora</th>
                <th className="pb-3">Produto</th>
                <th className="pb-3">Qtd</th>
                <th className="pb-3">Preço Un.</th>
                <th className="pb-3 pr-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {compraList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400 text-xs">
                    <svg className="w-8 h-8 mx-auto mb-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 14l6-6m-5.5.5h.01M14.5 9.5h.01M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2zM7 5V3m10 2V3" />
                    </svg>
                    Nenhuma compra registrada ainda.
                  </td>
                </tr>
              ) : (
                compraList.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-all duration-150">
                    <td className="py-3 pl-4 text-slate-600 font-mono text-xs">{c.data_compra}</td>
                    <td className="py-3 text-slate-600">{c.produto_nome}</td>
                    <td className="py-3 text-slate-600 font-mono">{c.quantidade}</td>
                    <td className="py-3 text-slate-600 font-mono">R$ {formatCurrency(c.preco_unitario)}</td>
                    <td className="py-3 pr-4 text-right text-emerald-600 font-mono font-semibold">R$ {formatCurrency(c.total)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {compraList.length > 0 && (
          <p className="mt-3 text-right text-[10px] text-slate-400">
            {compraList.length} compra{compraList.length !== 1 ? 's' : ''} registrada{compraList.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

    </div>
  );
};
