import React, { useState, useEffect } from 'react';
import MatchCard from './MatchCard.jsx';
import '../styles/live.css';

function LiveMatches() {
  const [liveMatches, setLiveMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    const fetchLiveMatches = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch('/api/live-matches?status=LIVE', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.log('Error response:', errorText);
          throw new Error(`Failed to fetch live matches: ${response.status}`);
        }

        const data = await response.json();
        const matchesData = Array.isArray(data?.matches) ? data.matches : [];
        setLiveMatches(matchesData);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Failed to load live matches');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLiveMatches();

    return () => controller.abort();
  }, []);

  if (loading) return <p>Loading live matches...</p>;
  if (error) return <p>Error: {error}</p>;
  if (liveMatches.length === 0) return <p>No Major league live matches currently available.</p>;

  return (
    <div className="live-matches">
      <h1>Live Matches</h1>
      <p>Found {liveMatches.length} live matches</p>
      
      <ul id="matches-list">
        {(() => {
          let previousLeague = '';
          return liveMatches.map((match) => {
            const currentLeague = match.competition?.name || 'Unknown League';
            const isNewLeague = currentLeague !== previousLeague;
            if (isNewLeague) {
              previousLeague = currentLeague;
            }
                  
            return (
              <React.Fragment key={`${match.id ?? match.utcDate}-fragment`}>
                {isNewLeague && (
                  <li key={`league-${currentLeague}`} className="league-header">
                    <h2>{currentLeague}</h2>
                  </li>
                )}
                
                <MatchCard key={match.id ?? match.utcDate} item={match} isLive={true} />
              </React.Fragment>
            );
          });
        })()}
      </ul>
    </div>
  );
}

export default LiveMatches;
