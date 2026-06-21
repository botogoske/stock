import React, { useState, useRef, useEffect } from 'react';
import logo from './assets/images/logo-universal.png';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { UserRegistration } from './components/UserRegistration';
import { Customers } from './components/Customers';
import { Products } from './components/Products';
import { Vendas } from './components/Sales';
import { Compras } from './components/Purchase';
import { RelatorioVendas } from './components/SalesReport';
import { RelatorioCompras } from './components/PurchaseReport';

function App() {
  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');

  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'customers' | 'products' | 'vendas' | 'compras' | 'relatoriovendas' | 'relatoriocompras'>('dashboard');
  const [isCadastrosOpen, setIsCadastrosOpen] = useState(false);
  const [isOperacoesOpen, setIsOperacoesOpen] = useState(false);
  const [isRelatoriosOpen, setIsRelatoriosOpen] = useState(false);
  const cadastrosRef = useRef<HTMLDivElement>(null);
  const operacoesRef = useRef<HTMLDivElement>(null);
  const relatoriosRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (cadastrosRef.current && !cadastrosRef.current.contains(e.target as Node)) {
        setIsCadastrosOpen(false);
      }
      if (operacoesRef.current && !operacoesRef.current.contains(e.target as Node)) {
        setIsOperacoesOpen(false);
      }
      if (relatoriosRef.current && !relatoriosRef.current.contains(e.target as Node)) {
        setIsRelatoriosOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isCadastroActive = activeTab === 'users' || activeTab === 'customers' || activeTab === 'products';
  const isOperacoesActive = activeTab === 'vendas' || activeTab === 'compras';
  const isRelatoriosActive = activeTab === 'relatoriovendas' || activeTab === 'relatoriocompras';

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setActiveTab('dashboard');
  };

  if (!isLoggedIn) {
    return (
      <Login
        onLoginSuccess={(loggedUser) => {
          setIsLoggedIn(true);
          setUsername(loggedUser);
        }}
      />
    );
  }

  // Dashboard / Management Shell
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col relative overflow-hidden select-none">
      {/* Decorative background glows */}
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/10 blur-[130px] pointer-events-none" />

      {/* Nav Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md py-4 px-6 flex items-center justify-between relative z-30">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-slate-100 rounded-xl p-1.5 border border-slate-200">
              <img src={logo} className="w-full h-full object-contain" alt="Wails logo" />
            </div>
            <span className="font-bold text-slate-900 tracking-wider text-sm hidden sm:inline-block">CONTROLE DE ESTOQUE</span>
          </div>

          {/* Navigation Tabs Menu */}
          <nav className="flex space-x-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/50">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 flex items-center space-x-1.5 ${
                activeTab === 'dashboard'
              ? 'bg-linear-to-r from-violet-600 to-indigo-600 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
              </svg>
              <span>Dashboard</span>
            </button>

            {/* Cadastros Dropdown */}
            <div className="relative" ref={cadastrosRef}>
              <button
                onClick={() => setIsCadastrosOpen(!isCadastrosOpen)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 flex items-center space-x-1.5 ${
                  isCadastroActive
                    ? 'bg-linear-to-r from-violet-600 to-indigo-600 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span>Cadastros</span>
                <svg className={`w-3 h-3 ml-1 transition-transform duration-200 ${isCadastrosOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isCadastrosOpen && (
                <div className="absolute top-full left-0 mt-1 w-52 bg-white border border-slate-200/80 rounded-xl shadow-2xl shadow-slate-200/50 backdrop-blur-xl overflow-hidden z-50">
                  {username === 'admin' && (
                    <button
                      onClick={() => { setActiveTab('users'); setIsCadastrosOpen(false); }}
                      className={`w-full flex items-center space-x-3 px-4 py-2.5 text-xs font-semibold tracking-wide transition-all duration-150 text-left ${
                        activeTab === 'users'
                          ? 'bg-violet-50 text-violet-600 border-l-2 border-violet-500'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-l-2 border-transparent'
                      }`}
                    >
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <span>Usuários</span>
                    </button>
                  )}
                  <button
                    onClick={() => { setActiveTab('customers'); setIsCadastrosOpen(false); }}
                    className={`w-full flex items-center space-x-3 px-4 py-2.5 text-xs font-semibold tracking-wide transition-all duration-150 text-left ${
                      activeTab === 'customers'
                        ? 'bg-violet-50 text-violet-600 border-l-2 border-violet-500'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-l-2 border-transparent'
                    }`}
                  >
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span>Clientes</span>
                  </button>
                  <button
                    onClick={() => { setActiveTab('products'); setIsCadastrosOpen(false); }}
                    className={`w-full flex items-center space-x-3 px-4 py-2.5 text-xs font-semibold tracking-wide transition-all duration-150 text-left ${
                      activeTab === 'products'
                        ? 'bg-violet-50 text-violet-600 border-l-2 border-violet-500'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-l-2 border-transparent'
                    }`}
                  >
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <span>Produtos</span>
                  </button>
                </div>
              )}
            </div>

            {/* Operações Dropdown */}
            <div className="relative" ref={operacoesRef}>
              <button
                onClick={() => setIsOperacoesOpen(!isOperacoesOpen)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 flex items-center space-x-1.5 ${
                  isOperacoesActive
                    ? 'bg-linear-to-r from-violet-600 to-indigo-600 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <span>Operações</span>
                <svg className={`w-3 h-3 ml-1 transition-transform duration-200 ${isOperacoesOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isOperacoesOpen && (
                <div className="absolute top-full left-0 mt-1 w-52 bg-white border border-slate-200/80 rounded-xl shadow-2xl shadow-slate-200/50 backdrop-blur-xl overflow-hidden z-50">
                  <button
                    onClick={() => { setActiveTab('vendas'); setIsOperacoesOpen(false); }}
                    className={`w-full flex items-center space-x-3 px-4 py-2.5 text-xs font-semibold tracking-wide transition-all duration-150 text-left ${
                      activeTab === 'vendas'
                        ? 'bg-violet-50 text-violet-600 border-l-2 border-violet-500'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-l-2 border-transparent'
                    }`}
                  >
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 14l6-6m-5.5.5h.01M14.5 9.5h.01M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2zM7 5V3m10 2V3" />
                    </svg>
                    <span>Vendas</span>
                  </button>
                  <button
                    onClick={() => { setActiveTab('compras'); setIsOperacoesOpen(false); }}
                    className={`w-full flex items-center space-x-3 px-4 py-2.5 text-xs font-semibold tracking-wide transition-all duration-150 text-left ${
                      activeTab === 'compras'
                        ? 'bg-violet-50 text-violet-600 border-l-2 border-violet-500'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-l-2 border-transparent'
                    }`}
                  >
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                    <span>Compras</span>
                  </button>
                </div>
              )}
            </div>

            {/* Relatórios Dropdown */}
            <div className="relative" ref={relatoriosRef}>
              <button
                onClick={() => setIsRelatoriosOpen(!isRelatoriosOpen)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 flex items-center space-x-1.5 ${
                  isRelatoriosActive
                    ? 'bg-linear-to-r from-violet-600 to-indigo-600 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Relatórios</span>
                <svg className={`w-3 h-3 ml-1 transition-transform duration-200 ${isRelatoriosOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isRelatoriosOpen && (
                <div className="absolute top-full left-0 mt-1 w-52 bg-white border border-slate-200/80 rounded-xl shadow-2xl shadow-slate-200/50 backdrop-blur-xl overflow-hidden z-50">
                  <button
                    onClick={() => { setActiveTab('relatoriovendas'); setIsRelatoriosOpen(false); }}
                    className={`w-full flex items-center space-x-3 px-4 py-2.5 text-xs font-semibold tracking-wide transition-all duration-150 text-left ${
                      activeTab === 'relatoriovendas'
                        ? 'bg-violet-50 text-violet-600 border-l-2 border-violet-500'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-l-2 border-transparent'
                    }`}
                  >
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Relatório de Vendas</span>
                  </button>
                  <button
                    onClick={() => { setActiveTab('relatoriocompras'); setIsRelatoriosOpen(false); }}
                    className={`w-full flex items-center space-x-3 px-4 py-2.5 text-xs font-semibold tracking-wide transition-all duration-150 text-left ${
                      activeTab === 'relatoriocompras'
                        ? 'bg-violet-50 text-violet-600 border-l-2 border-violet-500'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-l-2 border-transparent'
                    }`}
                  >
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                    <span>Relatório de Compras</span>
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-700 font-medium">{username}</span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center space-x-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 hover:text-red-700 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Sair</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8 flex flex-col relative z-10">
        {activeTab === 'dashboard' ? (
          <Dashboard username={username} />
        ) : activeTab === 'users' ? (
          <UserRegistration />
        ) : activeTab === 'customers' ? (
          <Customers />
        ) : activeTab === 'vendas' ? (
          <Vendas username={username} />
        ) : activeTab === 'compras' ? (
          <Compras />
        ) : activeTab === 'relatoriovendas' ? (
          <RelatorioVendas username={username} />
        ) : activeTab === 'relatoriocompras' ? (
          <RelatorioCompras />
        ) : (
          <Products />
        )}
      </main>

      <footer className="py-4 text-center border-t border-slate-200 text-slate-400 text-xs">
        Copyright &copy; {new Date().getFullYear()} Botogoske Soluções.
      </footer>
    </div>
  );
}

export default App;
