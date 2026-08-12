import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import { getDatabase } from '../db/database';
import { getCompany } from '../db/queries';
import {
  hasPin,
  verifyPin,
  savePin,
  isBiometricEnabled,
  setBiometricEnabled,
} from '../utils/security';

type AuthState = 'loading' | 'no_pin' | 'locked' | 'unlocked';

interface AuthContextValue {
  state: AuthState;
  isOnboarded: boolean;
  biometricAvailable: boolean;
  biometricEnabled: boolean;
  unlock: (pin: string) => Promise<boolean>;
  unlockWithBiometric: () => void;
  setupPin: (pin: string) => Promise<void>;
  lock: () => void;
  refreshOnboarding: () => Promise<void>;
  toggleBiometric: (enabled: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>('loading');
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabledState] = useState(false);

  const refreshOnboarding = useCallback(async () => {
    const company = await getCompany();
    setIsOnboarded(!!company);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        await getDatabase();
        const pinExists = await hasPin();
        const bio = await LocalAuthentication.hasHardwareAsync();
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        if (cancelled) return;
        setBiometricAvailable(bio && enrolled);
        setBiometricEnabledState(await isBiometricEnabled());
        await refreshOnboarding();
        if (cancelled) return;
        setState(pinExists ? 'locked' : 'no_pin');
      } catch (e) {
        console.error('Auth init failed', e);
        if (!cancelled) {
          // Fail open so the splash never hangs forever.
          setState('no_pin');
        }
      }
    }

    void init();
    return () => {
      cancelled = true;
    };
  }, [refreshOnboarding]);

  const unlock = async (pin: string) => {
    const valid = await verifyPin(pin);
    if (valid) setState('unlocked');
    return valid;
  };

  const setupPin = async (pin: string) => {
    await savePin(pin);
    setState('unlocked');
  };

  const lock = () => setState('locked');

  const unlockWithBiometric = () => setState('unlocked');

  const toggleBiometric = async (enabled: boolean) => {
    await setBiometricEnabled(enabled);
    setBiometricEnabledState(enabled);
  };

  return (
    <AuthContext.Provider
      value={{
        state,
        isOnboarded,
        biometricAvailable,
        biometricEnabled,
        unlock,
        unlockWithBiometric,
        setupPin,
        lock,
        refreshOnboarding,
        toggleBiometric,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
