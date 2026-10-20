import './App.css';
import LiveMatches from './component/LiveMatches';
import Fixture from './component/Fixture';
import MatchDetails from './component/MatchDetails';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';

function App() {
  return (
    <Router>
      <nav className='option-btn'>
        <NavLink to="/" end>LIVE</NavLink>
        <NavLink to="/fixtures">SCHEDULES</NavLink>
      </nav>

      <div className="content">
        <Routes>
          <Route path="/" element={<LiveMatches />} />
          <Route path="/fixtures" element={<Fixture />} />
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
