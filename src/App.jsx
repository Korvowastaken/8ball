import { useEffect, useState } from 'react';
import './App.css';
const API_KEY = import.meta.env.VITE_API_KEY;
const BASE_URL = 'https://v3.football.api-sports.io/';

function App() {
  // const [data, setData] = useState(null);
  const [searchHits, setSearchHits] = useState(0);
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!API_KEY) {
      setError('Missing API key. Define VITE_API_KEY in your .env file.');
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
    <>
      <main>
        {loading && <p>Loading live fixtures…</p>}
        {!loading && error && <p>{error}</p>}
        {!loading && !error && fixtures.length === 0 && <p>No live fixtures right now.</p>}
        {!loading && !error && fixtures.length > 0 && (
          <>
            <p>Found {searchHits} matches</p>
            <ul id="matches-list">
              {fixtures.map((item) => (
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

                  <div>
                    <p>{item.fixture?.status?.long}</p>
                    <p>{item.status?.elapsed || 'Unknown elapsed time'}</p>
                  </div>
                  <div>
                    <p>{item.fixture?.venue?.name || 'Unknown venue'}</p>
                  </div>

                </li>
              ))}
            </ul>
          </>
        )}
      </main>

      <footer>
        <p>made by Robel</p>
      </footer>
    </>
  );
}

export default App;
