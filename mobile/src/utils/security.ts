import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { fromBase64, toBase64 } from './encoding';

const PIN_HASH_KEY = 'fcrm_pin_hash';
const PIN_LENGTH_KEY = 'fcrm_pin_length';
const BIOMETRIC_KEY = 'fcrm_biometric_enabled';

export const MIN_PIN_LENGTH = 4;
export const MAX_PIN_LENGTH = 6;
/** Pause after the last digit before accepting a 4–5 digit PIN (6 submits immediately). */
export const PIN_IDLE_MS = 800;

export async function hashPin(pin: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, pin);
}

export async function savePin(pin: string): Promise<void> {
  const hash = await hashPin(pin);
  await SecureStore.setItemAsync(PIN_HASH_KEY, hash);
  await SecureStore.setItemAsync(PIN_LENGTH_KEY, String(pin.length));
}

export async function getPinLength(): Promise<number | null> {
  const value = await SecureStore.getItemAsync(PIN_LENGTH_KEY);
  if (!value) return null;
  const length = Number(value);
  if (!Number.isInteger(length) || length < MIN_PIN_LENGTH || length > MAX_PIN_LENGTH) {
    return null;
  }
  return length;
}

/** Persist length for older installs that only stored the hash. */
export async function rememberPinLength(length: number): Promise<void> {
  if (length < MIN_PIN_LENGTH || length > MAX_PIN_LENGTH) return;
  const existing = await getPinLength();
  if (existing != null) return;
  await SecureStore.setItemAsync(PIN_LENGTH_KEY, String(length));
}

export async function verifyPin(pin: string): Promise<boolean> {
  const stored = await SecureStore.getItemAsync(PIN_HASH_KEY);
  if (!stored) return false;
  const hash = await hashPin(pin);
  return stored === hash;
}

export async function hasPin(): Promise<boolean> {
  const stored = await SecureStore.getItemAsync(PIN_HASH_KEY);
  return !!stored;
}

export async function setBiometricEnabled(enabled: boolean): Promise<void> {
  await SecureStore.setItemAsync(BIOMETRIC_KEY, enabled ? '1' : '0');
}

export async function isBiometricEnabled(): Promise<boolean> {
  const value = await SecureStore.getItemAsync(BIOMETRIC_KEY);
  return value === '1';
}

const ENC_PREFIX = 'fcrm1:';

export async function encryptValue(value: string): Promise<string> {
  const key = await getEncryptionKey();
  const encoded = encodeURIComponent(value);
  let result = '';
  for (let i = 0; i < encoded.length; i++) {
    result += String.fromCharCode(encoded.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return ENC_PREFIX + toBase64(result);
}

export async function decryptValue(encrypted: string): Promise<string> {
  if (!encrypted.startsWith(ENC_PREFIX)) return '';
  const key = await getEncryptionKey();
  const raw = fromBase64(encrypted.slice(ENC_PREFIX.length));
  let decoded = '';
  for (let i = 0; i < raw.length; i++) {
    decoded += String.fromCharCode(raw.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return decodeURIComponent(decoded);
}

async function getEncryptionKey(): Promise<string> {
  const KEY_STORE = 'fcrm_enc_key';
  let key = await SecureStore.getItemAsync(KEY_STORE);
  if (!key) {
    const bytes = await Crypto.getRandomBytesAsync(32);
    key = Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
    await SecureStore.setItemAsync(KEY_STORE, key);
  }
  return key;
}
