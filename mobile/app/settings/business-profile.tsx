import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Button } from '../../src/components/ui/Button';
import { Dropdown } from '../../src/components/ui/Dropdown';
import { ScreenLayout } from '../../src/components/ui/ScreenLayout';
import { FormSection } from '../../src/components/forms/FormSection';
import { BusinessProfileFields, type BusinessProfileFormState } from '../../src/components/forms/BusinessProfileFields';
import { COMPLIANCE_DOC_OPTIONS } from '../../src/constants/options';
import {
  getCompany,
  saveCompany,
  getComplianceDocs,
  saveComplianceDoc,
  deleteComplianceDoc,
} from '../../src/db/queries';
import type { ComplianceDoc } from '../../src/types';
import { useAuth } from '../../src/context/AuthContext';
import { copyToAppStorage, getCompanyAssetsDir } from '../../src/utils/files';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../src/theme';

export default function BusinessProfileScreen() {
  const [form, setForm] = useState<BusinessProfileFormState>({ name: '', short_code: '', currency: 'INR', financial_year_start_month: 4 });
  const [complianceDocs, setComplianceDocs] = useState<ComplianceDoc[]>([]);
  const [docType, setDocType] = useState('msme');
  const [loading, setLoading] = useState(false);
  const { refreshOnboarding } = useAuth();
  const router = useRouter();

  useEffect(() => {
    getCompany().then((c) => {
      if (c) {
        setForm({
          name: c.name,
          short_code: c.short_code,
          owner_name: c.owner_name ?? '',
          address: c.address ?? '',
          currency: c.currency,
          financial_year_start_month: c.financial_year_start_month,
          logo_path: c.logo_path,
          business_type: c.business_type ?? undefined,
          industry: c.industry ?? undefined,
          email: c.email ?? '',
          phone: c.phone ?? '',
          gstin: c.gstin ?? '',
          pan: c.pan ?? '',
          msme_number: c.msme_number ?? '',
          website: c.website ?? '',
          invoice_prefix: c.invoice_prefix ?? c.short_code,
          default_payment_terms: c.default_payment_terms ?? undefined,
          bank_account_name: c.bank_account_name ?? '',
          bank_account_number: c.bank_account_number ?? '',
          bank_ifsc: c.bank_ifsc ?? '',
          upi_id: c.upi_id ?? '',
          payment_link: c.payment_link ?? '',
        });
        getComplianceDocs(c.id).then(setComplianceDocs);
      }
    });
  }, []);

  const pickLogo = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) return Alert.alert('Permission needed', 'Allow photo access');
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.9 });
      if (result.canceled || !result.assets?.[0]) return;
      const dest = `${getCompanyAssetsDir()}logo_${Date.now()}.jpg`;
      const saved = await copyToAppStorage(result.assets[0].uri, dest);
      setForm((f) => ({ ...f, logo_path: saved }));
    } catch (e) {
      Alert.alert('Upload failed', e instanceof Error ? e.message : 'Could not upload logo');
    }
  };

  const uploadComplianceDoc = async () => {
    const company = await getCompany();
    if (!company) return;
    try {
      const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
      if (result.canceled || !result.assets?.[0]) return;
      const asset = result.assets[0];
      const dest = `${getCompanyAssetsDir()}compliance_${Date.now()}_${asset.name ?? 'doc'}`;
      const saved = await copyToAppStorage(asset.uri, dest);
      const label = COMPLIANCE_DOC_OPTIONS.find((o) => o.value === docType)?.label ?? 'Document';
      await saveComplianceDoc({ company_id: company.id, title: label, file_path: saved, doc_type: docType });
      setComplianceDocs(await getComplianceDocs(company.id));
    } catch (e) {
      Alert.alert('Upload failed', e instanceof Error ? e.message : 'Could not upload document');
    }
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.short_code.trim()) {
      return Alert.alert('Required', 'Name and short code are required');
    }
    setLoading(true);
    try {
      await saveCompany({ ...form, logo_path: form.logo_path ?? undefined });
      await refreshOnboarding();
      router.back();
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenLayout>
      <BusinessProfileFields values={form} onChange={(p) => setForm((f) => ({ ...f, ...p }))} onPickLogo={pickLogo} showInvoicePrefix />
      <FormSection title="Compliance Documents">
        <Dropdown label="Document Type" options={COMPLIANCE_DOC_OPTIONS} value={docType} onChange={setDocType} />
        <Button title="Upload Compliance Document" onPress={uploadComplianceDoc} variant="secondary" />
        {complianceDocs.map((doc) => (
          <View key={doc.id} style={styles.docRow}>
            <MaterialIcons name="description" size={20} color={colors.primary} />
            <Text style={styles.docTitle}>{doc.title}</Text>
            <TouchableOpacity onPress={async () => {
              await deleteComplianceDoc(doc.id);
              const c = await getCompany();
              if (c) setComplianceDocs(await getComplianceDocs(c.id));
            }}>
              <MaterialIcons name="delete-outline" size={20} color={colors.error} />
            </TouchableOpacity>
          </View>
        ))}
      </FormSection>
      <Button title="Save Changes" onPress={handleSave} loading={loading} />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  docRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
  docTitle: { ...typography.bodySm, color: colors.onSurface, flex: 1 },
});
