import React, { useState, useEffect } from 'react'
import '../styles/live.css'



const API_KEY = import.meta.env.VITE_API_KEY;
const BASE_URL = 'https://v3.football.api-sports.io/';

export default function LiveMatches() {

    const [searchHits, setSearchHits] = useState(0);
    const [fixtures, setFixtures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {

        if (!API_KEY) {
          setError('Missing API key');
          setLoading(false);
          return;
        }
    
        const controller = new AbortController();
    
        fetch(`${BASE_URL}fixtures?live=all`, {
          method: 'GET',
          headers: {
            'x-apisports-key': API_KEY,
          },
          signal: controller.signal,
        })
          .then((res) => {
            if (!res.ok) {
              throw new Error(`Request failed with ${res.status}`);
            }
            return res.json();
          })
    
    
          .then((data) => {
            setFixtures(Array.isArray(data?.response) ? data.response : []);
            setSearchHits(data?.results ?? 0);
          })
    
    
          .catch((err) => {
            if (err.name !== 'AbortError') {
              setError(err.message || 'Failed to load fixtures.');
            }
          })
          .finally(() => setLoading(false));
    
        return () => controller.abort();
      }, []);


  return (
    <main>
        {loading && <p>Loading live fixtures…</p>}
        {!loading && error && <p>{error}</p>}
        {!loading && !error && fixtures.length === 0 && <p>No live fixtures right now.</p>}
        {!loading && !error && fixtures.length > 0 && (
          <>
            <p>Found {searchHits} matches</p>
            <ul id="matches-list">
              {(() => {
                let previousLeague = '';
                return fixtures.map((item) => {
                  const currentLeague = item.league?.name || 'Unknown League';
                  const isNewLeague = currentLeague !== previousLeague;
                  if (isNewLeague) {
                    previousLeague = currentLeague;
                  }
                  
                  return (
                    <React.Fragment key={`${item.fixture?.id ?? item.fixture?.timestamp}-fragment`}>
                      {isNewLeague && (
                        <li key={`league-${currentLeague}`} className="league-header">
                          <h2>{currentLeague}</h2>
                        </li>
                      )}
                      <li key={item.fixture?.id ?? item.fixture?.timestamp}>

                    <div id="teams-logos">
                      <img src={item.teams?.home?.logo} alt={item.teams?.home?.name} />
                      <img src={item.teams?.away?.logo} alt={item.teams?.away?.name} />
                    </div>

                    <div id="teams"> 
                      <p>{item.teams?.home?.name}</p>
                      <p>{item.teams?.away?.name}</p> 
                    </div>

                    <div id="goals">
                      <p>{item.goals?.home}</p>
                      <p>{item.goals?.away}</p>
                    </div>

                    <div id="status">
                      <p>{item.fixture?.status?.short}</p>
                      <p>{item.fixture?.status?.elapsed || 'Unknown elapsed time'} ' </p>
                    </div>
                    <div id="venue">
                      <p>{item.fixture?.venue?.name || 'Unknown venue'}</p>
                    </div>

                      </li>
                    </React.Fragment>
                  );
                });
              })()}
            </ul>
          </>
        )}
      </main>    
  )
}
