// Type declarations to allow using `className` on React Native components
// This is a minimal, safe augmentation for nativewind's `className` usage.
// Place this file under `types/` so TypeScript picks it up automatically.

import 'react-native';

declare module 'react-native' {
  interface ViewProps {
    className?: string;
  }

  interface TextProps {
    className?: string;
  }

  interface ImageProps {
    className?: string;
  }

  interface ScrollViewProps {
    className?: string;
  }

  interface FlatListProps<ItemT = any> {
    className?: string;
  }

  interface SectionListProps<ItemT = any> {
    className?: string;
  }

  interface TextInputProps {
    className?: string;
  }

  interface PressableProps {
    className?: string;
  }

  interface TouchableOpacityProps {
    className?: string;
  }
}
