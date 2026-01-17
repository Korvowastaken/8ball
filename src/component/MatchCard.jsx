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
      home: item.score?.fullTime?.home ?? item.score?.halfTime?.home ?? '0',
      away: item.score?.fullTime?.away ?? item.score?.halfTime?.away ?? '0'
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
        <img 
          src={item.homeTeam?.crest} 
          alt={item.homeTeam?.name} 
          loading="lazy"
          width="40"
          height="40"
          style={{ backgroundColor: '#f0f0f0' }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNjY2MiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS1jYW1lcmEtb2ZmIj48cGF0aCBkPSJtMiA3ID0yIDhIMjBsMS40LTMuNCIvPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTEiIGZpbGw9IiNmMGYwZjAiIHI9IjMiLz48cGF0aCBkPSJNMTggNmgtE0xwIDF2MTlhMiAyIDAgMCAwIDIgMmgxNmEyIDIgMCAwIDAgMi0yVjVjMC0xLjEtLjktMi0yLTJoLTUiLz48cGF0aCBkPSJtMiA3IDEtNSAxLjEtM2EzLjUgMy41IDAgMCAxIDYuNiAwbDEuMSAzIi8+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMSIgcjIiLz48bGluZSB4MT0iMiIgeDI9IjIyIiB5MT0iMiIgeTI9IjIyIi8+PC9zdmc+'
          }}
        />
        <p className='team-name'>{item.homeTeam?.name}</p>
        <p className='team-score'>{scores.home}</p>
        
      </div>

      <div className="away-team">
        <img 
          src={item.awayTeam?.crest} 
          alt={item.awayTeam?.name} 
          loading="lazy"
          width="40"
          height="40"
          style={{ backgroundColor: '#f0f0f0' }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNjY2MiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS1jYW1lcmEtb2ZmIj48cGF0aCBkPSJtMiA3ID0yIDhIMjBsMS40LTMuNCIvPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTEiIGZpbGw9IiNmMGYwZjAiIHI9IjMiLz48cGF0aCBkPSJNMTggNmgtE0xwIDF2MTlhMiAyIDAgMCAwIDIgMmgxNmEyIDIgMCAwIDAgMi0yVjVjMC0xLjEtLjktMi0yLTJoLTUiLz48cGF0aCBkPSJtMiA3IDEtNSAxLjEtM2EzLjUgMy41IDAgMCAxIDYuNiAwbDEuMSAzIi8+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMSIgcjIiLz48bGluZSB4MT0iMiIgeDI9IjIyIiB5MT0iMiIgeTI9IjIyIi8+PC9zdmc+'
          }}
        />
        <p className='team-name'>{item.awayTeam?.name}</p>
        <p className='team-score'>{scores.away}</p>
        
      </div>      

      <div className="status">
        <p>{item.utcDate ? new Date(item.utcDate).toLocaleTimeString() : 'TBD'}</p>
      </div>
    </li>
  );
}

export default MatchCard;
