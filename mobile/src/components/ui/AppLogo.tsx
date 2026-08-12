import React from 'react';
import { Image, ImageStyle, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

const logoSource = require('../../../assets/logo.png');

type LogoSize = 'sm' | 'md' | 'lg' | 'xl';

const SIZES: Record<LogoSize, number> = {
  sm: 40,
  md: 64,
  lg: 112,
  xl: 160,
};

interface AppLogoProps {
  size?: LogoSize | number;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
}

export function AppLogo({ size = 'md', style, imageStyle }: AppLogoProps) {
  const dimension = typeof size === 'number' ? size : SIZES[size];

  return (
    <View style={[styles.wrap, { width: dimension, height: dimension }, style]}>
      <Image
        source={logoSource}
        style={[styles.image, { width: dimension, height: dimension }, imageStyle]}
        resizeMode="contain"
        accessibilityLabel="FreelancePro logo"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    backgroundColor: 'transparent',
  },
});
