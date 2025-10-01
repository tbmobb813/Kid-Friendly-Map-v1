import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React from "react";
import { StyleSheet, Text, View, Switch, ScrollView, Pressable } from "react-native";
import Colors from "@/constants/colors";
import { Bell, Shield, MapPin, Clock, HelpCircle, Info, ChevronRight, Eye, Globe, Settings, RefreshCw, Palette, Lock, Camera, LogOut } from "lucide-react-native";
import AccessibilitySettings from "@/components/AccessibilitySettings";
import RegionSwitcher from "@/components/RegionSwitcher";
import RegionalTransitCard from "@/components/RegionalTransitCard";
import CityManagement from "@/components/CityManagement";
import CategoryManagement from "@/components/CategoryManagement";
import PhotoCheckInHistory from "@/components/PhotoCheckInHistory";
import { useRegionStore } from "@/stores/regionStore";
import { transitDataUpdater } from "@/utils/transitDataUpdater";
import { useParentalStore } from "@/stores/parentalStore";
import PinAuthentication from "@/components/PinAuthentication";
import ParentDashboard from "@/components/ParentDashboard";
import NotificationStatusCard from "@/components/NotificationStatusCard";
import SystemHealthMonitor from "@/components/SystemHealthMonitor";
import { useAuth } from "@/hooks/useAuth";
export default function SettingsScreen() {
    const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
    const [safetyAlertsEnabled, setSafetyAlertsEnabled] = React.useState(true);
    const [locationHistoryEnabled, setLocationHistoryEnabled] = React.useState(false);
    const [simplifiedDirections, setSimplifiedDirections] = React.useState(true);
    const [showAccessibility, setShowAccessibility] = React.useState(false);
    const [showCityManagement, setShowCityManagement] = React.useState(false);
    const [showCategoryManagement, setShowCategoryManagement] = React.useState(false);
    const [showPhotoHistory, setShowPhotoHistory] = React.useState(false);
    const [userMode, setUserMode] = React.useState('child');
    const [showPinAuth, setShowPinAuth] = React.useState(false);
    const [showParentDashboard, setShowParentDashboard] = React.useState(false);
    const { currentRegion, userPreferences, updatePreferences } = useRegionStore();
    const { isParentMode, authenticateParentMode, exitParentMode } = useParentalStore();
    const { user, logout } = useAuth();
    const SettingItem = ({ icon, title, description, value, onValueChange }) => (_jsxs(View, { style: styles.settingItem, children: [_jsx(View, { style: styles.settingIcon, children: icon }), _jsxs(View, { style: styles.settingContent, children: [_jsx(Text, { style: styles.settingTitle, children: title }), _jsx(Text, { style: styles.settingDescription, children: description })] }), _jsx(Switch, { value: value, onValueChange: onValueChange, trackColor: { false: "#E0E0E0", true: Colors.primary }, thumbColor: "#FFFFFF" })] }));
    const LinkItem = ({ icon, title, onPress }) => (_jsxs(Pressable, { style: ({ pressed }) => [
            styles.linkItem,
            pressed && styles.linkItemPressed
        ], onPress: onPress, children: [_jsx(View, { style: styles.settingIcon, children: icon }), _jsx(Text, { style: styles.linkTitle, children: title }), _jsx(ChevronRight, { size: 20, color: Colors.textLight })] }));
    const handleTransitDataUpdate = async () => {
        try {
            console.log('Starting transit data update for all regions...');
            const results = await transitDataUpdater.updateAllRegions();
            const successCount = results.filter(r => r.success).length;
            const totalCount = results.length;
            if (successCount === totalCount) {
                console.log(`Successfully updated transit data for all ${totalCount} regions`);
            }
            else {
                console.log(`Updated ${successCount}/${totalCount} regions successfully`);
                results.filter(r => !r.success).forEach(result => {
                    console.error(`Failed to update ${result.regionId}: ${result.message}`);
                });
            }
        }
        catch (error) {
            console.error('Failed to update transit data:', error);
        }
    };
    const handleParentModeToggle = () => {
        if (isParentMode) {
            exitParentMode();
            setShowParentDashboard(false);
        }
        else {
            setShowPinAuth(true);
        }
    };
    const handlePinAuthenticated = async () => {
        setShowPinAuth(false);
        setShowParentDashboard(true);
    };
    const handleExitParentDashboard = () => {
        setShowParentDashboard(false);
        exitParentMode();
    };
    return (_jsx(ScrollView, { style: styles.container, children: showPinAuth ? (_jsx(PinAuthentication, { onAuthenticated: handlePinAuthenticated, onCancel: () => setShowPinAuth(false) })) : showParentDashboard ? (_jsx(ParentDashboard, { onExit: handleExitParentDashboard })) : showAccessibility ? (_jsx(AccessibilitySettings, { onBack: () => setShowAccessibility(false) })) : showCityManagement ? (_jsx(CityManagement, { onBack: () => setShowCityManagement(false) })) : showCategoryManagement ? (_jsx(CategoryManagement, { onBack: () => setShowCategoryManagement(false), userMode: userMode })) : showPhotoHistory ? (_jsxs(View, { style: styles.fullScreenContainer, children: [_jsx(View, { style: styles.backHeader, children: _jsx(Pressable, { style: styles.backButton, onPress: () => setShowPhotoHistory(false), children: _jsx(Text, { style: styles.backButtonText, children: "\u2190 Back" }) }) }), _jsx(PhotoCheckInHistory, {})] })) : (_jsxs(_Fragment, { children: [_jsxs(View, { style: styles.section, children: [_jsx(Text, { style: styles.sectionTitle, children: "Region & Location" }), _jsx(View, { style: styles.regionContainer, children: _jsx(RegionSwitcher, {}) }), _jsx(LinkItem, { icon: _jsx(Settings, { size: 24, color: Colors.primary }), title: "Manage Cities", onPress: () => setShowCityManagement(true) }), _jsx(LinkItem, { icon: _jsx(RefreshCw, { size: 24, color: Colors.primary }), title: "Update Transit Data", onPress: handleTransitDataUpdate })] }), _jsx(RegionalTransitCard, {}), _jsxs(View, { style: styles.section, children: [_jsx(Text, { style: styles.sectionTitle, children: "Parental Controls" }), _jsx(LinkItem, { icon: _jsx(Lock, { size: 24, color: Colors.primary }), title: isParentMode ? "Exit Parent Mode" : "Parent Dashboard", onPress: handleParentModeToggle })] }), _jsxs(View, { style: styles.section, children: [_jsx(Text, { style: styles.sectionTitle, children: "User Mode" }), _jsxs(View, { style: styles.preferenceItem, children: [_jsx(Settings, { size: 24, color: Colors.primary }), _jsxs(View, { style: styles.preferenceContent, children: [_jsx(Text, { style: styles.preferenceTitle, children: "Current Mode" }), _jsxs(View, { style: styles.unitsToggle, children: [_jsx(Pressable, { style: [
                                                        styles.unitButton,
                                                        userMode === "child" && styles.activeUnit
                                                    ], onPress: () => setUserMode("child"), children: _jsx(Text, { style: [
                                                            styles.unitText,
                                                            userMode === "child" && styles.activeUnitText
                                                        ], children: "Child" }) }), _jsx(Pressable, { style: [
                                                        styles.unitButton,
                                                        userMode === "parent" && styles.activeUnit
                                                    ], onPress: () => setUserMode("parent"), children: _jsx(Text, { style: [
                                                            styles.unitText,
                                                            userMode === "parent" && styles.activeUnitText
                                                        ], children: "Parent" }) })] })] })] })] }), _jsxs(View, { style: styles.section, children: [_jsx(Text, { style: styles.sectionTitle, children: "Categories" }), _jsx(LinkItem, { icon: _jsx(Palette, { size: 24, color: Colors.primary }), title: "Manage Categories", onPress: () => setShowCategoryManagement(true) })] }), _jsxs(View, { style: styles.section, children: [_jsx(Text, { style: styles.sectionTitle, children: "Safety & Check-ins" }), _jsx(LinkItem, { icon: _jsx(Camera, { size: 24, color: Colors.primary }), title: "Photo Check-in History", onPress: () => setShowPhotoHistory(true) })] }), _jsxs(View, { style: styles.section, children: [_jsx(Text, { style: styles.sectionTitle, children: "App Settings" }), _jsx(NotificationStatusCard, { testId: "notification-status" }), _jsx(SettingItem, { icon: _jsx(Bell, { size: 24, color: Colors.primary }), title: "Notifications", description: "Get alerts about transit delays and updates", value: notificationsEnabled, onValueChange: setNotificationsEnabled }), _jsx(SettingItem, { icon: _jsx(Shield, { size: 24, color: Colors.primary }), title: "Safety Alerts", description: "Receive important safety information", value: safetyAlertsEnabled, onValueChange: setSafetyAlertsEnabled }), _jsx(SettingItem, { icon: _jsx(MapPin, { size: 24, color: Colors.primary }), title: "Save Location History", description: "Store places you've visited", value: locationHistoryEnabled, onValueChange: setLocationHistoryEnabled }), _jsx(SettingItem, { icon: _jsx(Clock, { size: 24, color: Colors.primary }), title: "Simplified Directions", description: "Show easier-to-follow directions", value: simplifiedDirections, onValueChange: setSimplifiedDirections })] }), _jsxs(View, { style: styles.section, children: [_jsx(Text, { style: styles.sectionTitle, children: "Regional Preferences" }), _jsxs(View, { style: styles.preferenceItem, children: [_jsx(Globe, { size: 24, color: Colors.primary }), _jsxs(View, { style: styles.preferenceContent, children: [_jsx(Text, { style: styles.preferenceTitle, children: "Units" }), _jsxs(View, { style: styles.unitsToggle, children: [_jsx(Pressable, { style: [
                                                        styles.unitButton,
                                                        userPreferences.preferredUnits === "imperial" && styles.activeUnit
                                                    ], onPress: () => updatePreferences({ preferredUnits: "imperial" }), children: _jsx(Text, { style: [
                                                            styles.unitText,
                                                            userPreferences.preferredUnits === "imperial" && styles.activeUnitText
                                                        ], children: "Imperial" }) }), _jsx(Pressable, { style: [
                                                        styles.unitButton,
                                                        userPreferences.preferredUnits === "metric" && styles.activeUnit
                                                    ], onPress: () => updatePreferences({ preferredUnits: "metric" }), children: _jsx(Text, { style: [
                                                            styles.unitText,
                                                            userPreferences.preferredUnits === "metric" && styles.activeUnitText
                                                        ], children: "Metric" }) })] })] })] })] }), _jsxs(View, { style: styles.section, children: [_jsx(Text, { style: styles.sectionTitle, children: "System Status" }), _jsx(SystemHealthMonitor, { testId: "system-health" })] }), _jsxs(View, { style: styles.section, children: [_jsx(Text, { style: styles.sectionTitle, children: "Account" }), user && (_jsxs(View, { style: styles.userInfo, children: [_jsxs(Text, { style: styles.userInfoText, children: ["Signed in as: ", user.name] }), _jsx(Text, { style: styles.userInfoEmail, children: user.email })] })), _jsx(LinkItem, { icon: _jsx(LogOut, { size: 24, color: Colors.error }), title: "Sign Out", onPress: logout })] }), _jsxs(View, { style: styles.section, children: [_jsx(Text, { style: styles.sectionTitle, children: "Help & Information" }), _jsx(LinkItem, { icon: _jsx(HelpCircle, { size: 24, color: Colors.primary }), title: "Help Center", onPress: () => { } }), _jsx(LinkItem, { icon: _jsx(Info, { size: 24, color: Colors.primary }), title: "About KidMap", onPress: () => { } })] }), _jsxs(View, { style: styles.section, children: [_jsx(Text, { style: styles.sectionTitle, children: "Accessibility" }), _jsx(LinkItem, { icon: _jsx(Eye, { size: 24, color: Colors.primary }), title: "Accessibility Settings", onPress: () => setShowAccessibility(true) })] }), _jsxs(View, { style: styles.versionContainer, children: [_jsx(Text, { style: styles.versionText, children: "KidMap v1.0.0" }), _jsxs(Text, { style: styles.regionText, children: ["Configured for ", currentRegion.name] })] })] })) }));
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    section: {
        padding: 16,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: Colors.text,
        marginBottom: 16,
    },
    regionContainer: {
        alignItems: "flex-start",
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
    settingDescription: {
        fontSize: 14,
        color: Colors.textLight,
    },
    linkItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.card,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    linkItemPressed: {
        opacity: 0.8,
        backgroundColor: "#EAEAEA",
    },
    linkTitle: {
        flex: 1,
        fontSize: 16,
        fontWeight: "600",
        color: Colors.text,
    },
    preferenceItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.card,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    preferenceContent: {
        flex: 1,
        marginLeft: 16,
    },
    preferenceTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.text,
        marginBottom: 8,
    },
    unitsToggle: {
        flexDirection: "row",
        backgroundColor: Colors.border,
        borderRadius: 8,
        padding: 2,
    },
    unitButton: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 6,
        alignItems: "center",
    },
    activeUnit: {
        backgroundColor: Colors.primary,
    },
    unitText: {
        fontSize: 14,
        fontWeight: "500",
        color: Colors.textLight,
    },
    activeUnitText: {
        color: "#FFFFFF",
    },
    versionContainer: {
        alignItems: "center",
        padding: 24,
    },
    versionText: {
        fontSize: 14,
        color: Colors.textLight,
    },
    regionText: {
        fontSize: 12,
        color: Colors.textLight,
        marginTop: 4,
    },
    fullScreenContainer: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    backHeader: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    backButton: {
        alignSelf: 'flex-start',
    },
    backButtonText: {
        fontSize: 16,
        color: Colors.primary,
        fontWeight: '600',
    },
    userInfo: {
        backgroundColor: Colors.card,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    userInfoText: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 4,
    },
    userInfoEmail: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
});
