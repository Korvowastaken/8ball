import React, { useState, useEffect, useCallback } from 'react';
import { addDays, format } from 'date-fns';
import MatchCard from './MatchCard';
import '../styles/fixture.css'

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
    setLoading(true);
    setError('');
    const controller = new AbortController();

    // Use the serverless function endpoint
    fetch(`/api/live-matches?dateFrom=${selectedDate}&dateTo=${nextDate}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
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
        
        
        const sortedFixtures = [...fixturesData].sort((a, b) => {
          const leagueA = a.competition?.name || '';
          const leagueB = b.competition?.name || '';
          
          if (leagueA < leagueB) return -1;
          if (leagueA > leagueB) return 1;
          
          return new Date(a.utcDate) - new Date(b.utcDate);
        });
        
        setFixtures(sortedFixtures);
        console.log('Fetched and sorted fixtures:', sortedFixtures);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Failed to load fixtures.');
        }
      })
      .finally(() => setLoading(false));
  }, [selectedDate, nextDate]);

  useEffect(() => {
    searchfixture();
  }, [searchfixture]);

  return (
    <>
      <div className="search">
        <input
        className='srch-input'
        type="date"
        value={selectedDate}
        onChange={(e) => {
          setSelectedDate(e.target.value)
          setNextDate(getNextDay(e.target.value))
        }}
        />
        {/* <button onClick={searchfixture} className='srch-btn'>
          SEARCH
        </button> */}
      </div>
      <div className='result'>
        {loading && <p className='hitStat'>Loading fixtures...</p>}
        {!loading && error && <p className='hitStat'>{error}</p>}
        {!loading && !error && fixtures.length === 0 && <p className='hitStat'>No fixtures found for this date.</p>}
        {!loading && !error && fixtures.length > 0 &&  (() => {
          return fixtures.length === 0 ? (
            <p className='hitStat'>No major league fixtures found for this date.</p>
        ) : (
          <>
            <p className='hitStat'>Found {fixtures.length} major league matches</p>
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
      </div>

      
    </>
  )
}

export default fixture