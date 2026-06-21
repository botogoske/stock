import React, { useState, useEffect } from 'react';
import { GetProducts, CreateProduct, UpdateProduct, DeleteProduct } from "../../wailsjs/go/main/App";
import { main } from "../../wailsjs/go/models";

export const Products: React.FC = () => {
  const [productList, setProductList] = useState<main.Product[]>([]);
  const [actionMsg, setActionMsg] = useState('');
  const [actionError, setActionError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState('');
  const [minStock, setMinStock] = useState('');

  const fetchProducts = () => {
    GetProducts()
      .then((data) => setProductList(data || []))
      .catch((err) => console.error("Erro ao buscar produtos:", err));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice('');
    setCategory('');
    setQuantity('');
    setMinStock('');
    setEditingProductId(null);
  };

  const handleEdit = (product: main.Product) => {
    setEditingProductId(product.id);
    setName(product.name);
    setDescription(product.description);
    const raw = product.price.toFixed(2).replace(/\D/g, '');
    setPrice(formatPrice(raw));
    setCategory(product.category);
    setQuantity(String(product.quantity));
    setMinStock(String(product.min_stock));
    setActionMsg('');
    setActionError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    resetForm();
  };

  const formatPrice = (value: string) => {
    const digits = value.replace(/\D/g, '');
    const padded = digits.padStart(3, '0');
    const integer = padded.slice(0, -2);
    const cents = padded.slice(-2);
    return `${parseInt(integer || '0').toLocaleString('pt-BR')},${cents}`;
  };

  const parsePrice = (formatted: string) => {
    return parseFloat(formatted.replace(/\./g, '').replace(',', '.')) || 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setActionError("Nome do produto é obrigatório.");
      setActionMsg('');
      return;
    }

    setActionError('');
    setActionMsg('');
    setIsLoading(true);

    const productData = new main.Product({
      id: editingProductId || 0,
      name: name.trim(),
      description: description.trim(),
      price: parsePrice(price),
      category: category.trim(),
      quantity: parseInt(quantity.replace(/\D/g, '')) || 0,
      min_stock: parseInt(minStock.replace(/\D/g, '')) || 0,
    });

    const action = editingProductId
      ? UpdateProduct(editingProductId, productData)
      : CreateProduct(productData);

    setTimeout(() => {
      action
        .then((res: any) => {
          setIsLoading(false);
          if (res.success) {
            setActionMsg(res.message);
            resetForm();
            fetchProducts();
          } else {
            setActionError(res.message);
          }
        })
        .catch((err) => {
          setIsLoading(false);
          setActionError("Erro de comunicação com o servidor.");
          console.error(err);
        });
    }, 400);
  };

  const handleDelete = (id: number) => {
    DeleteProduct(id)
      .then((success) => {
        if (success) {
          setActionMsg("Produto excluído com sucesso.");
          setActionError('');
          fetchProducts();
        } else {
          setActionError("Erro ao excluir produto.");
        }
      })
      .catch((err) => {
        setActionError("Erro de comunicação ao excluir.");
        console.error(err);
      });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

      {/* LEFT: Registration Form */}
      <div className="lg:col-span-4 bg-white border border-slate-200 backdrop-blur-xl rounded-2xl p-6 shadow-xl">
        <h2 className="text-lg font-bold text-slate-900 mb-4">{editingProductId ? 'Editar Produto' : 'Novo Produto'}</h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Nome do Produto *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex: Notebook Dell"
              disabled={isLoading}
              className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl py-2 px-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 text-sm transition-all duration-200"
              autoComplete="off"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Descrição
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição detalhada do produto"
              disabled={isLoading}
              rows={3}
              className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl py-2 px-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 text-sm transition-all duration-200 resize-none"
              autoComplete="off"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Preço (R$)
              </label>
              <input
                type="text"
                value={price}
                onChange={(e) => setPrice(formatPrice(e.target.value))}
                placeholder="0,00"
                disabled={isLoading}
                className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl py-2 px-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 text-sm transition-all duration-200 font-mono"
                autoComplete="off"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Quantidade
              </label>
              <input
                type="text"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value.replace(/\D/g, ''))}
                placeholder="0"
                disabled={isLoading}
                className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl py-2 px-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 text-sm transition-all duration-200 font-mono"
                autoComplete="off"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Estoque Mínimo
            </label>
            <input
              type="text"
              value={minStock}
              onChange={(e) => setMinStock(e.target.value.replace(/\D/g, ''))}
              placeholder="0"
              disabled={isLoading}
              className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl py-2 px-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 text-sm transition-all duration-200 font-mono"
              autoComplete="off"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Categoria
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={isLoading}
              className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl py-2 px-3 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 text-sm transition-all duration-200"
            >
              <option value="">Selecione uma categoria</option>
              <option value="Eletrônicos">Eletrônicos</option>
              <option value="Informática">Informática</option>
              <option value="Escritório">Escritório</option>
              <option value="Móveis">Móveis</option>
              <option value="Vestuário">Vestuário</option>
              <option value="Alimentação">Alimentação</option>
              <option value="Serviços">Serviços</option>
              <option value="Outros">Outros</option>
            </select>
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

          <div className="flex space-x-2">
            {editingProductId && (
              <button
                type="button"
                onClick={cancelEdit}
                disabled={isLoading}
                className="w-12 flex items-center justify-center py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-600 font-semibold rounded-xl text-sm transition-all duration-200 disabled:opacity-50"
                title="Cancelar edição"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-sm transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 shadow-md shadow-violet-200/50"
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
                <span>{editingProductId ? 'Atualizar Produto' : 'Adicionar Produto'}</span>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* RIGHT: Product List */}
      <div className="lg:col-span-8 bg-white border border-slate-200 backdrop-blur-xl rounded-2xl p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-slate-900">Produtos Cadastrados</h2>
          <button
            onClick={fetchProducts}
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
                <th className="pb-3 pl-4">Nome</th>
                <th className="pb-3">Categoria</th>
                <th className="pb-3">Preço</th>
                <th className="pb-3">Estoque</th>
                <th className="pb-3">Est. Mínimo</th>
                <th className="pb-3 pr-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {productList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400 text-xs">
                    <svg className="w-8 h-8 mx-auto mb-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    Nenhum produto cadastrado ainda.
                  </td>
                </tr>
              ) : (
                productList.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-all duration-150">
                    <td className="py-3 pl-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-300 text-amber-600 font-bold flex items-center justify-center text-xs flex-shrink-0">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 truncate">{p.name}</p>
                          {p.description && (
                            <p className="text-[10px] text-slate-400 truncate max-w-[200px]">{p.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border bg-slate-100 text-slate-600 border-slate-200">
                        {p.category || '—'}
                      </span>
                    </td>
                    <td className="py-3 text-slate-600 font-mono text-sm">
                      R$ {p.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3">
                      <span className={`inline-flex items-center space-x-1.5 text-xs font-semibold ${
                        p.quantity === 0 ? 'text-red-600' :
                        p.min_stock > 0 && p.quantity <= p.min_stock ? 'text-amber-600' :
                        'text-emerald-600'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${
                          p.quantity === 0 ? 'bg-red-500' :
                          p.min_stock > 0 && p.quantity <= p.min_stock ? 'bg-amber-500' :
                          'bg-emerald-500'
                        }`} />
                        <span>{p.quantity} un{p.quantity !== 1 ? 's' : ''}</span>
                        {p.min_stock > 0 && p.quantity <= p.min_stock && (
                          <svg className="w-3.5 h-3.5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                        )}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500 text-xs font-mono">
                      {p.min_stock > 0 ? `${p.min_stock} un${p.min_stock !== 1 ? 's' : ''}` : '—'}
                    </td>
                    <td className="py-3 pr-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => handleEdit(p)}
                          className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-150"
                          title="Editar produto"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-150"
                          title="Excluir produto"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {productList.length > 0 && (
          <p className="mt-3 text-right text-[10px] text-slate-400">
            {productList.length} produto{productList.length !== 1 ? 's' : ''} cadastrado{productList.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

    </div>
  );
};
