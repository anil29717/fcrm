import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PinPad } from '../../src/components/ui/PinPad';
import { useAndroidBack } from '../../src/hooks/useAndroidBack';
import { useAuth } from '../../src/context/AuthContext';
import { MAX_PIN_LENGTH } from '../../src/utils/security';
import { colors, typography, spacing } from '../../src/theme';

export default function ConfirmPinScreen() {
  const { pin: originalPin } = useLocalSearchParams<{ pin: string }>();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const { setupPin } = useAuth();
  const router = useRouter();
  const pinRef = useRef(pin);
  pinRef.current = pin;
  useAndroidBack('/auth/create-pin');

  const requiredLength = originalPin?.length ?? MAX_PIN_LENGTH;

  useEffect(() => {
    if (pin.length < requiredLength) return;

    const timer = setTimeout(() => {
      const current = pinRef.current;
      if (current.length < requiredLength) return;
      if (current === originalPin) {
        setupPin(current).then(() => router.replace('/onboarding/company-setup'));
      } else {
        setError('PINs do not match. Try again.');
        setPin('');
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [pin, originalPin, requiredLength, setupPin, router]);

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <View style={styles.content}>
        <PinPad
          value={pin}
          onChange={(v) => { setError(''); setPin(v); }}
          maxLength={requiredLength}
          title="Confirm PIN"
          subtitle="Re-enter your PIN to confirm"
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, justifyContent: 'center' },
  error: {
    ...typography.bodySm,
    color: colors.error,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
