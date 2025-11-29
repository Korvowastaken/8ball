import React from 'react';
import { useNavigate } from 'react-router-dom';
import './MatchCard.css';

function MatchCard({ item, isLive = false }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (item.id) {
      navigate(`/match/${item.id}`);
    }
  };

  const getScoreDisplay = () => {
    if (isLive && item.status === 'LIVE') {
      return {
        home: item.score?.fullTime?.home ?? item.score?.halfTime?.home ?? '-',
        away: item.score?.fullTime?.away ?? item.score?.halfTime?.away ?? '-'
      };
    }
    return {
      home: item.score?.fullTime?.home ?? item.score?.halfTime?.home ?? '-',
      away: item.score?.fullTime?.away ?? item.score?.halfTime?.away ?? '-'
    };
  };

  const scores = getScoreDisplay();

  return (
    <li 
      key={item.id ?? item.utcDate} 
      onClick={handleClick} 
      style={{ cursor: 'pointer' }}
      className={`match-card ${isLive ? 'live-match' : 'fixture-match'}`}
    >
      <div id="teams-logos">
        <img src={item.homeTeam?.crest} alt={item.homeTeam?.name} />
        <img src={item.awayTeam?.crest} alt={item.awayTeam?.name} />
      </div>

      <div id="teams"> 
        <p>{item.homeTeam?.name}</p>
        <p>{item.awayTeam?.name}</p> 
      </div>

      <div id="goals">
        <p>{scores.home}</p>
        <p>{scores.away}</p>
      </div>

      <div id="status">
        <p className={`match-status ${isLive && item.status === 'LIVE' ? 'live-indicator' : ''}`}>
          {item.status || 'TBD'}
        </p>
        <p>{item.utcDate ? new Date(item.utcDate).toLocaleTimeString() : 'TBD'}</p>
        <p>{item.venue || 'Unknown venue'}</p>
      </div>
    </li>
  );
}

export default MatchCard;
