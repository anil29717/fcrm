import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ViewStyle,
  ScrollViewProps,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '../../theme';

interface ScreenLayoutProps {
  children: React.ReactNode;
  fixedTop?: React.ReactNode;
  scrollable?: boolean;
  refreshControl?: ScrollViewProps['refreshControl'];
  contentContainerStyle?: ViewStyle;
  style?: ViewStyle;
}

export function ScreenLayout({
  children,
  fixedTop,
  scrollable = true,
  refreshControl,
  contentContainerStyle,
  style,
}: ScreenLayoutProps) {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
      // Keep the focused field reachable above the keyboard.
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, Platform.OS === 'android' ? 100 : 50);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardHeight(0));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // With Android adjustResize the window already shrinks; still add room to scroll.
  const bottomPad =
    spacing.xl * 2 +
    insets.bottom +
    (keyboardHeight > 0 ? Math.min(keyboardHeight, Platform.OS === 'android' ? 220 : 120) : 24);

  const body = !scrollable ? (
    <View style={[styles.body, contentContainerStyle]}>{children}</View>
  ) : (
    <ScrollView
      ref={scrollRef}
      style={styles.scroll}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: bottomPad },
        contentContainerStyle,
      ]}
      showsVerticalScrollIndicator={false}
      refreshControl={refreshControl}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
    >
      {children}
    </ScrollView>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.root, style]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      {fixedTop ? <View style={styles.fixedTop}>{fixedTop}</View> : null}
      {body}
    </KeyboardAvoidingView>
  );
}

interface ListScreenLayoutProps {
  fixedTop?: React.ReactNode;
  children: React.ReactNode;
  style?: ViewStyle;
}

export function ListScreenLayout({ fixedTop, children, style }: ListScreenLayoutProps) {
  return (
    <View style={[styles.root, style]}>
      {fixedTop ? <View style={styles.fixedTop}>{fixedTop}</View> : null}
      <View style={styles.listBody}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  fixedTop: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant + '40',
    zIndex: 1,
  },
  body: {
    flex: 1,
    padding: spacing.container,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.container,
    flexGrow: 1,
  },
  listBody: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
