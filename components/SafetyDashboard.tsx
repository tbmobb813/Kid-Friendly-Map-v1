import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Alert } from 'react-native';
import Colors from '@/constants/colors';
import { 
  Shield, 
  Camera, 
  MapPin, 
  Phone, 
  MessageCircle, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  Users,
  Settings,
  ArrowRight
} from 'lucide-react-native';
import { useParentalStore } from '@/stores/parentalStore';
import { useNavigationStore } from '@/stores/navigationStore';
import { useSafeZoneMonitor } from '@/hooks/useSafeZoneMonitor';
import PhotoCheckInButton from './PhotoCheckInButton';
import { SafeZoneIndicator } from './SafeZoneIndicator';

type SafetyDashboardProps = {
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
  currentPlace?: {
    id: string;
    name: string;
  };
  onNavigateToSettings?: () => void;
};

const SafetyDashboard: React.FC<SafetyDashboardProps> = ({ 
  currentLocation, 
  currentPlace,
  onNavigateToSettings 
}) => {
  const { settings, checkInRequests, safeZones } = useParentalStore();
  const { photoCheckIns } = useNavigationStore();
  const { currentZoneStatus } = useSafeZoneMonitor();
  const [showQuickActions, setShowQuickActions] = useState(true);

  // Calculate safety stats
  const recentCheckIns = photoCheckIns.slice(0, 3);
  const activeSafeZones = safeZones.filter(zone => zone.isActive).length;
  const pendingCheckInRequests = checkInRequests.filter(req => req.status === 'pending').length;
  const emergencyContacts = settings.emergencyContacts.length;

  const handleEmergencyCall = () => {
    Alert.alert(
      "Emergency Help",
      "Choose how you'd like to get help:",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Call 911", style: "destructive", onPress: () => console.log("Emergency call") },
        { text: "Call Parent", onPress: () => console.log("Parent call") }
      ]
    );
  };

  const handleQuickCheckIn = () => {
    Alert.alert(
      "Quick Check-in",
      "Let your family know you're okay?",
      [
        { text: "Not now", style: "cancel" },
        { text: "I&apos;m OK!", onPress: () => console.log("Quick check-in sent") }
      ]
    );
  };

  const SafetyStatCard = ({ 
    icon, 
    title, 
    value, 
    subtitle, 
    color = Colors.primary,
    onPress 
  }: {
    icon: React.ReactNode;
    title: string;
    value: string | number;
    subtitle: string;
    color?: string;
    onPress?: () => void;
  }) => (
    <Pressable 
      style={[styles.statCard, onPress && styles.pressableCard]} 
      onPress={onPress}
    >
      <View style={[styles.statIcon, { backgroundColor: `${color}20` }]}>
        {React.cloneElement(icon as React.ReactElement, { 
          size: 20, 
          color 
        })}
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
        <Text style={styles.statSubtitle}>{subtitle}</Text>
      </View>
      {onPress && <ArrowRight size={16} color={Colors.textLight} />}
    </Pressable>
  );

  const QuickActionButton = ({ 
    icon, 
    title, 
    onPress, 
    color = Colors.primary 
  }: {
    icon: React.ReactNode;
    title: string;
    onPress: () => void;
    color?: string;
  }) => (
    <Pressable style={[styles.quickActionButton, { backgroundColor: color }]} onPress={onPress}>
      {React.cloneElement(icon as React.ReactElement, { 
        size: 20, 
        color: '#FFFFFF' 
      })}
      <Text style={styles.quickActionText}>{title}</Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Shield size={24} color={Colors.primary} />
          <Text style={styles.headerTitle}>Safety Dashboard</Text>
        </View>
        {onNavigateToSettings && (
          <Pressable style={styles.settingsButton} onPress={onNavigateToSettings}>
            <Settings size={20} color={Colors.textLight} />
          </Pressable>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Status</Text>
          <SafeZoneIndicator />
          
          {currentZoneStatus && (
            <View style={[
              styles.statusCard, 
              { backgroundColor: currentZoneStatus.isInSafeZone ? '#E8F5E8' : '#FFF3E0' }
            ]}>
              <View style={[
                styles.statusIndicator,
                { backgroundColor: currentZoneStatus.isInSafeZone ? Colors.success : Colors.warning }
              ]} />
              <Text style={styles.statusText}>
                {currentZoneStatus.isInSafeZone 
                  ? `You're in the ${currentZoneStatus.zoneName} safe zone` 
                  : 'Outside safe zones - stay alert!'
                }
              </Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        {showQuickActions && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <Pressable onPress={() => setShowQuickActions(false)}>
                <Text style={styles.hideButton}>Hide</Text>
              </Pressable>
            </View>
            
            <View style={styles.quickActionsGrid}>
              <QuickActionButton
                icon={<Phone />}
                title="Emergency"
                onPress={handleEmergencyCall}
                color="#FF3B30"
              />
              
              <QuickActionButton
                icon={<MessageCircle />}
                title="I&apos;m OK!"
                onPress={handleQuickCheckIn}
                color={Colors.success}
              />
              
              <QuickActionButton
                icon={<MapPin />}
                title="Share Location"
                onPress={() => console.log("Share location")}
                color={Colors.primary}
              />
              
              <QuickActionButton
                icon={<Camera />}
                title="Photo Check-in"
                onPress={() => console.log("Photo check-in")}
                color={Colors.secondary}
              />
            </View>
          </View>
        )}

        {/* Photo Check-in */}
        {currentPlace && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Check-in at Current Location</Text>
            <PhotoCheckInButton 
              placeName={currentPlace.name}
              placeId={currentPlace.id}
            />
          </View>
        )}

        {/* Safety Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Safety Overview</Text>
          
          <View style={styles.statsGrid}>
            <SafetyStatCard
              icon={<Shield />}
              title="Safe Zones"
              value={activeSafeZones}
              subtitle="Active zones"
              onPress={() => console.log("Navigate to safe zones")}
            />
            
            <SafetyStatCard
              icon={<Camera />}
              title="Check-ins"
              value={recentCheckIns.length}
              subtitle="Recent"
              color={Colors.secondary}
              onPress={() => console.log("Navigate to check-in history")}
            />
          </View>

          <View style={styles.statsGrid}>
            <SafetyStatCard
              icon={<Clock />}
              title="Requests"
              value={pendingCheckInRequests}
              subtitle="Pending"
              color={pendingCheckInRequests > 0 ? Colors.warning : Colors.success}
            />
            
            <SafetyStatCard
              icon={<Users />}
              title="Contacts"
              value={emergencyContacts}
              subtitle="Emergency"
              color="#9C27B0"
              onPress={() => console.log("Navigate to emergency contacts")}
            />
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          
          {recentCheckIns.length > 0 ? (
            recentCheckIns.map((checkIn, index) => (
              <View key={index} style={styles.activityItem}>
                <CheckCircle size={16} color={Colors.success} />
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>Checked in at {checkIn.placeName}</Text>
                  <Text style={styles.activityTime}>
                    {new Date(checkIn.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyActivity}>
              <Camera size={32} color={Colors.textLight} />
              <Text style={styles.emptyActivityText}>No recent check-ins</Text>
              <Text style={styles.emptyActivitySubtext}>
                Take a photo when you arrive somewhere to let your family know you&apos;re safe
              </Text>
            </View>
          )}
        </View>

        {/* Safety Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Safety Reminder</Text>
          <View style={styles.tipCard}>
            <AlertTriangle size={20} color={Colors.warning} />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Stay Safe Out There!</Text>
              <Text style={styles.tipText}>
                Always let someone know where you&apos;re going and check in when you arrive safely.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
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
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  settingsButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  hideButton: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionButton: {
    width: '48%',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    minHeight: 80,
    justifyContent: 'center',
  },
  quickActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pressableCard: {
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  statTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 2,
  },
  statSubtitle: {
    fontSize: 10,
    color: Colors.textLight,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    gap: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  activityTime: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 2,
  },
  emptyActivity: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: Colors.card,
    borderRadius: 12,
  },
  emptyActivityText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 12,
  },
  emptyActivitySubtext: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  tipText: {
    fontSize: 12,
    color: Colors.text,
    lineHeight: 16,
  },
});

export default SafetyDashboard;
