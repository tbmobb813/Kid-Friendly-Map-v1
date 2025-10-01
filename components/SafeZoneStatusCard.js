import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Shield, MapPin, Clock, AlertTriangle } from 'lucide-react-native';
import { useSafeZoneMonitor } from '@/hooks/useSafeZoneMonitor';
import { useParentalStore } from '@/stores/parentalStore';
export const SafeZoneStatusCard = () => {
    const { isMonitoring, getCurrentSafeZoneStatus, startMonitoring, stopMonitoring } = useSafeZoneMonitor();
    const { settings, safeZones } = useParentalStore();
    const status = getCurrentSafeZoneStatus();
    const activeSafeZones = safeZones.filter(zone => zone.isActive);
    if (!settings.safeZoneAlerts || activeSafeZones.length === 0) {
        return (_jsxs(View, { style: styles.card, children: [_jsxs(View, { style: styles.header, children: [_jsx(Shield, { size: 24, color: "#9CA3AF" }), _jsx(Text, { style: styles.title, children: "Safe Zones" })] }), _jsx(Text, { style: styles.subtitle, children: activeSafeZones.length === 0
                        ? 'No safe zones configured'
                        : 'Safe zone alerts are disabled' })] }));
    }
    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    return (_jsxs(View, { style: styles.card, children: [_jsxs(View, { style: styles.header, children: [_jsx(Shield, { size: 24, color: isMonitoring ? '#10B981' : '#F59E0B' }), _jsx(Text, { style: styles.title, children: "Safe Zone Status" }), _jsx(View, { style: [
                            styles.statusBadge,
                            { backgroundColor: isMonitoring ? '#10B981' : '#F59E0B' }
                        ], children: _jsx(Text, { style: styles.statusText, children: isMonitoring ? 'Active' : 'Inactive' }) })] }), status && (_jsxs(View, { style: styles.content, children: [_jsxs(View, { style: styles.locationInfo, children: [_jsx(MapPin, { size: 16, color: "#6B7280" }), _jsx(Text, { style: styles.locationText, children: "Current location tracked" }), _jsx(Clock, { size: 16, color: "#6B7280" }), _jsx(Text, { style: styles.timeText, children: formatTime(status.currentLocation.timestamp) })] }), _jsxs(View, { style: styles.zoneStats, children: [_jsxs(View, { style: styles.statItem, children: [_jsx(Text, { style: styles.statNumber, children: status.inside.length }), _jsx(Text, { style: styles.statLabel, children: "Inside Safe Zones" })] }), _jsxs(View, { style: styles.statItem, children: [_jsx(Text, { style: styles.statNumber, children: status.outside.length }), _jsx(Text, { style: styles.statLabel, children: "Outside Safe Zones" })] }), _jsxs(View, { style: styles.statItem, children: [_jsx(Text, { style: styles.statNumber, children: status.totalActive }), _jsx(Text, { style: styles.statLabel, children: "Total Active" })] })] }), status.inside.length > 0 && (_jsxs(View, { style: styles.insideZones, children: [_jsx(Text, { style: styles.sectionTitle, children: "Currently Inside:" }), status.inside.map(zone => (_jsxs(View, { style: styles.zoneItem, children: [_jsx(View, { style: [styles.zoneDot, { backgroundColor: '#10B981' }] }), _jsx(Text, { style: styles.zoneName, children: zone.name })] }, zone.id)))] })), status.outside.length > 0 && status.inside.length === 0 && (_jsxs(View, { style: styles.outsideWarning, children: [_jsx(AlertTriangle, { size: 16, color: "#F59E0B" }), _jsx(Text, { style: styles.warningText, children: "Not currently in any safe zone" })] }))] })), _jsx(View, { style: styles.controls, children: _jsx(TouchableOpacity, { style: [
                        styles.controlButton,
                        { backgroundColor: isMonitoring ? '#EF4444' : '#10B981' }
                    ], onPress: isMonitoring ? stopMonitoring : startMonitoring, children: _jsx(Text, { style: styles.controlButtonText, children: isMonitoring ? 'Stop Monitoring' : 'Start Monitoring' }) }) })] }));
};
const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginHorizontal: 20,
        marginVertical: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
        marginLeft: 12,
        flex: 1,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginTop: 8,
    },
    content: {
        marginBottom: 16,
    },
    locationInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        padding: 12,
        backgroundColor: '#F9FAFB',
        borderRadius: 8,
    },
    locationText: {
        fontSize: 14,
        color: '#374151',
        marginLeft: 8,
        flex: 1,
    },
    timeText: {
        fontSize: 12,
        color: '#6B7280',
        marginLeft: 4,
    },
    zoneStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 16,
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1F2937',
    },
    statLabel: {
        fontSize: 12,
        color: '#6B7280',
        textAlign: 'center',
        marginTop: 4,
    },
    insideZones: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    zoneItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
    },
    zoneDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    zoneName: {
        fontSize: 14,
        color: '#374151',
    },
    outsideWarning: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#FEF3C7',
        borderRadius: 8,
        marginBottom: 16,
    },
    warningText: {
        fontSize: 14,
        color: '#92400E',
        marginLeft: 8,
    },
    controls: {
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingTop: 16,
    },
    controlButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
    },
    controlButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
