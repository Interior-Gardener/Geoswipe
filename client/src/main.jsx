import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { HeritageSelectionProvider } from './context/HeritageSelectionContext';
import { ThemeProvider } from './context/ThemeContext';
import './styles/theme-system.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <HeritageSelectionProvider>
        <App />
      </HeritageSelectionProvider>
    </ThemeProvider>
  </React.StrictMode>
);
