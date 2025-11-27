import React, { useState, useEffect, useCallback } from 'react'

const API_KEY = import.meta.env.VITE_API_KEY;
const BASE_URL = 'https://v3.football.api-sports.io/';

function fixture() {

  const [selectedDate, setSelectedDate] = useState('')
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchHits, setSearchHits] = useState(0);

  const searchfixture = useCallback(() => {
    if (!API_KEY) {
      setError('Missing API key');
      setLoading(false);
      return;
    }

    setLoading(true);
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
        setFixtures(Array.isArray(data?.response) ? data.response : []);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Failed to load fixtures.');
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [selectedDate]);

  useEffect(() => {
    console.log(fixtures);
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
    </>
  )
}

export default fixture