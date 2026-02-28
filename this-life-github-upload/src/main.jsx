import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';
import { ZoneProvider } from './contexts/ZoneContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ZoneProvider>
          <App />
        </ZoneProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
