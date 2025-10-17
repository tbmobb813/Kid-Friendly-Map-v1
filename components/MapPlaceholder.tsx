import React from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import Colors from '@/constants/colors';
import { MapPin } from 'lucide-react-native';

type MapPlaceholderProps = {
  message?: string;
};

const MapPlaceholder: React.FC<MapPlaceholderProps> = ({ message = 'Map will appear here' }) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <MapPin size={40} color={Colors.primary} />
      </View>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 300,
    backgroundColor: Colors.mapWater,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  message: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
  },
});

export default MapPlaceholder;
