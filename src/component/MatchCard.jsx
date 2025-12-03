import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/MatchCard.css';

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
      <div className="home-team">
        <img src={item.homeTeam?.crest} alt={item.homeTeam?.name} />
        <p className='team-name'>{item.homeTeam?.name}</p>
        <p className='team-score'>{scores.home}</p>
        
      </div>

      <div className="away-team">
        <img src={item.awayTeam?.crest} alt={item.awayTeam?.name} />
        <p className='team-name'>{item.awayTeam?.name}</p>
        <p className='team-score'>{scores.away}</p>
        
      </div>

      {/* <div className="teams-logos">
        <img src={item.homeTeam?.crest} alt={item.homeTeam?.name} />
        <p>VS</p>
        <img src={item.awayTeam?.crest} alt={item.awayTeam?.name} />
      </div>

      <div className="goals">
        <p>{scores.home}</p>
        <p>{scores.away}</p>
      </div>

      <div className="teams"> 
        <p>{item.homeTeam?.name}</p>
        <p>{item.awayTeam?.name}</p> 
      </div> */}

      

      <div className="status">
        {/* <p className={`match-status ${isLive && item.status === 'LIVE' ? 'live-indicator' : ''}`}>
          {item.status || 'TBD'}
        </p> */}
        <p>{item.utcDate ? new Date(item.utcDate).toLocaleTimeString() : 'TBD'}</p>
        {/* <p className="venue">{item.venue || 'Unknown venue'}</p> */}
      </div>
    </li>
  );
}

export default MatchCard;
