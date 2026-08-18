import Constants from 'expo-constants';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { exportBackupData, importBackupData, saveBackupLog } from '../db/queries';
import { ensureDir } from './files';

export const BACKUP_FORMAT_VERSION = 1;

export function getAppVersion(): string {
  return (
    Constants.expoConfig?.version ??
    Constants.nativeAppVersion ??
    '1.0.0'
  );
}

export type LocalBackupPayload = {
  format_version: number;
  app_version: string;
  backup_id: string;
  exported_at: string;
  company?: Record<string, unknown> | null;
  clients?: Record<string, unknown>[];
  projects?: Record<string, unknown>[];
  invoices?: Record<string, unknown>[];
  milestones?: Record<string, unknown>[];
  change_requests?: Record<string, unknown>[];
  phases?: Record<string, unknown>[];
  contact_persons?: Record<string, unknown>[];
  env_values?: Record<string, unknown>[];
  phase_tasks?: Record<string, unknown>[];
  payment_records?: Record<string, unknown>[];
  project_history?: Record<string, unknown>[];
  invoice_sequences?: Record<string, unknown>[];
  invoice_template_blocks?: Record<string, unknown>[];
  client_services?: Record<string, unknown>[];
};

function getExportsDir(): string {
  const base = FileSystem.documentDirectory;
  if (!base) throw new Error('Local storage is not available on this device');
  return `${base}exports/`;
}

function makeBackupId(appVersion: string, exportedAt: string): string {
  const stamp = exportedAt.replace(/[:.]/g, '-').replace('T', '_').slice(0, 19);
  return `FreelancePro-v${appVersion}-${stamp}`;
}

/** Build a full local backup object with version metadata. */
export async function buildLocalBackupPayload(): Promise<LocalBackupPayload> {
  const data = (await exportBackupData()) as LocalBackupPayload & { exported_at?: string };
  const appVersion = getAppVersion();
  const exportedAt = data.exported_at ?? new Date().toISOString();
  return {
    ...data,
    format_version: BACKUP_FORMAT_VERSION,
    app_version: appVersion,
    backup_id: makeBackupId(appVersion, exportedAt),
    exported_at: exportedAt,
  };
}

/** Write backup JSON to app storage and open the share sheet. */
export async function exportEverythingToFile(): Promise<{
  path: string;
  backupId: string;
  appVersion: string;
}> {
  const payload = await buildLocalBackupPayload();
  const dir = getExportsDir();
  await ensureDir(dir);
  const fileName = `${payload.backup_id}.json`;
  const path = `${dir}${fileName}`;
  await FileSystem.writeAsStringAsync(path, JSON.stringify(payload, null, 2), {
    encoding: FileSystem.EncodingType.UTF8,
  });

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(path, {
      mimeType: 'application/json',
      dialogTitle: 'Export FreelancePro backup',
      UTI: 'public.json',
    });
  }

  await saveBackupLog(
    'success',
    `Exported ${payload.backup_id} (app ${payload.app_version})`,
  );

  return {
    path,
    backupId: payload.backup_id,
    appVersion: payload.app_version,
  };
}

function isBackupPayload(value: unknown): value is LocalBackupPayload {
  if (!value || typeof value !== 'object') return false;
  const obj = value as Record<string, unknown>;
  return typeof obj.exported_at === 'string' || typeof obj.app_version === 'string' || Array.isArray(obj.clients);
}

/** Pick a backup JSON file and restore everything into SQLite. */
export async function restoreEverythingFromFile(): Promise<{
  clients: number;
  projects: number;
  invoices: number;
  services: number;
  appVersion: string | null;
  backupId: string | null;
}> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['application/json', 'text/json', 'application/octet-stream', '*/*'],
    copyToCacheDirectory: true,
    multiple: false,
  });
  if (result.canceled || !result.assets?.[0]) {
    throw new Error('No backup file selected');
  }

  const asset = result.assets[0];
  const raw = await FileSystem.readAsStringAsync(asset.uri, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('Invalid backup file. Choose a FreelancePro .json export.');
  }

  if (!isBackupPayload(parsed)) {
    throw new Error('This file is not a valid FreelancePro backup.');
  }

  const counts = await importBackupData(parsed);
  await saveBackupLog(
    'success',
    `Restored ${parsed.backup_id ?? 'backup'} (from app ${parsed.app_version ?? 'unknown'})`,
  );

  return {
    ...counts,
    appVersion: typeof parsed.app_version === 'string' ? parsed.app_version : null,
    backupId: typeof parsed.backup_id === 'string' ? parsed.backup_id : null,
  };
}
