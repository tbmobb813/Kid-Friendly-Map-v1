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

type SettingItemProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

type LinkItemProps = {
  icon: React.ReactNode;
  title: string;
  onPress: () => void;
};

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [safetyAlertsEnabled, setSafetyAlertsEnabled] = React.useState(true);
  const [locationHistoryEnabled, setLocationHistoryEnabled] = React.useState(false);
  const [simplifiedDirections, setSimplifiedDirections] = React.useState(true);
  const [showAccessibility, setShowAccessibility] = React.useState(false);
  const [showCityManagement, setShowCityManagement] = React.useState(false);
  const [showCategoryManagement, setShowCategoryManagement] = React.useState(false);
  const [showPhotoHistory, setShowPhotoHistory] = React.useState(false);
  const [userMode, setUserMode] = React.useState<'parent' | 'child'>('child');
  const [showPinAuth, setShowPinAuth] = React.useState(false);
  const [showParentDashboard, setShowParentDashboard] = React.useState(false);
  
  const { currentRegion, userPreferences, updatePreferences } = useRegionStore();
  const { isParentMode, authenticateParentMode, exitParentMode } = useParentalStore();
  const { user, logout } = useAuth();

  const SettingItem: React.FC<SettingItemProps> = ({ icon, title, description, value, onValueChange }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingIcon}>{icon}</View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "#E0E0E0", true: Colors.primary }}
        thumbColor="#FFFFFF"
      />
    </View>
  );

  const LinkItem: React.FC<LinkItemProps> = ({ icon, title, onPress }) => (
    <Pressable 
      style={({ pressed }) => [
        styles.linkItem,
        pressed && styles.linkItemPressed
      ]}
      onPress={onPress}
    >
      <View style={styles.settingIcon}>{icon}</View>
      <Text style={styles.linkTitle}>{title}</Text>
      <ChevronRight size={20} color={Colors.textLight} />
    </Pressable>
  );

  const handleTransitDataUpdate = async () => {
    try {
      console.log('Starting transit data update for all regions...');
      const results = await transitDataUpdater.updateAllRegions();
      
      const successCount = results.filter(r => r.success).length;
      const totalCount = results.length;
      
      if (successCount === totalCount) {
        console.log(`Successfully updated transit data for all ${totalCount} regions`);
      } else {
        console.log(`Updated ${successCount}/${totalCount} regions successfully`);
        results.filter(r => !r.success).forEach(result => {
          console.error(`Failed to update ${result.regionId}: ${result.message}`);
        });
      }
    } catch (error) {
      console.error('Failed to update transit data:', error);
    }
  };

  const handleParentModeToggle = () => {
    if (isParentMode) {
      exitParentMode();
      setShowParentDashboard(false);
    } else {
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

  return (
    <ScrollView style={styles.container}>
      {showPinAuth ? (
        <PinAuthentication
          onAuthenticated={handlePinAuthenticated}
          onCancel={() => setShowPinAuth(false)}
        />
      ) : showParentDashboard ? (
        <ParentDashboard onExit={handleExitParentDashboard} />
      ) : showAccessibility ? (
        <AccessibilitySettings onBack={() => setShowAccessibility(false)} />
      ) : showCityManagement ? (
        <CityManagement onBack={() => setShowCityManagement(false)} />
      ) : showCategoryManagement ? (
        <CategoryManagement onBack={() => setShowCategoryManagement(false)} userMode={userMode} />
      ) : showPhotoHistory ? (
        <View style={styles.fullScreenContainer}>
          <View style={styles.backHeader}>
            <Pressable 
              style={styles.backButton}
              onPress={() => setShowPhotoHistory(false)}
            >
              <Text style={styles.backButtonText}>← Back</Text>
            </Pressable>
          </View>
          <PhotoCheckInHistory />
        </View>
      ) : (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Region & Location</Text>
            <View style={styles.regionContainer}>
              <RegionSwitcher />
            </View>
            
            <LinkItem
              icon={<Settings size={24} color={Colors.primary} />}
              title="Manage Cities"
              onPress={() => setShowCityManagement(true)}
            />
            
            <LinkItem
              icon={<RefreshCw size={24} color={Colors.primary} />}
              title="Update Transit Data"
              onPress={handleTransitDataUpdate}
            />
          </View>

          <RegionalTransitCard />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Parental Controls</Text>
            
            <LinkItem
              icon={<Lock size={24} color={Colors.primary} />}
              title={isParentMode ? "Exit Parent Mode" : "Parent Dashboard"}
              onPress={handleParentModeToggle}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>User Mode</Text>
            <View style={styles.preferenceItem}>
              <Settings size={24} color={Colors.primary} />
              <View style={styles.preferenceContent}>
                <Text style={styles.preferenceTitle}>Current Mode</Text>
                <View style={styles.unitsToggle}>
                  <Pressable
                    style={[
                      styles.unitButton,
                      userMode === "child" && styles.activeUnit
                    ]}
                    onPress={() => setUserMode("child")}
                  >
                    <Text style={[
                      styles.unitText,
                      userMode === "child" && styles.activeUnitText
                    ]}>
                      Child
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.unitButton,
                      userMode === "parent" && styles.activeUnit
                    ]}
                    onPress={() => setUserMode("parent")}
                  >
                    <Text style={[
                      styles.unitText,
                      userMode === "parent" && styles.activeUnitText
                    ]}>
                      Parent
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Categories</Text>
            
            <LinkItem
              icon={<Palette size={24} color={Colors.primary} />}
              title="Manage Categories"
              onPress={() => setShowCategoryManagement(true)}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Safety & Check-ins</Text>
            
            <LinkItem
              icon={<Camera size={24} color={Colors.primary} />}
              title="Photo Check-in History"
              onPress={() => setShowPhotoHistory(true)}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>App Settings</Text>
            
            <NotificationStatusCard testId="notification-status" />
            
            <SettingItem
              icon={<Bell size={24} color={Colors.primary} />}
              title="Notifications"
              description="Get alerts about transit delays and updates"
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
            />
            
            <SettingItem
              icon={<Shield size={24} color={Colors.primary} />}
              title="Safety Alerts"
              description="Receive important safety information"
              value={safetyAlertsEnabled}
              onValueChange={setSafetyAlertsEnabled}
            />
            
            <SettingItem
              icon={<MapPin size={24} color={Colors.primary} />}
              title="Save Location History"
              description="Store places you've visited"
              value={locationHistoryEnabled}
              onValueChange={setLocationHistoryEnabled}
            />
            
            <SettingItem
              icon={<Clock size={24} color={Colors.primary} />}
              title="Simplified Directions"
              description="Show easier-to-follow directions"
              value={simplifiedDirections}
              onValueChange={setSimplifiedDirections}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Regional Preferences</Text>
            
            <View style={styles.preferenceItem}>
              <Globe size={24} color={Colors.primary} />
              <View style={styles.preferenceContent}>
                <Text style={styles.preferenceTitle}>Units</Text>
                <View style={styles.unitsToggle}>
                  <Pressable
                    style={[
                      styles.unitButton,
                      userPreferences.preferredUnits === "imperial" && styles.activeUnit
                    ]}
                    onPress={() => updatePreferences({ preferredUnits: "imperial" })}
                  >
                    <Text style={[
                      styles.unitText,
                      userPreferences.preferredUnits === "imperial" && styles.activeUnitText
                    ]}>
                      Imperial
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.unitButton,
                      userPreferences.preferredUnits === "metric" && styles.activeUnit
                    ]}
                    onPress={() => updatePreferences({ preferredUnits: "metric" })}
                  >
                    <Text style={[
                      styles.unitText,
                      userPreferences.preferredUnits === "metric" && styles.activeUnitText
                    ]}>
                      Metric
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>System Status</Text>
            <SystemHealthMonitor testId="system-health" />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            
            {user && (
              <View style={styles.userInfo}>
                <Text style={styles.userInfoText}>Signed in as: {user.name}</Text>
                <Text style={styles.userInfoEmail}>{user.email}</Text>
              </View>
            )}
            
            <LinkItem
              icon={<LogOut size={24} color={Colors.error} />}
              title="Sign Out"
              onPress={logout}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Help & Information</Text>
            
            <LinkItem
              icon={<HelpCircle size={24} color={Colors.primary} />}
              title="Help Center"
              onPress={() => {}}
            />
            
            <LinkItem
              icon={<Info size={24} color={Colors.primary} />}
              title="About KidMap"
              onPress={() => {}}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Accessibility</Text>
            
            <LinkItem
              icon={<Eye size={24} color={Colors.primary} />}
              title="Accessibility Settings"
              onPress={() => setShowAccessibility(true)}
            />
          </View>

          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>KidMap v1.0.0</Text>
            <Text style={styles.regionText}>Configured for {currentRegion.name}</Text>
          </View>
        </>
      )}
    </ScrollView>
  );
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
