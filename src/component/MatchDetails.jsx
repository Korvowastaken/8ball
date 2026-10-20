import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CREST_FALLBACK, onCrestError, statusText } from './matchHelpers';
import '../styles/MatchDetails.css';

const REFRESH_MS = 60_000;

function Team({ team, score, className }) {
  return (
    <div className={`team-card ${className}`}>
      <div className="team-logo-container">
        <img src={team?.crest || CREST_FALLBACK} alt={team?.name} onError={onCrestError} />
        <h3 className="team-name">{team?.shortName || team?.name}</h3>
      </div>
      <div className="team-info">
        <div className="team-score">{score ?? '-'}</div>
      </div>
    </div>
  );
}

function MatchDetails() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState({ id: null, match: null, error: '' });
  const loading = result.id !== matchId;
  const { match, error } = result;

  useEffect(() => {
    const controller = new AbortController();

    const load = () =>
      fetch(`/api/match-details?id=${encodeURIComponent(matchId)}`, { signal: controller.signal })
        .then((res) => {
          if (!res.ok) throw new Error(`Failed to fetch match details: ${res.status}`);
          return res.json();
        })
        .then((data) => {
          // temporary: see logMatches
          console.log(`[8ball] match ${matchId}`, data);
          setResult({ id: matchId, match: data, error: '' });
        })
        .catch((err) => {
          if (err.name !== 'AbortError') {
            setResult({ id: matchId, match: null, error: err.message || 'Failed to load match details' });
          }
        });

    load();
    // finished matches are edge-cached for a day, so refreshing them is cheap
    const timer = setInterval(load, REFRESH_MS);

    return () => {
      controller.abort();
      clearInterval(timer);
    };
  }, [matchId]);

  if (loading) return <p className='hitStat'>Loading match details...</p>;
  if (error) return <p className='hitStat'>Error: {error}</p>;
  if (!match) return <p className='hitStat'>Match not found</p>;

  const teamName = (side) => (side === 'home' ? match.homeTeam : match.awayTeam)?.shortName;
  const meta = [match.area, match.season && `Season ${match.season}`, match.matchday && `Matchday ${match.matchday}`, match.stage]
    .filter(Boolean);
  const halfTime = match.score?.halfTime;

  return (
    <div className="match-details">
      <button onClick={() => navigate(-1)} className="back-button">
        ← Back
      </button>

      <div className="match-header">
        {match.competition?.emblem && (
          <img src={match.competition.emblem} alt={match.competition.name} className="competition-emblem" />
        )}
        <h1>{match.competition?.name || 'Match details'}</h1>
        {meta.length > 0 && <p className="competition-meta">{meta.join(' · ')}</p>}
      </div>

      <div className="teams-container">
        <div className="teams-grid">
          <Team team={match.homeTeam} score={match.score?.fullTime?.home} className="home-team" />

          <div className="match-status">
            <div className="match-time">
              {match.utcDate ? new Date(match.utcDate).toLocaleDateString([], { day: 'numeric', month: 'short' }) : ''}
            </div>
            <div className="match-vs">
              <p>VS</p>
            </div>
            <div className={`status-badge ${match.status?.toLowerCase()}`}>{statusText(match)}</div>
          </div>

          <Team team={match.awayTeam} score={match.score?.fullTime?.away} className="away-team-det" />
        </div>
      </div>

      <div className="match-info">
        <h3>Match Information</h3>
        <div className="info-grid">
          <div className="info-item">
            <strong>Kick-off</strong>
            <span>{match.utcDate ? new Date(match.utcDate).toLocaleString() : 'TBD'}</span>
          </div>
          {match.venue && (
            <div className="info-item">
              <strong>Venue</strong>
              <span>{match.venue}</span>
            </div>
          )}
          {match.attendance && (
            <div className="info-item">
              <strong>Attendance</strong>
              <span>{match.attendance.toLocaleString()}</span>
            </div>
          )}
          {halfTime?.home != null && (
            <div className="info-item">
              <strong>Half Time Score</strong>
              <span>{halfTime.home} - {halfTime.away}</span>
            </div>
          )}
        </div>
      </div>

      {match.events?.length > 0 && (
        <div className="referees-section">
          <h3>Timeline</h3>
          <ul className="event-list">
            {match.events.map((e, i) => (
              <li key={i} className={`event ${e.side}`}>
                <span className="event-minute">{e.minute}</span>
                <strong>{e.type}</strong>
                <span>{e.players.length ? e.players.join(' ↔ ') : e.text}</span>
                <span className="event-team">{teamName(e.side)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {match.stats?.length > 0 && (
        <div className="referees-section">
          <h3>Stats</h3>
          <table className="stats-table">
            <thead>
              <tr>
                <th>{match.homeTeam?.shortName}</th>
                <th></th>
                <th>{match.awayTeam?.shortName}</th>
              </tr>
            </thead>
            <tbody>
              {match.stats.map((s) => (
                <tr key={s.label}>
                  <td>{s.home}</td>
                  <th scope="row">{s.label}</th>
                  <td>{s.away}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {match.lineups?.length > 0 && (
        <div className="referees-section">
          <h3>Lineups</h3>
          <div className="lineups">
            {match.lineups.map((l) => (
              <div key={l.side} className="lineup">
                <h4>{l.team}{l.formation ? ` (${l.formation})` : ''}</h4>
                <ul>
                  {l.starters.map((p) => (
                    <li key={`${p.number}-${p.name}`}>{p.number} {p.name} <small>{p.position}</small></li>
                  ))}
                </ul>
                {l.subs.length > 0 && (
                  <>
                    <h5>Substitutes</h5>
                    <ul>
                      {l.subs.map((p) => (
                        <li key={`${p.number}-${p.name}`}>{p.number} {p.name} <small>{p.position}</small></li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {match.referees?.length > 0 && (
        <div className="referees-section">
          <h3>Match Officials</h3>
          <ul>
            {match.referees.map((referee, index) => (
              <li key={index}>
                {referee.name} - {referee.role || 'Referee'}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default MatchDetails;
