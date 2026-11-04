import React from 'react';
import { createRoot } from 'react-dom/client';
import AndroidSimulator from './components/AndroidSimulator';
import './app-only.css';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AndroidSimulator standalone />
  </React.StrictMode>,
);
