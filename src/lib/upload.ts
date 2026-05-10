import { put } from '@vercel/blob';

export async function uploadFile(file: File, folder: string): Promise<string> {
  const blob = await put(`${folder}/${file.name}`, file, {
    access: 'public',
    addRandomSuffix: true,
  });
  return blob.url;
}
