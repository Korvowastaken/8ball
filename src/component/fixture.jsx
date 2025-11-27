import React, { useState, useEffect, useCallback } from 'react'

const API_KEY = import.meta.env.VITE_API_KEY;
const BASE_URL = 'https://v3.football.api-sports.io/';

function fixture() {

  const [selectedDate, setSelectedDate] = useState('')
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchHits, setSearchHits] = useState(0);

  const majorleague = [
    1,    // FIFA World Cup
    2,    // UEFA Champions League
    3,    // UEFA Europa League
    5,    // UEFA Nations League
    39,   // Premier League
    40,   // Championship
    45,   // FA Cup
    48,   // EFL Cup
    61,   // Ligue 1
    66,   // Coupe de France
    71,   // Brasileirão Série A
    78,   // Bundesliga
    81,   // DFB-Pokal
    88,   // Eredivisie
    94,   // Primeira Liga
    128,  // Liga Profesional
    135,  // Serie A
    137,  // Coppa Italia
    140,  // La Liga
    143,  // Copa del Rey
    262,  // Liga MX
    848   // UEFA Europa Conference League
  ]

  const searchfixture = useCallback(() => {
    if (!API_KEY) {
      setError('Missing API key');
      setLoading(false);
      return;
    }

    if (!selectedDate) {
      setError('Please select a date');
      return;
    }

    setLoading(true);
    setError('');
    const controller = new AbortController();

    fetch(`${BASE_URL}fixtures?date=${selectedDate}`, {
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
        const fixturesData = Array.isArray(data?.response) ? data.response : [];
        setFixtures(fixturesData);
        setSearchHits(data?.results ?? 0);
        console.log('Fetched fixtures:', fixturesData);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Failed to load fixtures.');
        }
      })
      .finally(() => setLoading(false));
  }, [selectedDate]);

  useEffect(() => {
    fixtures.forEach(e => {
      if(e.league?.id === 140){
        console.log(e)
      }
    });
  }, [fixtures]);

  return (
    <>
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
      />
      <button onClick={searchfixture}>
        search
      </button>

      {loading && <p>Loading fixtures...</p>}
      {!loading && error && <p>{error}</p>}
      {!loading && !error && fixtures.length === 0 && <p>No fixtures found for this date.</p>}
      {!loading && !error && fixtures.length > 0 &&  (() => {
        const filteredFixtures = fixtures.filter(item => majorleague.includes(item.league?.id));
        return filteredFixtures.length === 0 ? (
          <p>No major league fixtures found for this date.</p>
        ) : (
          <>
            <p>Found {filteredFixtures.length} major league matches</p>
          <ul id="matches-list">
            {(() => {
              let previousLeague = '';
              return fixtures
                .filter(item => majorleague.includes(item.league?.id))
                .map((item) => {
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
                        <p>{item.goals?.home ?? '-'}</p>
                        <p>{item.goals?.away ?? '-'}</p>
                      </div>

                      <div id="status">
                        <p>{item.fixture?.status?.short || item.fixture?.status?.long || 'TBD'}</p>
                        <p>{item.fixture?.status?.elapsed ? `${item.fixture.status.elapsed}'` : item.fixture?.date ? new Date(item.fixture.date).toLocaleTimeString() : 'TBD'}</p>
                        <p>{item.fixture?.venue?.name || 'Unknown venue'}</p>
                      </div>
                    </li>
                  </React.Fragment>
                );
              });
            })()}
          </ul>
        </>
        );
      })()}
    </>
  )
}

export default fixture