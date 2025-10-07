import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Pressable, Platform } from 'react-native';
import { AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
const SystemHealthMonitor = ({ testId }) => {
    const [healthChecks, setHealthChecks] = useState([]);
    const [isRunningChecks, setIsRunningChecks] = useState(false);
    const { isConnected } = useNetworkStatus();
    const runHealthChecks = async () => {
        setIsRunningChecks(true);
        const checks = [];
        const now = Date.now();
        // Network connectivity check
        checks.push({
            id: 'network',
            name: 'Network Connection',
            status: isConnected ? 'healthy' : 'error',
            message: isConnected ? 'Connected to internet' : 'No internet connection',
            lastChecked: now,
        });
        // Platform compatibility check
        const platformStatus = Platform.OS === 'web' ? 'warning' : 'healthy';
        checks.push({
            id: 'platform',
            name: 'Platform Compatibility',
            status: platformStatus,
            message: Platform.OS === 'web'
                ? 'Running on web - some features limited'
                : `Running on ${Platform.OS} - full features available`,
            lastChecked: now,
        });
        // Storage availability check
        try {
            if (Platform.OS !== 'web') {
                const AsyncStorage = require('@react-native-async-storage/async-storage').default;
                await AsyncStorage.setItem('health_check', 'test');
                await AsyncStorage.removeItem('health_check');
                checks.push({
                    id: 'storage',
                    name: 'Local Storage',
                    status: 'healthy',
                    message: 'AsyncStorage working normally',
                    lastChecked: now,
                });
            }
            else {
                localStorage.setItem('health_check', 'test');
                localStorage.removeItem('health_check');
                checks.push({
                    id: 'storage',
                    name: 'Local Storage',
                    status: 'healthy',
                    message: 'LocalStorage working normally',
                    lastChecked: now,
                });
            }
        }
        catch (error) {
            checks.push({
                id: 'storage',
                name: 'Local Storage',
                status: 'error',
                message: 'Storage access failed',
                lastChecked: now,
            });
        }
        // Location services check
        try {
            if (Platform.OS !== 'web') {
                const Location = require('expo-location');
                const { status } = await Location.getForegroundPermissionsAsync();
                checks.push({
                    id: 'location',
                    name: 'Location Services',
                    status: status === 'granted' ? 'healthy' : 'warning',
                    message: status === 'granted'
                        ? 'Location permissions granted'
                        : 'Location permissions needed for full functionality',
                    lastChecked: now,
                });
            }
            else {
                const hasGeolocation = 'geolocation' in navigator;
                checks.push({
                    id: 'location',
                    name: 'Location Services',
                    status: hasGeolocation ? 'healthy' : 'error',
                    message: hasGeolocation
                        ? 'Geolocation API available'
                        : 'Geolocation not supported',
                    lastChecked: now,
                });
            }
        }
        catch (error) {
            checks.push({
                id: 'location',
                name: 'Location Services',
                status: 'error',
                message: 'Location services check failed',
                lastChecked: now,
            });
        }
        // Memory usage check (basic)
        const memoryStatus = Platform.OS === 'web' && performance.memory
            ? (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) > 0.8
                ? 'warning'
                : 'healthy'
            : 'healthy';
        checks.push({
            id: 'memory',
            name: 'Memory Usage',
            status: memoryStatus,
            message: memoryStatus === 'warning'
                ? 'High memory usage detected'
                : 'Memory usage normal',
            lastChecked: now,
        });
        setHealthChecks(checks);
        setIsRunningChecks(false);
    };
    useEffect(() => {
        runHealthChecks();
        // Run health checks every 5 minutes
        const interval = setInterval(runHealthChecks, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [isConnected]);
    const getOverallStatus = () => {
        if (healthChecks.some(check => check.status === 'error'))
            return 'error';
        if (healthChecks.some(check => check.status === 'warning'))
            return 'warning';
        return 'healthy';
    };
    const getStatusIcon = (status) => {
        switch (status) {
            case 'healthy':
                return _jsx(CheckCircle, { size: 16, color: Colors.success });
            case 'warning':
                return _jsx(AlertTriangle, { size: 16, color: Colors.warning });
            case 'error':
                return _jsx(AlertTriangle, { size: 16, color: Colors.error });
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'healthy':
                return Colors.success;
            case 'warning':
                return Colors.warning;
            case 'error':
                return Colors.error;
        }
    };
    const overallStatus = getOverallStatus();
    const errorCount = healthChecks.filter(check => check.status === 'error').length;
    const warningCount = healthChecks.filter(check => check.status === 'warning').length;
    return (_jsxs(View, { style: styles.container, testID: testId, children: [_jsxs(View, { style: styles.header, children: [_jsxs(View, { style: styles.statusIndicator, children: [getStatusIcon(overallStatus), _jsxs(Text, { style: [styles.statusText, { color: getStatusColor(overallStatus) }], children: ["System ", overallStatus === 'healthy' ? 'Healthy' : overallStatus === 'warning' ? 'Issues Detected' : 'Errors Found'] })] }), _jsx(Pressable, { style: [styles.refreshButton, isRunningChecks && styles.refreshButtonDisabled], onPress: runHealthChecks, disabled: isRunningChecks, children: _jsx(RefreshCw, { size: 16, color: isRunningChecks ? Colors.textLight : Colors.primary, style: isRunningChecks ? styles.spinning : undefined }) })] }), (errorCount > 0 || warningCount > 0) && (_jsxs(View, { style: styles.summary, children: [errorCount > 0 && (_jsxs(Text, { style: styles.errorSummary, children: [errorCount, " error", errorCount > 1 ? 's' : '', " found"] })), warningCount > 0 && (_jsxs(Text, { style: styles.warningSummary, children: [warningCount, " warning", warningCount > 1 ? 's' : '', " found"] }))] })), _jsx(View, { style: styles.checksList, children: healthChecks.map((check) => (_jsxs(View, { style: styles.checkItem, children: [_jsxs(View, { style: styles.checkHeader, children: [getStatusIcon(check.status), _jsx(Text, { style: styles.checkName, children: check.name })] }), _jsx(Text, { style: styles.checkMessage, children: check.message }), _jsxs(Text, { style: styles.checkTime, children: ["Last checked: ", new Date(check.lastChecked).toLocaleTimeString()] })] }, check.id))) }), overallStatus === 'error' && (_jsxs(View, { style: styles.actionSection, children: [_jsx(Text, { style: styles.actionTitle, children: "Recommended Actions:" }), _jsxs(Text, { style: styles.actionText, children: ["\u2022 Check your internet connection", '\n', "\u2022 Restart the app if issues persist", '\n', "\u2022 Contact support if problems continue"] })] }))] }));
};
const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.card,
        borderRadius: 12,
        padding: 16,
        marginVertical: 8,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    statusIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statusText: {
        fontSize: 16,
        fontWeight: '600',
    },
    refreshButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: Colors.androidRipple,
    },
    refreshButtonDisabled: {
        opacity: 0.5,
    },
    spinning: {
    // Note: CSS animation would be needed for web, this is just a placeholder
    },
    summary: {
        marginBottom: 12,
        padding: 8,
        backgroundColor: Colors.androidRipple,
        borderRadius: 8,
    },
    errorSummary: {
        color: Colors.error,
        fontSize: 14,
        fontWeight: '500',
    },
    warningSummary: {
        color: Colors.warning,
        fontSize: 14,
        fontWeight: '500',
    },
    checksList: {
        gap: 8,
    },
    checkItem: {
        padding: 12,
        backgroundColor: Colors.androidRipple,
        borderRadius: 8,
    },
    checkHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    checkName: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text,
    },
    checkMessage: {
        fontSize: 13,
        color: Colors.textLight,
        marginBottom: 4,
    },
    checkTime: {
        fontSize: 11,
        color: Colors.textLight,
    },
    actionSection: {
        marginTop: 12,
        padding: 12,
        backgroundColor: Colors.error + '10',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.error + '30',
    },
    actionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.error,
        marginBottom: 8,
    },
    actionText: {
        fontSize: 13,
        color: Colors.textLight,
        lineHeight: 18,
    },
});
export default SystemHealthMonitor;
