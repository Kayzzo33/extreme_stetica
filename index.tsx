
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

try {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error("Erro fatal na renderização:", error);
  rootElement.innerHTML = '<div style="color: white; padding: 20px; text-align: center;"><h1>Erro ao carregar o site.</h1><p>Por favor, recarregue a página.</p></div>';
}
