import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { ScreenLayout } from '../../src/components/ui/ScreenLayout';
import { FormSection } from '../../src/components/forms/FormSection';
import { getAppSetting, saveBackupConfig } from '../../src/db/queries';
import { colors, spacing, typography } from '../../src/theme';
import { Text, StyleSheet } from 'react-native';

export default function BackupConfigScreen() {
  const [apiUrl, setApiUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [dataSource, setDataSource] = useState('Cluster0');
  const [database, setDatabase] = useState('fcrm');
  const [collection, setCollection] = useState('backups');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    Promise.all([
      getAppSetting('mongodb_api_url'),
      getAppSetting('mongodb_api_key'),
      getAppSetting('mongodb_data_source'),
      getAppSetting('mongodb_database'),
      getAppSetting('mongodb_collection'),
    ]).then(([url, key, ds, db, col]) => {
      if (url) setApiUrl(url);
      if (key) setApiKey(key);
      if (ds) setDataSource(ds);
      if (db) setDatabase(db);
      if (col) setCollection(col);
    });
  }, []);

  const save = async () => {
    if (!apiUrl.trim() || !apiKey.trim()) {
      Alert.alert('Required', 'API endpoint URL and API key are required');
      return;
    }
    setLoading(true);
    try {
      await saveBackupConfig({
        apiUrl: apiUrl.trim(),
        apiKey: apiKey.trim(),
        dataSource: dataSource.trim(),
        database: database.trim(),
        collection: collection.trim(),
      });
      Alert.alert('Saved', 'MongoDB Atlas backup configuration saved.');
      router.back();
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenLayout>
      <FormSection title="MongoDB Atlas Data API">
        <Text style={styles.hint}>
          Use your Atlas Data API insertOne endpoint URL and API key. Example URL:{'\n'}
          https://data.mongodb-api.com/app/…/endpoint/data/v1/action/insertOne
        </Text>
        <Input
          label="API Endpoint URL"
          value={apiUrl}
          onChangeText={setApiUrl}
          placeholder="https://data.mongodb-api.com/app/.../insertOne"
          autoCapitalize="none"
        />
        <Input label="API Key" value={apiKey} onChangeText={setApiKey} placeholder="Your Data API key" autoCapitalize="none" secureTextEntry />
        <Input label="Data Source" value={dataSource} onChangeText={setDataSource} placeholder="Cluster0" autoCapitalize="none" />
        <Input label="Database" value={database} onChangeText={setDatabase} placeholder="fcrm" autoCapitalize="none" />
        <Input label="Collection" value={collection} onChangeText={setCollection} placeholder="backups" autoCapitalize="none" />
      </FormSection>
      <Button title="Save Configuration" onPress={save} loading={loading} />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  hint: { ...typography.caption, color: colors.onSurfaceVariant, marginBottom: spacing.md, lineHeight: 18 },
});
