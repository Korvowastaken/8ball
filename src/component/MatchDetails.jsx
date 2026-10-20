import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CREST_FALLBACK, onCrestError, statusText, isLive } from './matchHelpers';
import '../styles/MatchDetails.css';

const REFRESH_MS = 60_000;

const isGoal = (type = '') => /goal|penalty - scored/i.test(type) && !/disallowed|missed|saved/i.test(type);
const cardOf = (type = '') => (/red card/i.test(type) ? 'red' : /yellow card/i.test(type) ? 'yellow' : null);

function Section({ title, className = '', children }) {
  return (
    <section className={`md-card ${className}`}>
      <h3>{title}</h3>
      {children}
    </section>
  );
}

function TeamHeader({ team, scorers, side }) {
  return (
    <div className={`md-team ${side}`}>
      <img src={team?.crest || CREST_FALLBACK} alt="" onError={onCrestError} />
      <h2>{team?.shortName || team?.name}</h2>
      {scorers.length > 0 && (
        <ul className="md-scorers">
          {scorers.map((e, i) => (
            <li key={i}>{e.players[0] ?? e.text} {e.minute}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function StatRow({ label, home, away }) {
  const h = parseFloat(home) || 0;
  const a = parseFloat(away) || 0;
  const homeShare = h + a ? (h / (h + a)) * 100 : 50;
  return (
    <li className="md-stat">
      <div className="md-stat-values">
        <span>{home ?? '-'}</span>
        <span className="md-stat-label">{label}</span>
        <span>{away ?? '-'}</span>
      </div>
      <div className="md-stat-bar" aria-hidden="true">
        <span className={h >= a ? 'lead' : ''} style={{ width: `${homeShare}%` }} />
        <span className={a >= h ? 'lead' : ''} style={{ width: `${100 - homeShare}%` }} />
      </div>
    </li>
  );
}

function Lineup({ lineup, markers }) {
  const player = (p) => {
    const m = markers[p.name] ?? {};
    return (
      <li key={`${p.number}-${p.name}`}>
        <span className="md-shirt">{p.number}</span>
        <span>{p.name}</span>
        <span className="md-markers">
          {'⚽'.repeat(m.goals ?? 0)}
          {m.yellow && <span className="md-card-icon yellow" title="Yellow card" />}
          {m.red && <span className="md-card-icon red" title="Red card" />}
          {p.subbedIn && <span className="md-sub in" title="Came on">▲</span>}
          {p.subbedOut && <span className="md-sub out" title="Went off">▼</span>}
        </span>
        <small>{p.position}</small>
      </li>
    );
  };

  return (
    <div className="md-lineup">
      <h4>{lineup.team}{lineup.formation ? <small> {lineup.formation}</small> : null}</h4>
      <ul>{lineup.starters.map(player)}</ul>
      {lineup.subs.length > 0 && (
        <>
          <h5>Substitutes</h5>
          <ul>{lineup.subs.map(player)}</ul>
        </>
      )}
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

  const events = match.events ?? [];
  const goals = events.filter((e) => isGoal(e.type));
  const markers = {};
  for (const e of events) {
    const name = e.players?.[0];
    if (!name) continue;
    const m = (markers[name] ??= {});
    if (isGoal(e.type)) m.goals = (m.goals ?? 0) + 1;
    const card = cardOf(e.type);
    if (card) m[card] = true;
  }

  const teamOf = (side) => (side === 'home' ? match.homeTeam : match.awayTeam);
  const teamIds = [match.homeTeam?.id, match.awayTeam?.id];
  const meta = [match.area, match.season && `Season ${match.season}`, match.matchday && `Matchday ${match.matchday}`, match.stage];
  const halfTime = match.score?.halfTime;
  const kickoff = match.utcDate ? new Date(match.utcDate) : null;

  return (
    <div className="md">
      <button onClick={() => navigate(-1)} className="back-button">
        ← Back
      </button>

      <header className="md-scoreboard">
        <p className="md-comp">
          {match.competition?.emblem && <img src={match.competition.emblem} alt="" />}
          {[match.competition?.name, kickoff?.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' }), ...meta]
            .filter(Boolean)
            .join(' · ')}
        </p>
        <div className="md-teams">
          <TeamHeader team={match.homeTeam} side="home" scorers={goals.filter((e) => e.side === 'home')} />
          <div className="md-score">
            <span className="md-score-value">
              {match.score?.fullTime?.home ?? '-'} - {match.score?.fullTime?.away ?? '-'}
            </span>
            <span className={`md-status ${isLive(match) ? 'live' : ''}`}>{statusText(match)}</span>
          </div>
          <TeamHeader team={match.awayTeam} side="away" scorers={goals.filter((e) => e.side === 'away')} />
        </div>
      </header>

      <div className="md-grid">
        <div className="md-col">
          {events.length > 0 && (
            <Section title="Timeline">
              <ol className="md-timeline">
                {events.map((e, i) => (
                  <li key={i} className={e.side}>
                    <span className="md-minute">{e.minute}</span>
                    <span className="md-event-type">{e.type}</span>
                    <span>{e.players?.length ? e.players.join(' ↔ ') : e.text}</span>
                    <small>{teamOf(e.side)?.shortName}</small>
                  </li>
                ))}
              </ol>
            </Section>
          )}

          {match.lineups?.length > 0 && (
            <Section title="Lineups">
              <div className="md-lineups">
                {match.lineups.map((l) => <Lineup key={l.side} lineup={l} markers={markers} />)}
              </div>
            </Section>
          )}
        </div>

        <div className="md-col">
          {match.statGroups?.map((g) => (
            <Section key={g.group} title={g.group}>
              <ul className="md-stats">
                {g.rows.map((row) => <StatRow key={row.label} {...row} />)}
              </ul>
            </Section>
          ))}

          {match.form?.length > 0 && (
            <Section title="Form (last 5)">
              {match.form.map((t) => (
                <div key={t.side} className="md-form">
                  <span>{t.team}</span>
                  <span className="md-form-results">
                    {t.games.map((g, i) => (
                      <span key={i} className={`md-result ${g.result}`} title={`${g.atVs ?? ''} ${g.opponent ?? ''} ${g.score ?? ''}`.trim()}>
                        {g.result}
                      </span>
                    ))}
                  </span>
                </div>
              ))}
            </Section>
          )}

          {match.standings?.length > 0 && (
            <Section title="Table">
              <table className="md-table">
                <thead>
                  <tr><th>#</th><th>Team</th><th>P</th><th>GD</th><th>Pts</th></tr>
                </thead>
                <tbody>
                  {match.standings.map((row) => (
                    <tr key={row.teamId ?? row.team} className={teamIds.includes(row.teamId) ? 'highlight' : ''}>
                      <td>{row.rank}</td>
                      <td>{row.team}</td>
                      <td>{row.played}</td>
                      <td>{row.goalDifference}</td>
                      <td><strong>{row.points}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>
          )}

          <Section title="Match info">
            <dl className="md-info">
              {[
                ['Kick-off', kickoff ? kickoff.toLocaleString() : 'TBD'],
                ['Venue', match.venue],
                ['Attendance', match.attendance?.toLocaleString()],
                ['Half time', halfTime?.home != null ? `${halfTime.home} - ${halfTime.away}` : null],
                ...(match.referees ?? []).map((r) => [r.role || 'Referee', r.name]),
              ].filter(([, value]) => value).map(([label, value], i) => (
                <div key={i}><dt>{label}</dt><dd>{value}</dd></div>
              ))}
            </dl>
          </Section>
        </div>
      </div>

      {match.commentary?.length > 0 && (
        <details className="md-card md-commentary">
          <summary>Commentary ({match.commentary.length})</summary>
          <ol>
            {match.commentary.map((c, i) => (
              <li key={i}>
                <span className="md-minute">{c.minute}</span>
                <span>{c.text}</span>
              </li>
            ))}
          </ol>
        </details>
      )}
    </div>
  );
}

export default MatchDetails;
