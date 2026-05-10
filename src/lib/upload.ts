export async function uploadFile(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const mimeType = file.type || 'image/webp';
  return `data:${mimeType};base64,${buffer.toString('base64')}`;
}
