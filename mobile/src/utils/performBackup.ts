import { exportBackupData, saveBackupLog } from '../db/queries';
import { exportEverythingToFile } from './localBackup';

/** Prefer full local export+share; kept for older call sites. */
export async function performCloudBackup(): Promise<{ mode: 'cloud' | 'local' }> {
  await exportEverythingToFile();
  return { mode: 'local' };
}

export async function performLocalExportOnly(): Promise<object> {
  const payload = await exportBackupData();
  await saveBackupLog('success', 'Data exported locally.');
  return payload;
}
