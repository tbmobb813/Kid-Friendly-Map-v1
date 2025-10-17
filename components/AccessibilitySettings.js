import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { StyleSheet, Text, View, Switch, ScrollView, Pressable } from "react-native";
import Colors from "@/constants/colors";
import { Eye, Volume2, Zap, Settings, ArrowLeft } from "lucide-react-native";
import { useNavigationStore } from "@/stores/navigationStore";
const AccessibilitySettings = ({ onBack }) => {
    const { accessibilitySettings, updateAccessibilitySettings } = useNavigationStore();
    const SettingItem = ({ icon, title, description, value, onValueChange }) => (_jsxs(View, { style: styles.settingItem, children: [_jsx(View, { style: styles.settingIcon, children: icon }), _jsxs(View, { style: styles.settingContent, children: [_jsx(Text, { style: [styles.settingTitle, accessibilitySettings.largeText && styles.largeText], children: title }), _jsx(Text, { style: [styles.settingDescription, accessibilitySettings.largeText && styles.largeDescription], children: description })] }), _jsx(Switch, { value: value, onValueChange: onValueChange, trackColor: { false: "#E0E0E0", true: Colors.primary }, thumbColor: "#FFFFFF" })] }));
    return (_jsxs(ScrollView, { style: styles.container, children: [onBack && (_jsxs(Pressable, { style: styles.backButton, onPress: onBack, children: [_jsx(ArrowLeft, { size: 20, color: Colors.primary }), _jsx(Text, { style: styles.backText, children: "Back to Settings" })] })), _jsx(Text, { style: [styles.sectionTitle, accessibilitySettings.largeText && styles.largeSectionTitle], children: "Accessibility Settings" }), _jsx(SettingItem, { icon: _jsx(Eye, { size: 24, color: Colors.primary }), title: "Large Text", description: "Make text bigger and easier to read", value: accessibilitySettings.largeText, onValueChange: (value) => updateAccessibilitySettings({ largeText: value }) }), _jsx(SettingItem, { icon: _jsx(Settings, { size: 24, color: Colors.primary }), title: "High Contrast", description: "Use colors that are easier to see", value: accessibilitySettings.highContrast, onValueChange: (value) => updateAccessibilitySettings({ highContrast: value }) }), _jsx(SettingItem, { icon: _jsx(Volume2, { size: 24, color: Colors.primary }), title: "Voice Descriptions", description: "Hear descriptions of what's on screen", value: accessibilitySettings.voiceDescriptions, onValueChange: (value) => updateAccessibilitySettings({ voiceDescriptions: value }) }), _jsx(SettingItem, { icon: _jsx(Zap, { size: 24, color: Colors.primary }), title: "Simplified Mode", description: "Show only the most important features", value: accessibilitySettings.simplifiedMode, onValueChange: (value) => updateAccessibilitySettings({ simplifiedMode: value }) })] }));
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        padding: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: Colors.text,
        marginBottom: 16,
    },
    largeSectionTitle: {
        fontSize: 24,
    },
    settingItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.card,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    settingIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#F0F4FF",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
    },
    settingContent: {
        flex: 1,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.text,
        marginBottom: 4,
    },
    largeText: {
        fontSize: 20,
    },
    settingDescription: {
        fontSize: 14,
        color: Colors.textLight,
    },
    largeDescription: {
        fontSize: 16,
    },
    backButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 4,
        marginBottom: 16,
    },
    backText: {
        fontSize: 16,
        color: Colors.primary,
        fontWeight: "600",
        marginLeft: 8,
    },
});
export default AccessibilitySettings;
