import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import { ScansProvider } from './context/ScansContext';
import './index.css';

// HashRouter keeps routing working on static hosts (GitHub Pages / Netlify / Vercel) without rewrite rules.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <ScansProvider>
        <App />
      </ScansProvider>
    </HashRouter>
  </React.StrictMode>
);
