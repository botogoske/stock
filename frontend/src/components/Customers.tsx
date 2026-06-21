import React, { useState, useEffect } from 'react';
import { GetCustomers, CreateCustomer, UpdateCustomer, DeleteCustomer } from "../../wailsjs/go/main/App";
import { main } from "../../wailsjs/go/models";

export const Customers: React.FC = () => {
  const [customerList, setCustomerList] = useState<main.Customer[]>([]);
  const [actionMsg, setActionMsg] = useState('');
  const [actionError, setActionError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState<number | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [razaoSocial, setRazaoSocial] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [endereco, setEndereco] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [cep, setCep] = useState('');

  const fetchCustomers = () => {
    GetCustomers()
      .then((data) => setCustomerList(data || []))
      .catch((err) => console.error("Erro ao buscar clientes:", err));
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const resetForm = () => {
    setName('');
    setRazaoSocial('');
    setCnpj('');
    setEndereco('');
    setBairro('');
    setCidade('');
    setCep('');
    setEditingCustomerId(null);
  };

  const handleEdit = (customer: main.Customer) => {
    setEditingCustomerId(customer.id);
    setName(customer.name);
    setRazaoSocial(customer.razao_social);
    setCnpj(customer.cnpj);
    setEndereco(customer.endereco);
    setBairro(customer.bairro);
    setCidade(customer.cidade);
    setCep(customer.cep);
    setActionMsg('');
    setActionError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    resetForm();
  };

  const formatCNPJ = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 14);
    return digits
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  };

  const formatCEP = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    return digits.replace(/^(\d{5})(\d)/, '$1-$2');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !cnpj.trim()) {
      setActionError("Nome do cliente e CNPJ são obrigatórios.");
      setActionMsg('');
      return;
    }

    setActionError('');
    setActionMsg('');
    setIsLoading(true);

    const customerData = new main.Customer({
      id: editingCustomerId || 0,
      name: name.trim(),
      razao_social: razaoSocial.trim(),
      cnpj: cnpj.trim(),
      endereco: endereco.trim(),
      bairro: bairro.trim(),
      cidade: cidade.trim(),
      cep: cep.trim(),
    });

    const action = editingCustomerId
      ? UpdateCustomer(editingCustomerId, customerData)
      : CreateCustomer(customerData);

    setTimeout(() => {
      action
        .then((res: any) => {
          setIsLoading(false);
          if (res.success) {
            setActionMsg(res.message);
            resetForm();
            fetchCustomers();
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
    DeleteCustomer(id)
      .then((success) => {
        if (success) {
          setActionMsg("Cliente excluído com sucesso.");
          setActionError('');
          fetchCustomers();
        } else {
          setActionError("Erro ao excluir cliente.");
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
        <h2 className="text-lg font-bold text-slate-900 mb-4">{editingCustomerId ? 'Editar Cliente' : 'Novo Cliente'}</h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Nome do Cliente *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex: Empresa XPTO Ltda"
              disabled={isLoading}
              className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl py-2 px-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 text-sm transition-all duration-200"
              autoComplete="off"
            />
          </div>

          {/* Razão Social */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Razão Social
            </label>
            <input
              type="text"
              value={razaoSocial}
              onChange={(e) => setRazaoSocial(e.target.value)}
              placeholder="ex: Empresa XPTO S/A"
              disabled={isLoading}
              className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl py-2 px-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 text-sm transition-all duration-200"
              autoComplete="off"
            />
          </div>

          {/* CNPJ */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              CNPJ *
            </label>
            <input
              type="text"
              value={cnpj}
              onChange={(e) => setCnpj(formatCNPJ(e.target.value))}
              placeholder="00.000.000/0000-00"
              disabled={isLoading}
              className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl py-2 px-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 text-sm transition-all duration-200 font-mono"
              autoComplete="off"
            />
          </div>

          {/* Endereço */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Endereço
            </label>
            <input
              type="text"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              placeholder="ex: Rua das Flores, 123"
              disabled={isLoading}
              className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl py-2 px-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 text-sm transition-all duration-200"
              autoComplete="off"
            />
          </div>

          {/* Bairro */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Bairro
            </label>
            <input
              type="text"
              value={bairro}
              onChange={(e) => setBairro(e.target.value)}
              placeholder="ex: Centro"
              disabled={isLoading}
              className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl py-2 px-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 text-sm transition-all duration-200"
              autoComplete="off"
            />
          </div>

          {/* Cidade e CEP side by side */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Cidade
              </label>
              <input
                type="text"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                placeholder="ex: São Paulo"
                disabled={isLoading}
              className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl py-2 px-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 text-sm transition-all duration-200"
                autoComplete="off"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                CEP
              </label>
              <input
                type="text"
                value={cep}
                onChange={(e) => setCep(formatCEP(e.target.value))}
                placeholder="00000-000"
                disabled={isLoading}
              className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl py-2 px-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 text-sm transition-all duration-200 font-mono"
                autoComplete="off"
              />
            </div>
          </div>

          {/* Feedback messages */}
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
            {editingCustomerId && (
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
                <span>{editingCustomerId ? 'Atualizar Cliente' : 'Adicionar Cliente'}</span>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* RIGHT: Customer List */}
      <div className="lg:col-span-8 bg-white border border-slate-200 backdrop-blur-xl rounded-2xl p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-slate-900">Clientes Cadastrados</h2>
          <button
            onClick={fetchCustomers}
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
                <th className="pb-3">CNPJ</th>
                <th className="pb-3">Cidade</th>
                <th className="pb-3">Bairro</th>
                <th className="pb-3 pr-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {customerList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400 text-xs">
                    <svg className="w-8 h-8 mx-auto mb-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Nenhum cliente cadastrado ainda.
                  </td>
                </tr>
              ) : (
                customerList.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-all duration-150">
                    <td className="py-3 pl-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-cyan-100 border border-cyan-300 text-cyan-600 font-bold flex items-center justify-center text-xs flex-shrink-0">
                          {c.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 truncate">{c.name}</p>
                          {c.razao_social && (
                            <p className="text-[10px] text-slate-400 truncate">{c.razao_social}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-slate-600 font-mono text-xs">{c.cnpj}</td>
                    <td className="py-3 text-slate-600 text-xs">{c.cidade || '—'}</td>
                    <td className="py-3 text-slate-500 text-xs">{c.bairro || '—'}</td>
                    <td className="py-3 pr-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => handleEdit(c)}
                          className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-150"
                          title="Editar cliente"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-150"
                          title="Excluir cliente"
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

        {customerList.length > 0 && (
          <p className="mt-3 text-right text-[10px] text-slate-400">
            {customerList.length} cliente{customerList.length !== 1 ? 's' : ''} cadastrado{customerList.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

    </div>
  );
};
