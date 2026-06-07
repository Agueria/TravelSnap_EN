import * as FileSystem from 'expo-file-system/legacy';

const getTripsFolder = (): string | null =>
  FileSystem.documentDirectory ? `${FileSystem.documentDirectory}trips/` : null;

export async function ensureTripFolder(tripId: string): Promise<string | null> {
  const tripsFolder = getTripsFolder();
  if (!tripsFolder) return null;

  const folder = `${tripsFolder}${tripId}/`;
  const info = await FileSystem.getInfoAsync(folder);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(folder, { intermediates: true });
  }
  return folder;
}

export async function saveImageToTrip(uri: string, tripId: string): Promise<string> {
  const folder = await ensureTripFolder(tripId);
  if (!folder) return uri;

  const cleanUri = uri.split('?')[0];
  const extension = cleanUri.split('.').pop() ?? 'jpg';
  const destination = `${folder}${Date.now()}.${extension}`;
  await FileSystem.copyAsync({ from: uri, to: destination });
  return destination;
}

export async function deleteImage(uri: string): Promise<void> {
  if (!FileSystem.documentDirectory || !uri.startsWith(FileSystem.documentDirectory)) {
    return;
  }

  await FileSystem.deleteAsync(uri, { idempotent: true });
}
