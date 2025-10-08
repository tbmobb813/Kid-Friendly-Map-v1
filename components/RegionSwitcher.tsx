import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable, Modal } from 'react-native';
import Colors from '@/constants/colors';
import { useRegionStore } from '@/stores/regionStore';
import RegionSelector from './RegionSelector';
import { Globe, X } from 'lucide-react-native';

const RegionSwitcher: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const { currentRegion, availableRegions, userPreferences, setRegion } = useRegionStore();

  const handleRegionSelect = (regionId: string) => {
    setRegion(regionId);
    setShowModal(false);
  };

  return (
    <>
      <Pressable style={styles.trigger} onPress={() => setShowModal(true)}>
        <Globe size={20} color={Colors.primary} />
        <Text style={styles.triggerText}>{currentRegion.name}</Text>
      </Pressable>

      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Switch Region</Text>
            <Pressable style={styles.closeButton} onPress={() => setShowModal(false)}>
              <X size={24} color={Colors.text} />
            </Pressable>
          </View>

          <RegionSelector
            regions={availableRegions}
            selectedRegion={userPreferences.selectedRegion}
            onSelectRegion={handleRegionSelect}
          />
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 8,
  },
  triggerText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  closeButton: {
    padding: 4,
  },
});

export default RegionSwitcher;
