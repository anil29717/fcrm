import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Input } from '../ui/Input';
import { Dropdown } from '../ui/Dropdown';
import { FormSection } from './FormSection';
import {
  BUSINESS_TYPE_OPTIONS,
  CURRENCY_OPTIONS,
  FINANCIAL_YEAR_OPTIONS,
  INDUSTRY_OPTIONS,
  PAYMENT_TERMS_OPTIONS,
  SIGNATURE_MODE_OPTIONS,
} from '../../constants/options';
import type { CompanyProfileInput } from '../../types';
import { colors, spacing, typography, radius } from '../../theme';

export interface BusinessProfileFormState extends Omit<CompanyProfileInput, 'logo_path' | 'signature_path'> {
  logo_path?: string | null;
  signature_path?: string | null;
}

interface BusinessProfileFieldsProps {
  values: BusinessProfileFormState;
  onChange: (patch: Partial<BusinessProfileFormState>) => void;
  onPickLogo: () => void;
  onPickSignature?: () => void;
  showInvoicePrefix?: boolean;
}

export function BusinessProfileFields({
  values,
  onChange,
  onPickLogo,
  onPickSignature,
  showInvoicePrefix = true,
}: BusinessProfileFieldsProps) {
  const set = (key: keyof BusinessProfileFormState, value: unknown) => onChange({ [key]: value });
  const signatureMode = values.signature_mode ?? 'computer_generated';

  return (
    <>
      <TouchableOpacity style={styles.logoBox} onPress={onPickLogo}>
        {values.logo_path ? (
          <Image source={{ uri: values.logo_path }} style={styles.logoImage} />
        ) : (
          <>
            <MaterialIcons name="add-a-photo" size={32} color={colors.primary} />
            <Text style={styles.logoText}>Upload company logo</Text>
          </>
        )}
      </TouchableOpacity>

      <FormSection title="Basic Information">
        <Input label="Business Name" value={values.name} onChangeText={(v) => set('name', v)} placeholder="Your business name" />
        <Input label="Owner / Freelancer Name" value={values.owner_name ?? ''} onChangeText={(v) => set('owner_name', v)} placeholder="Your name" />
        <Dropdown label="Business Type" options={BUSINESS_TYPE_OPTIONS} value={values.business_type ?? null} onChange={(v) => set('business_type', v)} />
        <Dropdown label="Industry / Niche" options={INDUSTRY_OPTIONS} value={values.industry ?? null} onChange={(v) => set('industry', v)} placeholder="Optional" />
        <Input label="Email" value={values.email ?? ''} onChangeText={(v) => set('email', v)} keyboardType="email-address" autoCapitalize="none" />
        <Input label="Phone" value={values.phone ?? ''} onChangeText={(v) => set('phone', v)} keyboardType="phone-pad" />
        <Input label="Address" value={values.address ?? ''} onChangeText={(v) => set('address', v)} multiline numberOfLines={3} style={{ minHeight: 80, textAlignVertical: 'top' }} />
        <Input label="Website" value={values.website ?? ''} onChangeText={(v) => set('website', v)} autoCapitalize="none" keyboardType="url" />
        <Dropdown label="Currency" options={CURRENCY_OPTIONS} value={values.currency ?? 'INR'} onChange={(v) => set('currency', v)} />
        <Dropdown
          label="Financial Year Start"
          options={FINANCIAL_YEAR_OPTIONS}
          value={values.financial_year_start_month ?? 4}
          onChange={(v) => set('financial_year_start_month', v)}
        />
      </FormSection>

      <FormSection title="Invoice Signature">
        <Dropdown
          label="Signature Style"
          options={SIGNATURE_MODE_OPTIONS}
          value={signatureMode}
          onChange={(v) => set('signature_mode', v)}
        />
        <Text style={styles.hint}>
          {signatureMode === 'authorized'
            ? 'Upload a signature image. It appears on invoice PDFs as Authorized Signatory.'
            : 'PDFs will show “SYSTEM GENERATED” — no handwritten signature needed.'}
        </Text>
        {signatureMode === 'authorized' && onPickSignature ? (
          <TouchableOpacity style={styles.sigBox} onPress={onPickSignature}>
            {values.signature_path ? (
              <Image source={{ uri: values.signature_path }} style={styles.sigImage} resizeMode="contain" />
            ) : (
              <>
                <MaterialIcons name="draw" size={28} color={colors.primary} />
                <Text style={styles.logoText}>Upload signature image</Text>
              </>
            )}
          </TouchableOpacity>
        ) : null}
        {signatureMode === 'authorized' && values.signature_path ? (
          <TouchableOpacity onPress={() => set('signature_path', null)}>
            <Text style={styles.clearSig}>Remove signature image</Text>
          </TouchableOpacity>
        ) : null}
      </FormSection>

      <FormSection title="Tax & Registration">
        <Input label="GSTIN / Tax ID" value={values.gstin ?? ''} onChangeText={(v) => set('gstin', v)} autoCapitalize="characters" />
        <Input label="PAN Number" value={values.pan ?? ''} onChangeText={(v) => set('pan', v)} autoCapitalize="characters" />
        <Input label="MSME Registration No." value={values.msme_number ?? ''} onChangeText={(v) => set('msme_number', v)} />
        {showInvoicePrefix ? (
          <>
            <Input label="Company Short Code" value={values.short_code} onChangeText={(v) => set('short_code', v)} autoCapitalize="characters" maxLength={6} placeholder="ABC" />
            <Input label="Invoice Prefix" value={values.invoice_prefix ?? values.short_code} onChangeText={(v) => set('invoice_prefix', v)} autoCapitalize="characters" />
          </>
        ) : null}
        <Dropdown label="Default Payment Terms" options={PAYMENT_TERMS_OPTIONS} value={values.default_payment_terms ?? null} onChange={(v) => set('default_payment_terms', v)} placeholder="Optional" />
      </FormSection>

      <FormSection title="Payment Details">
        <Input label="Bank Account Name" value={values.bank_account_name ?? ''} onChangeText={(v) => set('bank_account_name', v)} />
        <Input label="Bank Account Number" value={values.bank_account_number ?? ''} onChangeText={(v) => set('bank_account_number', v)} keyboardType="number-pad" />
        <Input label="IFSC Code" value={values.bank_ifsc ?? ''} onChangeText={(v) => set('bank_ifsc', v)} autoCapitalize="characters" />
        <Input label="UPI ID" value={values.upi_id ?? ''} onChangeText={(v) => set('upi_id', v)} autoCapitalize="none" />
        <Input label="PayPal / Payment Link" value={values.payment_link ?? ''} onChangeText={(v) => set('payment_link', v)} autoCapitalize="none" />
      </FormSection>
    </>
  );
}

const styles = StyleSheet.create({
  logoBox: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderStyle: 'dashed',
    backgroundColor: colors.surfaceContainerLow,
    marginBottom: spacing.md,
  },
  logoImage: { width: 96, height: 96, borderRadius: radius.md },
  logoText: { ...typography.caption, color: colors.onSurfaceVariant, marginTop: spacing.xs },
  hint: { ...typography.caption, color: colors.onSurfaceVariant, marginBottom: spacing.sm, lineHeight: 18 },
  sigBox: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderStyle: 'dashed',
    backgroundColor: colors.surfaceContainerLow,
    padding: spacing.sm,
  },
  sigImage: { width: '100%', height: 80 },
  clearSig: { ...typography.caption, color: colors.error, marginTop: spacing.sm },
});
