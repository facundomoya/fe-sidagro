import React from 'react';
import { Sprout, LogOut, User } from 'lucide-react';

export default function Dashboard({ user, onLogout }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Barra superior */}
      <header className="bg-emerald-800 text-white px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-700 rounded-lg border border-emerald-600">
            <Sprout className="w-5 h-5 text-emerald-100" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight">SID-Agro</span>
            <span className="text-xs text-emerald-200 block">Panel de Control</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <span className="text-sm font-semibold block">{user.email}</span>
            <span className="text-xs text-emerald-200 uppercase font-medium">{user.role}</span>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 bg-emerald-900/60 hover:bg-emerald-900 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-colors border border-emerald-700"
          >
            <LogOut className="w-4 h-4" />
            <span>Salir</span>
          </button>
        </div>
      </header>

      {/* Contenido temporal del panel */}
      <main className="p-6 max-w-6xl mx-auto w-full flex-1 flex flex-col justify-center items-center text-center">
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm max-w-lg">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-4 border border-emerald-200">
            <User className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Sesión Iniciada con Éxito</h2>
          <p className="text-sm text-slate-600 mt-2">
            Ingresaste con el perfil de <strong>{user.role}</strong>.
          </p>
          <p className="text-xs text-slate-400 mt-4 leading-relaxed">
            Aquí conectaremos los módulos de Monitoreo de Plagas (Nezara viridula), Cálculo de Umbrales de Daño y Gestión de Lotes.
          </p>
        </div>
      </main>
    </div>
  );
}