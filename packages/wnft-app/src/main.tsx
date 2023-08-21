import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
// import './index.css';
import {Buffer} from 'buffer';
import {SnackbarProvider} from 'notistack';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).Buffer = Buffer;


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SnackbarProvider maxSnack={3}>
      <App />
    </SnackbarProvider>
  </React.StrictMode>
);
