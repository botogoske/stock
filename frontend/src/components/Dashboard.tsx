import React from 'react';

interface DashboardProps {
  username: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ username }) => {
  return (
    <div className="max-w-2xl mx-auto w-full text-center py-8">
      <div className="bg-white border border-slate-200 backdrop-blur-xl rounded-2xl p-8 shadow-xl">
        <div className="mb-6">
          <div className="inline-flex w-16 h-16 rounded-full bg-violet-50 text-violet-600 items-center justify-center mb-4 border border-violet-200">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Painel Principal</h1>
          <p className="text-slate-500 mt-2 text-sm">Bem-vindo à área de controle do sistema</p>
        </div>

        {/* Info Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-6 text-left">
          <h3 className="text-slate-900 text-sm font-semibold mb-3">Informações da Sessão</h3>
          <p className="text-slate-500 text-sm leading-relaxed">
            Você efetuou login com sucesso como <span className="text-violet-600 font-semibold">{username}</span>.
          </p>
        </div>

        <div className="text-slate-400 text-xs flex items-center justify-center space-x-2">
          <span>Status da Conexão:</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-slate-600 font-medium">Conectado ao Go Backend</span>
        </div>
      </div>
    </div>
  );
};
