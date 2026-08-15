import React from 'react';
import { createRoot } from 'react-dom/client';

/* Token + base layer first, then the self-hosted brand faces, then the page geometry
   that sits on top of both. Order matters: styles.css reads the tokens these define. */
import '@repoassure/design-system/styles';
import '@repoassure/design-system/styles/fonts';

import { App } from './App.tsx';
import './styles.css';

createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
