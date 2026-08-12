import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Input } from '../ui/Input';
import { ToggleRow } from '../ui/ToggleRow';
import type { ContactPerson } from '../../types';
import { colors, spacing, typography, radius } from '../../theme';

interface ContactPersonsEditorProps {
  contacts: ContactPerson[];
  onChange: (contacts: ContactPerson[]) => void;
}

const emptyContact = (): ContactPerson => ({
  name: '',
  designation: null,
  phone: null,
  email: null,
  is_primary: 0,
});

export function ContactPersonsEditor({ contacts, onChange }: ContactPersonsEditorProps) {
  const update = (index: number, patch: Partial<ContactPerson>) => {
    const next = contacts.map((c, i) => (i === index ? { ...c, ...patch } : c));
    if (patch.is_primary) {
      next.forEach((c, i) => { if (i !== index) c.is_primary = 0; });
    }
    onChange(next);
  };

  const add = () => onChange([...contacts, emptyContact()]);
  const remove = (index: number) => onChange(contacts.filter((_, i) => i !== index));

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={styles.title}>Contact Persons</Text>
        <TouchableOpacity style={styles.addBtn} onPress={add}>
          <MaterialIcons name="person-add" size={18} color={colors.onPrimary} />
          <Text style={styles.addText}>Add</Text>
        </TouchableOpacity>
      </View>
      {contacts.length === 0 ? (
        <Text style={styles.hint}>No contacts added. Tap Add to include contact persons.</Text>
      ) : null}
      {contacts.map((contact, index) => (
        <View key={index} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Contact #{index + 1}</Text>
            <TouchableOpacity onPress={() => remove(index)}>
              <MaterialIcons name="delete-outline" size={20} color={colors.error} />
            </TouchableOpacity>
          </View>
          <Input label="Name" value={contact.name} onChangeText={(v) => update(index, { name: v })} placeholder="Full name" />
          <Input label="Designation" value={contact.designation ?? ''} onChangeText={(v) => update(index, { designation: v })} placeholder="e.g. Marketing Head" />
          <Input label="Phone" value={contact.phone ?? ''} onChangeText={(v) => update(index, { phone: v })} keyboardType="phone-pad" />
          <Input label="Email" value={contact.email ?? ''} onChangeText={(v) => update(index, { email: v })} keyboardType="email-address" autoCapitalize="none" />
          <ToggleRow
            label="Primary contact"
            value={!!contact.is_primary}
            onChange={(v) => update(index, { is_primary: v ? 1 : 0 })}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  title: { ...typography.title, fontSize: 15, color: colors.onSurface },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryContainer,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.lg,
  },
  addText: { ...typography.caption, color: colors.onPrimary, fontWeight: '600' },
  hint: { ...typography.caption, color: colors.onSurfaceVariant, marginBottom: spacing.sm },
  card: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.outlineVariant + '50',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
  cardTitle: { ...typography.caption, color: colors.primary, fontWeight: '700' },
});
