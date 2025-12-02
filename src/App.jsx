import React, { useState } from 'react';
import './App.css';
import LiveMatches from './component/LiveMatches';
import Fixture from './component/fixture'
import MatchDetails from './component/MatchDetails';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  const [option, setOption] = useState('live');

  return (
    <Router>
      <div className='option-btn'>
        <button onClick={() => setOption('live')}>LIVE</button>
        <button onClick={() => setOption('fixture')}>SCHEDULES</button>
      </div>
      
     <div className="content">
       <Routes>
        <Route path="/" element={option === 'live' ? <LiveMatches /> : <Fixture />} />
        <Route path="/match/:matchId" element={<MatchDetails />} />
      </Routes>
     </div>

      <footer>
        <p>made by Robel</p>
      </footer>
    </Router>
  );
}

export default App;
