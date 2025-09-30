import React, { useState } from "react";
import { StyleSheet, Text, View, Pressable, ScrollView } from "react-native";
import Colors from "@/constants/colors";
import RegionSelector from "./RegionSelector";
import { useRegionStore } from "@/stores/regionStore";
import { MapPin, Settings, Shield, CheckCircle } from "lucide-react-native";

type OnboardingStep = "welcome" | "region" | "preferences" | "safety" | "complete";

type OnboardingFlowProps = {
  onComplete: () => void;
};

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("welcome");
  const {
    availableRegions,
    userPreferences,
    setRegion,
    updatePreferences,
    completeOnboarding,
  } = useRegionStore();

  const handleRegionSelect = (regionId: string) => {
    setRegion(regionId);
    setCurrentStep("preferences");
  };

  const handlePreferencesComplete = () => {
    setCurrentStep("safety");
  };

  const handleSafetyComplete = () => {
    setCurrentStep("complete");
  };

  const handleComplete = () => {
    completeOnboarding();
    onComplete();
  };

  const renderWelcome = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <MapPin size={48} color={Colors.primary} />
      </View>
      <Text style={styles.stepTitle}>Welcome to KidMap!</Text>
      <Text style={styles.stepDescription}>
        KidMap helps kids navigate public transportation safely and confidently. 
        Let's set up your app for your city and preferences.
      </Text>
      <Pressable style={styles.primaryButton} onPress={() => setCurrentStep("region")}>
        <Text style={styles.buttonText}>Get Started</Text>
      </Pressable>
    </View>
  );

  const renderRegionSelection = () => (
    <RegionSelector
      regions={availableRegions}
      selectedRegion={userPreferences.selectedRegion}
      onSelectRegion={handleRegionSelect}
    />
  );

  const renderPreferences = () => (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContentContainer}>
      <View style={styles.iconContainer}>
        <Settings size={48} color={Colors.primary} />
      </View>
      <Text style={styles.stepTitle}>Customize Your Experience</Text>
      <Text style={styles.stepDescription}>
        Set your preferences to make KidMap work best for you.
      </Text>

      <View style={styles.preferenceSection}>
        <Text style={styles.sectionTitle}>Units</Text>
        <View style={styles.optionRow}>
          <Pressable
            style={[
              styles.optionButton,
              userPreferences.preferredUnits === "imperial" && styles.selectedOption
            ]}
            onPress={() => updatePreferences({ preferredUnits: "imperial" })}
          >
            <Text style={[
              styles.optionText,
              userPreferences.preferredUnits === "imperial" && styles.selectedOptionText
            ]}>
              Imperial (miles, °F)
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.optionButton,
              userPreferences.preferredUnits === "metric" && styles.selectedOption
            ]}
            onPress={() => updatePreferences({ preferredUnits: "metric" })}
          >
            <Text style={[
              styles.optionText,
              userPreferences.preferredUnits === "metric" && styles.selectedOptionText
            ]}>
              Metric (km, °C)
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.preferenceSection}>
        <Text style={styles.sectionTitle}>Accessibility</Text>
        <Pressable
          style={[
            styles.toggleOption,
            userPreferences.accessibilityMode && styles.selectedToggle
          ]}
          onPress={() => updatePreferences({ 
            accessibilityMode: !userPreferences.accessibilityMode 
          })}
        >
          <Text style={styles.toggleText}>Enable accessibility features</Text>
          {userPreferences.accessibilityMode && (
            <CheckCircle size={20} color={Colors.success} />
          )}
        </Pressable>
      </View>

      <Pressable style={styles.primaryButton} onPress={handlePreferencesComplete}>
        <Text style={styles.buttonText}>Continue</Text>
      </Pressable>
    </ScrollView>
  );

  const renderSafety = () => (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContentContainer}>
      <View style={styles.iconContainer}>
        <Shield size={48} color={Colors.primary} />
      </View>
      <Text style={styles.stepTitle}>Safety First</Text>
      <Text style={styles.stepDescription}>
        KidMap includes safety features to help you travel confidently.
      </Text>

      <View style={styles.safetyFeatures}>
        <View style={styles.featureItem}>
          <Shield size={24} color={Colors.success} />
          <Text style={styles.featureText}>Emergency contact buttons</Text>
        </View>
        <View style={styles.featureItem}>
          <MapPin size={24} color={Colors.success} />
          <Text style={styles.featureText}>Location sharing with parents</Text>
        </View>
        <View style={styles.featureItem}>
          <CheckCircle size={24} color={Colors.success} />
          <Text style={styles.featureText}>Safe arrival notifications</Text>
        </View>
      </View>

      <View style={styles.preferenceSection}>
        <Pressable
          style={[
            styles.toggleOption,
            userPreferences.parentalControls && styles.selectedToggle
          ]}
          onPress={() => updatePreferences({ 
            parentalControls: !userPreferences.parentalControls 
          })}
        >
          <Text style={styles.toggleText}>Enable parental controls</Text>
          {userPreferences.parentalControls && (
            <CheckCircle size={20} color={Colors.success} />
          )}
        </Pressable>
      </View>

      <Pressable style={styles.primaryButton} onPress={handleSafetyComplete}>
        <Text style={styles.buttonText}>Continue</Text>
      </Pressable>
    </ScrollView>
  );

  const renderComplete = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <CheckCircle size={48} color={Colors.success} />
      </View>
      <Text style={styles.stepTitle}>You're All Set!</Text>
      <Text style={styles.stepDescription}>
        KidMap is now configured for your region and preferences. 
        Start exploring your city safely!
      </Text>
      <Pressable style={styles.primaryButton} onPress={handleComplete}>
        <Text style={styles.buttonText}>Start Using KidMap</Text>
      </Pressable>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "welcome": return renderWelcome();
      case "region": return renderRegionSelection();
      case "preferences": return renderPreferences();
      case "safety": return renderSafety();
      case "complete": return renderComplete();
    }
  };

  return (
    <View style={styles.container}>
      {renderCurrentStep()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  stepContainer: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: 24,
    flexGrow: 1,
    justifyContent: "center",
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.text,
    textAlign: "center",
    marginBottom: 16,
  },
  stepDescription: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: "center",
    marginTop: 24,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  preferenceSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 12,
  },
  optionRow: {
    flexDirection: "row",
    gap: 12,
  },
  optionButton: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedOption: {
    borderColor: Colors.primary,
    backgroundColor: "#F0F4FF",
  },
  optionText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: "500",
  },
  selectedOptionText: {
    color: Colors.primary,
    fontWeight: "600",
  },
  toggleOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 16,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedToggle: {
    borderColor: Colors.success,
    backgroundColor: "#F0FFF4",
  },
  toggleText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: "500",
  },
  safetyFeatures: {
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  featureText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: "500",
  },
});

export default OnboardingFlow;
