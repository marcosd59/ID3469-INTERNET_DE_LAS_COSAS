// App.js
import React, { useState } from 'react';
import './App.css';
import ProductStock from './productos';
import Notifications from './notificaciones';
import LoginForm from './LoginForm';

function App() {
  const [token, setToken] = useState('');

  const handleLogin = (accessToken) => {
    setToken(accessToken);
  };

  return (
    <div className="App">
      {token ? (
        <>
          <ProductStock token={token} />
          <Notifications token={token} />
        </>
      ) : (
        <LoginForm onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;