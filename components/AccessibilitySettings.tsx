import React from "react";
import { StyleSheet, Text, View, Switch, ScrollView, Pressable } from "react-native";
import Colors from "@/constants/colors";
import { Eye, Volume2, Zap, Settings, ArrowLeft } from "lucide-react-native";
import { useNavigationStore } from "@/stores/navigationStore";

type AccessibilitySettingsProps = {
  onBack?: () => void;
};

const AccessibilitySettings: React.FC<AccessibilitySettingsProps> = ({ onBack }) => {
  const { accessibilitySettings, updateAccessibilitySettings } = useNavigationStore();

  const SettingItem = ({ 
    icon, 
    title, 
    description, 
    value, 
    onValueChange 
  }: {
    icon: React.ReactNode;
    title: string;
    description: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
  }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingIcon}>{icon}</View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, accessibilitySettings.largeText && styles.largeText]}>
          {title}
        </Text>
        <Text style={[styles.settingDescription, accessibilitySettings.largeText && styles.largeDescription]}>
          {description}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "#E0E0E0", true: Colors.primary }}
        thumbColor="#FFFFFF"
      />
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {onBack && (
        <Pressable style={styles.backButton} onPress={onBack}>
          <ArrowLeft size={20} color={Colors.primary} />
          <Text style={styles.backText}>Back to Settings</Text>
        </Pressable>
      )}
      
      <Text style={[styles.sectionTitle, accessibilitySettings.largeText && styles.largeSectionTitle]}>
        Accessibility Settings
      </Text>
      
      <SettingItem
        icon={<Eye size={24} color={Colors.primary} />}
        title="Large Text"
        description="Make text bigger and easier to read"
        value={accessibilitySettings.largeText}
        onValueChange={(value) => updateAccessibilitySettings({ largeText: value })}
      />
      
      <SettingItem
        icon={<Settings size={24} color={Colors.primary} />}
        title="High Contrast"
        description="Use colors that are easier to see"
        value={accessibilitySettings.highContrast}
        onValueChange={(value) => updateAccessibilitySettings({ highContrast: value })}
      />
      
      <SettingItem
        icon={<Volume2 size={24} color={Colors.primary} />}
        title="Voice Descriptions"
        description="Hear descriptions of what's on screen"
        value={accessibilitySettings.voiceDescriptions}
        onValueChange={(value) => updateAccessibilitySettings({ voiceDescriptions: value })}
      />
      
      <SettingItem
        icon={<Zap size={24} color={Colors.primary} />}
        title="Simplified Mode"
        description="Show only the most important features"
        value={accessibilitySettings.simplifiedMode}
        onValueChange={(value) => updateAccessibilitySettings({ simplifiedMode: value })}
      />
    </ScrollView>
  );
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
