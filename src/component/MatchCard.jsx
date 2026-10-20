import { Link } from 'react-router-dom';
import { CREST_FALLBACK, onCrestError, statusText } from './matchHelpers';
import '../styles/MatchCard.css';

function Team({ className, team, score }) {
  return (
    <div className={className}>
      <img
        src={team?.crest || CREST_FALLBACK}
        alt={team?.name}
        loading="lazy"
        width="40"
        height="40"
        style={{ backgroundColor: '#f0f0f0' }}
        onError={onCrestError}
      />
      <p className='team-name'>{team?.name}</p>
      <p className='team-score'>{score}</p>
    </div>
  );
}

function MatchCard({ item }) {
  // fullTime holds the running score while a match is live; null before kick-off
  const score = item.score?.fullTime ?? {};

  return (
    <li className="match-item">
      <Link to={`/match/${item.id}`} className="match-card">
        <Team className="home-team" team={item.homeTeam} score={score.home ?? '-'} />
        <Team className="away-team" team={item.awayTeam} score={score.away ?? '-'} />
        <div className="status">
          <p>{statusText(item)}</p>
        </div>
      </Link>
    </li>
  );
}

export default MatchCard;
