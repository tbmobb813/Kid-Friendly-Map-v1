import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { StyleSheet, Text, View, Pressable, ScrollView } from "react-native";
import Colors from "@/constants/colors";
import RegionSelector from "./RegionSelector";
import { useRegionStore } from "@/stores/regionStore";
import { MapPin, Settings, Shield, CheckCircle } from "lucide-react-native";
const OnboardingFlow = ({ onComplete }) => {
    const [currentStep, setCurrentStep] = useState("welcome");
    const { availableRegions, userPreferences, setRegion, updatePreferences, completeOnboarding, } = useRegionStore();
    const handleRegionSelect = (regionId) => {
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
    const renderWelcome = () => (_jsxs(View, { style: styles.stepContainer, children: [_jsx(View, { style: styles.iconContainer, children: _jsx(MapPin, { size: 48, color: Colors.primary }) }), _jsx(Text, { style: styles.stepTitle, children: "Welcome to KidMap!" }), _jsx(Text, { style: styles.stepDescription, children: "KidMap helps kids navigate public transportation safely and confidently. Let's set up your app for your city and preferences." }), _jsx(Pressable, { style: styles.primaryButton, onPress: () => setCurrentStep("region"), children: _jsx(Text, { style: styles.buttonText, children: "Get Started" }) })] }));
    const renderRegionSelection = () => (_jsx(RegionSelector, { regions: availableRegions, selectedRegion: userPreferences.selectedRegion, onSelectRegion: handleRegionSelect }));
    const renderPreferences = () => (_jsxs(ScrollView, { style: styles.scrollContainer, contentContainerStyle: styles.scrollContentContainer, children: [_jsx(View, { style: styles.iconContainer, children: _jsx(Settings, { size: 48, color: Colors.primary }) }), _jsx(Text, { style: styles.stepTitle, children: "Customize Your Experience" }), _jsx(Text, { style: styles.stepDescription, children: "Set your preferences to make KidMap work best for you." }), _jsxs(View, { style: styles.preferenceSection, children: [_jsx(Text, { style: styles.sectionTitle, children: "Units" }), _jsxs(View, { style: styles.optionRow, children: [_jsx(Pressable, { style: [
                                    styles.optionButton,
                                    userPreferences.preferredUnits === "imperial" && styles.selectedOption
                                ], onPress: () => updatePreferences({ preferredUnits: "imperial" }), children: _jsx(Text, { style: [
                                        styles.optionText,
                                        userPreferences.preferredUnits === "imperial" && styles.selectedOptionText
                                    ], children: "Imperial (miles, \u00B0F)" }) }), _jsx(Pressable, { style: [
                                    styles.optionButton,
                                    userPreferences.preferredUnits === "metric" && styles.selectedOption
                                ], onPress: () => updatePreferences({ preferredUnits: "metric" }), children: _jsx(Text, { style: [
                                        styles.optionText,
                                        userPreferences.preferredUnits === "metric" && styles.selectedOptionText
                                    ], children: "Metric (km, \u00B0C)" }) })] })] }), _jsxs(View, { style: styles.preferenceSection, children: [_jsx(Text, { style: styles.sectionTitle, children: "Accessibility" }), _jsxs(Pressable, { style: [
                            styles.toggleOption,
                            userPreferences.accessibilityMode && styles.selectedToggle
                        ], onPress: () => updatePreferences({
                            accessibilityMode: !userPreferences.accessibilityMode
                        }), children: [_jsx(Text, { style: styles.toggleText, children: "Enable accessibility features" }), userPreferences.accessibilityMode && (_jsx(CheckCircle, { size: 20, color: Colors.success }))] })] }), _jsx(Pressable, { style: styles.primaryButton, onPress: handlePreferencesComplete, children: _jsx(Text, { style: styles.buttonText, children: "Continue" }) })] }));
    const renderSafety = () => (_jsxs(ScrollView, { style: styles.scrollContainer, contentContainerStyle: styles.scrollContentContainer, children: [_jsx(View, { style: styles.iconContainer, children: _jsx(Shield, { size: 48, color: Colors.primary }) }), _jsx(Text, { style: styles.stepTitle, children: "Safety First" }), _jsx(Text, { style: styles.stepDescription, children: "KidMap includes safety features to help you travel confidently." }), _jsxs(View, { style: styles.safetyFeatures, children: [_jsxs(View, { style: styles.featureItem, children: [_jsx(Shield, { size: 24, color: Colors.success }), _jsx(Text, { style: styles.featureText, children: "Emergency contact buttons" })] }), _jsxs(View, { style: styles.featureItem, children: [_jsx(MapPin, { size: 24, color: Colors.success }), _jsx(Text, { style: styles.featureText, children: "Location sharing with parents" })] }), _jsxs(View, { style: styles.featureItem, children: [_jsx(CheckCircle, { size: 24, color: Colors.success }), _jsx(Text, { style: styles.featureText, children: "Safe arrival notifications" })] })] }), _jsx(View, { style: styles.preferenceSection, children: _jsxs(Pressable, { style: [
                        styles.toggleOption,
                        userPreferences.parentalControls && styles.selectedToggle
                    ], onPress: () => updatePreferences({
                        parentalControls: !userPreferences.parentalControls
                    }), children: [_jsx(Text, { style: styles.toggleText, children: "Enable parental controls" }), userPreferences.parentalControls && (_jsx(CheckCircle, { size: 20, color: Colors.success }))] }) }), _jsx(Pressable, { style: styles.primaryButton, onPress: handleSafetyComplete, children: _jsx(Text, { style: styles.buttonText, children: "Continue" }) })] }));
    const renderComplete = () => (_jsxs(View, { style: styles.stepContainer, children: [_jsx(View, { style: styles.iconContainer, children: _jsx(CheckCircle, { size: 48, color: Colors.success }) }), _jsx(Text, { style: styles.stepTitle, children: "You're All Set!" }), _jsx(Text, { style: styles.stepDescription, children: "KidMap is now configured for your region and preferences. Start exploring your city safely!" }), _jsx(Pressable, { style: styles.primaryButton, onPress: handleComplete, children: _jsx(Text, { style: styles.buttonText, children: "Start Using KidMap" }) })] }));
    const renderCurrentStep = () => {
        switch (currentStep) {
            case "welcome": return renderWelcome();
            case "region": return renderRegionSelection();
            case "preferences": return renderPreferences();
            case "safety": return renderSafety();
            case "complete": return renderComplete();
        }
    };
    return (_jsx(View, { style: styles.container, children: renderCurrentStep() }));
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
