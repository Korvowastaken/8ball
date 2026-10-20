import React from 'react';
import MatchCard from './MatchCard';

const leagueOf = (match) => match.competition?.name || 'Unknown League';

function MatchList({ matches }) {
  const sorted = [...matches].sort((a, b) =>
    leagueOf(a).localeCompare(leagueOf(b)) || new Date(a.utcDate) - new Date(b.utcDate)
  );

  return (
    <ul id="matches-list">
      {sorted.map((match, i) => (
        <React.Fragment key={match.id ?? match.utcDate}>
          {(i === 0 || leagueOf(match) !== leagueOf(sorted[i - 1])) && (
            <li className="league-header">
              <h2>{leagueOf(match)}</h2>
            </li>
          )}
          <MatchCard item={match} />
        </React.Fragment>
      ))}
    </ul>
  );
}

export default MatchList;
