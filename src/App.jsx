import React, { useState } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

export default function App() {
  // 1. Estado global del usuario
  const [currentUser, setCurrentUser] = useState(null);

  // 2. Función para iniciar sesión
  const handleLogin = (userData) => {
    setCurrentUser(userData);
  };

  // 3. Función para cerrar sesión
  const handleLogout = () => {
    setCurrentUser(null);
  };

  // 4. Renderizado condicional
  return (
    <main>
      {!currentUser ? (
        <Login onLogin={handleLogin} />
      ) : (
        <Dashboard user={currentUser} onLogout={handleLogout} />
      )}
    </main>
  );
}