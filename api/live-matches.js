import * as espn from './_espn.js';
import * as footballData from './_footballData.js';

const DAY = /^\d{4}-\d{2}-\d{2}$/;
const MAX_DAYS = 10;

function daysBetween(from, to) {
  const days = [];
  const end = new Date(`${to}T00:00:00Z`);
  for (let d = new Date(`${from}T00:00:00Z`); d <= end && days.length <= MAX_DAYS; d.setUTCDate(d.getUTCDate() + 1)) {
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

// GET ?status=LIVE, or ?dateFrom=YYYY-MM-DD&dateTo=YYYY-MM-DD
export default async function handler(req, res) {
  const { dateFrom, dateTo, status } = req.query;
  const live = status === 'LIVE';
  const days = live ? [] : DAY.test(dateFrom ?? '') && DAY.test(dateTo ?? '') ? daysBetween(dateFrom, dateTo) : [];

  if (!live && (days.length === 0 || days.length > MAX_DAYS)) {
    return res.status(400).json({ error: `Pass status=LIVE, or dateFrom and dateTo (YYYY-MM-DD, up to ${MAX_DAYS} days)` });
  }

  try {
    let source = 'espn';
    let matches;
    try {
      matches = await espn.listMatches({ live, days });
    } catch (err) {
      console.error('ESPN failed, falling back to football-data:', err);
      source = 'football-data';
      matches = await footballData.listMatches({ live, dateFrom, dateTo });
    }

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=60');
    return res.status(200).json({ source, matches });
  } catch (err) {
    console.error('Error in live-matches API:', err);
    return res.status(err.status ?? 500).json({ error: 'Failed to fetch matches', details: err.message });
  }
}
