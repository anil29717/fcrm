import { getAppSetting } from '../db/queries';

export interface BackupConfig {
  apiUrl: string | null;
  apiKey: string | null;
  dataSource: string;
  database: string;
  collection: string;
}

export async function getBackupConfig(): Promise<BackupConfig> {
  const [apiUrl, apiKey, dataSource, database, collection] = await Promise.all([
    getAppSetting('mongodb_api_url'),
    getAppSetting('mongodb_api_key'),
    getAppSetting('mongodb_data_source'),
    getAppSetting('mongodb_database'),
    getAppSetting('mongodb_collection'),
  ]);
  return {
    apiUrl,
    apiKey,
    dataSource: dataSource ?? 'Cluster0',
    database: database ?? 'fcrm',
    collection: collection ?? 'backups',
  };
}

export function isBackupConfigured(config: BackupConfig): boolean {
  return !!(config.apiUrl?.trim() && config.apiKey?.trim());
}

export async function uploadBackupToCloud(payload: object): Promise<void> {
  const config = await getBackupConfig();
  if (!isBackupConfigured(config)) {
    throw new Error('MongoDB Atlas is not configured. Open Backup → Configure API to set your endpoint and API key.');
  }

  const url = config.apiUrl!.trim();
  const body = {
    dataSource: config.dataSource,
    database: config.database,
    collection: config.collection,
    document: payload,
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': config.apiKey!.trim(),
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    let detail = '';
    try {
      const json = await response.json();
      detail = json.error ?? json.message ?? JSON.stringify(json);
    } catch {
      detail = await response.text();
    }
    throw new Error(`Cloud upload failed (${response.status}): ${detail}`);
  }
}
