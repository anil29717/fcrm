import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppLogo } from '../../src/components/ui/AppLogo';
import { PinPad } from '../../src/components/ui/PinPad';
import { useAndroidBack } from '../../src/hooks/useAndroidBack';
import { useAuth } from '../../src/context/AuthContext';
import { MAX_PIN_LENGTH } from '../../src/utils/security';
import { colors, typography, spacing } from '../../src/theme';

export default function ConfirmPinScreen() {
  const params = useLocalSearchParams<{ pin?: string | string[] }>();
  const originalPin = Array.isArray(params.pin) ? params.pin[0] : params.pin;
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const { setupPin } = useAuth();
  const router = useRouter();
  const pinRef = useRef(pin);
  pinRef.current = pin;
  useAndroidBack('/auth/create-pin');

  const requiredLength = originalPin?.length === MAX_PIN_LENGTH ? MAX_PIN_LENGTH : MAX_PIN_LENGTH;

  useEffect(() => {
    if (!originalPin || originalPin.length !== MAX_PIN_LENGTH) {
      router.replace('/auth/create-pin');
    }
  }, [originalPin, router]);

  useEffect(() => {
    if (pin.length < requiredLength) return;

    const timer = setTimeout(() => {
      const current = pinRef.current;
      if (current.length < requiredLength) return;
      if (current === originalPin) {
        setupPin(current).then(() => router.replace('/onboarding/restore-choice'));
      } else {
        setError('PINs do not match. Try again.');
        setPin('');
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [pin, originalPin, requiredLength, setupPin, router]);

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <View style={styles.content}>
        <AppLogo size="lg" style={styles.logo} />
        <PinPad
          value={pin}
          onChange={(v) => { setError(''); setPin(v); }}
          maxLength={MAX_PIN_LENGTH}
          title="Confirm PIN"
          subtitle="Re-enter your 6-digit PIN to confirm"
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
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
});
