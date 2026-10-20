import * as espn from './_espn.js';
import * as footballData from './_footballData.js';

// ids look like espn-eng.1-401879263 or fd-537785 (bare numbers are old football-data links)
const ESPN_ID = /^espn-([a-z]+(?:\.[a-z0-9]+)*)-(\d+)$/;
const FD_ID = /^(?:fd-)?(\d+)$/;

export default async function handler(req, res) {
  const id = req.query?.id ?? '';
  const espnId = ESPN_ID.exec(id);
  const fdId = FD_ID.exec(id);

  if (!espnId && !fdId) {
    return res.status(400).json({ error: 'Invalid match id' });
  }

  try {
    // temporary: raw ESPN fields for checking the converters, see _espn.js rawSample
    if (espnId && req.query.debug === '1') {
      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).json(await espn.rawSample(espnId[1], espnId[2]));
    }

    const match = espnId
      ? await espn.matchDetails(espnId[1], espnId[2])
      : await footballData.matchDetails(fdId[1]);

    res.setHeader('Cache-Control', match.status === 'FINISHED'
      ? 's-maxage=86400'
      : 's-maxage=60, stale-while-revalidate=60');
    return res.status(200).json(match);
  } catch (err) {
    console.error('Error in match-details API:', err);
    return res.status(err.status ?? 500).json({ error: 'Failed to fetch match details', details: err.message });
  }
}
