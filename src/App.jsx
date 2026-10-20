import './App.css';
import LiveMatches from './component/LiveMatches';
import Fixture from './component/Fixture';
import MatchDetails from './component/MatchDetails';
import { BrowserRouter as Router, Routes, Route, Link, NavLink } from 'react-router-dom';

function App() {
  return (
    <Router>
      <header className="site-header">
        <nav className="site-nav" aria-label="Main">
          <Link to="/" className="brand">
            <img src="/ball.png" alt="" width="28" height="28" />
            <span>8Ball</span>
          </Link>
          <div className="nav-links">
            <NavLink to="/" end>
              <span className="live-dot" aria-hidden="true" />
              Live
            </NavLink>
            <NavLink to="/fixtures">Schedule</NavLink>
          </div>
        </nav>
      </header>

      <div className="content">
        <Routes>
          <Route path="/" element={<LiveMatches />} />
          <Route path="/fixtures" element={<Fixture />} />
          <Route path="/match/:matchId" element={<MatchDetails />} />
        </Routes>
      </div>

      <footer className="site-footer">
        <p>
          Made by{' '}
          <a href="https://robe1dev.vercel.app/" target="_blank" rel="noopener noreferrer">Robel</a>
        </p>
      </footer>
    </Router>
  );
}

export default App;
