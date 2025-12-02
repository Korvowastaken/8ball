import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/MatchDetails.css';

function MatchDetails() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!matchId) {
      setError('No match ID provided');
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchMatchDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/match-details?id=${matchId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch match details: ${response.status}`);
        }

        const data = await response.json();
        setMatch(data);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Failed to load match details');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMatchDetails();

    return () => controller.abort();
  }, [matchId]);

  if (loading) return <p>Loading match details...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!match) return <p>Match not found</p>;

  return (
    <div className="match-details">
      <button onClick={() => navigate(-1)} className="back-button">
        ← Back
      </button>
      
      <div className="match-header">
        <h1>Match Details</h1>
        <div className="competition-info">
          <h2>{match.competition?.name || 'Unknown Competition'}</h2>
          <p>Matchday {match.matchday || 'N/A'}</p>
        </div>
      </div>

      <div className="teams-section">
        <div className="team home-team">
          <img src={match.homeTeam?.crest} alt={match.homeTeam?.name} />
          <h3>{match.homeTeam?.name}</h3>
        </div>
        
        <div className="score-section">
          <div className="score">
            <span className="home-score">{match.score?.fullTime?.home ?? '-'}</span>
            <span className="vs">VS</span>
            <span className="away-score">{match.score?.fullTime?.away ?? '-'}</span>
          </div>
          <div className="status">
            <p>{(match.status === 'IN_PLAY' ? 'Live' : match.status) || 'TBD'}</p>
            <p>Date: {match.utcDate ? new Date(match.utcDate).toLocaleString() : 'TBD'}</p>
          </div>
        </div>
        
        <div className="team away-team">
          <img src={match.awayTeam?.crest} alt={match.awayTeam?.name} />
          <h3>{match.awayTeam?.name}</h3>
        </div>
      </div>

      <div className="match-info">
        <h3>Match Information</h3>
        <div className="info-grid">
          <div className="info-item">
            <strong>Venue:</strong> {match.venue || 'Unknown venue'}
          </div>
          <div className="info-item">
            <strong>Referee:</strong> {match.referees?.[0]?.name || 'Not assigned'}
          </div>
          <div className="info-item">
            <strong>Half Time Score:</strong> {match.score?.halfTime?.home ?? '-'} - {match.score?.halfTime?.away ?? '-'}
          </div>
          <div className="info-item">
            <strong>Full Time Score:</strong> {match.score?.fullTime?.home ?? '-'} - {match.score?.fullTime?.away ?? '-'}
          </div>
        </div>
      </div>

      {match.referees && match.referees.length > 0 && (
        <div className="referees-section">
          <h3>Match Officials</h3>
          <ul>
            {match.referees.map((referee, index) => (
              <li key={index}>
                {referee.name} - {referee.role || 'Referee'}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default MatchDetails;
