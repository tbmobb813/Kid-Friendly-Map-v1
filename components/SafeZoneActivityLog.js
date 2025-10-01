import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Activity, ArrowRight, ArrowLeft, Clock } from 'lucide-react-native';
import { useParentalStore } from '@/stores/parentalStore';
export const SafeZoneActivityLog = () => {
    const { dashboardData } = useParentalStore();
    const { safeZoneActivity } = dashboardData;
    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
        if (diffInHours < 1) {
            const diffInMinutes = Math.floor(diffInHours * 60);
            return `${diffInMinutes}m ago`;
        }
        else if (diffInHours < 24) {
            return `${Math.floor(diffInHours)}h ago`;
        }
        else {
            return date.toLocaleDateString([], {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    };
    const getActivityIcon = (type) => {
        return type === 'entry'
            ? _jsx(ArrowRight, { size: 16, color: "#10B981" })
            : _jsx(ArrowLeft, { size: 16, color: "#EF4444" });
    };
    const getActivityColor = (type) => {
        return type === 'entry' ? '#10B981' : '#EF4444';
    };
    if (safeZoneActivity.length === 0) {
        return (_jsxs(View, { style: styles.card, children: [_jsxs(View, { style: styles.header, children: [_jsx(Activity, { size: 24, color: "#6B7280" }), _jsx(Text, { style: styles.title, children: "Safe Zone Activity" })] }), _jsxs(View, { style: styles.emptyState, children: [_jsx(Clock, { size: 48, color: "#D1D5DB" }), _jsx(Text, { style: styles.emptyText, children: "No recent activity" }), _jsx(Text, { style: styles.emptySubtext, children: "Safe zone entries and exits will appear here" })] })] }));
    }
    return (_jsxs(View, { style: styles.card, children: [_jsxs(View, { style: styles.header, children: [_jsx(Activity, { size: 24, color: "#6366F1" }), _jsx(Text, { style: styles.title, children: "Safe Zone Activity" }), _jsx(Text, { style: styles.count, children: safeZoneActivity.length })] }), _jsx(ScrollView, { style: styles.activityList, showsVerticalScrollIndicator: false, children: safeZoneActivity.map((activity, index) => (_jsxs(View, { style: styles.activityItem, children: [_jsx(View, { style: styles.activityIcon, children: getActivityIcon(activity.type) }), _jsxs(View, { style: styles.activityContent, children: [_jsxs(View, { style: styles.activityHeader, children: [_jsx(Text, { style: styles.activityType, children: activity.type === 'entry' ? 'Entered' : 'Left' }), _jsx(Text, { style: styles.activityTime, children: formatTime(activity.timestamp) })] }), _jsx(Text, { style: styles.safeZoneName, children: activity.safeZoneName })] }), _jsx(View, { style: [
                                styles.statusDot,
                                { backgroundColor: getActivityColor(activity.type) }
                            ] }), index < safeZoneActivity.length - 1 && (_jsx(View, { style: styles.connector }))] }, activity.id))) }), safeZoneActivity.length >= 10 && (_jsx(View, { style: styles.footer, children: _jsxs(Text, { style: styles.footerText, children: ["Showing last ", safeZoneActivity.length, " activities"] }) }))] }));
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
        maxHeight: 400,
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
    count: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6366F1',
        backgroundColor: '#EEF2FF',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6B7280',
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#9CA3AF',
        textAlign: 'center',
        marginTop: 8,
    },
    activityList: {
        flex: 1,
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 12,
        position: 'relative',
    },
    activityIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F9FAFB',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        zIndex: 2,
    },
    activityContent: {
        flex: 1,
    },
    activityHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    activityType: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    activityTime: {
        fontSize: 12,
        color: '#6B7280',
    },
    safeZoneName: {
        fontSize: 14,
        color: '#6B7280',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginLeft: 8,
        marginTop: 4,
    },
    connector: {
        position: 'absolute',
        left: 15,
        top: 44,
        bottom: -12,
        width: 2,
        backgroundColor: '#E5E7EB',
        zIndex: 1,
    },
    footer: {
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingTop: 12,
        marginTop: 8,
    },
    footerText: {
        fontSize: 12,
        color: '#6B7280',
        textAlign: 'center',
    },
});
