import { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as LocalAuthentication from 'expo-local-authentication';
import { MaterialIcons } from '@expo/vector-icons';
import { AppLogo } from '../../src/components/ui/AppLogo';
import { PinPad } from '../../src/components/ui/PinPad';
import { useAuth } from '../../src/context/AuthContext';
import {
  getPinLength,
  MAX_PIN_LENGTH,
  MIN_PIN_LENGTH,
  PIN_IDLE_MS,
  rememberPinLength,
} from '../../src/utils/security';
import { colors, typography, spacing } from '../../src/theme';

export default function EnterPinScreen() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [expectedLength, setExpectedLength] = useState<number | null>(null);
  const { unlock, unlockWithBiometric, isOnboarded, biometricAvailable, biometricEnabled } = useAuth();
  const router = useRouter();
  const pinRef = useRef(pin);
  pinRef.current = pin;

  useEffect(() => {
    getPinLength().then(setExpectedLength);
  }, []);

  useEffect(() => {
    if (biometricAvailable && biometricEnabled) {
      LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock FreelancePro',
        fallbackLabel: 'Use PIN',
      }).then((result) => {
        if (result.success) {
          unlockWithBiometric();
          if (!isOnboarded) router.replace('/onboarding/company-setup');
          else router.replace('/(tabs)');
        }
      });
    }
  }, [biometricAvailable, biometricEnabled, isOnboarded, router, unlockWithBiometric]);

  useEffect(() => {
    if (pin.length < MIN_PIN_LENGTH) return;

    const ready =
      expectedLength != null
        ? pin.length === expectedLength
        : pin.length >= MIN_PIN_LENGTH;

    if (!ready) return;

    // Without a known length, wait so a 5–6 digit PIN can be finished.
    const delay =
      expectedLength != null
        ? 150
        : pin.length >= MAX_PIN_LENGTH
          ? 150
          : PIN_IDLE_MS;

    let cancelled = false;
    const timer = setTimeout(async () => {
      const current = pinRef.current;
      if (cancelled || current.length < MIN_PIN_LENGTH) return;
      if (expectedLength != null && current.length !== expectedLength) return;

      const valid = await unlock(current);
      if (cancelled) return;
      if (valid) {
        if (expectedLength == null) {
          await rememberPinLength(current.length);
          setExpectedLength(current.length);
        }
        if (!isOnboarded) router.replace('/onboarding/company-setup');
        else router.replace('/(tabs)');
      } else {
        setError('Incorrect PIN');
        setPin('');
      }
    }, delay);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [pin, expectedLength, unlock, isOnboarded, router]);

  const tryBiometric = async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Unlock FreelancePro',
    });
    if (result.success) {
      unlockWithBiometric();
      if (!isOnboarded) router.replace('/onboarding/company-setup');
      else router.replace('/(tabs)');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <AppLogo size="lg" style={styles.logo} />
        <PinPad
          value={pin}
          onChange={(v) => { setError(''); setPin(v); }}
          maxLength={MAX_PIN_LENGTH}
          title="Enter PIN"
          subtitle="Enter your PIN to unlock"
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {biometricAvailable && biometricEnabled ? (
          <TouchableOpacity style={styles.bioButton} onPress={tryBiometric}>
            <MaterialIcons name="fingerprint" size={32} color={colors.primary} />
            <Text style={styles.bioText}>Use biometrics</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, justifyContent: 'center' },
  logo: {
    alignSelf: 'center',
    marginBottom: spacing.xl,
  },
  error: {
    ...typography.bodySm,
    color: colors.error,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  bioButton: { alignItems: 'center', marginTop: spacing.xl },
  bioText: { ...typography.bodySm, color: colors.primary, marginTop: spacing.xs },
});
