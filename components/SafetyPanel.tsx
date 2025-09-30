import React, { useState } from "react";
import { StyleSheet, Text, View, Pressable, Alert, Linking, Platform } from "react-native";
import Colors from "@/constants/colors";
import { Shield, Phone, MessageCircle, MapPin, AlertTriangle, Camera, CheckCircle, XCircle } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { useGamificationStore } from "@/stores/gamificationStore";
import { useNavigationStore } from "@/stores/navigationStore";
import { useParentalStore } from "@/stores/parentalStore";
import { formatDistance, getLocationAccuracyDescription } from "@/utils/locationUtils";
import { validateLocation, validatePhotoCheckIn, logValidationResult } from "@/utils/validation";
import { withRetry, handleCameraError, handleLocationError, DEFAULT_RETRY_CONFIG } from "@/utils/errorHandling";
import { log } from "@/utils/logger";
import ErrorBoundary from "./ErrorBoundary";
import { useToast } from "@/hooks/useToast";

type SafetyPanelProps = {
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
  currentPlace?: {
    id: string;
    name: string;
  };
};

const SafetyPanel: React.FC<SafetyPanelProps> = ({ currentLocation, currentPlace }) => {
  const { safetyContacts } = useGamificationStore();
  const { addLocationVerifiedPhotoCheckIn } = useNavigationStore();
  const { settings, addCheckInToDashboard, updateLastKnownLocation } = useParentalStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPhotoLoading, setIsPhotoLoading] = useState(false);
  const { showToast } = useToast();

  // Validate current location on component mount
  React.useEffect(() => {
    if (currentLocation) {
      const locationValidation = validateLocation(currentLocation);
      logValidationResult('SafetyPanel currentLocation', locationValidation);
      
      if (!locationValidation.isValid) {
        log.warn('SafetyPanel received invalid location', { 
          location: currentLocation,
          errors: locationValidation.errors 
        });
        showToast('Location data may be inaccurate', 'warning');
      }
    }
  }, [currentLocation, showToast]);

  const handleEmergencyCall = async () => {
    try {
      log.info('Emergency call initiated');
      
      Alert.alert(
        "Emergency Call",
        "Do you need to call for help?",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Call 911", 
            style: "destructive",
            onPress: async () => {
              try {
                await withRetry(
                  () => Linking.openURL("tel:911"),
                  DEFAULT_RETRY_CONFIG.critical,
                  'Emergency 911 call'
                );
                log.info('Emergency 911 call initiated successfully');
              } catch (error) {
                log.error('Failed to initiate 911 call', error as Error);
                showToast('Unable to make emergency call', 'error');
              }
            }
          },
          { 
            text: "Call Parent", 
            onPress: async () => {
              try {
                const primaryContact = settings.emergencyContacts.find(c => c.isPrimary) || safetyContacts.find(c => c.isPrimary);
                if (primaryContact) {
                  await withRetry(
                    () => Linking.openURL(`tel:${primaryContact.phone}`),
                    DEFAULT_RETRY_CONFIG.critical,
                    'Parent emergency call'
                  );
                  log.info('Parent emergency call initiated successfully', { contactId: primaryContact.id });
                } else {
                  showToast('No emergency contact available', 'warning');
                  log.warn('No primary emergency contact found');
                }
              } catch (error) {
                log.error('Failed to initiate parent call', error as Error);
                showToast('Unable to call parent', 'error');
              }
            }
          }
        ]
      );
    } catch (error) {
      log.error('Emergency call handler failed', error as Error);
      showToast('Emergency feature temporarily unavailable', 'error');
    }
  };

  const handleShareLocation = async () => {
    try {
      if (!currentLocation) {
        const locationError = handleLocationError({ code: 'POSITION_UNAVAILABLE' });
        showToast(locationError.userMessage, 'warning');
        log.warn('Share location attempted without current location');
        return;
      }

      // Validate location before sharing
      const locationValidation = validateLocation(currentLocation);
      if (!locationValidation.isValid) {
        log.error('Invalid location data for sharing', { 
          location: currentLocation,
          errors: locationValidation.errors 
        });
        showToast('Location data is invalid', 'error');
        return;
      }

      const message = `I'm at: https://maps.google.com/?q=${currentLocation.latitude},${currentLocation.longitude}`;
      const primaryContact = settings.emergencyContacts.find(c => c.isPrimary) || safetyContacts.find(c => c.isPrimary);
      
      if (primaryContact && Platform.OS !== 'web') {
        await withRetry(
          () => Linking.openURL(`sms:${primaryContact.phone}&body=${encodeURIComponent(message)}`),
          DEFAULT_RETRY_CONFIG.critical,
          'Share location SMS'
        );
        log.info('Location shared successfully', { contactId: primaryContact.id });
        showToast('Location shared with emergency contact', 'success');
      } else if (!primaryContact) {
        showToast('No emergency contact available', 'warning');
        log.warn('No primary contact for location sharing');
      } else {
        // Web fallback - copy to clipboard or show message
        showToast('Location sharing not available on web', 'info');
      }
      
      // Update last known location in parent dashboard
      try {
        await withRetry(
          () => Promise.resolve(updateLastKnownLocation({
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            timestamp: Date.now(),
            placeName: currentPlace?.name,
          })),
          DEFAULT_RETRY_CONFIG.storage,
          'Update last known location'
        );
      } catch (error) {
        log.warn('Failed to update last known location', error as Error);
        // Don't show error to user as location was still shared
      }
    } catch (error) {
      log.error('Share location failed', error as Error);
      showToast('Unable to share location', 'error');
    }
  };

  const handleSafeArrival = () => {
    Alert.alert(
      "I Made It!",
      "Let your family know you arrived safely?",
      [
        { text: "Not now", style: "cancel" },
        { 
          text: "Send message", 
          onPress: () => {
            const primaryContact = settings.emergencyContacts.find(c => c.isPrimary) || safetyContacts.find(c => c.isPrimary);
            if (primaryContact && Platform.OS !== 'web') {
              const placeName = currentPlace?.name || "my destination";
              Linking.openURL(`sms:${primaryContact.phone}&body=I made it to ${placeName} safely! 😊`);
            }
            
            // Update last known location in parent dashboard
            if (currentLocation && currentPlace) {
              updateLastKnownLocation({
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
                timestamp: Date.now(),
                placeName: currentPlace.name,
              });
            }
          }
        }
      ]
    );
  };

  const handlePhotoCheckIn = async () => {
    try {
      if (!currentPlace) {
        showToast('Please select a destination first', 'warning');
        log.warn('Photo check-in attempted without current place');
        return;
      }

      if (!currentLocation) {
        const locationError = handleLocationError({ code: 'POSITION_UNAVAILABLE' });
        Alert.alert('Location Required', locationError.userMessage + '\n\n' + (locationError.suggestedAction || ''));
        log.warn('Photo check-in attempted without current location');
        return;
      }

      // Validate location before proceeding
      const locationValidation = validateLocation(currentLocation);
      if (!locationValidation.isValid) {
        log.error('Invalid location for photo check-in', { 
          location: currentLocation,
          errors: locationValidation.errors 
        });
        Alert.alert('Location Error', 'Your location data appears to be invalid. Please try again.');
        return;
      }

      if (locationValidation.warnings && locationValidation.warnings.length > 0) {
        log.warn('Location warnings for photo check-in', { warnings: locationValidation.warnings });
        // Continue but log the warnings
      }

      if (Platform.OS === 'web') {
        // Web fallback with validation
        const webCheckIn = {
          placeId: currentPlace.id,
          placeName: currentPlace.name,
          photoUrl: "https://via.placeholder.com/300x200?text=Check-in+Photo",
          timestamp: Date.now(),
          notes: "I made it here safely!",
          location: currentLocation
        };

        const checkInValidation = validatePhotoCheckIn(webCheckIn);
        if (!checkInValidation.isValid) {
          log.error('Invalid web check-in data', { errors: checkInValidation.errors });
          showToast('Check-in data is invalid', 'error');
          return;
        }

        const placeCoordinates = { latitude: 40.7128, longitude: -74.0060 }; // Default NYC coordinates
        
        try {
          await withRetry(
            () => Promise.resolve(addLocationVerifiedPhotoCheckIn(
              webCheckIn,
              currentLocation,
              placeCoordinates
            )),
            DEFAULT_RETRY_CONFIG.storage,
            'Web photo check-in'
          );
          
          showToast('Check-in recorded successfully!', 'success');
          log.info('Web photo check-in completed', { placeId: currentPlace.id });
        } catch (error) {
          log.error('Web photo check-in failed', error as Error);
          showToast('Failed to record check-in', 'error');
        }
        return;
      }

      setIsPhotoLoading(true);
      log.info('Starting photo check-in process', { placeId: currentPlace.id });
      
      try {
        const permissionResult = await withRetry(
          () => ImagePicker.requestCameraPermissionsAsync(),
          { maxAttempts: 2, delayMs: 500 },
          'Camera permission request'
        );
        
        if (!permissionResult.granted) {
          const cameraError = handleCameraError({ message: 'Camera permission denied' });
          
          if (Platform.OS === 'android') {
            Alert.alert(
              "Camera Permission", 
              cameraError.userMessage + "\n\nPlease enable camera access in your device settings.",
              [
                { text: "Cancel", style: "cancel" },
                { text: "Settings", onPress: () => {
                  Alert.alert("Enable Camera", "Go to Settings > Apps > KidMap > Permissions > Camera");
                }}
              ]
            );
          } else {
            Alert.alert("Permission needed", cameraError.userMessage);
          }
          
          log.warn('Camera permission denied for photo check-in');
          return;
        }
      } catch (error) {
        const cameraError = handleCameraError(error);
        log.error('Camera permission request failed', error as Error);
        showToast(cameraError.userMessage, 'error');
        return;
      }

      const cameraOptions = Platform.OS === 'android' 
        ? {
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3] as [number, number],
            quality: 0.6,
            exif: false,
          }
        : {
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3] as [number, number],
            quality: 0.7,
          };

      try {
        const result = await withRetry(
          () => ImagePicker.launchCameraAsync(cameraOptions),
          { maxAttempts: 2, delayMs: 1000 },
          'Camera launch'
        );

        if (!result.canceled && result.assets[0]) {
          const checkInData = {
            placeId: currentPlace.id,
            placeName: currentPlace.name,
            photoUrl: result.assets[0].uri,
            timestamp: Date.now(),
            notes: "I made it here safely!",
            location: currentLocation
          };

          // Validate check-in data before processing
          const checkInValidation = validatePhotoCheckIn(checkInData);
          if (!checkInValidation.isValid) {
            log.error('Invalid photo check-in data', { errors: checkInValidation.errors });
            showToast('Check-in data is invalid', 'error');
            return;
          }

          // For demo purposes, we'll use mock coordinates for the place
          // In a real app, this would come from the place data
          const placeCoordinates = { latitude: 40.7128, longitude: -74.0060 }; // Default NYC coordinates
          
          let verification;
          try {
            verification = await withRetry(
              () => Promise.resolve(addLocationVerifiedPhotoCheckIn(
                checkInData,
                currentLocation,
                placeCoordinates
              )),
              DEFAULT_RETRY_CONFIG.storage,
              'Photo check-in verification'
            );
          } catch (error) {
            log.error('Photo check-in verification failed', error as Error);
            showToast('Failed to verify check-in location', 'error');
            return;
          }
        
          // Add to parent dashboard with retry
          try {
            await withRetry(
              () => Promise.resolve(addCheckInToDashboard({
                id: `checkin_${Date.now()}`,
                timestamp: Date.now(),
                placeName: currentPlace.name,
                photoUrl: result.assets[0].uri,
                location: currentLocation,
              })),
              DEFAULT_RETRY_CONFIG.storage,
              'Add check-in to dashboard'
            );
          } catch (error) {
            log.warn('Failed to add check-in to parent dashboard', error as Error);
            // Don't fail the whole operation for this
          }
          
          // Update last known location with retry
          try {
            await withRetry(
              () => Promise.resolve(updateLastKnownLocation({
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
                timestamp: Date.now(),
                placeName: currentPlace.name,
              })),
              DEFAULT_RETRY_CONFIG.storage,
              'Update last known location'
            );
          } catch (error) {
            log.warn('Failed to update last known location', error as Error);
            // Don't fail the whole operation for this
          }
        
        // Show verification result
        const accuracyDescription = getLocationAccuracyDescription(verification.distance);
        const distanceText = formatDistance(verification.distance);
        
        if (verification.isWithinRadius) {
          Alert.alert(
            "✅ Check-in Verified!", 
            `Great job! You're ${accuracyDescription} (${distanceText}) from ${currentPlace.name}. Your location has been verified! 📸`,
            [{ text: "Awesome!", style: "default" }]
          );
          } else {
            Alert.alert(
              "⚠️ Location Check", 
              `Photo taken! However, you appear to be ${distanceText} from ${currentPlace.name}. Make sure you're at the right location for accurate check-ins.`,
              [{ text: "Got it", style: "default" }]
            );
          }
          
          log.info('Photo check-in completed successfully', {
            placeId: currentPlace.id,
            distance: verification.distance,
            isVerified: verification.isWithinRadius
          });
        } else {
          log.info('Photo check-in cancelled by user');
        }
      } catch (cameraError) {
        const errorInfo = handleCameraError(cameraError);
        log.error('Camera operation failed', cameraError as Error);
        showToast(errorInfo.userMessage, 'error');
      }
    } catch (error) {
      log.error('Photo check-in process failed', error as Error);
      showToast('Photo check-in failed. Please try again.', 'error');
    } finally {
      setIsPhotoLoading(false);
    }
  };

  return (
    <ErrorBoundary>
      <View style={styles.container}>
      <Pressable 
        style={styles.header}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <Shield size={20} color={Colors.primary} />
        <Text style={styles.title}>Safety Tools</Text>
        <Text style={styles.expandIcon}>{isExpanded ? "−" : "+"}</Text>
      </Pressable>

      {isExpanded && (
        <View style={styles.content}>
          <View style={styles.buttonRow}>
            <Pressable style={styles.safetyButton} onPress={handleEmergencyCall}>
              <Phone size={18} color="#FFFFFF" />
              <Text style={styles.buttonText}>Emergency</Text>
            </Pressable>

            <Pressable style={styles.safetyButton} onPress={handleShareLocation}>
              <MapPin size={18} color="#FFFFFF" />
              <Text style={styles.buttonText}>Share Location</Text>
            </Pressable>
          </View>

          <View style={styles.buttonRow}>
            <Pressable style={styles.safetyButton} onPress={handleSafeArrival}>
              <MessageCircle size={18} color="#FFFFFF" />
              <Text style={styles.buttonText}>I Made It!</Text>
            </Pressable>

            <Pressable 
              style={[styles.safetyButton, isPhotoLoading && styles.loadingButton]} 
              onPress={handlePhotoCheckIn}
              disabled={isPhotoLoading}
            >
              <Camera size={18} color="#FFFFFF" />
              <Text style={styles.buttonText}>
                {isPhotoLoading ? "Taking Photo..." : "Photo Check-in"}
              </Text>
            </Pressable>
          </View>

          <View style={styles.tipContainer}>
            <AlertTriangle size={16} color={Colors.warning} />
            <Text style={styles.tipText}>
              Always stay with a trusted adult when traveling
            </Text>
          </View>
        </View>
      )}
      </View>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F0F4FF",
    borderRadius: 12,
    margin: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginLeft: 8,
  },
  expandIcon: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.primary,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    gap: 8,
  },
  safetyButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    gap: 4,
    minHeight: 60,
    justifyContent: "center",
  },
  loadingButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  tipContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF9E6",
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 12,
    color: Colors.text,
  },
});

export default SafetyPanel;
