import { AccessibilityInfo, Platform } from "react-native";
export const announceForAccessibility = (message) => {
    if (Platform.OS !== 'web') {
        AccessibilityInfo.announceForAccessibility(message);
    }
};
export const isScreenReaderEnabled = async () => {
    if (Platform.OS === 'web') {
        return false; // Web screen reader detection is complex
    }
    try {
        return await AccessibilityInfo.isScreenReaderEnabled();
    }
    catch {
        return false;
    }
};
export const getAccessibilityLabel = (text, context) => {
    if (context) {
        return `${text}, ${context}`;
    }
    return text;
};
export const getAccessibilityHint = (action) => {
    return `Double tap to ${action}`;
};
