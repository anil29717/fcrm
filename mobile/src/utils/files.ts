import * as FileSystem from 'expo-file-system/legacy';

export async function ensureDir(path: string): Promise<void> {
  const info = await FileSystem.getInfoAsync(path);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(path, { intermediates: true });
  }
}

export async function copyToAppStorage(sourceUri: string, destPath: string): Promise<string> {
  await ensureDir(destPath.substring(0, destPath.lastIndexOf('/') + 1));
  await FileSystem.copyAsync({ from: sourceUri, to: destPath });
  return destPath;
}

export function getProjectDocsDir(projectId: number): string {
  const base = FileSystem.documentDirectory;
  if (!base) throw new Error('Local storage is not available on this device');
  return `${base}project_docs/${projectId}/`;
}

export function getCompanyAssetsDir(): string {
  const base = FileSystem.documentDirectory;
  if (!base) throw new Error('Local storage is not available on this device');
  return `${base}company/`;
}

export async function deleteLocalFile(path: string): Promise<void> {
  try {
    const info = await FileSystem.getInfoAsync(path);
    if (info.exists) await FileSystem.deleteAsync(path, { idempotent: true });
  } catch {
    // ignore missing files
  }
}

export async function readFileAsBase64(path: string): Promise<string | null> {
  try {
    const info = await FileSystem.getInfoAsync(path);
    if (!info.exists) return null;
    return FileSystem.readAsStringAsync(path, { encoding: FileSystem.EncodingType.Base64 });
  } catch {
    return null;
  }
}

export function getInvoicePdfDir(): string {
  const base = FileSystem.documentDirectory;
  if (!base) throw new Error('Local storage is not available on this device');
  return `${base}invoices/`;
}
