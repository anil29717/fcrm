import { useProjectIdFromContext } from '../context/ProjectIdContext';

/**
 * Project id from ProjectIdProvider only.
 * Parent `projects/[id]/_layout` must wrap screens with ProjectIdProvider.
 * Do not call expo-router param hooks here — that breaks Tabs on navigation.
 */
export function useProjectId(): number | null {
  return useProjectIdFromContext();
}
