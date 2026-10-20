// football-data.org, the fallback when ESPN fails. Free tier: delayed scores, no lineups/events/stats.
const BASE = 'https://api.football-data.org/v4';

async function getJson(path) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'X-Auth-Token': process.env.FOOTBALL_DATA_API_KEY },
  });
  if (!res.ok) throw Object.assign(new Error(`Football data API error: ${res.status}`), { status: res.status });
  return res.json();
}

const toTeam = (t) => ({ id: t?.id, name: t?.name, shortName: t?.shortName, crest: t?.crest });

const toMatch = (m) => ({
  id: `fd-${m.id}`,
  utcDate: m.utcDate,
  status: m.status,
  minute: null,
  competition: { name: m.competition?.name, emblem: m.competition?.emblem },
  homeTeam: toTeam(m.homeTeam),
  awayTeam: toTeam(m.awayTeam),
  score: { fullTime: m.score?.fullTime ?? {}, halfTime: m.score?.halfTime },
  venue: m.venue,
});

export async function listMatches({ live, dateFrom, dateTo }) {
  const params = new URLSearchParams(live ? { status: 'LIVE' } : { dateFrom, dateTo });
  const data = await getJson(`/matches?${params}`);
  return (data.matches ?? []).map(toMatch);
}

export async function matchDetails(id) {
  const m = await getJson(`/matches/${id}`);
  return {
    ...toMatch(m),
    area: m.area?.name,
    season: m.season?.startDate && `${m.season.startDate.slice(0, 4)}/${m.season.endDate?.slice(0, 4)}`,
    matchday: m.matchday,
    stage: m.stage?.replaceAll('_', ' '),
    referees: (m.referees ?? []).map((r) => ({ name: r.name, role: r.type })),
    events: [],
    stats: [],
    lineups: [],
  };
}
