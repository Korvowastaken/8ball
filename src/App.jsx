import React, { useState } from 'react';
import './App.css';
import LiveMatches from './component/livematchs';
import Fixture from './component/fixture'

function App() {

  const [option , setOption] = useState('live')

  return (
    <>
      <div className='option-btn'>
        <button onClick={() => setOption('live')}>live</button>
        <button onClick={() => setOption('fixture')}>fixture</button>
      </div>
      {option === 'live' && <LiveMatches />}
      {option === 'fixture' && <Fixture />}
      <footer>
        <p>made by Robel</p>
      </footer>
    </>
  );
}

export default App;
