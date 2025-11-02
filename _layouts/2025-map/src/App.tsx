import React from 'react';
import './App.css';
import { MarketMap } from './Map';
import { CssBaseline } from '@mui/material';
import { BoothContentProvider } from './contexts/BoothContentContext';

function App() {
  return (
    <div className="App">
      <CssBaseline />
      <BoothContentProvider>
        <MarketMap />
      </BoothContentProvider>
    </div>
  );
}

export default App;