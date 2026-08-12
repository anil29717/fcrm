import { exportBackupData, saveBackupLog } from '../db/queries';
import { getBackupConfig, isBackupConfigured, uploadBackupToCloud } from './cloudBackup';

export async function performCloudBackup(): Promise<{ mode: 'cloud' | 'local' }> {
  const payload = await exportBackupData();
  const config = await getBackupConfig();

  if (isBackupConfigured(config)) {
    await uploadBackupToCloud(payload);
    await saveBackupLog('success', 'Backup uploaded to MongoDB Atlas successfully.');
    return { mode: 'cloud' };
  }

  await saveBackupLog('success', 'Data exported locally. Configure MongoDB Atlas API to enable cloud upload.');
  return { mode: 'local' };
}
