import { jsx as _jsx } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import SmartNotification from './SmartNotification';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { addInAppBannerListener } from '@/utils/notifications';
const InAppNotificationHost = ({ testId }) => {
    const [notifications, setNotifications] = useState([]);
    const insets = useSafeAreaInsets();
    // Initialize with sample notifications
    useEffect(() => {
        const sampleNotifications = [
            {
                id: 'weather-1',
                title: 'Weather Alert',
                message: 'Rain expected in 30 minutes. Consider taking an umbrella or finding covered routes.',
                type: 'weather',
                actionText: 'View Covered Routes',
                priority: 'normal',
            },
            {
                id: 'safety-1',
                title: 'Safety Reminder',
                message: 'You\'re approaching a busy intersection. Stay alert and follow traffic signals.',
                type: 'safety',
                actionText: 'Got it',
                priority: 'high',
            },
            {
                id: 'achievement-1',
                title: 'Achievement Unlocked!',
                message: 'Congratulations! You\'ve completed 10 safe journeys this week.',
                type: 'achievement',
                actionText: 'View Achievements',
                priority: 'normal',
            },
            {
                id: 'reminder-1',
                title: 'Journey Reminder',
                message: 'Don\'t forget your appointment at 3 PM. Leave in 15 minutes for on-time arrival.',
                type: 'reminder',
                actionText: 'Schedule Notification',
                scheduledFor: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes from now
                priority: 'normal',
            },
        ];
        const timer = setTimeout(() => {
            setNotifications(sampleNotifications);
        }, 2000); // Show after 2 seconds
        return () => clearTimeout(timer);
    }, []);
    // Listen for legacy banner notifications
    useEffect(() => {
        const unsub = addInAppBannerListener((banner) => {
            const notification = {
                id: banner.id,
                title: banner.title,
                message: banner.message,
                type: banner.type,
                priority: 'normal',
            };
            setNotifications(prev => [notification, ...prev].slice(0, 3));
        });
        return unsub;
    }, []);
    // Listen for incoming notifications (native only)
    useEffect(() => {
        if (Platform.OS === 'web')
            return;
        const subscription = Notifications.addNotificationReceivedListener(notification => {
            const { title, body, data } = notification.request.content;
            const newNotification = {
                id: notification.request.identifier,
                title: title || 'Notification',
                message: body || '',
                type: data?.type || 'reminder',
                actionText: data?.actionText ?? undefined,
                actionData: data?.actionData ?? undefined,
                priority: data?.priority || 'normal',
            };
            setNotifications(prev => [newNotification, ...prev].slice(0, 3));
        });
        return () => subscription.remove();
    }, []);
    // Auto-dismiss notifications after 10 seconds
    useEffect(() => {
        if (notifications.length === 0)
            return;
        const timer = setTimeout(() => {
            setNotifications(prev => prev.slice(0, -1)); // Remove oldest notification
        }, 10000);
        return () => clearTimeout(timer);
    }, [notifications]);
    const handleDismiss = useCallback((id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);
    const handleAction = useCallback((notification) => {
        console.log('Notification action:', notification);
        // Handle different notification actions here
        switch (notification.type) {
            case 'weather':
                // Navigate to weather or covered routes
                break;
            case 'safety':
                // Acknowledge safety alert
                handleDismiss(notification.id);
                break;
            case 'achievement':
                // Navigate to achievements screen
                break;
            case 'reminder':
                // Handle reminder action
                break;
        }
    }, [handleDismiss]);
    if (notifications.length === 0) {
        return null;
    }
    return (_jsx(View, { style: [styles.container, { paddingTop: insets.top }], testID: testId ?? 'notification-host', pointerEvents: "box-none", children: notifications.slice(0, 3).map((notification) => ( // Show max 3 notifications
        _jsx(SmartNotification, { notification: notification, onDismiss: handleDismiss, onAction: handleAction, isInApp: true }, notification.id))) }));
};
const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        pointerEvents: 'box-none',
    },
});
export default InAppNotificationHost;
