import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { Dropdown } from '../../src/components/ui/Dropdown';
import { ScreenLayout } from '../../src/components/ui/ScreenLayout';
import { FormSection } from '../../src/components/forms/FormSection';
import { INVOICE_FORMAT_OPTIONS, INVOICE_RESET_OPTIONS } from '../../src/constants/options';
import { getCompany, saveCompany } from '../../src/db/queries';
import { colors } from '../../src/theme';

export default function InvoiceNumberingScreen() {
  const [prefix, setPrefix] = useState('');
  const [format, setFormat] = useState('{prefix}-{FY}-{seq}');
  const [nextNumber, setNextNumber] = useState('1');
  const [resetFreq, setResetFreq] = useState('never');
  const [shortCode, setShortCode] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    getCompany().then((c) => {
      if (!c) return;
      setShortCode(c.short_code);
      setPrefix(c.invoice_prefix ?? c.short_code);
      setFormat(c.invoice_number_format ?? '{prefix}-{FY}-{seq}');
      setNextNumber(String(c.invoice_next_number ?? 1));
      setResetFreq(c.invoice_reset_frequency ?? 'never');
    });
  }, []);

  const save = async () => {
    const company = await getCompany();
    if (!company) return Alert.alert('Error', 'Company not configured');
    const num = parseInt(nextNumber, 10);
    if (!Number.isFinite(num) || num < 1) return Alert.alert('Required', 'Enter valid next number');
    setLoading(true);
    try {
      await saveCompany({
        name: company.name,
        short_code: shortCode || company.short_code,
        invoice_prefix: prefix.trim() || company.short_code,
        invoice_number_format: format,
        invoice_next_number: num,
        invoice_reset_frequency: resetFreq,
      });
      router.back();
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenLayout>
      <FormSection title="Invoice Numbering">
        <Input label="Invoice Prefix" value={prefix} onChangeText={setPrefix} autoCapitalize="characters" placeholder="ABC" />
        <Dropdown label="Number Format" options={INVOICE_FORMAT_OPTIONS} value={format} onChange={setFormat} />
        <Input label="Next Number" value={nextNumber} onChangeText={setNextNumber} keyboardType="number-pad" />
        <Dropdown label="Reset Frequency" options={INVOICE_RESET_OPTIONS} value={resetFreq} onChange={setResetFreq} />
      </FormSection>
      <Button title="Save Settings" onPress={save} loading={loading} />
    </ScreenLayout>
  );
}
