import React, { useState, useEffect } from 'react'
import '../styles/live.css'


const API_KEY = import.meta.env.VITE_API_KEY2;
const BASE_URL = '/api/football-data';

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
    
        fetch(`${BASE_URL}matches?status=LIVE`, {
          method: 'GET',
          headers: {
            'X-Auth-Token': API_KEY,
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
            const fixturesData = Array.isArray(data?.matches) ? data.matches : [];
            setFixtures(fixturesData);
            setSearchHits(fixturesData.length);
        console.log('Fetched fixtures:', fixturesData); 
          })
    
    
          .catch((err) => {
            if (err.name !== 'AbortError') {
              setError(err.message || 'Failed to load fixtures.');
            }
          })
          .finally(() => setLoading(false));
    
        return () => controller.abort();
      }, []);

    useEffect(()=>{
      
    },[])


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
                  const currentLeague = item.competition?.name || 'Unknown League';
                  const isNewLeague = currentLeague !== previousLeague;
                  if (isNewLeague) {
                    previousLeague = currentLeague;
                  }
                        
                  return (
                  <React.Fragment key={`${item.id ?? item.utcDate}-fragment`}>
                    {isNewLeague && (
                      <li key={`league-${currentLeague}`} className="league-header">
                        <h2>{currentLeague}</h2>
                      </li>
                    )}
                    
                    <li key={item.id ?? item.utcDate}>
                      <div id="teams-logos">
                        <img src={item.homeTeam?.crest} alt={item.homeTeam?.name} />
                        <img src={item.awayTeam?.crest} alt={item.awayTeam?.name} />
                      </div>

                      <div id="teams"> 
                        <p>{item.homeTeam?.name}</p>
                        <p>{item.awayTeam?.name}</p> 
                      </div>

                      <div id="goals">
                        <p>{item.score?.fullTime?.home ?? item.score?.halfTime?.home ?? '-'}</p>
                        <p>{item.score?.fullTime?.away ?? item.score?.halfTime?.away ?? '-'}</p>
                      </div>

                      <div id="status">
                        <p>{item.status || 'TBD'}</p>
                        <p>{item.utcDate ? new Date(item.utcDate).toLocaleTimeString() : 'TBD'}</p>
                        <p>{item.venue || 'Unknown venue'}</p>
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
