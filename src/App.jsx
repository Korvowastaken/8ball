import React, { useEffect, useState } from 'react';
import './App.css';
import './component/livematchs'
import LiveMatches from './component/livematchs';

function App() {

  return (
    <>
      <LiveMatches />
      <footer>
        <p>made by Robel</p>
      </footer>
    </>
  );
}

export default App;
