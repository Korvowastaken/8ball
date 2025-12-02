import React, { useState, useEffect, useCallback } from 'react'
import { addDays, format } from 'date-fns';

import MatchCard from './MatchCard';


const API_KEY = import.meta.env.VITE_API_KEY2;
const BASE_URL = import.meta.env.PROD
  ? 'https://api.football-data.org/v4'
  : '/api/football-data';

function fixture() {
  
  const [selectedDate, setSelectedDate] = useState(() =>
    new Date().toISOString().split('T')[0]
  );
  const [nextDate, setNextDate] = useState(() =>
    getNextDay(new Date().toISOString().split('T')[0])
  );
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  
  function getNextDay(dateString) {
    const date = new Date(dateString);
    const nextDay = addDays(date, 1);
    return format(nextDay, 'yyyy-MM-dd');
  }

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

    // Format date for API (YYYY-MM-DD)
    const formattedDate = selectedDate;
    fetch(`${BASE_URL}/matches?dateFrom=${selectedDate}&dateTo=${nextDate}`, {    
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
        console.log('Fetched fixtures:', fixturesData);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Failed to load fixtures.');
        }
      })
      .finally(() => setLoading(false));
  }, [selectedDate]);

  return (
    <>
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => {
          setSelectedDate(e.target.value)
          setNextDate(getNextDay(e.target.value))
        }}
      />
      <button onClick={searchfixture}>
        search
      </button>

      {loading && <p>Loading fixtures...</p>}
      {!loading && error && <p>{error}</p>}
      {!loading && !error && fixtures.length === 0 && <p>No fixtures found for this date.</p>}
      {!loading && !error && fixtures.length > 0 &&  (() => {
        return fixtures.length === 0 ? (
          <p>No major league fixtures found for this date.</p>
        ) : (
          <>
            <p>Found {fixtures.length} major league matches</p>
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
                    
                    <MatchCard key={item.id ?? item.utcDate} item={item} isLive={true} />
                    
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