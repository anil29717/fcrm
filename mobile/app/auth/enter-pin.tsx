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
  rememberPinLength,
} from '../../src/utils/security';
import { colors, typography, spacing } from '../../src/theme';

export default function EnterPinScreen() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [expectedLength, setExpectedLength] = useState(MAX_PIN_LENGTH);
  const { unlock, unlockWithBiometric, isOnboarded, biometricAvailable, biometricEnabled } = useAuth();
  const router = useRouter();
  const pinRef = useRef(pin);
  pinRef.current = pin;

  useEffect(() => {
    getPinLength().then((len) => {
      // New accounts are always 6 digits; keep older saved lengths working.
      setExpectedLength(len ?? MAX_PIN_LENGTH);
    });
  }, []);

  useEffect(() => {
    if (biometricAvailable && biometricEnabled) {
      LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock FreelancePro',
        fallbackLabel: 'Use PIN',
      }).then((result) => {
        if (result.success) {
          unlockWithBiometric();
          if (!isOnboarded) router.replace('/onboarding/restore-choice');
          else router.replace('/(tabs)');
        }
      });
    }
  }, [biometricAvailable, biometricEnabled, isOnboarded, router, unlockWithBiometric]);

  useEffect(() => {
    if (pin.length !== expectedLength) return;

    let cancelled = false;
    const timer = setTimeout(async () => {
      const current = pinRef.current;
      if (cancelled || current.length !== expectedLength) return;

      const valid = await unlock(current);
      if (cancelled) return;
      if (valid) {
        await rememberPinLength(current.length);
        if (!isOnboarded) router.replace('/onboarding/restore-choice');
        else router.replace('/(tabs)');
      } else {
        setError('Incorrect PIN');
        setPin('');
      }
    }, 150);

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
      if (!isOnboarded) router.replace('/onboarding/restore-choice');
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
          maxLength={expectedLength}
          title="Enter PIN"
          subtitle={`Enter your ${expectedLength}-digit PIN to unlock`}
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
