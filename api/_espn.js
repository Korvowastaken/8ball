// ESPN's public (unofficial, undocumented) soccer API. No key needed.
// Files starting with _ are not deployed as Vercel functions.
const BASE = 'https://site.api.espn.com/apis/site/v2/sports/soccer';

export const LEAGUES = [
  'eng.1', 'eng.2', 'esp.1', 'ger.1', 'ita.1', 'fra.1',
  'ned.1', 'por.1', 'bra.1', 'uefa.champions', 'uefa.europa',
];

// ESPN boxscore stat names (seen in real responses), grouped for the match page.
// ESPN's own *Pct values are skipped; accuracy is computed from accurate/total instead.
const STAT_GROUPS = [
  ['General', [
    ['possessionPct', 'Possession %'], ['wonCorners', 'Corners'], ['offsides', 'Offsides'],
    ['foulsCommitted', 'Fouls'], ['yellowCards', 'Yellow cards'], ['redCards', 'Red cards'],
  ]],
  ['Attack', [
    ['totalShots', 'Shots'], ['shotsOnTarget', 'Shots on target'], ['blockedShots', 'Blocked shots'],
    ['penaltyKickShots', 'Penalties taken'], ['penaltyKickGoals', 'Penalties scored'],
  ]],
  ['Passing', [
    ['totalPasses', 'Passes'], ['accuratePasses', 'Accurate passes', 'totalPasses'],
    ['totalCrosses', 'Crosses'], ['accurateCrosses', 'Accurate crosses', 'totalCrosses'],
    ['totalLongBalls', 'Long balls'], ['accurateLongBalls', 'Accurate long balls', 'totalLongBalls'],
  ]],
  ['Defence', [
    ['totalTackles', 'Tackles'], ['effectiveTackles', 'Tackles won', 'totalTackles'],
    ['interceptions', 'Interceptions'], ['totalClearance', 'Clearances'], ['saves', 'Saves'],
  ]],
];

// "412" or "412 (87%)" when there is a total to compare against
function statValue(stats, key, totalKey) {
  const value = stats?.[key];
  const total = Number(stats?.[totalKey]);
  if (value == null || !totalKey || !total) return value ?? null;
  return `${value} (${Math.round((Number(value) / total) * 100)}%)`;
}

const asFlag = (v) => Boolean(v?.didSub ?? v);

async function getJson(url) {
  // fail fast so the football-data fallback still answers quickly
  const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
  if (!res.ok) throw Object.assign(new Error(`ESPN error: ${res.status}`), { status: res.status });
  return res.json();
}

function toStatus(st) {
  const name = st?.type?.name ?? '';
  if (name.includes('POSTPONED')) return 'POSTPONED';
  if (name.includes('CANCELED')) return 'CANCELLED';
  if (name.includes('HALFTIME')) return 'PAUSED';
  return { pre: 'SCHEDULED', in: 'IN_PLAY', post: 'FINISHED' }[st?.type?.state] ?? 'SCHEDULED';
}

const toTeam = (t) => ({
  id: t?.id,
  name: t?.displayName,
  shortName: t?.shortDisplayName,
  crest: t?.logo ?? t?.logos?.[0]?.href,
});

function toMatch(league, leagueInfo, event, comp) {
  const side = (homeAway) => comp?.competitors?.find((c) => c.homeAway === homeAway);
  const home = side('home');
  const away = side('away');
  const st = comp?.status ?? event?.status;
  const started = st?.type?.state && st.type.state !== 'pre';
  const goals = (c) => {
    const raw = typeof c?.score === 'object' ? c.score?.value : c?.score;
    return started && raw != null && raw !== '' ? Number(raw) : null;
  };

  return {
    id: `espn-${league}-${event.id}`,
    utcDate: event.date ?? comp?.date,
    status: toStatus(st),
    minute: st?.type?.state === 'in' ? (st.type.shortDetail ?? st.displayClock) : null,
    competition: { name: leagueInfo?.name, emblem: leagueInfo?.logos?.[0]?.href },
    homeTeam: toTeam(home?.team),
    awayTeam: toTeam(away?.team),
    score: { fullTime: { home: goals(home), away: goals(away) } },
    venue: comp?.venue?.fullName,
  };
}

// days: ['YYYY-MM-DD', ...]; live: only matches in progress (today's scoreboard)
export async function listMatches({ live, days }) {
  const requests = LEAGUES.flatMap((league) =>
    live ? [[league, '']] : days.map((day) => [league, `?dates=${day.replaceAll('-', '')}`])
  );
  const results = await Promise.allSettled(requests.map(async ([league, query]) => {
    const board = await getJson(`${BASE}/${league}/scoreboard${query}`);
    return (board.events ?? []).map((e) => toMatch(league, board.leagues?.[0], e, e.competitions?.[0]));
  }));

  // one league failing is fine; all failing means ESPN is down or blocking us
  if (results.every((r) => r.status === 'rejected')) throw results[0].reason;
  const matches = results.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));
  return live ? matches.filter((m) => m.status === 'IN_PLAY' || m.status === 'PAUSED') : matches;
}

const toPlayers = (roster, starter) => (roster ?? [])
  .filter((p) => Boolean(p.starter) === starter)
  .map((p) => ({
    name: p.athlete?.displayName,
    number: p.jersey,
    position: p.position?.abbreviation,
    subbedIn: asFlag(p.subbedIn),
    subbedOut: asFlag(p.subbedOut),
  }));

// the league table group that contains this match's teams
function toStandings(standings, teamIds) {
  const groups = standings?.groups ?? [];
  const entriesOf = (g) => g.standings?.entries ?? g.entries ?? [];
  const group = groups.find((g) => entriesOf(g).some((e) => teamIds.includes(e.team?.id ?? e.id))) ?? groups[0];

  return entriesOf(group ?? {}).map((e) => {
    const st = Object.fromEntries((e.stats ?? []).map((x) => [x.name ?? x.type, x.displayValue ?? x.value]));
    return {
      teamId: e.team?.id ?? e.id,
      team: e.team?.shortDisplayName ?? e.team?.displayName ?? (typeof e.team === 'string' ? e.team : undefined),
      rank: st.rank,
      played: st.gamesPlayed,
      goalDifference: st.pointDifferential,
      points: st.points,
    };
  }).filter((row) => row.team);
}

export async function matchDetails(league, eventId) {
  const s = await getJson(`${BASE}/${league}/summary?event=${eventId}`);
  const comp = s.header?.competitions?.[0];
  const match = toMatch(league, s.header?.league, { id: eventId, date: comp?.date }, comp);
  const sideOf = (teamId) => (teamId != null && teamId === match.homeTeam.id ? 'home' : 'away');

  const statsBySide = Object.fromEntries((s.boxscore?.teams ?? []).map((t) => [
    sideOf(t.team?.id),
    Object.fromEntries((t.statistics ?? []).map((x) => [x.name, x.displayValue])),
  ]));

  return {
    ...match,
    venue: s.gameInfo?.venue?.fullName ?? match.venue,
    attendance: s.gameInfo?.attendance || null,
    referees: (s.gameInfo?.officials ?? []).map((o) => ({
      name: o.displayName ?? o.fullName,
      role: o.position?.displayName ?? o.position?.name,
    })),
    // kick-off, half-time etc. have no team; keep goals, cards, subs
    events: (s.keyEvents ?? []).filter((e) => e.team).map((e) => ({
      minute: e.clock?.displayValue,
      type: e.type?.text,
      players: (e.participants ?? []).map((p) => p.athlete?.displayName).filter(Boolean),
      text: e.shortText ?? e.text,
      side: sideOf(e.team.id),
    })),
    statGroups: STAT_GROUPS.map(([group, stats]) => ({
      group,
      rows: stats
        .map(([key, label, totalKey]) => ({
          label,
          home: statValue(statsBySide.home, key, totalKey),
          away: statValue(statsBySide.away, key, totalKey),
        }))
        .filter((row) => row.home != null || row.away != null),
    })).filter((g) => g.rows.length),
    form: (s.lastFiveGames ?? []).map((t) => ({
      side: sideOf(t.team?.id),
      team: t.team?.displayName,
      games: (t.events ?? []).map((g) => ({
        result: g.gameResult,
        score: g.score,
        opponent: g.opponent?.displayName ?? g.opponent?.abbreviation,
        date: g.gameDate,
        atVs: g.atVs,
      })),
    })).filter((t) => t.games.length),
    standings: toStandings(s.standings, [match.homeTeam.id, match.awayTeam.id]),
    commentary: (s.commentary ?? [])
      .map((c) => ({ minute: c.time?.displayValue, text: c.text }))
      .filter((c) => c.text),
    lineups: (s.rosters ?? [])
      .filter((r) => r.roster?.length)
      .map((r) => ({
        side: r.homeAway ?? sideOf(r.team?.id),
        team: r.team?.displayName,
        formation: r.formation,
        starters: toPlayers(r.roster, true),
        subs: toPlayers(r.roster, false),
      })),
  };
}

