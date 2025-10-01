import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { StyleSheet, Text, View, Pressable, Platform } from 'react-native';
import { Bell, AlertTriangle, ExternalLink, CheckCircle } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { showDevelopmentBuildRecommendation, requestNotificationPermission } from '@/utils/notifications';
const NotificationStatusCard = ({ testId }) => {
    const isExpoGo = __DEV__ && Platform.OS !== 'web';
    const isWeb = Platform.OS === 'web';
    const getStatusInfo = () => {
        if (isWeb) {
            return {
                icon: _jsx(Bell, { size: 20, color: Colors.primary }),
                title: 'Web Notifications',
                description: 'Browser permissions control notification delivery',
                status: 'good',
                showAction: true,
                actionText: 'Enable Notifications',
            };
        }
        if (isExpoGo) {
            return {
                icon: _jsx(AlertTriangle, { size: 20, color: Colors.warning }),
                title: 'Limited Notifications',
                description: 'Running in Expo Go - using alerts and in-app banners',
                status: 'warning',
                showAction: true,
                actionText: 'Why Limited?',
            };
        }
        return {
            icon: _jsx(CheckCircle, { size: 20, color: Colors.success }),
            title: 'Full Notifications Available',
            description: 'Push and scheduled notifications are supported',
            status: 'good',
            showAction: true,
            actionText: 'Request Permission',
        };
    };
    const statusInfo = getStatusInfo();
    const handleAction = async () => {
        if (isExpoGo) {
            showDevelopmentBuildRecommendation();
            return;
        }
        await requestNotificationPermission();
    };
    return (_jsxs(View, { style: [styles.card, styles[statusInfo.status]], testID: testId, children: [_jsxs(View, { style: styles.header, children: [_jsx(View, { style: styles.iconContainer, children: statusInfo.icon }), _jsxs(View, { style: styles.content, children: [_jsx(Text, { style: styles.title, children: statusInfo.title }), _jsx(Text, { style: styles.description, children: statusInfo.description })] })] }), statusInfo.showAction && (_jsxs(Pressable, { style: styles.actionButton, onPress: handleAction, children: [_jsx(ExternalLink, { size: 16, color: Colors.primary }), _jsx(Text, { style: styles.actionText, children: statusInfo.actionText })] })), isExpoGo && (_jsx(View, { style: styles.infoBox, children: _jsx(Text, { style: styles.infoText, children: "\uD83D\uDCA1 Use a development build for full notification support" }) }))] }));
};
const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.card,
        borderRadius: 12,
        padding: 16,
        marginVertical: 8,
        borderWidth: 1,
    },
    good: {
        borderColor: Colors.success + '30',
        backgroundColor: Colors.success + '10',
    },
    warning: {
        borderColor: Colors.warning + '30',
        backgroundColor: Colors.warning + '10',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.androidRipple,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 4,
    },
    description: {
        fontSize: 14,
        color: Colors.textLight,
        lineHeight: 20,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: Colors.androidRipple,
        borderRadius: 8,
        marginTop: 8,
        gap: 8,
    },
    actionText: {
        fontSize: 14,
        color: Colors.primary,
        fontWeight: '500',
    },
    infoBox: {
        backgroundColor: Colors.androidRipple,
        borderRadius: 8,
        padding: 12,
        marginTop: 12,
    },
    infoText: {
        fontSize: 12,
        color: Colors.textLight,
        lineHeight: 16,
    },
});
export default NotificationStatusCard;
