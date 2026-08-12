import { useEffect } from 'react';
import { BackHandler } from 'react-native';
import { useRouter, type Href } from 'expo-router';

/** Ensures Android hardware back button navigates back or to fallback. */
export function useAndroidBack(fallback?: Href, enabled = true) {
  const router = useRouter();

  useEffect(() => {
    if (!enabled) return;

    const onBack = () => {
      if (router.canGoBack()) {
        router.back();
        return true;
      }
      if (fallback) {
        router.replace(fallback);
        return true;
      }
      return false;
    };

    const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => sub.remove();
  }, [router, fallback, enabled]);
}
