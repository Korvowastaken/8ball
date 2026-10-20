export const CREST_FALLBACK = '/crest-fallback.svg';

export const onCrestError = (e) => {
  e.target.onerror = null;
  e.target.src = CREST_FALLBACK;
};

export const isLive = (match) => match.status === 'IN_PLAY' || match.status === 'PAUSED';

export function statusText(match) {
  if (isLive(match)) return match.minute || 'LIVE';
  if (match.status === 'FINISHED') return 'FT';
  if (match.status === 'POSTPONED') return 'Postponed';
  if (match.status === 'CANCELLED') return 'Cancelled';
  return match.utcDate
    ? new Date(match.utcDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'TBD';
}
