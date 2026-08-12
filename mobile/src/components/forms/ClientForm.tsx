import { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Dropdown } from '../ui/Dropdown';
import { ScreenLayout } from '../ui/ScreenLayout';
import { FormSection } from './FormSection';
import { ContactPersonsEditor } from './ContactPersonsEditor';
import { MultiSelect } from '../ui/MultiSelect';
import {
  CLIENT_TYPE_OPTIONS,
  LEAD_SOURCE_OPTIONS,
  CLIENT_STATUS_OPTIONS,
  CLIENT_TAG_OPTIONS,
} from '../../constants/options';
import { saveClient } from '../../db/queries';
import type { ContactPerson } from '../../types';

interface ClientFormProps {
  initial?: {
    id?: number;
    name?: string;
    client_type?: string;
    gstin?: string;
    address?: string;
    lead_source?: string;
    status?: string;
    tags?: string[];
    phone?: string;
    email?: string;
    notes?: string;
    contacts?: ContactPerson[];
  };
  onSaved: (id: number) => void;
}

export function ClientForm({ initial, onSaved }: ClientFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [clientType, setClientType] = useState(initial?.client_type ?? '');
  const [gstin, setGstin] = useState(initial?.gstin ?? '');
  const [address, setAddress] = useState(initial?.address ?? '');
  const [leadSource, setLeadSource] = useState(initial?.lead_source ?? '');
  const [status, setStatus] = useState(initial?.status ?? 'active');
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const [phone, setPhone] = useState(initial?.phone ?? '');
  const [email, setEmail] = useState(initial?.email ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [contacts, setContacts] = useState<ContactPerson[]>(initial?.contacts ?? []);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Client name is required');
      return;
    }
    if (!status) {
      Alert.alert('Required', 'Select client status');
      return;
    }
    setLoading(true);
    try {
      const id = await saveClient({
        id: initial?.id,
        name: name.trim(),
        client_type: clientType || undefined,
        gstin: gstin || undefined,
        address: address || undefined,
        lead_source: leadSource || undefined,
        status,
        tags,
        phone: phone || undefined,
        email: email || undefined,
        notes: notes || undefined,
        contacts,
      });
      onSaved(id);
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to save client');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenLayout>
      <FormSection title="Client Details">
        <Input label="Client / Company Name" value={name} onChangeText={setName} placeholder="Client name" />
        <Dropdown label="Client Type" options={CLIENT_TYPE_OPTIONS} value={clientType || null} onChange={setClientType} placeholder="Optional" />
        <Input label="Client GSTIN" value={gstin} onChangeText={setGstin} autoCapitalize="characters" />
        <Input label="Address" value={address} onChangeText={setAddress} multiline numberOfLines={3} style={{ minHeight: 80, textAlignVertical: 'top' }} />
        <Dropdown label="Lead Source" options={LEAD_SOURCE_OPTIONS} value={leadSource || null} onChange={setLeadSource} placeholder="Optional" />
        <Dropdown label="Status" options={CLIENT_STATUS_OPTIONS} value={status} onChange={setStatus} />
        <MultiSelect label="Tags" options={CLIENT_TAG_OPTIONS} values={tags} onChange={setTags} />
        <Input label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <Input label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <Input label="Notes" value={notes} onChangeText={setNotes} multiline numberOfLines={3} style={{ minHeight: 80, textAlignVertical: 'top' }} />
      </FormSection>
      <ContactPersonsEditor contacts={contacts} onChange={setContacts} />
      <Button title={initial?.id ? 'Save Changes' : 'Save Client'} onPress={handleSave} loading={loading} />
    </ScreenLayout>
  );
}
