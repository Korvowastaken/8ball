export const CREST_FALLBACK = '/crest-fallback.svg';

export const onCrestError = (e) => {
  e.target.onerror = null;
  e.target.src = CREST_FALLBACK;
};

// temporary: print API data to the browser console while we verify the ESPN source
export function logMatches(label, source, matches) {
  console.log(`[8ball] ${label}: ${matches.length} matches from ${source}`, matches);
  console.table(matches.map((m) => ({
    id: m.id,
    league: m.competition?.name,
    home: m.homeTeam?.name,
    away: m.awayTeam?.name,
    score: `${m.score?.fullTime?.home ?? '-'} - ${m.score?.fullTime?.away ?? '-'}`,
    status: m.status,
    minute: m.minute,
    kickoff: m.utcDate,
  })));
}

export const isLive =(match) => match.status === 'IN_PLAY' || match.status === 'PAUSED';

export function statusText(match) {
  if (isLive(match)) return match.minute || 'LIVE';
  if (match.status === 'FINISHED') return 'FT';
  if (match.status === 'POSTPONED') return 'Postponed';
  if (match.status === 'CANCELLED') return 'Cancelled';
  return match.utcDate
    ? new Date(match.utcDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'TBD';
}
