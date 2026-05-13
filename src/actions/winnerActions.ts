'use server'

import connectDB from '@/lib/mongodb';
import Winner from '@/models/Winner';
import { revalidatePath } from 'next/cache';
import { uploadFile } from '@/lib/upload';

export async function createWinner(formData: FormData) {
  await connectDB();
  const teamName = formData.get('teamName') as string;
  const season = formData.get('season') as string;
  const photoFile = formData.get('photo') as File;

  if (!photoFile || photoFile.size === 0) {
    return { success: false, error: 'Team photo is required' };
  }

  try {
    const photo = await uploadFile(photoFile, 'winners');
    const winner = new Winner({ teamName, photo, season });
    await winner.save();
    revalidatePath('/gallery');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getWinners() {
  try {
    await connectDB();
    const winners = await Winner.find({}).sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(winners));
  } catch {
    return [];
  }
}

export async function deleteWinner(id: string) {
  try {
    await connectDB();
    await Winner.findByIdAndDelete(id);
    revalidatePath('/gallery');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
