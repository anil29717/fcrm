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

/** Derive Data API action URL (insertOne / find / findOne) from any action endpoint. */
export function toDataApiActionUrl(apiUrl: string, action: 'insertOne' | 'find' | 'findOne'): string {
  const trimmed = apiUrl.trim().replace(/\/+$/, '');
  if (/\/action\/(insertOne|findOne|find)$/i.test(trimmed)) {
    return trimmed.replace(/\/action\/(insertOne|findOne|find)$/i, `/action/${action}`);
  }
  if (/\/action$/i.test(trimmed)) {
    return `${trimmed}/${action}`;
  }
  return `${trimmed}/action/${action}`;
}

export async function uploadBackupToCloud(payload: object): Promise<void> {
  const config = await getBackupConfig();
  if (!isBackupConfigured(config)) {
    throw new Error('MongoDB Atlas is not configured. Open Backup → Configure API to set your endpoint and API key.');
  }

  const url = toDataApiActionUrl(config.apiUrl!, 'insertOne');
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

export type BackupPayload = {
  exported_at?: string;
  company?: Record<string, unknown> | null;
  clients?: Record<string, unknown>[];
  projects?: Record<string, unknown>[];
  invoices?: Record<string, unknown>[];
  milestones?: Record<string, unknown>[];
  change_requests?: Record<string, unknown>[];
  phases?: Record<string, unknown>[];
  contact_persons?: Record<string, unknown>[];
  env_values?: Record<string, unknown>[];
};

/** Fetch the latest backup document from MongoDB Atlas Data API. */
export async function downloadLatestBackup(config?: BackupConfig): Promise<BackupPayload> {
  const cfg = config ?? (await getBackupConfig());
  if (!isBackupConfigured(cfg)) {
    throw new Error('Enter your MongoDB Atlas API URL and API key to restore.');
  }

  const url = toDataApiActionUrl(cfg.apiUrl!, 'find');
  const body = {
    dataSource: cfg.dataSource,
    database: cfg.database,
    collection: cfg.collection,
    filter: {},
    sort: { exported_at: -1 },
    limit: 1,
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': cfg.apiKey!.trim(),
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
    throw new Error(`Cloud restore failed (${response.status}): ${detail}`);
  }

  const json = await response.json();
  const docs = (json.documents ?? json.document ?? []) as BackupPayload[];
  const latest = Array.isArray(docs) ? docs[0] : docs;
  if (!latest || typeof latest !== 'object') {
    throw new Error('No backup found in this MongoDB collection. Create a backup from your old app first.');
  }
  return latest as BackupPayload;
}
