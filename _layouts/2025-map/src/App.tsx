import React from 'react';
import './App.css';
import { MarketMap } from './Map';
import { CssBaseline } from '@mui/material';

function App() {
  return (
    <div className="App">
      {/* <img src={`${process.env.PUBLIC_URL}/coming_soon.png`} alt="coming soon" width="350"></img> */}
      <CssBaseline />
      <MarketMap />
    </div>
  );
}

export default App;