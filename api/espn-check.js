// Temporary: checks whether ESPN's unofficial soccer API is reachable from Vercel and what data it has. Delete after testing.
const BASE = 'https://site.api.espn.com/apis/site/v2/sports/soccer';
const LEAGUES = ['eng.1', 'esp.1', 'ita.1', 'ger.1', 'fra.1', 'uefa.champions'];

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} from ${url}`);
  return res.json();
}

async function check(league, dates) {
  const board = await getJson(`${BASE}/${league}/scoreboard${dates ? `?dates=${dates}` : ''}`);
  const events = board.events ?? [];
  // finished or live matches are the ones that should have lineups, events and stats
  const event = events.find((e) => e.status?.type?.state !== 'pre') ?? events[0];
  const comp = event?.competitions?.[0];

  const result = {
    league,
    matches: events.length,
    sample: event && {
      id: event.id,
      name: event.name,
      date: event.date,
      status: event.status?.type?.description,
      clock: event.status?.displayClock,
      score: comp?.competitors?.map((c) => `${c.team?.shortDisplayName} ${c.score}`).join(' - '),
      scoreboardHasDetails: (comp?.details?.length ?? 0) > 0,
      scoreboardDetailTypes: [...new Set((comp?.details ?? []).map((d) => d.type?.text))],
      scoreboardHasTeamStats: (comp?.competitors?.[0]?.statistics?.length ?? 0) > 0,
    },
  };

  if (event) {
    const summary = await getJson(`${BASE}/${league}/summary?event=${event.id}`);
    result.summary = {
      keys: Object.keys(summary),
      lineupPlayers: summary.rosters?.map((r) => r.roster?.length ?? 0),
      teamStatNames: summary.boxscore?.teams?.[0]?.statistics?.map((s) => s.name),
      keyEvents: summary.keyEvents?.length ?? 0,
      hasCommentary: (summary.commentary?.length ?? 0) > 0,
    };
  }
  return result;
}

export default async function handler(req, res) {
  // optional YYYYMMDD, to look at finished matches
  const dates = /^\d{8}$/.test(req.query?.dates ?? '') ? req.query.dates : undefined;
  const results = await Promise.all(
    LEAGUES.map((league) => check(league, dates).catch((err) => ({ league, error: err.message })))
  );
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ checkedAt: new Date().toISOString(), results });
}
