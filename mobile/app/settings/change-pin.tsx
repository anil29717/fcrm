import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PinPad } from '../../src/components/ui/PinPad';
import { useAndroidBack } from '../../src/hooks/useAndroidBack';
import {
  getPinLength,
  MAX_PIN_LENGTH,
  MIN_PIN_LENGTH,
  PIN_IDLE_MS,
  savePin,
  verifyPin,
} from '../../src/utils/security';
import { colors, spacing, typography } from '../../src/theme';

export default function ChangePinScreen() {
  const [step, setStep] = useState<'current' | 'new' | 'confirm'>('current');
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [expectedLength, setExpectedLength] = useState<number | null>(null);
  const router = useRouter();
  useAndroidBack('/(tabs)/settings');

  const currentRef = useRef(currentPin);
  const newRef = useRef(newPin);
  const confirmRef = useRef(confirmPin);
  currentRef.current = currentPin;
  newRef.current = newPin;
  confirmRef.current = confirmPin;

  useEffect(() => {
    getPinLength().then(setExpectedLength);
  }, []);

  useEffect(() => {
    if (step !== 'current') return;
    if (currentPin.length < MIN_PIN_LENGTH) return;

    const ready =
      expectedLength != null
        ? currentPin.length === expectedLength
        : currentPin.length >= MIN_PIN_LENGTH;
    if (!ready) return;

    const delay =
      expectedLength != null
        ? 150
        : currentPin.length >= MAX_PIN_LENGTH
          ? 150
          : PIN_IDLE_MS;

    let cancelled = false;
    const timer = setTimeout(async () => {
      const pin = currentRef.current;
      if (cancelled || pin.length < MIN_PIN_LENGTH) return;
      if (expectedLength != null && pin.length !== expectedLength) return;

      const valid = await verifyPin(pin);
      if (cancelled) return;
      if (valid) {
        setError('');
        setStep('new');
        setCurrentPin('');
      } else {
        setError('Incorrect current PIN');
        setCurrentPin('');
      }
    }, delay);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [step, currentPin, expectedLength]);

  useEffect(() => {
    if (step !== 'new') return;
    if (newPin.length < MIN_PIN_LENGTH) return;

    const delay = newPin.length >= MAX_PIN_LENGTH ? 150 : PIN_IDLE_MS;
    const timer = setTimeout(() => {
      const pin = newRef.current;
      if (pin.length < MIN_PIN_LENGTH) return;
      setError('');
      setStep('confirm');
    }, delay);

    return () => clearTimeout(timer);
  }, [step, newPin]);

  useEffect(() => {
    if (step !== 'confirm') return;
    if (confirmPin.length < newPin.length || newPin.length < MIN_PIN_LENGTH) return;

    let cancelled = false;
    const timer = setTimeout(async () => {
      const pin = confirmRef.current;
      if (cancelled || pin.length < newPin.length) return;
      if (pin === newPin) {
        await savePin(pin);
        if (!cancelled) router.back();
      } else {
        setError('PINs do not match');
        setConfirmPin('');
        setNewPin('');
        setStep('new');
      }
    }, 150);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [step, confirmPin, newPin, router]);

  const titles = {
    current: { title: 'Current PIN', subtitle: 'Enter your current PIN' },
    new: { title: 'New PIN', subtitle: 'Enter your new PIN (4–6 digits)' },
    confirm: { title: 'Confirm New PIN', subtitle: 'Re-enter to confirm' },
  };

  const stepConfig = titles[step];
  const value = step === 'current' ? currentPin : step === 'new' ? newPin : confirmPin;
  const onChange =
    step === 'current'
      ? (v: string) => { setError(''); setCurrentPin(v); }
      : step === 'new'
        ? (v: string) => { setError(''); setNewPin(v); }
        : (v: string) => { setError(''); setConfirmPin(v); };

  const maxLength =
    step === 'confirm' ? Math.max(newPin.length, MIN_PIN_LENGTH) : MAX_PIN_LENGTH;

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <View style={styles.content}>
        <PinPad
          value={value}
          onChange={onChange}
          maxLength={maxLength}
          title={stepConfig.title}
          subtitle={stepConfig.subtitle}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, justifyContent: 'center' },
  error: { ...typography.bodySm, color: colors.error, textAlign: 'center', marginTop: spacing.md },
});
