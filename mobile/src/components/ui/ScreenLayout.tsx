import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  ScrollViewProps,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '../../theme';

interface ScreenLayoutProps {
  children: React.ReactNode;
  /** Fixed content below the navigation header (e.g. search bar) */
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
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const bottomPad = keyboardVisible
    ? spacing.xl * 3 + insets.bottom
    : spacing.xl * 2 + insets.bottom;

  const body = !scrollable ? (
    <View style={[styles.body, contentContainerStyle]}>{children}</View>
  ) : (
    <KeyboardAwareScrollView
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
      enableOnAndroid
      enableAutomaticScroll
      extraScrollHeight={Platform.OS === 'android' ? 80 : 40}
      extraHeight={Platform.OS === 'android' ? 120 : 60}
      enableResetScrollToCoords={false}
      keyboardOpeningTime={0}
    >
      {children}
    </KeyboardAwareScrollView>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.root, style]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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

/** Wrapper for FlatList screens — keeps fixed top, list fills remaining space */
export function ListScreenLayout({ fixedTop, children, style }: ListScreenLayoutProps) {
  return (
    <KeyboardAvoidingView
      style={[styles.root, style]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      {fixedTop ? <View style={styles.fixedTop}>{fixedTop}</View> : null}
      <View style={styles.listBody}>{children}</View>
    </KeyboardAvoidingView>
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
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.container,
    flexGrow: 1,
  },
  listBody: {
    flex: 1,
  },
});
