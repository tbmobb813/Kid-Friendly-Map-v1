import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Pressable, Alert, Platform, Vibration } from 'react-native';
import { Phone, MapPin, MessageCircle, X, CheckCircle } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useParentalStore } from '@/stores/parentalStore';
import useLocation from '@/hooks/useLocation';
import { DevicePingRequest } from '@/types/parental';

type DevicePingHandlerProps = {
  testId?: string;
};

const DevicePingHandler: React.FC<DevicePingHandlerProps> = ({ testId }) => {
  const { devicePings, acknowledgePing, updateLastKnownLocation } = useParentalStore();
  const { location } = useLocation();
  const [activePing, setActivePing] = useState<DevicePingRequest | null>(null);
  const [isRinging, setIsRinging] = useState(false);

  // Check for pending pings
  useEffect(() => {
    const pendingPings = devicePings.filter(ping => ping.status === 'pending');
    const latestPing = pendingPings[pendingPings.length - 1];
    
    if (latestPing && latestPing.id !== activePing?.id) {
      setActivePing(latestPing);
      handlePingReceived(latestPing);
    }
  }, [devicePings, activePing]);

  const handlePingReceived = (ping: DevicePingRequest) => {
    console.log('Device ping received:', ping.type, ping.message);
    
    switch (ping.type) {
      case 'ring':
        handleRingPing(ping);
        break;
      case 'location':
        handleLocationPing(ping);
        break;
      case 'message':
        handleMessagePing(ping);
        break;
    }
  };

  const handleRingPing = (ping: DevicePingRequest) => {
    setIsRinging(true);
    
    // Vibrate the device
    if (Platform.OS !== 'web') {
      const pattern = [0, 1000, 500, 1000, 500, 1000];
      Vibration.vibrate(pattern, true);
    }
    
    // Show alert
    Alert.alert(
      '📱 Device Ping',
      ping.message || 'Your parent is trying to locate your device',
      [
        {
          text: 'Acknowledge',
          onPress: () => handleAcknowledgePing(ping.id),
        },
      ],
      { cancelable: false }
    );
  };

  const handleLocationPing = (ping: DevicePingRequest) => {
    Alert.alert(
      '📍 Location Request',
      ping.message || 'Your parent has requested your current location',
      [
        {
          text: 'Share Location',
          onPress: () => handleAcknowledgePing(ping.id, true),
        },
        {
          text: 'Decline',
          style: 'cancel',
          onPress: () => handleAcknowledgePing(ping.id, false),
        },
      ]
    );
  };

  const handleMessagePing = (ping: DevicePingRequest) => {
    Alert.alert(
      '💬 Message from Parent',
      ping.message || 'You have a message from your parent',
      [
        {
          text: 'OK',
          onPress: () => handleAcknowledgePing(ping.id),
        },
      ]
    );
  };

  const handleAcknowledgePing = async (pingId: string, shareLocation: boolean = true) => {
    try {
      // Stop ringing
      if (isRinging) {
        setIsRinging(false);
        if (Platform.OS !== 'web') {
          Vibration.cancel();
        }
      }

      // Acknowledge the ping with location if requested
      const locationData = shareLocation && !location.error ? {
        latitude: location.latitude,
        longitude: location.longitude,
      } : undefined;

      await acknowledgePing(pingId, locationData);
      
      // Update last known location if sharing
      if (locationData) {
        updateLastKnownLocation({
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          timestamp: Date.now(),
          placeName: 'Current Location',
        });
      }

      setActivePing(null);
      
      Alert.alert(
        '✅ Response Sent',
        shareLocation ? 'Your location has been shared with your parent' : 'Response sent to your parent'
      );
    } catch (error) {
      console.error('Failed to acknowledge ping:', error);
      Alert.alert('Error', 'Failed to respond to ping. Please try again.');
    }
  };

  const handleDismissPing = () => {
    if (activePing) {
      handleAcknowledgePing(activePing.id, false);
    }
  };

  // Don't render anything if no active ping
  if (!activePing) {
    return null;
  }

  const getPingIcon = () => {
    switch (activePing.type) {
      case 'ring':
        return <Phone size={24} color={Colors.primary} />;
      case 'location':
        return <MapPin size={24} color={Colors.primary} />;
      case 'message':
        return <MessageCircle size={24} color={Colors.primary} />;
      default:
        return <Phone size={24} color={Colors.primary} />;
    }
  };

  const getPingTitle = () => {
    switch (activePing.type) {
      case 'ring':
        return 'Device Ping';
      case 'location':
        return 'Location Request';
      case 'message':
        return 'Message from Parent';
      default:
        return 'Parent Request';
    }
  };

  return (
    <View style={styles.overlay} testID={testId}>
      <View style={[styles.pingCard, isRinging && styles.ringingCard]}>
        <View style={styles.pingHeader}>
          <View style={styles.pingIconContainer}>
            {getPingIcon()}
          </View>
          <Pressable style={styles.dismissButton} onPress={handleDismissPing}>
            <X size={20} color={Colors.textLight} />
          </Pressable>
        </View>
        
        <Text style={styles.pingTitle}>{getPingTitle()}</Text>
        
        {activePing.message && (
          <Text style={styles.pingMessage}>{activePing.message}</Text>
        )}
        
        <View style={styles.pingActions}>
          {activePing.type === 'location' ? (
            <>
              <Pressable
                style={[styles.actionButton, styles.declineButton]}
                onPress={() => handleAcknowledgePing(activePing.id, false)}
              >
                <Text style={styles.declineButtonText}>Decline</Text>
              </Pressable>
              
              <Pressable
                style={[styles.actionButton, styles.shareButton]}
                onPress={() => handleAcknowledgePing(activePing.id, true)}
              >
                <MapPin size={16} color="#FFFFFF" />
                <Text style={styles.shareButtonText}>Share Location</Text>
              </Pressable>
            </>
          ) : (
            <Pressable
              style={[styles.actionButton, styles.acknowledgeButton]}
              onPress={() => handleAcknowledgePing(activePing.id)}
            >
              <CheckCircle size={16} color="#FFFFFF" />
              <Text style={styles.acknowledgeButtonText}>Acknowledge</Text>
            </Pressable>
          )}
        </View>
        
        <Text style={styles.pingTime}>
          Received {new Date(activePing.requestedAt).toLocaleTimeString()}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  pingCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 24,
    margin: 20,
    maxWidth: 320,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  ringingCard: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  pingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  pingIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.androidRipple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissButton: {
    padding: 8,
  },
  pingTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  pingMessage: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  pingActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  acknowledgeButton: {
    backgroundColor: Colors.primary,
  },
  acknowledgeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  shareButton: {
    backgroundColor: Colors.success,
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  declineButton: {
    backgroundColor: Colors.textLight,
  },
  declineButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  pingTime: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
  },
});

export default DevicePingHandler;
