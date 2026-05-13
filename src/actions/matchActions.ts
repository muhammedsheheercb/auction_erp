'use server'

import connectDB from '@/lib/mongodb';
import Match from '@/models/Match';
import Team from '@/models/Team';
import { revalidatePath } from 'next/cache';

// Group A team name keywords (case-insensitive partial match)
const GROUP_A_KEYWORDS = ['majestic', 'hermanos', 'decano', 'storm tuskers'];

function isGroupA(name: string) {
  const lower = name.toLowerCase();
  return GROUP_A_KEYWORDS.some(k => lower.includes(k));
}

function mkMatch(stage: string, n: number, home: any, away: any, day = 1) {
  return {
    stage, matchNumber: n, day,
    homeTeam: home._id, homeTeamName: home.name, homeTeamLogo: home.logo || '',
    awayTeam: away._id, awayTeamName: away.name, awayTeamLogo: away.logo || '',
    homeScore: 0, awayScore: 0, status: 'upcoming', goalScorers: [],
  };
}

// 4 teams → full round-robin, 6 matches, each team plays 3
//   Day 1 (4 matches): each team plays 2
//   Day 2 (2 matches): each team plays 1 → top 2 advance to semis
function buildGroupMatches(teams: any[], stage: string) {
  const t = teams;
  if (t.length === 4) {
    return [
      mkMatch(stage, 1, t[0], t[1], 1),
      mkMatch(stage, 2, t[2], t[3], 1),
      mkMatch(stage, 3, t[0], t[2], 1),
      mkMatch(stage, 4, t[1], t[3], 1),
      mkMatch(stage, 5, t[0], t[3], 2),
      mkMatch(stage, 6, t[1], t[2], 2),
    ];
  }
  if (t.length === 3) {
    return [
      mkMatch(stage, 1, t[0], t[1], 1),
      mkMatch(stage, 2, t[2], t[0], 1),
      mkMatch(stage, 3, t[1], t[2], 2),
    ];
  }
  if (t.length === 2) {
    return [
      mkMatch(stage, 1, t[0], t[1], 1),
      mkMatch(stage, 2, t[1], t[0], 2),
    ];
  }
  // fallback full round-robin (day 1 for all)
  const matches: any[] = [];
  let n = 1;
  for (let i = 0; i < t.length; i++)
    for (let j = i + 1; j < t.length; j++)
      matches.push(mkMatch(stage, n++, t[i], t[j], 1));
  return matches;
}

export async function initializeTournament() {
  await connectDB();
  const existing = await Match.countDocuments({ stage: { $in: ['GROUP_A', 'GROUP_B'] } });
  if (existing > 0) return { success: false, error: 'Group stage already initialized.' };

  const teams = await Team.find({}).lean();
  const groupA = teams.filter(t => isGroupA(t.name));
  const groupB = teams.filter(t => !isGroupA(t.name));

  if (groupA.length < 2) return { success: false, error: 'Need at least 2 Group A teams.' };
  if (groupB.length < 2) return { success: false, error: 'Need at least 2 Group B teams.' };

  await Match.insertMany([
    ...buildGroupMatches(groupA, 'GROUP_A'),
    ...buildGroupMatches(groupB, 'GROUP_B'),
  ]);

  revalidatePath('/tournament');
  return { success: true };
}

export async function resetTournament() {
  await connectDB();
  await Match.deleteMany({});
  revalidatePath('/tournament');
  return { success: true };
}

export async function resetAndInitializeTournament() {
  await connectDB();
  await Match.deleteMany({});

  const teams = await Team.find({}).lean();
  const groupA = teams.filter(t => isGroupA(t.name));
  const groupB = teams.filter(t => !isGroupA(t.name));

  if (groupA.length < 2) return { success: false, error: 'Need at least 2 Group A teams.' };
  if (groupB.length < 2) return { success: false, error: 'Need at least 2 Group B teams.' };

  await Match.insertMany([
    ...buildGroupMatches(groupA, 'GROUP_A'),
    ...buildGroupMatches(groupB, 'GROUP_B'),
  ]);

  revalidatePath('/tournament');
  return { success: true };
}

export async function getMatches() {
  try {
    await connectDB();
    const matches = await Match.find({}).sort({ stage: 1, matchNumber: 1 }).lean();
    return JSON.parse(JSON.stringify(matches));
  } catch {
    return [];
  }
}

export async function updateMatch(
  matchId: string,
  data: {
    homeScore: number;
    awayScore: number;
    status: 'upcoming' | 'completed';
    goalScorers: {
      playerId: string;
      playerName: string;
      teamId: string;
      teamName: string;
      goals: number;
    }[];
  }
) {
  await connectDB();
  await Match.findByIdAndUpdate(matchId, {
    homeScore: data.homeScore,
    awayScore: data.awayScore,
    status: data.status,
    goalScorers: data.goalScorers,
  });
  revalidatePath('/tournament');
  return { success: true };
}

export async function deleteMatch(matchId: string) {
  await connectDB();
  await Match.findByIdAndDelete(matchId);
  revalidatePath('/tournament');
  return { success: true };
}

// ── Knockout generation ────────────────────────────────────────────────────────

function getStandings(teamIds: string[], matches: any[], stage: string) {
  return teamIds.map(id => {
    const played = matches.filter(
      m => m.stage === stage && m.status === 'completed' &&
        (m.homeTeam.toString() === id || m.awayTeam.toString() === id)
    );
    let W = 0, D = 0, L = 0, GF = 0, GA = 0;
    for (const m of played) {
      const home = m.homeTeam.toString() === id;
      const gs = home ? m.homeScore : m.awayScore;
      const gc = home ? m.awayScore : m.homeScore;
      GF += gs; GA += gc;
      if (gs > gc) W++;
      else if (gs === gc) D++;
      else L++;
    }
    return { id, W, D, L, GF, GA, GD: GF - GA, Pts: W * 3 + D };
  }).sort((a, b) => b.Pts - a.Pts || b.GD - a.GD || b.GF - a.GF);
}

export async function generateSemiFinals() {
  await connectDB();

  const existing = await Match.countDocuments({ stage: { $in: ['SEMI_1', 'SEMI_2'] } });
  if (existing > 0) return { success: false, error: 'Semi-finals already created.' };

  const matches = await Match.find({ stage: { $in: ['GROUP_A', 'GROUP_B'] } }).lean();
  const teams = await Team.find({}).lean();

  const groupAIds = teams.filter(t => isGroupA(t.name)).map(t => t._id.toString());
  const groupBIds = teams.filter(t => !isGroupA(t.name)).map(t => t._id.toString());

  const standA = getStandings(groupAIds, matches, 'GROUP_A');
  const standB = getStandings(groupBIds, matches, 'GROUP_B');

  if (standA.length < 2 || standB.length < 2) {
    return { success: false, error: 'Not enough teams in standings.' };
  }

  const getTeam = (id: string) => teams.find(t => t._id.toString() === id)!;
  const a1 = getTeam(standA[0].id);
  const a2 = getTeam(standA[1].id);
  const b1 = getTeam(standB[0].id);
  const b2 = getTeam(standB[1].id);

  await Match.insertMany([
    {
      stage: 'SEMI_1', matchNumber: 1,
      homeTeam: a1._id, homeTeamName: a1.name, homeTeamLogo: a1.logo || '',
      awayTeam: b2._id, awayTeamName: b2.name, awayTeamLogo: b2.logo || '',
      homeScore: 0, awayScore: 0, status: 'upcoming', goalScorers: [],
    },
    {
      stage: 'SEMI_2', matchNumber: 1,
      homeTeam: b1._id, homeTeamName: b1.name, homeTeamLogo: b1.logo || '',
      awayTeam: a2._id, awayTeamName: a2.name, awayTeamLogo: a2.logo || '',
      homeScore: 0, awayScore: 0, status: 'upcoming', goalScorers: [],
    },
  ]);

  revalidatePath('/tournament');
  return { success: true };
}

export async function generateFinals() {
  await connectDB();

  const existing = await Match.countDocuments({ stage: { $in: ['FINAL', 'LOSERS_FINAL'] } });
  if (existing > 0) return { success: false, error: 'Finals already created.' };

  const sf1 = await Match.findOne({ stage: 'SEMI_1', status: 'completed' }).lean();
  const sf2 = await Match.findOne({ stage: 'SEMI_2', status: 'completed' }).lean();

  if (!sf1 || !sf2) return { success: false, error: 'Complete both semi-finals first.' };

  // Determine winners and losers
  const sf1HomeWon = sf1.homeScore > sf1.awayScore;
  const sf2HomeWon = sf2.homeScore > sf2.awayScore;

  const finalHome    = sf1HomeWon ? { id: sf1.homeTeam, name: sf1.homeTeamName, logo: sf1.homeTeamLogo } : { id: sf1.awayTeam, name: sf1.awayTeamName, logo: sf1.awayTeamLogo };
  const finalAway    = sf2HomeWon ? { id: sf2.homeTeam, name: sf2.homeTeamName, logo: sf2.homeTeamLogo } : { id: sf2.awayTeam, name: sf2.awayTeamName, logo: sf2.awayTeamLogo };
  const losersHome   = sf1HomeWon ? { id: sf1.awayTeam, name: sf1.awayTeamName, logo: sf1.awayTeamLogo } : { id: sf1.homeTeam, name: sf1.homeTeamName, logo: sf1.homeTeamLogo };
  const losersAway   = sf2HomeWon ? { id: sf2.awayTeam, name: sf2.awayTeamName, logo: sf2.awayTeamLogo } : { id: sf2.homeTeam, name: sf2.homeTeamName, logo: sf2.homeTeamLogo };

  await Match.insertMany([
    {
      stage: 'FINAL', matchNumber: 1,
      homeTeam: finalHome.id, homeTeamName: finalHome.name, homeTeamLogo: finalHome.logo,
      awayTeam: finalAway.id, awayTeamName: finalAway.name, awayTeamLogo: finalAway.logo,
      homeScore: 0, awayScore: 0, status: 'upcoming', goalScorers: [],
    },
    {
      stage: 'LOSERS_FINAL', matchNumber: 1,
      homeTeam: losersHome.id, homeTeamName: losersHome.name, homeTeamLogo: losersHome.logo,
      awayTeam: losersAway.id, awayTeamName: losersAway.name, awayTeamLogo: losersAway.logo,
      homeScore: 0, awayScore: 0, status: 'upcoming', goalScorers: [],
    },
  ]);

  revalidatePath('/tournament');
  return { success: true };
}

export async function getTournamentData() {
  try {
    await connectDB();
    const [matches, teams] = await Promise.all([
      Match.find({}).sort({ stage: 1, matchNumber: 1 }).lean(),
      Team.find({}).populate('players').lean(),
    ]);
    return {
      matches: JSON.parse(JSON.stringify(matches)),
      teams: JSON.parse(JSON.stringify(teams)),
    };
  } catch {
    return { matches: [], teams: [] };
  }
}
