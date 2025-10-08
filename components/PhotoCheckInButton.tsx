import React, { useState } from 'react';
import { StyleSheet, Text, Pressable, Alert, Platform, View, Image } from 'react-native';
import Colors from '@/constants/colors';
import { Camera as CameraIcon, MapPin, Check, X } from 'lucide-react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useNavigationStore } from '@/stores/navigationStore';
import useLocation from '@/hooks/useLocation';

type PhotoCheckInButtonProps = {
  placeName: string;
  placeId: string;
  placeLat?: number;
  placeLng?: number;
};

type PreviewState = {
  uri: string;
} | null;

const PhotoCheckInButton: React.FC<PhotoCheckInButtonProps> = ({
  placeName,
  placeId,
  placeLat,
  placeLng,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [preview, setPreview] = useState<PreviewState>(null);
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const { addPhotoCheckIn, addLocationVerifiedPhotoCheckIn } = useNavigationStore();
  const { location } = useLocation();

  const close = () => {
    setIsOpen(false);
    setPreview(null);
  };

  const onSnap = async () => {
    Alert.alert('Photo', 'Snap is a placeholder in Expo Go. Use screenshot after tapping.', [
      { text: 'OK' },
    ]);
  };

  const onConfirm = async () => {
    const timestamp = Date.now();
    if (Platform.OS === 'web') {
      addPhotoCheckIn({
        placeId,
        placeName,
        photoUrl: preview?.uri || 'https://via.placeholder.com/300x200?text=Check-in+Photo',
        timestamp,
        notes: 'Web check-in',
      });
      close();
      Alert.alert('Check-in Complete!', `You've safely arrived at ${placeName}!`);
      return;
    }

    if (placeLat !== undefined && placeLng !== undefined && location) {
      addLocationVerifiedPhotoCheckIn(
        {
          placeId,
          placeName,
          photoUrl: preview?.uri || 'placeholder://photo',
          timestamp,
          notes: 'Safe arrival confirmed!',
        },
        { latitude: location.latitude, longitude: location.longitude },
        { latitude: placeLat, longitude: placeLng },
      );
    } else {
      addPhotoCheckIn({
        placeId,
        placeName,
        photoUrl: preview?.uri || 'placeholder://photo',
        timestamp,
        notes: 'Safe arrival confirmed!',
      });
    }
    close();
    Alert.alert('Check-in Complete!', `You've safely arrived at ${placeName}!`);
  };

  const onOpenCamera = async () => {
    if (Platform.OS === 'web') {
      setPreview({ uri: 'https://via.placeholder.com/600x400?text=Preview' });
      setIsOpen(true);
      return;
    }
    if (!permission) return;
    if (!permission.granted) {
      const granted = await requestPermission();
      if (!granted?.granted) {
        Alert.alert('Permission needed', 'Camera permission is required for photo check-ins');
        return;
      }
    }
    setIsOpen(true);
  };

  return (
    <>
      <Pressable testID="photo-checkin-button" style={styles.button} onPress={onOpenCamera}>
        <CameraIcon size={20} color="#FFFFFF" />
        <Text style={styles.text}>Photo Check-in</Text>
        <MapPin size={16} color="#FFFFFF" style={styles.locationIcon} />
      </Pressable>

      {isOpen && (
        <View style={styles.modal} testID="photo-checkin-modal">
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Check-in Photo</Text>
            <Pressable onPress={close} testID="close-preview">
              <X size={20} color={Colors.text} />
            </Pressable>
          </View>

          {preview ? (
            <Image source={{ uri: preview.uri }} style={styles.preview} />
          ) : (
            <View style={styles.cameraWrap}>
              <CameraView style={styles.camera} facing={facing}>
                <View style={styles.cameraControls}>
                  <Pressable style={styles.snap} onPress={onSnap} testID="snap-button" />
                </View>
              </CameraView>
            </View>
          )}

          <View style={styles.modalFooter}>
            <Pressable style={[styles.footerBtn, styles.cancel]} onPress={close}>
              <Text style={styles.footerText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.footerBtn, styles.confirm]}
              onPress={onConfirm}
              testID="confirm-checkin"
            >
              <Check size={16} color="#fff" />
              <Text style={styles.footerText}>Confirm</Text>
            </Pressable>
          </View>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.secondary,
    borderRadius: 12,
    padding: 16,
    margin: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  locationIcon: { marginLeft: 4 },
  modal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000d0',
    paddingTop: 48,
  },
  modalHeader: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  cameraWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  camera: { width: '92%', height: 360, borderRadius: 16, overflow: 'hidden' },
  cameraControls: { flex: 1, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 16 },
  snap: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#ffffffcc' },
  preview: { width: '92%', height: 360, borderRadius: 16, alignSelf: 'center' },
  modalFooter: { flexDirection: 'row', gap: 12, padding: 16, justifyContent: 'flex-end' },
  footerBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#222',
  },
  cancel: { backgroundColor: '#333' },
  confirm: { backgroundColor: Colors.primary, flexDirection: 'row', alignItems: 'center', gap: 6 },
  footerText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});

export default PhotoCheckInButton;
