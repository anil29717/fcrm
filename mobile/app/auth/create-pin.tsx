import { useState, useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppLogo } from '../../src/components/ui/AppLogo';
import { PinPad } from '../../src/components/ui/PinPad';
import { MAX_PIN_LENGTH } from '../../src/utils/security';
import { colors, spacing } from '../../src/theme';

export default function CreatePinScreen() {
  const [pin, setPin] = useState('');
  const router = useRouter();
  const pinRef = useRef(pin);
  pinRef.current = pin;
  const navigating = useRef(false);

  useEffect(() => {
    if (pin.length !== MAX_PIN_LENGTH || navigating.current) return;

    const timer = setTimeout(() => {
      const current = pinRef.current;
      if (current.length !== MAX_PIN_LENGTH || navigating.current) return;
      navigating.current = true;
      router.push({ pathname: '/auth/confirm-pin', params: { pin: current } });
      setPin('');
      // Allow create again if user comes back.
      setTimeout(() => { navigating.current = false; }, 500);
    }, 200);

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
          subtitle="Enter a 6-digit PIN to secure your business data"
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
