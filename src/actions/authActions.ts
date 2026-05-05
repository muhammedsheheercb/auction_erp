'use server'

import { login, logout as authLogout } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function adminLogin(prevState: any, formData: FormData) {
  const password = formData.get('password') as string;
  const success = await login(password);
  
  if (success) {
    revalidatePath('/');
    redirect('/auction');
  } else {
    return { error: 'Invalid Administration Credentials' };
  }
}

export async function adminLogout() {
  await authLogout();
  revalidatePath('/');
  redirect('/');
}
