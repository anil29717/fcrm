import { useState, useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppLogo } from '../../src/components/ui/AppLogo';
import { PinPad } from '../../src/components/ui/PinPad';
import {
  MAX_PIN_LENGTH,
  MIN_PIN_LENGTH,
  PIN_IDLE_MS,
} from '../../src/utils/security';
import { colors, spacing } from '../../src/theme';

export default function CreatePinScreen() {
  const [pin, setPin] = useState('');
  const router = useRouter();
  const pinRef = useRef(pin);
  pinRef.current = pin;

  useEffect(() => {
    if (pin.length < MIN_PIN_LENGTH) return;

    const delay = pin.length >= MAX_PIN_LENGTH ? 150 : PIN_IDLE_MS;
    const timer = setTimeout(() => {
      const current = pinRef.current;
      if (current.length < MIN_PIN_LENGTH) return;
      router.push({ pathname: '/auth/confirm-pin', params: { pin: current } });
      setPin('');
    }, delay);

    return () => clearTimeout(timer);
  }, [pin, router]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <AppLogo size="lg" style={styles.logo} />
        <PinPad
          value={pin}
          onChange={setPin}
          maxLength={MAX_PIN_LENGTH}
          title="Create PIN"
          subtitle="Choose a 4–6 digit PIN to secure your business data"
        />
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
});
