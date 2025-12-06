import React, { useState, useEffect } from 'react';
import MatchCard from './MatchCard.jsx';
import '../styles/live.css';

function LiveMatches() {
  const [liveMatches, setLiveMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [apiResponded, setApiResponded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let minLoadingTimer;

    const fetchLiveMatches = async () => {
      try {
        setError('');

        const response = await fetch('/api/live-matches?status=LIVE', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.log('Error response:', errorText);
          throw new Error(`Failed to fetch live matches: ${response.status}`);
        }

        const data = await response.json();
        const matchesData = Array.isArray(data?.matches) ? data.matches : [];
        
        if (isMounted) {
          setLiveMatches(matchesData);
          setApiResponded(true);
        }
      } catch (err) {
        if (isMounted && err.name !== 'AbortError') {
          setError(err.message || 'Failed to load live matches');
          setApiResponded(true);
        }
      }
    };

    minLoadingTimer = setTimeout(() => {
      if (isMounted && apiResponded) {
        setLoading(false);
      }
    }, 500);

    fetchLiveMatches().then(() => {
      if (isMounted && apiResponded) {
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, 500 - elapsedTime);
        
        if (remainingTime === 0) {
          setLoading(false);
        } else {
          setTimeout(() => {
            if (isMounted) {
              setLoading(false);
            }
          }, remainingTime);
        }
      }
    });

    const startTime = Date.now();

    return () => {
      isMounted = false;
      clearTimeout(minLoadingTimer);
    };
  }, [apiResponded]);

  if (loading) {
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
        </>
      )}
    </div>
  );
}

export default LiveMatches;