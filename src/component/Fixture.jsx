import { useState, useEffect } from 'react';
import { addDays, format, parseISO } from 'date-fns';
import MatchList from './MatchList';
import { logMatches } from './matchHelpers';
import '../styles/fixture.css'

// local calendar day, not UTC
const toDay = (date) => format(date, 'yyyy-MM-dd');

function Fixture() {
  const [selectedDate, setSelectedDate] = useState(() => toDay(new Date()));
  const [result, setResult] = useState({ date: null, fixtures: [], error: '' });
  const loading = result.date !== selectedDate;

  useEffect(() => {
    const controller = new AbortController();
    // The API filters by UTC date, so fetch the neighbouring days and keep only the user's local day.
    const day = parseISO(selectedDate);
    const from = toDay(addDays(day, -1));
    const to = toDay(addDays(day, 1));

    fetch(`/api/live-matches?dateFrom=${from}&dateTo=${to}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed with ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const matches = Array.isArray(data?.matches) ? data.matches : [];
        const fixtures = matches.filter((m) => m.utcDate && toDay(new Date(m.utcDate)) === selectedDate);
        logMatches(`fixtures ${selectedDate}`, data?.source, fixtures);
        setResult({ date: selectedDate, fixtures, error: '' });
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setResult({ date: selectedDate, fixtures: [], error: err.message || 'Failed to load fixtures.' });
        }
      });

    return () => controller.abort();
  }, [selectedDate]);

  const { fixtures, error } = result;

  return (
    <>
      <div className="search">
        <input
          className='srch-input'
          type="date"
          aria-label="Match date"
          value={selectedDate}
          // clearing the input gives '', which isn't a date
          onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
        />
      </div>
      <div className='result'>
        {loading ? (
          <p className='hitStat'>Loading fixtures...</p>
        ) : error ? (
          <p className='hitStat'>{error}</p>
        ) : fixtures.length === 0 ? (
          <p className='hitStat'>No fixtures found for this date.</p>
        ) : (
          <>
            <p className='hitStat'>Found {fixtures.length} major league matches</p>
            <MatchList matches={fixtures} />
          </>
        )}
      </div>
    </>
  )
}

export default Fixture
