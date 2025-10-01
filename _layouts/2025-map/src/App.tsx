import React from 'react';
import './App.css';
import { MarketMap } from './Map';
import { CssBaseline } from '@mui/material';

function App() {
  return (
    <div className="App">
      <CssBaseline />
      <MarketMap />
    </div>
  );
}

export default App;