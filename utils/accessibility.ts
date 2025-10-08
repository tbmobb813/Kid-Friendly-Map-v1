import { AccessibilityInfo, Platform } from 'react-native';

export const announceForAccessibility = (message: string) => {
  if (Platform.OS !== 'web') {
    AccessibilityInfo.announceForAccessibility(message);
  }
};

export const isScreenReaderEnabled = async (): Promise<boolean> => {
  if (Platform.OS === 'web') {
    return false; // Web screen reader detection is complex
  }

  try {
    return await AccessibilityInfo.isScreenReaderEnabled();
  } catch {
    return false;
  }
};

export const getAccessibilityLabel = (text: string, context?: string): string => {
  if (context) {
    return `${text}, ${context}`;
  }
  return text;
};

export const getAccessibilityHint = (action: string): string => {
  return `Double tap to ${action}`;
};
