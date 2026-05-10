'use server'

import connectDB from '@/lib/mongodb';
import Team from '@/models/Team';
import Player from '@/models/Player';
import { revalidatePath } from 'next/cache';
import { uploadFile } from '@/lib/upload';

export async function createTeam(formData: FormData) {
  await connectDB();
  const name = formData.get('name') as string;
  const manager1 = formData.get('manager1') as string;
  const manager2 = formData.get('manager2') as string;
  const logoFile = formData.get('logo') as File;

  let logo = '';
  if (logoFile && logoFile.size > 0) {
    logo = await uploadFile(logoFile, 'teams');
  } else {
    const fileName = name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    logo = `/images/teams/${fileName}.webp`;
  }

  try {
    const team = new Team({
      name,
      logo,
      manager1,
      manager2,
      totalBudget: 20000,
      remainingBudget: 20000,
      players: [],
    });
    await team.save();
    revalidatePath('/teams');
    revalidatePath('/auction');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateTeam(id: string, formData: FormData) {
  await connectDB();
  const name = formData.get('name') as string;
  const manager1 = formData.get('manager1') as string;
  const manager2 = formData.get('manager2') as string;
  const logoFile = formData.get('logo') as File;

  try {
    const updateData: any = { name, manager1, manager2 };
    if (logoFile && logoFile.size > 0) {
      updateData.logo = await uploadFile(logoFile, 'teams');
    }

    await Team.findByIdAndUpdate(id, updateData);
    revalidatePath('/teams');
    revalidatePath('/auction');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteAllTeams() {
  await connectDB();
  await Team.deleteMany({});
  await Player.updateMany({}, { $set: { team: null, status: 'available', soldPrice: null } });
  revalidatePath('/teams');
  revalidatePath('/auction');
  return { success: true };
}

export async function deleteTeam(id: string) {
  await connectDB();
  const team = await Team.findById(id);
  if (!team) throw new Error('Team not found');

  // Reset all players belonging to this team
  await Player.updateMany(
    { team: id },
    { $set: { status: 'available', team: null, soldPrice: null } }
  );

  await Team.findByIdAndDelete(id);
  revalidatePath('/teams');
  revalidatePath('/auction');
  revalidatePath('/players');
  return { success: true };
}

export async function getTeams() {
  await connectDB();
  const teams = await Team.find({}).populate('players').lean();
  return JSON.parse(JSON.stringify(teams));
}


export async function sellPlayer(playerId: string, teamId: string, price: number) {
  await connectDB();

  const team = await Team.findById(teamId);
  const player = await Player.findById(playerId);

  if (!team || !player) throw new Error('Team or Player not found');
  if (player.status !== 'available') throw new Error('Player already sold');
  if (team.players.length >= 9) throw new Error('Squad is full (9 players max)');

  const isGoalkeeper = player.position === 'Goalkeeper';

  // All signings are now paid: check budget and minimum-reserve rule.
  if (price > 0) {
    if (team.remainingBudget < price) throw new Error('Insufficient budget');
    const paidCount = await Player.countDocuments({
      _id: { $in: team.players }
    });
    const afterPaidBuy = paidCount + 1;
    const stillRequired = Math.max(0, 9 - afterPaidBuy);
    const minimumReserved = stillRequired * 500;
    if (team.remainingBudget - price < minimumReserved) {
      throw new Error(
        `Cannot bid more than ${team.remainingBudget - minimumReserved}. Must reserve 500 per mandatory slot remaining.`
      );
    }
  }

  player.status = 'sold';
  player.soldPrice = price;
  player.team = teamId;
  await player.save();

  team.remainingBudget -= price;
  team.players.push(playerId);
  await team.save();

  revalidatePath('/auction');
  revalidatePath('/teams');
  revalidatePath('/players');

  return { success: true };
}
