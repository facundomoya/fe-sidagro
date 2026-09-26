import React, { useState } from 'react';
import { Sprout, Lock, Mail, UserCheck, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('ingeniero');
  const [showPassword, setShowPassword] = useState(false);

  const roles = [
    { id: 'admin', label: 'Administrador del Sistema' },
    { id: 'ingeniero', label: 'Ingeniero Agrónomo' },
    { id: 'dueño', label: 'Dueño de campo'}
  ];

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     console.log('Credenciales enviadas:', { email, password, role });
//     alert(`Accediendo como: ${role}\nCorreo: ${email}`);
//   };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (onLogin) {
        onLogin({ email, role });
        }
    };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl border border-slate-200 grid grid-cols-1 md:grid-cols-2 overflow-hidden">
        
        {/* Panel Izquierdo: Identidad de SID-Agro */}
        <div className="bg-emerald-800 p-8 sm:p-10 text-white flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-700/80 mb-6 border border-emerald-600">
              <Sprout className="w-6 h-6 text-emerald-100" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">SID-Agro</h1>
            <p className="text-emerald-100 text-sm mt-2 font-medium">
              Sistema Inteligente de Decisión para Soja
            </p>
            
          </div>

          <div className="mt-8 pt-6 border-t border-emerald-700 text-xs text-emerald-200 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Módulo de Control de Acceso y Roles</span>
          </div>
        </div>

        {/* Panel Derecho: Formulario */}
        <div className="p-8 sm:p-10 flex flex-col justify-center">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-800">Iniciar Sesión</h2>
            <p className="text-sm text-slate-500 mt-1">Seleccioná tu rol de usuario e ingresá</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Selector de Rol */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                Tipo de Usuario / Rol
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <UserCheck className="w-5 h-5" />
                </span>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-5 h-5" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@sidagro.com"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                Contraseña
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Botón de envío */}
            <button
              type="submit"
              className="w-full mt-2 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-medium rounded-lg text-sm transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
            >
              Ingresar al Sistema
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}