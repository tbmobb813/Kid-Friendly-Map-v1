import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Alert, Image } from 'react-native';
import Colors from '@/constants/colors';
import { Shield, MapPin, Camera, CheckCircle, AlertTriangle, Phone, Settings, Plus, Eye, LogOut, MessageCircle } from 'lucide-react-native';
import { useParentalStore } from '@/stores/parentalStore';
import { useCategoryStore } from '@/stores/categoryStore';
import SafeZoneManagement from '@/components/SafeZoneManagement';
import { SafeZoneStatusCard } from '@/components/SafeZoneStatusCard';
import { SafeZoneActivityLog } from '@/components/SafeZoneActivityLog';
import DevicePingHistory from '@/components/DevicePingHistory';
const ParentDashboard = ({ onExit }) => {
    const { dashboardData, checkInRequests, safeZones, settings, sendDevicePing, requestCheckIn, } = useParentalStore();
    const { getPendingCategories, approveCategory } = useCategoryStore();
    const [activeTab, setActiveTab] = useState('overview');
    const [showSafeZoneManagement, setShowSafeZoneManagement] = useState(false);
    const pendingCategories = getPendingCategories();
    const pendingCheckIns = checkInRequests.filter(req => req.status === 'pending');
    const handleRequestCheckIn = () => {
        Alert.alert('Request Check-in', 'Send a check-in request to your child?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Send Request',
                onPress: () => {
                    requestCheckIn('Please check in and let me know you are safe', false);
                    Alert.alert('Request Sent', 'Your child will receive a check-in request');
                }
            }
        ]);
    };
    const handleDevicePing = (type) => {
        const message = type === 'location' ? 'Parent requested your location' : 'Parent is pinging your device';
        sendDevicePing(type, message);
        Alert.alert('Ping Sent', `${type === 'location' ? 'Location request' : 'Device ping'} sent to child's device`);
    };
    const handleSendMessage = () => {
        Alert.prompt('Send Message', 'Enter a message to send to your child:', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Send',
                onPress: (message) => {
                    if (message && message.trim()) {
                        sendDevicePing('message', message.trim());
                        Alert.alert('Message Sent', 'Your message has been sent to your child');
                    }
                },
            },
        ], 'plain-text', '', 'default');
    };
    const handleApproveCategory = (categoryId) => {
        approveCategory(categoryId);
        Alert.alert('Category Approved', 'The category has been approved and is now available');
    };
    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };
    const formatDate = (timestamp) => {
        return new Date(timestamp).toLocaleDateString();
    };
    const TabButton = ({ id, title, icon }) => (_jsxs(Pressable, { style: [styles.tabButton, activeTab === id && styles.activeTab], onPress: () => setActiveTab(id), children: [icon, _jsx(Text, { style: [styles.tabText, activeTab === id && styles.activeTabText], children: title })] }));
    const renderOverview = () => (_jsxs(View, { style: styles.tabContent, children: [_jsxs(View, { style: styles.section, children: [_jsx(Text, { style: styles.sectionTitle, children: "Quick Actions" }), _jsxs(View, { style: styles.quickActionsGrid, children: [_jsxs(Pressable, { style: styles.quickActionButton, onPress: handleRequestCheckIn, children: [_jsx(CheckCircle, { size: 24, color: "#FFFFFF" }), _jsx(Text, { style: styles.quickActionText, children: "Request Check-in" })] }), _jsxs(Pressable, { style: styles.quickActionButton, onPress: () => handleDevicePing('location'), children: [_jsx(MapPin, { size: 24, color: "#FFFFFF" }), _jsx(Text, { style: styles.quickActionText, children: "Get Location" })] }), _jsxs(Pressable, { style: styles.quickActionButton, onPress: () => handleDevicePing('ring'), children: [_jsx(Phone, { size: 24, color: "#FFFFFF" }), _jsx(Text, { style: styles.quickActionText, children: "Ring Device" })] }), _jsxs(Pressable, { style: styles.quickActionButton, onPress: () => handleSendMessage(), children: [_jsx(MessageCircle, { size: 24, color: "#FFFFFF" }), _jsx(Text, { style: styles.quickActionText, children: "Send Message" })] })] })] }), (pendingCheckIns.length > 0 || pendingCategories.length > 0) && (_jsxs(View, { style: styles.section, children: [_jsx(Text, { style: styles.sectionTitle, children: "Alerts" }), pendingCheckIns.map(request => (_jsxs(View, { style: styles.alertCard, children: [_jsx(AlertTriangle, { size: 20, color: Colors.warning }), _jsxs(View, { style: styles.alertContent, children: [_jsx(Text, { style: styles.alertTitle, children: "Pending Check-in Request" }), _jsxs(Text, { style: styles.alertSubtitle, children: ["Sent ", formatTime(request.requestedAt), " - ", request.message] })] })] }, request.id))), pendingCategories.map(category => (_jsxs(View, { style: styles.alertCard, children: [_jsxs(View, { style: styles.alertContent, children: [_jsx(Text, { style: styles.alertTitle, children: "Category Approval Needed" }), _jsxs(Text, { style: styles.alertSubtitle, children: ["Child wants to add \"", category.name, "\" category"] })] }), _jsx(Pressable, { style: styles.approveButton, onPress: () => handleApproveCategory(category.id), children: _jsx(Text, { style: styles.approveButtonText, children: "Approve" }) })] }, category.id)))] })), dashboardData.lastKnownLocation && (_jsxs(View, { style: styles.section, children: [_jsx(Text, { style: styles.sectionTitle, children: "Last Known Location" }), _jsxs(View, { style: styles.locationCard, children: [_jsx(MapPin, { size: 20, color: Colors.primary }), _jsxs(View, { style: styles.locationContent, children: [_jsx(Text, { style: styles.locationTitle, children: dashboardData.lastKnownLocation.placeName || 'Unknown Location' }), _jsxs(Text, { style: styles.locationSubtitle, children: [formatTime(dashboardData.lastKnownLocation.timestamp), " on ", formatDate(dashboardData.lastKnownLocation.timestamp)] })] })] })] })), _jsxs(View, { style: styles.section, children: [_jsx(Text, { style: styles.sectionTitle, children: "Recent Check-ins" }), dashboardData.recentCheckIns.length === 0 ? (_jsx(Text, { style: styles.emptyText, children: "No recent check-ins" })) : (dashboardData.recentCheckIns.slice(0, 3).map(checkIn => (_jsxs(View, { style: styles.checkInCard, children: [_jsx(Camera, { size: 20, color: Colors.primary }), _jsxs(View, { style: styles.checkInContent, children: [_jsx(Text, { style: styles.checkInTitle, children: checkIn.placeName }), _jsxs(Text, { style: styles.checkInTime, children: [formatTime(checkIn.timestamp), " on ", formatDate(checkIn.timestamp)] })] }), checkIn.photoUrl && (_jsx(Image, { source: { uri: checkIn.photoUrl }, style: styles.checkInPhoto }))] }, checkIn.id))))] })] }));
    const renderCheckIns = () => (_jsx(View, { style: styles.tabContent, children: _jsxs(View, { style: styles.section, children: [_jsx(Text, { style: styles.sectionTitle, children: "All Check-ins" }), dashboardData.recentCheckIns.length === 0 ? (_jsx(Text, { style: styles.emptyText, children: "No check-ins yet" })) : (dashboardData.recentCheckIns.map(checkIn => (_jsxs(View, { style: styles.checkInCard, children: [_jsx(Camera, { size: 20, color: Colors.primary }), _jsxs(View, { style: styles.checkInContent, children: [_jsx(Text, { style: styles.checkInTitle, children: checkIn.placeName }), _jsxs(Text, { style: styles.checkInTime, children: [formatTime(checkIn.timestamp), " on ", formatDate(checkIn.timestamp)] }), checkIn.location && (_jsxs(Text, { style: styles.checkInLocation, children: [checkIn.location.latitude.toFixed(4), ", ", checkIn.location.longitude.toFixed(4)] }))] }), checkIn.photoUrl && (_jsx(Image, { source: { uri: checkIn.photoUrl }, style: styles.checkInPhoto }))] }, checkIn.id))))] }) }));
    const renderSafeZones = () => (_jsxs(ScrollView, { style: styles.safeZonesContent, showsVerticalScrollIndicator: false, children: [_jsx(SafeZoneStatusCard, {}), _jsxs(View, { style: styles.section, children: [_jsxs(View, { style: styles.sectionHeader, children: [_jsx(Text, { style: styles.sectionTitle, children: "Manage Safe Zones" }), _jsx(Pressable, { style: styles.addButton, onPress: () => setShowSafeZoneManagement(true), children: _jsx(Plus, { size: 20, color: Colors.primary }) })] }), safeZones.length === 0 ? (_jsxs(View, { style: styles.emptyStateCard, children: [_jsx(Shield, { size: 48, color: Colors.textLight }), _jsx(Text, { style: styles.emptyStateTitle, children: "No Safe Zones" }), _jsx(Text, { style: styles.emptyStateSubtitle, children: "Create safe zones to monitor when your child enters or leaves specific areas" }), _jsxs(Pressable, { style: styles.createButton, onPress: () => setShowSafeZoneManagement(true), children: [_jsx(Plus, { size: 16, color: "#FFFFFF" }), _jsx(Text, { style: styles.createButtonText, children: "Create Safe Zone" })] })] })) : (safeZones.map(zone => (_jsxs(View, { style: styles.safeZoneCard, children: [_jsx(Shield, { size: 20, color: zone.isActive ? Colors.success : Colors.textLight }), _jsxs(View, { style: styles.safeZoneContent, children: [_jsx(Text, { style: styles.safeZoneTitle, children: zone.name }), _jsxs(Text, { style: styles.safeZoneSubtitle, children: ["Radius: ", zone.radius, "m \u2022 ", zone.isActive ? 'Active' : 'Inactive'] }), _jsxs(Text, { style: styles.safeZoneNotifications, children: ["Alerts: ", zone.notifications.onEntry ? 'Entry' : '', zone.notifications.onEntry && zone.notifications.onExit ? ' & ' : '', zone.notifications.onExit ? 'Exit' : '', !zone.notifications.onEntry && !zone.notifications.onExit ? 'None' : ''] })] })] }, zone.id))))] }), _jsx(SafeZoneActivityLog, {})] }));
    const renderPings = () => (_jsx(DevicePingHistory, { testId: "device-ping-history" }));
    const renderSettings = () => (_jsx(View, { style: styles.tabContent, children: _jsxs(View, { style: styles.section, children: [_jsx(Text, { style: styles.sectionTitle, children: "Parental Settings" }), _jsxs(View, { style: styles.settingCard, children: [_jsx(Text, { style: styles.settingTitle, children: "Category Management" }), _jsxs(Text, { style: styles.settingSubtitle, children: ["Child can create categories: ", settings.allowChildCategoryCreation ? 'Yes' : 'No'] }), _jsxs(Text, { style: styles.settingSubtitle, children: ["Requires approval: ", settings.requireApprovalForCategories ? 'Yes' : 'No'] })] }), _jsxs(View, { style: styles.settingCard, children: [_jsx(Text, { style: styles.settingTitle, children: "Safety Settings" }), _jsxs(Text, { style: styles.settingSubtitle, children: ["Safe zone alerts: ", settings.safeZoneAlerts ? 'Enabled' : 'Disabled'] }), _jsxs(Text, { style: styles.settingSubtitle, children: ["Check-in reminders: ", settings.checkInReminders ? 'Enabled' : 'Disabled'] })] }), _jsxs(View, { style: styles.settingCard, children: [_jsx(Text, { style: styles.settingTitle, children: "Emergency Contacts" }), settings.emergencyContacts.map(contact => (_jsxs(Text, { style: styles.settingSubtitle, children: [contact.name, " (", contact.relationship, ") - ", contact.phone, contact.isPrimary && ' • Primary'] }, contact.id)))] })] }) }));
    if (showSafeZoneManagement) {
        return (_jsx(SafeZoneManagement, { onBack: () => setShowSafeZoneManagement(false) }));
    }
    return (_jsxs(View, { style: styles.container, children: [_jsxs(View, { style: styles.header, children: [_jsxs(View, { style: styles.headerLeft, children: [_jsx(Shield, { size: 24, color: Colors.primary }), _jsx(Text, { style: styles.headerTitle, children: "Parent Dashboard" })] }), _jsx(Pressable, { style: styles.exitButton, onPress: onExit, children: _jsx(LogOut, { size: 20, color: Colors.textLight }) })] }), _jsxs(View, { style: styles.tabs, children: [_jsx(TabButton, { id: "overview", title: "Overview", icon: _jsx(Eye, { size: 16, color: activeTab === 'overview' ? '#FFFFFF' : Colors.textLight }) }), _jsx(TabButton, { id: "checkins", title: "Check-ins", icon: _jsx(Camera, { size: 16, color: activeTab === 'checkins' ? '#FFFFFF' : Colors.textLight }) }), _jsx(TabButton, { id: "safezones", title: "Safe Zones", icon: _jsx(Shield, { size: 16, color: activeTab === 'safezones' ? '#FFFFFF' : Colors.textLight }) }), _jsx(TabButton, { id: "pings", title: "Device Pings", icon: _jsx(Phone, { size: 16, color: activeTab === 'pings' ? '#FFFFFF' : Colors.textLight }) }), _jsx(TabButton, { id: "settings", title: "Settings", icon: _jsx(Settings, { size: 16, color: activeTab === 'settings' ? '#FFFFFF' : Colors.textLight }) })] }), activeTab === 'safezones' ? (renderSafeZones()) : activeTab === 'pings' ? (renderPings()) : (_jsxs(ScrollView, { style: styles.content, showsVerticalScrollIndicator: false, children: [activeTab === 'overview' && renderOverview(), activeTab === 'checkins' && renderCheckIns(), activeTab === 'settings' && renderSettings()] }))] }));
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
    exitButton: {
        padding: 8,
    },
    tabs: {
        flexDirection: 'row',
        backgroundColor: Colors.card,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    tabButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        gap: 2,
    },
    activeTab: {
        backgroundColor: Colors.primary,
    },
    tabText: {
        fontSize: 10,
        fontWeight: '600',
        color: Colors.textLight,
    },
    activeTabText: {
        color: '#FFFFFF',
    },
    content: {
        flex: 1,
    },
    tabContent: {
        padding: 16,
    },
    section: {
        marginBottom: 24,
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
    addButton: {
        padding: 8,
    },
    quickActionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    quickActionButton: {
        width: '48%',
        backgroundColor: Colors.primary,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        gap: 8,
    },
    quickActionText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
    },
    alertCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF9E6',
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
        gap: 12,
    },
    alertContent: {
        flex: 1,
    },
    alertTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 4,
    },
    alertSubtitle: {
        fontSize: 12,
        color: Colors.textLight,
    },
    approveButton: {
        backgroundColor: Colors.success,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    approveButtonText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },
    locationCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.card,
        borderRadius: 12,
        padding: 16,
        gap: 12,
    },
    locationContent: {
        flex: 1,
    },
    locationTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 4,
    },
    locationSubtitle: {
        fontSize: 14,
        color: Colors.textLight,
    },
    checkInCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.card,
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
        gap: 12,
    },
    checkInContent: {
        flex: 1,
    },
    checkInTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 4,
    },
    checkInTime: {
        fontSize: 14,
        color: Colors.textLight,
        marginBottom: 2,
    },
    checkInLocation: {
        fontSize: 12,
        color: Colors.textLight,
    },
    checkInPhoto: {
        width: 50,
        height: 50,
        borderRadius: 8,
    },
    safeZoneCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.card,
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
        gap: 12,
    },
    safeZoneContent: {
        flex: 1,
    },
    safeZoneTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 4,
    },
    safeZoneSubtitle: {
        fontSize: 14,
        color: Colors.textLight,
    },
    activityCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.card,
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
        gap: 12,
    },
    activityIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    activityContent: {
        flex: 1,
    },
    activityTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 4,
    },
    activityTime: {
        fontSize: 12,
        color: Colors.textLight,
    },
    settingCard: {
        backgroundColor: Colors.card,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 8,
    },
    settingSubtitle: {
        fontSize: 14,
        color: Colors.textLight,
        marginBottom: 4,
    },
    emptyText: {
        fontSize: 14,
        color: Colors.textLight,
        textAlign: 'center',
        fontStyle: 'italic',
        paddingVertical: 20,
    },
    safeZonesContent: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    emptyStateCard: {
        backgroundColor: Colors.card,
        borderRadius: 16,
        padding: 32,
        alignItems: 'center',
        marginHorizontal: 20,
    },
    emptyStateTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.text,
        marginTop: 16,
        marginBottom: 8,
    },
    emptyStateSubtitle: {
        fontSize: 14,
        color: Colors.textLight,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },
    createButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primary,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        gap: 8,
    },
    createButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    safeZoneNotifications: {
        fontSize: 12,
        color: Colors.textLight,
        marginTop: 2,
    },
});
export default ParentDashboard;
