import { useState, useEffect } from 'react';
import { addDays, differenceInCalendarDays, format, parseISO } from 'date-fns';
import MatchList from './MatchList';
import '../styles/fixture.css'

// local calendar day, not UTC
const toDay = (date) => format(date, 'yyyy-MM-dd');
const RELATIVE_DAYS = { '-1': 'Yesterday', 0: 'Today', 1: 'Tomorrow' };

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
  const day = parseISO(selectedDate);
  const offset = differenceInCalendarDays(day, new Date());
  const shift = (n) => setSelectedDate(toDay(addDays(day, n)));

  return (
    <>
      <div className="day-bar">
        <h1 className="day-title">
          {RELATIVE_DAYS[offset] ?? format(day, 'EEEE')}
          <small>{format(day, 'd MMMM yyyy')}</small>
        </h1>
        <div className="day-nav">
          <button type="button" onClick={() => shift(-1)} aria-label="Previous day">‹</button>
          <input
            className='srch-input'
            type="date"
            aria-label="Match date"
            value={selectedDate}
            // clearing the input gives '', which isn't a date
            onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
          />
          <button type="button" onClick={() => shift(1)} aria-label="Next day">›</button>
        </div>
        {offset !== 0 && (
          <button type="button" className="today-button" onClick={() => setSelectedDate(toDay(new Date()))}>
            Back to today
          </button>
        )}
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
            <p className='match-count'>{fixtures.length} match{fixtures.length !== 1 ? 'es' : ''}</p>
            <MatchList matches={fixtures} />
          </>
        )}
      </div>
    </>
  )
}

export default Fixture
