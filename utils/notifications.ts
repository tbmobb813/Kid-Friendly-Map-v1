import { Platform, Alert } from 'react-native';

export type NotificationOptions = {
  title: string;
  body: string;
  icon?: string;
  priority?: 'high' | 'normal';
  scheduleAt?: Date;
};

type InAppBanner = {
  id: string;
  title: string;
  message: string;
  type: 'reminder' | 'weather' | 'safety' | 'achievement';
};

const inAppListeners: Array<(banner: InAppBanner) => void> = [];
export const addInAppBannerListener = (cb: (banner: InAppBanner) => void) => {
  inAppListeners.push(cb);
  return () => {
    const i = inAppListeners.indexOf(cb);
    if (i > -1) inAppListeners.splice(i, 1);
  };
};
export const showInAppBanner = (banner: InAppBanner) => {
  inAppListeners.forEach((l) => {
    try {
      l(banner);
    } catch {}
  });
};

// Check if we're running in Expo Go (which has notification limitations)
const isExpoGo = __DEV__ && Platform.OS !== 'web';

export const initializeNotifications = async () => {
  if (Platform.OS === 'web') return;
  try {
    const { Notifications } = require('expo-notifications');
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
      await Notifications.setNotificationChannelAsync('high', {
        name: 'High Priority',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
        vibrationPattern: [0, 250, 250, 250],
      });
    }
  } catch (e) {
    console.warn('initializeNotifications failed:', e);
  }
};

export const showNotification = async (options: NotificationOptions) => {
  const { title, body, icon = '/icon.png', priority = 'normal', scheduleAt } = options;

  if (Platform.OS === 'web') {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(title, { body, icon });
      } else if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') new Notification(title, { body, icon });
      }
    }
    showInAppBanner({ id: Date.now().toString(), title, message: body, type: 'reminder' });
    return;
  }

  if (isExpoGo) {
    if (priority === 'high') Alert.alert(title, body, [{ text: 'OK' }]);
    else console.log(`📱 Notification: ${title} - ${body}`);
    showInAppBanner({ id: Date.now().toString(), title, message: body, type: 'reminder' });
    return;
  }

  try {
    const { Notifications } = require('expo-notifications');
    await initializeNotifications();
    const trigger = scheduleAt ? new Date(scheduleAt) : null;
    await Notifications.scheduleNotificationAsync({
      content: { title, body, sound: true },
      trigger,
    });
  } catch (error) {
    console.warn('Failed to show notification:', error);
    if (priority === 'high') Alert.alert(title, body, [{ text: 'OK' }]);
    showInAppBanner({ id: Date.now().toString(), title, message: body, type: 'reminder' });
  }
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'web') {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }
  if (isExpoGo) {
    console.log('⚠️ Running in Expo Go - notifications limited to alerts');
    console.log('💡 For full notification support, use a development build');
    return true;
  }
  try {
    const { Notifications } = require('expo-notifications');
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.warn('Failed to request notification permissions:', error);
    return false;
  }
};

export const hasNotificationPermission = (): boolean => {
  if (Platform.OS === 'web') {
    return 'Notification' in window && Notification.permission === 'granted';
  }
  if (isExpoGo) return true;
  try {
    // In production you'd cache this
    return true;
  } catch {
    return false;
  }
};

export const showDevelopmentBuildRecommendation = () => {
  if (isExpoGo) {
    Alert.alert(
      '📱 Enhanced Features Available',
      'For the best experience with notifications and background features, consider using a development build instead of Expo Go.\n\nLearn more at: docs.expo.dev/develop/development-builds/',
      [
        { text: 'Maybe Later', style: 'cancel' },
        { text: 'Learn More', onPress: () => console.log('Open development build docs') },
      ],
    );
  }
};
