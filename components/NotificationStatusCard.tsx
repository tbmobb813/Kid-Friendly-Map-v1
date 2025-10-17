import React from 'react';
import { StyleSheet, Text, View, Pressable, Platform } from 'react-native';
import { Bell, AlertTriangle, ExternalLink, CheckCircle } from 'lucide-react-native';
import Colors from '@/constants/colors';
import {
  showDevelopmentBuildRecommendation,
  requestNotificationPermission,
} from '@/utils/notifications';

type NotificationStatusCardProps = {
  testId?: string;
};

const NotificationStatusCard: React.FC<NotificationStatusCardProps> = ({ testId }) => {
  const isExpoGo = __DEV__ && Platform.OS !== 'web';
  const isWeb = Platform.OS === 'web';

  const getStatusInfo = () => {
    if (isWeb) {
      return {
        icon: <Bell size={20} color={Colors.primary} />,
        title: 'Web Notifications',
        description: 'Browser permissions control notification delivery',
        status: 'good' as const,
        showAction: true,
        actionText: 'Enable Notifications',
      };
    }

    if (isExpoGo) {
      return {
        icon: <AlertTriangle size={20} color={Colors.warning} />,
        title: 'Limited Notifications',
        description: 'Running in Expo Go - using alerts and in-app banners',
        status: 'warning' as const,
        showAction: true,
        actionText: 'Why Limited?',
      };
    }

    return {
      icon: <CheckCircle size={20} color={Colors.success} />,
      title: 'Full Notifications Available',
      description: 'Push and scheduled notifications are supported',
      status: 'good' as const,
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

  return (
    <View style={[styles.card, styles[statusInfo.status]]} testID={testId}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>{statusInfo.icon}</View>
        <View style={styles.content}>
          <Text style={styles.title}>{statusInfo.title}</Text>
          <Text style={styles.description}>{statusInfo.description}</Text>
        </View>
      </View>

      {statusInfo.showAction && (
        <Pressable style={styles.actionButton} onPress={handleAction}>
          <ExternalLink size={16} color={Colors.primary} />
          <Text style={styles.actionText}>{statusInfo.actionText}</Text>
        </Pressable>
      )}

      {isExpoGo && (
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            💡 Use a development build for full notification support
          </Text>
        </View>
      )}
    </View>
  );
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
