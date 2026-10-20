import { useState, useEffect } from 'react';
import MatchList from './MatchList';
import '../styles/live.css';

// matches the API's 60s edge cache
const REFRESH_MS = 60_000;

function LiveMatches() {
  const [liveMatches, setLiveMatches] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    const load = () =>
      fetch('/api/live-matches?status=LIVE', { signal: controller.signal })
        .then((res) => {
          if (!res.ok) throw new Error(`Failed to fetch live matches: ${res.status}`);
          return res.json();
        })
        .then((data) => {
          setLiveMatches(Array.isArray(data?.matches) ? data.matches : []);
          setError('');
        })
        .catch((err) => {
          if (err.name !== 'AbortError') setError(err.message || 'Failed to load live matches');
        });

    load();
    const timer = setInterval(load, REFRESH_MS);

    return () => {
      controller.abort();
      clearInterval(timer);
    };
  }, []);

  if (!liveMatches && !error) {
    return (
      <div className="result">
        <p className='hitStat' style={{ marginTop: '2rem' }}>Loading live matches...</p>
      </div>
    );
  }

  return (
    <div className="result">
      {error ? (
        <p className='hitStat'>{error}</p>
      ) : liveMatches.length === 0 ? (
        <p className='hitStat' style={{ marginTop: '2rem' }}>No major league live matches currently available.</p>
      ) : (
        <>
          <p className='hitStat'>
            Found {liveMatches.length} major league live match{liveMatches.length !== 1 ? 'es' : ''}
          </p>
          <MatchList matches={liveMatches} />
        </>
      )}
    </div>
  );
}

export default LiveMatches;
