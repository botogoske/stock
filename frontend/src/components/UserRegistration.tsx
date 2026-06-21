import React, { useState, useEffect } from 'react';
import { GetUsers, CreateUser, UpdateUser, DeleteUser } from "../../wailsjs/go/main/App";
import { main } from "../../wailsjs/go/models";

export const UserRegistration: React.FC = () => {
  // Users management states
  const [usersList, setUsersList] = useState<main.User[]>([]);
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('Administrador');

  const [userActionMsg, setUserActionMsg] = useState('');
  const [userActionError, setUserActionError] = useState('');
  const [isUserLoading, setIsUserLoading] = useState(false);
  const [editingUsername, setEditingUsername] = useState<string | null>(null);

  const resetUserForm = () => {
    setNewUsername('');
    setNewEmail('');
    setNewPassword('');
    setNewRole('Administrador');
    setEditingUsername(null);
  };

  const fetchUsers = () => {
    GetUsers()
      .then((users) => {
        setUsersList(users || []);
      })
      .catch((err) => {
        console.error("Erro ao buscar usuários:", err);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEditUser = (user: main.User) => {
    setEditingUsername(user.username);
    setNewUsername(user.username);
    setNewEmail(user.email);
    setNewPassword('');
    setNewRole(user.role);
    setUserActionMsg('');
    setUserActionError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEditUser = () => {
    resetUserForm();
  };

  // Create new user
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newEmail.trim()) {
      setUserActionError("Nome de usuário e email são obrigatórios.");
      setUserActionMsg('');
      return;
    }

    if (!editingUsername && !newPassword.trim()) {
      setUserActionError("Senha é obrigatória para novos usuários.");
      setUserActionMsg('');
      return;
    }

    setUserActionError('');
    setUserActionMsg('');
    setIsUserLoading(true);

    const userData = new main.User({
      username: newUsername.trim(),
      email: newEmail.trim(),
      role: newRole,
      password: newPassword,
    });

    const action = editingUsername
      ? UpdateUser(editingUsername, userData)
      : CreateUser(userData);

    action
      .then((res: any) => {
        setIsUserLoading(false);
        if (res.success) {
          setUserActionMsg(res.message);
          resetUserForm();
          fetchUsers();
        } else {
          setUserActionError(res.message);
        }
      })
      .catch((err) => {
        setIsUserLoading(false);
        setUserActionError("Erro ao salvar usuário.");
        console.error(err);
      });
  };

  // Delete user
  const handleDeleteUser = (usernameToDelete: string) => {
    if (usernameToDelete === 'admin') {
      setUserActionError("O administrador padrão não pode ser excluído.");
      return;
    }

    DeleteUser(usernameToDelete)
      .then((success) => {
        if (success) {
          setUserActionMsg(`Usuário ${usernameToDelete} excluído com sucesso.`);
          setUserActionError('');
          fetchUsers();
        } else {
          setUserActionError("Erro ao excluir usuário.");
        }
      })
      .catch((err) => {
        setUserActionError("Erro na requisição.");
        console.error(err);
      });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* LEFT: Registration Form */}
      <div className="lg:col-span-4 bg-white border border-slate-200 backdrop-blur-xl rounded-2xl p-6 shadow-xl">
        <h2 className="text-lg font-bold text-slate-900 mb-4">{editingUsername ? 'Editar Usuário' : 'Novo Usuário'}</h2>
        
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <label htmlFor="newUser" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Nome de Usuário
            </label>
              <input
                id="newUser"
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="ex: joaosilva"
                disabled={isUserLoading || !!editingUsername}
                className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl py-2 px-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 text-sm transition-all duration-200 disabled:bg-slate-100 disabled:text-slate-500"
                autoComplete="off"
              />
              {editingUsername && (
                <p className="text-[10px] text-slate-400 mt-1">O nome de usuário não pode ser alterado.</p>
              )}
          </div>

          <div>
            <label htmlFor="newEmail" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              E-mail
            </label>
            <input
              id="newEmail"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="ex: joao@email.com"
              disabled={isUserLoading}
              className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl py-2 px-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 text-sm transition-all duration-200"
              autoComplete="off"
            />
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Senha
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isUserLoading}
              className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl py-2 px-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 text-sm transition-all duration-200"
              autoComplete="off"
            />
          </div>

          <div>
            <label htmlFor="newRole" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Cargo / Nível de Acesso
            </label>
            <select
              id="newRole"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              disabled={isUserLoading}
              className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl py-2 px-3 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 text-sm transition-all duration-200"
            >
              <option value="Administrador">Administrador</option>
              <option value="Operador">Operador</option>
            </select>
          </div>

          {/* Action Alert Message */}
          {userActionError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs flex items-center space-x-2">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{userActionError}</span>
            </div>
          )}

          {userActionMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-xl text-xs flex items-center space-x-2">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{userActionMsg}</span>
            </div>
          )}

          <div className="flex space-x-2">
            {editingUsername && (
              <button
                type="button"
                onClick={cancelEditUser}
                disabled={isUserLoading}
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
              disabled={isUserLoading}
              className="flex-1 py-2.5 bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-sm transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isUserLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Cadastrando...</span>
                </>
              ) : (
                <span>{editingUsername ? 'Atualizar Usuário' : 'Adicionar Usuário'}</span>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* RIGHT: Registered Users List */}
      <div className="lg:col-span-8 bg-white border border-slate-200 backdrop-blur-xl rounded-2xl p-6 shadow-xl flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-slate-900">Usuários Cadastrados</h2>
          <button
            onClick={fetchUsers}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg border border-slate-200 transition-all duration-200"
            title="Atualizar lista"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.228 9H18.01" />
            </svg>
          </button>
        </div>

        {/* Table list */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <th className="pb-3 pl-4">Usuário</th>
                <th className="pb-3">E-mail</th>
                <th className="pb-3">Cargo</th>
                <th className="pb-3 pr-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {usersList.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400 text-xs">
                    Nenhum usuário cadastrado.
                  </td>
                </tr>
              ) : (
                usersList.map((usr) => (
                  <tr key={usr.username} className="hover:bg-slate-50 transition-all duration-150 group">
                    <td className="py-3 pl-4 font-semibold text-slate-900 flex items-center space-x-3">
                      {/* Avatar placeholder */}
                      <div className="w-8 h-8 rounded-full bg-violet-100 border border-violet-300 text-violet-600 font-bold flex items-center justify-center text-xs">
                        {usr.username.slice(0, 2).toUpperCase()}
                      </div>
                      <span>{usr.username}</span>
                    </td>
                    <td className="py-3 text-slate-600 font-sans text-xs">{usr.email}</td>
                    <td className="py-3">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        usr.role === 'Administrador'
                          ? 'bg-indigo-50 text-indigo-600 border-indigo-200'
                          : usr.role === 'Editor'
                          ? 'bg-cyan-50 text-cyan-600 border-cyan-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {usr.role}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-right">
                      {usr.username !== 'admin' ? (
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => handleEditUser(usr)}
                            className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-150"
                            title="Editar usuário"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteUser(usr.username)}
                            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-150"
                            title="Excluir usuário"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 select-none italic font-sans pr-2">Sistema</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
