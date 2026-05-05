'use server'

import connectDB from '@/lib/mongodb';
import Player from '@/models/Player';
import Team from '@/models/Team';
import { revalidatePath } from 'next/cache';
import { uploadFile } from '@/lib/upload';

export async function createPlayer(_prevState: { success?: boolean; error?: string | null }, formData: FormData) {
  await connectDB();

  const name = formData.get('name') as string;
  const position = formData.get('position') as string;
  const number = parseInt(formData.get('number') as string);
  const photoFile = formData.get('photo') as File;

  let photo = '';
  if (photoFile && photoFile.size > 0) {
    photo = await uploadFile(photoFile, 'players');
  } else {
    photo = `/images/players/${number}.webp`;
  }

  try {
    const player = new Player({
      name,
      photo,
      position,
      number,
      status: 'available',
      basePrice: position === 'Goalkeeper' ? 0 : 500,
    });

    await player.save();
    revalidatePath('/players');
    revalidatePath('/auction');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deletePlayer(id: string) {
  await connectDB();
  const player = await Player.findById(id);
  if (!player) throw new Error('Player not found');
  
  // If player was sold, update team budget
  if (player.status === 'sold' && player.team) {
    await Team.findByIdAndUpdate(player.team, {
      $inc: { remainingBudget: player.soldPrice },
      $pull: { players: id }
    });
  }

  await Player.findByIdAndDelete(id);
  revalidatePath('/players');
  revalidatePath('/auction');
  revalidatePath('/teams');
  return { success: true };
}

export async function updatePlayer(id: string, formData: FormData) {
  await connectDB();
  const name = formData.get('name') as string;
  const position = formData.get('position') as string;
  const number = parseInt(formData.get('number') as string);
  const photoFile = formData.get('photo') as File;

  try {
    const updateData: any = { name, position, number };
    if (photoFile && photoFile.size > 0) {
      updateData.photo = await uploadFile(photoFile, 'players');
    }

    await Player.findByIdAndUpdate(id, updateData);
    revalidatePath('/players');
    revalidatePath('/auction');
    revalidatePath('/teams');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updatePlayerStatus(id: string, status: string, soldPrice: number | null = null, team: string | null = null) {
  await connectDB();
  await Player.findByIdAndUpdate(id, { status, soldPrice, team });
  revalidatePath('/players');
  revalidatePath('/auction');
  revalidatePath('/teams');
  return { success: true };
}

export async function getPlayers() {
  await connectDB();
  const players = await Player.find({}).sort({ number: 1 }).lean();
  return JSON.parse(JSON.stringify(players));
}
