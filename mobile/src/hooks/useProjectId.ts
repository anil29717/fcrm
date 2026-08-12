import { useGlobalSearchParams } from 'expo-router';
import { useProjectIdFromContext } from '../context/ProjectIdContext';

/** Reads project id from tab layout context, or parent dynamic route params. */
export function useProjectId(): number | null {
  const fromContext = useProjectIdFromContext();
  if (fromContext != null) return fromContext;

  const { id } = useGlobalSearchParams<{ id?: string | string[] }>();
  const raw = Array.isArray(id) ? id[0] : id;
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}
