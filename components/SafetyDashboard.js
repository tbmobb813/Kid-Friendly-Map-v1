import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Alert } from 'react-native';
import Colors from '@/constants/colors';
import { Shield, Camera, MapPin, Phone, MessageCircle, Clock, CheckCircle, AlertTriangle, Users, Settings, ArrowRight } from 'lucide-react-native';
import { useParentalStore } from '@/stores/parentalStore';
import { useNavigationStore } from '@/stores/navigationStore';
import { useSafeZoneMonitor } from '@/hooks/useSafeZoneMonitor';
import PhotoCheckInButton from './PhotoCheckInButton';
import { SafeZoneIndicator } from './SafeZoneIndicator';
const SafetyDashboard = ({ currentLocation, currentPlace, onNavigateToSettings }) => {
    const { settings, checkInRequests, safeZones } = useParentalStore();
    const { photoCheckIns } = useNavigationStore();
    const { getCurrentSafeZoneStatus } = useSafeZoneMonitor();
    const currentZoneStatus = getCurrentSafeZoneStatus ? getCurrentSafeZoneStatus() : null;
    const [showQuickActions, setShowQuickActions] = useState(true);
    // Calculate safety stats
    const recentCheckIns = photoCheckIns.slice(0, 3);
    const activeSafeZones = safeZones.filter(zone => zone.isActive).length;
    const pendingCheckInRequests = checkInRequests.filter(req => req.status === 'pending').length;
    const emergencyContacts = settings.emergencyContacts.length;
    const handleEmergencyCall = () => {
        Alert.alert("Emergency Help", "Choose how you'd like to get help:", [
            { text: "Cancel", style: "cancel" },
            { text: "Call 911", style: "destructive", onPress: () => console.log("Emergency call") },
            { text: "Call Parent", onPress: () => console.log("Parent call") }
        ]);
    };
    const handleQuickCheckIn = () => {
        Alert.alert("Quick Check-in", "Let your family know you're okay?", [
            { text: "Not now", style: "cancel" },
            { text: "I&apos;m OK!", onPress: () => console.log("Quick check-in sent") }
        ]);
    };
    const SafetyStatCard = ({ icon, title, value, subtitle, color = Colors.primary, onPress }) => (_jsxs(Pressable, { style: [styles.statCard, onPress && styles.pressableCard], onPress: onPress, children: [_jsx(View, { style: [styles.statIcon, { backgroundColor: `${color}20` }], children: React.cloneElement(icon, {
                    size: 20,
                    color
                }) }), _jsxs(View, { style: styles.statContent, children: [_jsx(Text, { style: styles.statValue, children: value }), _jsx(Text, { style: styles.statTitle, children: title }), _jsx(Text, { style: styles.statSubtitle, children: subtitle })] }), onPress && _jsx(ArrowRight, { size: 16, color: Colors.textLight })] }));
    const QuickActionButton = ({ icon, title, onPress, color = Colors.primary }) => (_jsxs(Pressable, { style: [styles.quickActionButton, { backgroundColor: color }], onPress: onPress, children: [React.cloneElement(icon, {
                size: 20,
                color: '#FFFFFF'
            }), _jsx(Text, { style: styles.quickActionText, children: title })] }));
    return (_jsxs(View, { style: styles.container, children: [_jsxs(View, { style: styles.header, children: [_jsxs(View, { style: styles.headerLeft, children: [_jsx(Shield, { size: 24, color: Colors.primary }), _jsx(Text, { style: styles.headerTitle, children: "Safety Dashboard" })] }), onNavigateToSettings && (_jsx(Pressable, { style: styles.settingsButton, onPress: onNavigateToSettings, children: _jsx(Settings, { size: 20, color: Colors.textLight }) }))] }), _jsxs(ScrollView, { style: styles.content, showsVerticalScrollIndicator: false, children: [_jsxs(View, { style: styles.section, children: [_jsx(Text, { style: styles.sectionTitle, children: "Current Status" }), _jsx(SafeZoneIndicator, {}), currentZoneStatus && (() => {
                                const isInSafeZone = currentZoneStatus.inside && currentZoneStatus.inside.length > 0;
                                const zoneName = isInSafeZone ? currentZoneStatus.inside[0].name : undefined;
                                return (_jsxs(View, { style: [
                                        styles.statusCard,
                                        { backgroundColor: isInSafeZone ? '#E8F5E8' : '#FFF3E0' }
                                    ], children: [_jsx(View, { style: [
                                                styles.statusIndicator,
                                                { backgroundColor: isInSafeZone ? Colors.success : Colors.warning }
                                            ] }), _jsx(Text, { style: styles.statusText, children: isInSafeZone
                                                ? `You're in the ${zoneName} safe zone`
                                                : 'Outside safe zones - stay alert!' })] }));
                            })()] }), showQuickActions && (_jsxs(View, { style: styles.section, children: [_jsxs(View, { style: styles.sectionHeader, children: [_jsx(Text, { style: styles.sectionTitle, children: "Quick Actions" }), _jsx(Pressable, { onPress: () => setShowQuickActions(false), children: _jsx(Text, { style: styles.hideButton, children: "Hide" }) })] }), _jsxs(View, { style: styles.quickActionsGrid, children: [_jsx(QuickActionButton, { icon: _jsx(Phone, {}), title: "Emergency", onPress: handleEmergencyCall, color: "#FF3B30" }), _jsx(QuickActionButton, { icon: _jsx(MessageCircle, {}), title: "I'm OK!", onPress: handleQuickCheckIn, color: Colors.success }), _jsx(QuickActionButton, { icon: _jsx(MapPin, {}), title: "Share Location", onPress: () => console.log("Share location"), color: Colors.primary }), _jsx(QuickActionButton, { icon: _jsx(Camera, {}), title: "Photo Check-in", onPress: () => console.log("Photo check-in"), color: Colors.secondary })] })] })), currentPlace && (_jsxs(View, { style: styles.section, children: [_jsx(Text, { style: styles.sectionTitle, children: "Check-in at Current Location" }), _jsx(PhotoCheckInButton, { placeName: currentPlace.name, placeId: currentPlace.id })] })), _jsxs(View, { style: styles.section, children: [_jsx(Text, { style: styles.sectionTitle, children: "Safety Overview" }), _jsxs(View, { style: styles.statsGrid, children: [_jsx(SafetyStatCard, { icon: _jsx(Shield, {}), title: "Safe Zones", value: activeSafeZones, subtitle: "Active zones", onPress: () => console.log("Navigate to safe zones") }), _jsx(SafetyStatCard, { icon: _jsx(Camera, {}), title: "Check-ins", value: recentCheckIns.length, subtitle: "Recent", color: Colors.secondary, onPress: () => console.log("Navigate to check-in history") })] }), _jsxs(View, { style: styles.statsGrid, children: [_jsx(SafetyStatCard, { icon: _jsx(Clock, {}), title: "Requests", value: pendingCheckInRequests, subtitle: "Pending", color: pendingCheckInRequests > 0 ? Colors.warning : Colors.success }), _jsx(SafetyStatCard, { icon: _jsx(Users, {}), title: "Contacts", value: emergencyContacts, subtitle: "Emergency", color: "#9C27B0", onPress: () => console.log("Navigate to emergency contacts") })] })] }), _jsxs(View, { style: styles.section, children: [_jsx(Text, { style: styles.sectionTitle, children: "Recent Activity" }), recentCheckIns.length > 0 ? (recentCheckIns.map((checkIn, index) => (_jsxs(View, { style: styles.activityItem, children: [_jsx(CheckCircle, { size: 16, color: Colors.success }), _jsxs(View, { style: styles.activityContent, children: [_jsxs(Text, { style: styles.activityTitle, children: ["Checked in at ", checkIn.placeName] }), _jsx(Text, { style: styles.activityTime, children: new Date(checkIn.timestamp).toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                }) })] })] }, index)))) : (_jsxs(View, { style: styles.emptyActivity, children: [_jsx(Camera, { size: 32, color: Colors.textLight }), _jsx(Text, { style: styles.emptyActivityText, children: "No recent check-ins" }), _jsx(Text, { style: styles.emptyActivitySubtext, children: "Take a photo when you arrive somewhere to let your family know you're safe" })] }))] }), _jsxs(View, { style: styles.section, children: [_jsx(Text, { style: styles.sectionTitle, children: "Safety Reminder" }), _jsxs(View, { style: styles.tipCard, children: [_jsx(AlertTriangle, { size: 20, color: Colors.warning }), _jsxs(View, { style: styles.tipContent, children: [_jsx(Text, { style: styles.tipTitle, children: "Stay Safe Out There!" }), _jsx(Text, { style: styles.tipText, children: "Always let someone know where you're going and check in when you arrive safely." })] })] })] })] })] }));
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
