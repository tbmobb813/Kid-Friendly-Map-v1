import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { StyleSheet, Text, View, Pressable, Platform, Alert } from "react-native";
import Colors from "@/constants/colors";
import { Clock, X, MapPin, Bell, Shield, Trophy } from "lucide-react-native";
import * as Notifications from "expo-notifications";
import { useToast } from "@/hooks/useToast";
// Configure notification behavior
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        // Include web/modern fields required by NotificationBehavior
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});
const SmartNotification = ({ notification, onDismiss, onAction, isInApp = true }) => {
    const { showToast } = useToast();
    const [isScheduling, setIsScheduling] = useState(false);
    const { id, title, message, type, actionText, scheduledFor, priority = 'normal' } = notification;
    const getIcon = () => {
        switch (type) {
            case "reminder": return _jsx(Clock, { size: 20, color: Colors.primary });
            case "weather": return _jsx(MapPin, { size: 20, color: Colors.warning });
            case "safety": return _jsx(Shield, { size: 20, color: Colors.error });
            case "achievement": return _jsx(Trophy, { size: 20, color: Colors.secondary });
        }
    };
    const scheduleNotification = async () => {
        if (Platform.OS === 'web') {
            // Web notifications fallback
            if ('Notification' in window) {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    new Notification(title, {
                        body: message,
                        icon: '/favicon.png',
                        tag: id,
                    });
                    showToast('Notification scheduled', 'success');
                }
                else {
                    showToast('Notification permission denied', 'warning');
                }
            }
            else {
                showToast('Notifications not supported in this browser', 'warning');
            }
            return;
        }
        if (__DEV__) {
            // Expo Go limitations
            Alert.alert('Notification Scheduled', `In a development build, this would schedule: "${title}"`, [{ text: 'OK' }]);
            showToast('Notification scheduled (dev mode)', 'success');
            return;
        }
        try {
            setIsScheduling(true);
            // Request permissions
            const { status } = await Notifications.requestPermissionsAsync();
            if (status !== 'granted') {
                showToast('Notification permission denied', 'warning');
                return;
            }
            // Schedule notification
            const notificationId = await Notifications.scheduleNotificationAsync({
                content: {
                    title,
                    body: message,
                    data: { type, id, actionData: notification.actionData },
                    // Android priority enum is typed in expo; cast to any to be safe
                    priority: (priority === 'high' ? Notifications.AndroidNotificationPriority.HIGH :
                        priority === 'low' ? Notifications.AndroidNotificationPriority.LOW :
                            Notifications.AndroidNotificationPriority.DEFAULT),
                },
                trigger: scheduledFor ? { type: 'date', date: scheduledFor } : null,
            });
            showToast('Notification scheduled successfully', 'success');
            console.log('Scheduled notification:', notificationId);
        }
        catch (error) {
            console.error('Failed to schedule notification:', error);
            showToast('Failed to schedule notification', 'error');
        }
        finally {
            setIsScheduling(false);
        }
    };
    const handleAction = () => {
        if (actionText === 'Schedule Notification') {
            scheduleNotification();
        }
        else {
            onAction?.(notification);
        }
    };
    const handleDismiss = () => {
        onDismiss(id);
    };
    const getBackgroundColor = () => {
        switch (type) {
            case "reminder": return "#F0F4FF";
            case "weather": return "#FFF9E6";
            case "safety": return "#FFE6E6";
            case "achievement": return "#F0FFF4";
        }
    };
    const getBorderColor = () => {
        switch (type) {
            case "reminder": return Colors.primary;
            case "weather": return Colors.warning;
            case "safety": return Colors.error;
            case "achievement": return Colors.secondary;
        }
    };
    return (_jsx(View, { style: [
            styles.container,
            {
                backgroundColor: getBackgroundColor(),
                borderLeftColor: getBorderColor()
            }
        ], children: _jsxs(View, { style: styles.content, children: [_jsxs(View, { style: styles.header, children: [getIcon(), _jsx(Text, { style: styles.title, children: title }), _jsx(Pressable, { style: styles.dismissButton, onPress: handleDismiss, children: _jsx(X, { size: 16, color: Colors.textLight }) })] }), _jsx(Text, { style: styles.message, children: message }), actionText && (_jsxs(Pressable, { style: [styles.actionButton, isScheduling && styles.actionButtonDisabled], onPress: handleAction, disabled: isScheduling, children: [actionText === 'Schedule Notification' && _jsx(Bell, { size: 14, color: Colors.primary }), _jsx(Text, { style: styles.actionText, children: isScheduling ? 'Scheduling...' : actionText })] })), scheduledFor && (_jsxs(View, { style: styles.scheduleInfo, children: [_jsx(Clock, { size: 12, color: Colors.textLight }), _jsxs(Text, { style: styles.scheduleText, children: ["Scheduled for ", scheduledFor.toLocaleString()] })] })), priority === 'high' && (_jsx(View, { style: styles.priorityBadge, children: _jsx(Text, { style: styles.priorityText, children: "HIGH PRIORITY" }) }))] }) }));
};
const styles = StyleSheet.create({
    container: {
        borderRadius: 12,
        marginHorizontal: 16,
        marginTop: 8,
        borderLeftWidth: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    content: {
        padding: 16,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    title: {
        flex: 1,
        fontSize: 16,
        fontWeight: "600",
        color: Colors.text,
        marginLeft: 8,
    },
    dismissButton: {
        padding: 4,
    },
    message: {
        fontSize: 14,
        color: Colors.text,
        lineHeight: 20,
        marginBottom: 12,
    },
    actionButton: {
        backgroundColor: Colors.primary,
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 16,
        alignSelf: "flex-start",
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    actionButtonDisabled: {
        backgroundColor: Colors.textLight,
        opacity: 0.6,
    },
    actionText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "600",
    },
    scheduleInfo: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 8,
        gap: 4,
    },
    scheduleText: {
        fontSize: 12,
        color: Colors.textLight,
        fontStyle: "italic",
    },
    priorityBadge: {
        backgroundColor: Colors.error,
        borderRadius: 4,
        paddingHorizontal: 8,
        paddingVertical: 2,
        alignSelf: "flex-start",
        marginTop: 8,
    },
    priorityText: {
        color: "#FFFFFF",
        fontSize: 10,
        fontWeight: "700",
    },
});
export default SmartNotification;
