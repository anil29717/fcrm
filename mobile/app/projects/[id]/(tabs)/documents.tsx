import { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import { Dropdown } from '../../../../src/components/ui/Dropdown';
import { DOCUMENT_CATEGORY_OPTIONS } from '../../../../src/constants/options';
import { ListScreenLayout } from '../../../../src/components/ui/ScreenLayout';
import { InvalidProjectFallback } from '../../../../src/components/ui/InvalidProjectFallback';
import { useProjectId } from '../../../../src/hooks/useProjectId';
import { getDocuments, saveDocument, deleteDocument } from '../../../../src/db/queries';
import type { ProjectDocument } from '../../../../src/types';
import { copyToAppStorage, deleteLocalFile, getProjectDocsDir } from '../../../../src/utils/files';
import { colors, spacing, typography, radius } from '../../../../src/theme';

export default function ProjectDocumentsScreen() {
  const projectId = useProjectId();
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    if (!projectId) return;
    setDocuments(await getDocuments(projectId));
  }, [projectId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const saveFile = async (sourceUri: string, fileName: string, docTitle: string) => {
    if (!projectId) return;
    const destDir = getProjectDocsDir(projectId);
    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const destPath = `${destDir}${Date.now()}_${safeName}`;
    await copyToAppStorage(sourceUri, destPath);
    await saveDocument({
      project_id: projectId,
      title: docTitle,
      file_path: destPath,
      category: category || undefined,
      notes: notes || undefined,
    });
    setTitle('');
    setCategory('');
    setNotes('');
    await load();
  };

  const pickDocument = async () => {
    if (!title.trim()) {
      Alert.alert('Required', 'Enter a document title first');
      return;
    }
    setUploading(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
      if (result.canceled || !result.assets?.[0]) return;
      const asset = result.assets[0];
      await saveFile(asset.uri, asset.name ?? 'document', title.trim());
      Alert.alert('Success', 'Document attached');
    } catch (e) {
      Alert.alert('Upload failed', e instanceof Error ? e.message : 'Could not attach file');
    } finally {
      setUploading(false);
    }
  };

  const pickImage = async () => {
    if (!title.trim()) {
      Alert.alert('Required', 'Enter a document title first');
      return;
    }
    setUploading(true);
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission needed', 'Allow photo library access to upload images');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.9,
      });
      if (result.canceled || !result.assets?.[0]) return;
      const asset = result.assets[0];
      const fileName = asset.fileName ?? `image_${Date.now()}.jpg`;
      await saveFile(asset.uri, fileName, title.trim());
      Alert.alert('Success', 'Image attached');
    } catch (e) {
      Alert.alert('Upload failed', e instanceof Error ? e.message : 'Could not attach image');
    } finally {
      setUploading(false);
    }
  };

  const removeDoc = (doc: ProjectDocument) => {
    Alert.alert('Delete', `Remove "${doc.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteLocalFile(doc.file_path);
            await deleteDocument(doc.id);
            await load();
          } catch {
            Alert.alert('Error', 'Failed to delete document');
          }
        },
      },
    ]);
  };

  if (!projectId) {
    return <InvalidProjectFallback />;
  }

  return (
    <ListScreenLayout
      fixedTop={
        <View style={styles.addSection}>
          <TextInput
            style={styles.input}
            placeholder="Document title (e.g. Contract)"
            placeholderTextColor={colors.outline}
            value={title}
            onChangeText={setTitle}
          />
          <Dropdown label="Category" options={DOCUMENT_CATEGORY_OPTIONS} value={category || null} onChange={setCategory} placeholder="Optional" />
          <TextInput
            style={[styles.input, { minHeight: 60 }]}
            placeholder="Notes (optional)"
            placeholderTextColor={colors.outline}
            value={notes}
            onChangeText={setNotes}
            multiline
          />
          <View style={styles.btnRow}>
            <TouchableOpacity style={[styles.attachBtn, styles.attachBtnHalf]} onPress={pickDocument} disabled={uploading}>
              <MaterialIcons name="attach-file" size={20} color={colors.onPrimary} />
              <Text style={styles.attachText}>File</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.attachBtn, styles.attachBtnHalf]} onPress={pickImage} disabled={uploading}>
              <MaterialIcons name="image" size={20} color={colors.onPrimary} />
              <Text style={styles.attachText}>Image</Text>
            </TouchableOpacity>
          </View>
          {uploading ? <ActivityIndicator color={colors.primary} style={styles.loader} /> : null}
        </View>
      }
    >
      <FlatList
        data={documents}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No documents attached yet.</Text>}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <MaterialIcons name="description" size={28} color={colors.primary} />
            <View style={styles.rowBody}>
              <Text style={styles.docTitle}>{item.title}</Text>
              <Text style={styles.docPath}>{item.file_path.split('/').pop()}</Text>
            </View>
            <TouchableOpacity onPress={() => removeDoc(item)}>
              <MaterialIcons name="delete-outline" size={22} color={colors.error} />
            </TouchableOpacity>
          </View>
        )}
      />
    </ListScreenLayout>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { ...typography.body, color: colors.error },
  addSection: { padding: spacing.container, gap: spacing.sm },
  input: {
    ...typography.body,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    color: colors.onSurface,
    backgroundColor: colors.surfaceContainerLowest,
  },
  btnRow: { flexDirection: 'row', gap: spacing.sm },
  attachBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryContainer,
    padding: 12,
    borderRadius: radius.lg,
    gap: spacing.sm,
  },
  attachBtnHalf: { flex: 1 },
  attachText: { ...typography.label, color: colors.onPrimary },
  loader: { marginTop: spacing.xs },
  list: { padding: spacing.container, paddingBottom: spacing.xl },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  rowBody: { flex: 1 },
  docTitle: { ...typography.body, fontWeight: '500', color: colors.onSurface },
  docPath: { ...typography.caption, color: colors.onSurfaceVariant },
  empty: { ...typography.bodySm, color: colors.onSurfaceVariant, textAlign: 'center', padding: spacing.lg },
});
