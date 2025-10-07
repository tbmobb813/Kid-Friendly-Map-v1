/**
 * Routing Preferences Component
 * Allows users to configure routing preferences for ORS/OTP2 services
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Pressable,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import {
  Settings,
  Shield,
  Heart,
  Accessibility,
  MapPin,
  Users,
  X,
  Info,
  Sliders,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useNavigationStore } from '@/stores/enhancedNavigationStore';

interface RoutingPreferencesProps {
  visible: boolean;
  onClose: () => void;
}

const RoutingPreferences: React.FC<RoutingPreferencesProps> = ({ visible, onClose }) => {
  const {
    routingPreferences,
    accessibilitySettings,
    useAdvancedRouting,
    updateRoutingPreferences,
    updateAccessibilitySettings,
    toggleAdvancedRouting,
  } = useNavigationStore();

  const [localPreferences, setLocalPreferences] = useState(routingPreferences);
  const [localAccessibility, setLocalAccessibility] = useState(accessibilitySettings);
  const [childAgeText, setChildAgeText] = useState(localPreferences.childAge?.toString() || '');

  const handleSave = () => {
    const childAge = childAgeText ? parseInt(childAgeText) : undefined;

    if (childAgeText && (isNaN(childAge!) || childAge! < 0 || childAge! > 18)) {
      Alert.alert('Invalid Age', 'Please enter a valid age between 0 and 18');
      return;
    }

    updateRoutingPreferences({
      ...localPreferences,
      childAge,
    });

    updateAccessibilitySettings(localAccessibility);
    onClose();
  };

  const SettingRow: React.FC<{
    icon: React.ReactNode;
    title: string;
    description: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
    disabled?: boolean;
  }> = ({ icon, title, description, value, onValueChange, disabled = false }) => (
    <View style={styles.settingRow}>
      <View style={styles.settingIcon}>{icon}</View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, disabled && styles.disabledText]}>{title}</Text>
        <Text style={[styles.settingDescription, disabled && styles.disabledText]}>
          {description}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: Colors.border, true: Colors.primary + '50' }}
        thumbColor={value ? Colors.primary : Colors.textLight}
      />
    </View>
  );

  const NumberInput: React.FC<{
    icon: React.ReactNode;
    title: string;
    description: string;
    value: number;
    onValueChange: (value: number) => void;
    unit: string;
    min: number;
    max: number;
  }> = ({ icon, title, description, value, onValueChange, unit, min, max }) => {
    const [localValue, setLocalValue] = useState(value.toString());

    const handleChange = (text: string) => {
      setLocalValue(text);
      const num = parseInt(text);
      if (!isNaN(num) && num >= min && num <= max) {
        onValueChange(num);
      }
    };

    return (
      <View style={styles.settingRow}>
        <View style={styles.settingIcon}>{icon}</View>
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingDescription}>{description}</Text>
        </View>
        <View style={styles.numberInputContainer}>
          <TextInput
            style={styles.numberInput}
            value={localValue}
            onChangeText={handleChange}
            keyboardType="numeric"
            placeholder={min.toString()}
          />
          <Text style={styles.unitText}>{unit}</Text>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIcon}>
              <Settings size={24} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.headerTitle}>Routing Preferences</Text>
              <Text style={styles.headerSubtitle}>Customize your travel experience</Text>
            </View>
          </View>
          <Pressable style={styles.closeButton} onPress={onClose}>
            <X size={24} color={Colors.text} />
          </Pressable>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Advanced Routing Toggle */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Routing Service</Text>
            <SettingRow
              icon={
                <Sliders size={20} color={useAdvancedRouting ? Colors.primary : Colors.textLight} />
              }
              title="Advanced Routing"
              description="Use ORS and OTP2 for better route quality and safety scores"
              value={useAdvancedRouting}
              onValueChange={toggleAdvancedRouting}
            />
          </View>

          {useAdvancedRouting && (
            <>
              {/* Child Settings */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Child Safety</Text>

                <View style={styles.childAgeContainer}>
                  <View style={styles.settingRow}>
                    <View style={styles.settingIcon}>
                      <Users size={20} color={Colors.primary} />
                    </View>
                    <View style={styles.settingContent}>
                      <Text style={styles.settingTitle}>Child Age</Text>
                      <Text style={styles.settingDescription}>
                        Routes optimized for this age group (leave empty for adult)
                      </Text>
                    </View>
                    <View style={styles.ageInputContainer}>
                      <TextInput
                        style={styles.ageInput}
                        value={childAgeText}
                        onChangeText={setChildAgeText}
                        keyboardType="numeric"
                        placeholder="Age"
                        placeholderTextColor={Colors.textLight}
                      />
                      <Text style={styles.ageUnit}>years</Text>
                    </View>
                  </View>
                </View>

                <SettingRow
                  icon={
                    <Shield
                      size={20}
                      color={localPreferences.prioritizeSafety ? Colors.primary : Colors.textLight}
                    />
                  }
                  title="Prioritize Safety"
                  description="Choose safer routes even if they take longer"
                  value={localPreferences.prioritizeSafety}
                  onValueChange={(value) =>
                    setLocalPreferences((prev) => ({ ...prev, prioritizeSafety: value }))
                  }
                />
              </View>

              {/* Accessibility */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Accessibility</Text>

                <SettingRow
                  icon={
                    <Accessibility
                      size={20}
                      color={localPreferences.wheelchair ? Colors.primary : Colors.textLight}
                    />
                  }
                  title="Wheelchair Accessible"
                  description="Show only wheelchair accessible routes"
                  value={localPreferences.wheelchair}
                  onValueChange={(value) =>
                    setLocalPreferences((prev) => ({ ...prev, wheelchair: value }))
                  }
                />

                <SettingRow
                  icon={
                    <Heart
                      size={20}
                      color={localAccessibility.simplifiedMode ? Colors.primary : Colors.textLight}
                    />
                  }
                  title="Simplified Mode"
                  description="Use simple language and clear directions"
                  value={localAccessibility.simplifiedMode}
                  onValueChange={(value) =>
                    setLocalAccessibility((prev) => ({ ...prev, simplifiedMode: value }))
                  }
                />

                <SettingRow
                  icon={
                    <Info
                      size={20}
                      color={
                        localAccessibility.voiceDescriptions ? Colors.primary : Colors.textLight
                      }
                    />
                  }
                  title="Voice Descriptions"
                  description="Detailed audio descriptions for navigation"
                  value={localAccessibility.voiceDescriptions}
                  onValueChange={(value) =>
                    setLocalAccessibility((prev) => ({ ...prev, voiceDescriptions: value }))
                  }
                />
              </View>

              {/* Distance and Transfer Limits */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Travel Limits</Text>

                <NumberInput
                  icon={<MapPin size={20} color={Colors.primary} />}
                  title="Max Walking Distance"
                  description="Maximum distance you're willing to walk"
                  value={localPreferences.maxWalkDistance}
                  onValueChange={(value) =>
                    setLocalPreferences((prev) => ({ ...prev, maxWalkDistance: value }))
                  }
                  unit="meters"
                  min={100}
                  max={2000}
                />

                <NumberInput
                  icon={<MapPin size={20} color={Colors.primary} />}
                  title="Max Transfers"
                  description="Maximum number of transit transfers"
                  value={localPreferences.maxTransfers}
                  onValueChange={(value) =>
                    setLocalPreferences((prev) => ({ ...prev, maxTransfers: value }))
                  }
                  unit="transfers"
                  min={0}
                  max={5}
                />
              </View>

              {/* Route Avoidance */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Route Avoidance</Text>

                <SettingRow
                  icon={
                    <MapPin
                      size={20}
                      color={localPreferences.avoidHighways ? Colors.primary : Colors.textLight}
                    />
                  }
                  title="Avoid Highways"
                  description="Prefer local roads over highways"
                  value={localPreferences.avoidHighways}
                  onValueChange={(value) =>
                    setLocalPreferences((prev) => ({ ...prev, avoidHighways: value }))
                  }
                />

                <SettingRow
                  icon={
                    <MapPin
                      size={20}
                      color={localPreferences.avoidTolls ? Colors.primary : Colors.textLight}
                    />
                  }
                  title="Avoid Tolls"
                  description="Choose routes without toll roads"
                  value={localPreferences.avoidTolls}
                  onValueChange={(value) =>
                    setLocalPreferences((prev) => ({ ...prev, avoidTolls: value }))
                  }
                />
              </View>
            </>
          )}

          {/* Age-based recommendations */}
          {useAdvancedRouting && childAgeText && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Age-Based Recommendations</Text>
              <View style={styles.recommendationCard}>
                {(() => {
                  const age = parseInt(childAgeText);
                  if (age <= 5) {
                    return (
                      <>
                        <Text style={styles.recommendationTitle}>Ages 3-5: Stroller-Friendly</Text>
                        <Text style={styles.recommendationText}>
                          • Maximum 200m walking{'\n'}• Avoid stairs, prefer elevators{'\n'}• No
                          transit transfers{'\n'}• Prefer wide sidewalks and parks
                        </Text>
                      </>
                    );
                  } else if (age <= 8) {
                    return (
                      <>
                        <Text style={styles.recommendationTitle}>Ages 6-8: Supervised Walking</Text>
                        <Text style={styles.recommendationText}>
                          • Maximum 400m walking{'\n'}• Prioritize safety over speed{'\n'}• Maximum
                          1 transit transfer{'\n'}• Avoid busy intersections
                        </Text>
                      </>
                    );
                  } else if (age <= 12) {
                    return (
                      <>
                        <Text style={styles.recommendationTitle}>Ages 9-12: Semi-Independent</Text>
                        <Text style={styles.recommendationText}>
                          • Maximum 800m walking{'\n'}• Include cycling routes{'\n'}• Maximum 2
                          transit transfers{'\n'}• Balance safety and efficiency
                        </Text>
                      </>
                    );
                  } else {
                    return (
                      <>
                        <Text style={styles.recommendationTitle}>Teen: Independent Travel</Text>
                        <Text style={styles.recommendationText}>
                          • Normal walking distances{'\n'}• All transport modes available{'\n'}•
                          Standard transfer limits{'\n'}• Focus on efficiency
                        </Text>
                      </>
                    );
                  }
                })()}
              </View>
            </View>
          )}
        </ScrollView>

        {/* Save Button */}
        <View style={styles.footer}>
          <Pressable style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Preferences</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 2,
  },
  closeButton: {
    padding: 8,
    borderRadius: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingIcon: {
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
  },
  disabledText: {
    opacity: 0.5,
  },
  childAgeContainer: {
    marginBottom: 8,
  },
  ageInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ageInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: Colors.text,
    textAlign: 'center',
    width: 60,
  },
  ageUnit: {
    fontSize: 14,
    color: Colors.textLight,
    marginLeft: 8,
  },
  numberInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  numberInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: Colors.text,
    textAlign: 'center',
    width: 80,
  },
  unitText: {
    fontSize: 14,
    color: Colors.textLight,
    marginLeft: 8,
  },
  recommendationCard: {
    backgroundColor: Colors.primary + '10',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 22,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RoutingPreferences;
