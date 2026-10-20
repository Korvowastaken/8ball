import { Link } from 'react-router-dom';
import { CREST_FALLBACK, onCrestError, isLive, statusText } from './matchHelpers';
import '../styles/MatchCard.css';

function Team({ team, score, winner }) {
  return (
    <div className={`match-team${winner ? ' winner' : ''}`}>
      <img
        src={team?.crest || CREST_FALLBACK}
        alt=""
        loading="lazy"
        width="24"
        height="24"
        onError={onCrestError}
      />
      <span className="team-name">{team?.name}</span>
      <span className="team-score">{score}</span>
    </div>
  );
}

function MatchCard({ item }) {
  // fullTime holds the running score while a match is live; null before kick-off
  const { home, away } = item.score?.fullTime ?? {};
  const finished = item.status === 'FINISHED';

  return (
    <li className="match-item">
      <Link to={`/match/${item.id}`} className={`match-card${isLive(item) ? ' live' : ''}`}>
        <span className="match-status">{statusText(item)}</span>
        <div className="match-teams">
          <Team team={item.homeTeam} score={home} winner={finished && home > away} />
          <Team team={item.awayTeam} score={away} winner={finished && away > home} />
        </div>
      </Link>
    </li>
  );
}

export default MatchCard;
