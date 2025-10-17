import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import Colors from '@/constants/colors';
import { Search, Plus, MapPin, Trash2, Edit3, Globe, Clock, Phone } from 'lucide-react-native';
import { useRegionStore } from '@/stores/regionStore';
import { RegionConfig } from '@/types/region';

type CityManagementProps = {
  onBack: () => void;
};

export default function CityManagement({ onBack }: CityManagementProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [editingRegion, setEditingRegion] = useState<RegionConfig | null>(null);

  const {
    availableRegions,
    currentRegion,
    setRegion,
    addCustomRegion,
    removeRegion,
    updateRegionTransitData,
    searchRegions,
    getRegionsByCountry,
  } = useRegionStore();

  const filteredRegions = searchQuery ? searchRegions(searchQuery) : availableRegions;

  const usRegions = getRegionsByCountry('United States');
  const internationalRegions = availableRegions.filter((r) => r.country !== 'United States');

  const handleDeleteRegion = (regionId: string) => {
    if (regionId === currentRegion.id) {
      Alert.alert('Cannot Delete', 'You cannot delete the currently selected region.');
      return;
    }

    Alert.alert(
      'Delete Region',
      'Are you sure you want to delete this region? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => removeRegion(regionId),
        },
      ],
    );
  };

  const handleUpdateTransitData = (regionId: string) => {
    Alert.alert(
      'Update Transit Data',
      "This would typically connect to the region's transit API to fetch the latest schedules and route information.",
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Update',
          onPress: () => {
            // In a real app, this would make API calls to update transit data
            Alert.alert('Success', 'Transit data updated successfully!');
          },
        },
      ],
    );
  };

  const RegionCard = ({ region }: { region: RegionConfig }) => (
    <View style={[styles.regionCard, region.id === currentRegion.id && styles.currentRegionCard]}>
      <Pressable style={styles.regionHeader} onPress={() => setRegion(region.id)}>
        <View style={styles.regionInfo}>
          <View style={styles.regionTitleRow}>
            <MapPin size={20} color={Colors.primary} />
            <Text style={styles.regionName}>{region.name}</Text>
            {region.id === currentRegion.id && (
              <View style={styles.currentBadge}>
                <Text style={styles.currentBadgeText}>Current</Text>
              </View>
            )}
          </View>
          <View style={styles.regionDetails}>
            <View style={styles.detailItem}>
              <Globe size={14} color={Colors.textLight} />
              <Text style={styles.detailText}>{region.country}</Text>
            </View>
            <View style={styles.detailItem}>
              <Clock size={14} color={Colors.textLight} />
              <Text style={styles.detailText}>{region.timezone}</Text>
            </View>
            <View style={styles.detailItem}>
              <Phone size={14} color={Colors.textLight} />
              <Text style={styles.detailText}>{region.emergencyNumber}</Text>
            </View>
          </View>
          <Text style={styles.transitCount}>
            {region.transitSystems.length} transit system
            {region.transitSystems.length !== 1 ? 's' : ''}
          </Text>
        </View>
      </Pressable>

      <View style={styles.regionActions}>
        <Pressable style={styles.actionButton} onPress={() => handleUpdateTransitData(region.id)}>
          <Text style={styles.actionButtonText}>Update Transit</Text>
        </Pressable>
        <Pressable style={styles.actionButton} onPress={() => setEditingRegion(region)}>
          <Edit3 size={16} color={Colors.primary} />
        </Pressable>
        <Pressable
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteRegion(region.id)}
        >
          <Trash2 size={16} color="#FF4444" />
        </Pressable>
      </View>
    </View>
  );

  if (showAddForm || editingRegion) {
    return (
      <AddEditRegionForm
        region={editingRegion}
        onSave={(region) => {
          if (editingRegion) {
            updateRegionTransitData(region.id, region);
          } else {
            addCustomRegion(region);
          }
          setShowAddForm(false);
          setEditingRegion(null);
        }}
        onCancel={() => {
          setShowAddForm(false);
          setEditingRegion(null);
        }}
      />
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>City Management</Text>
        <Pressable style={styles.addButton} onPress={() => setShowAddForm(true)}>
          <Plus size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add City</Text>
        </Pressable>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color={Colors.textLight} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search cities..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={Colors.textLight}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>United States ({usRegions.length})</Text>
        {(searchQuery
          ? filteredRegions.filter((r) => r.country === 'United States')
          : usRegions
        ).map((region) => (
          <RegionCard key={region.id} region={region} />
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>International ({internationalRegions.length})</Text>
        {(searchQuery
          ? filteredRegions.filter((r) => r.country !== 'United States')
          : internationalRegions
        ).map((region) => (
          <RegionCard key={region.id} region={region} />
        ))}
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Transit Data Updates</Text>
        <Text style={styles.infoText}>
          Transit schedules and route information are automatically updated when available. You can
          manually refresh data for any city by tapping "Update Transit".
        </Text>
        <Text style={styles.infoText}>
          Custom cities can be added with their own transit API endpoints for real-time data
          integration.
        </Text>
      </View>
    </ScrollView>
  );
}

type AddEditRegionFormProps = {
  region?: RegionConfig | null;
  onSave: (region: RegionConfig) => void;
  onCancel: () => void;
};

function AddEditRegionForm({ region, onSave, onCancel }: AddEditRegionFormProps) {
  const [formData, setFormData] = useState<Partial<RegionConfig>>({
    id: region?.id || '',
    name: region?.name || '',
    country: region?.country || 'United States',
    timezone: region?.timezone || 'America/New_York',
    currency: region?.currency || 'USD',
    language: region?.language || 'en',
    coordinates: region?.coordinates || { latitude: 0, longitude: 0 },
    emergencyNumber: region?.emergencyNumber || '911',
    transitApiEndpoint: region?.transitApiEndpoint || '',
    mapStyle: region?.mapStyle || 'standard',
    transitSystems: region?.transitSystems || [],
    safetyTips: region?.safetyTips || [],
    funFacts: region?.funFacts || [],
    popularPlaces: region?.popularPlaces || [],
  });

  const handleSave = () => {
    if (!formData.id || !formData.name || !formData.country) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    onSave(formData as RegionConfig);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={onCancel}>
          <Text style={styles.backButtonText}>Cancel</Text>
        </Pressable>
        <Text style={styles.title}>{region ? 'Edit' : 'Add'} City</Text>
        <Pressable style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </Pressable>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.formLabel}>City ID *</Text>
        <TextInput
          style={styles.formInput}
          value={formData.id}
          onChangeText={(text) => setFormData({ ...formData, id: text })}
          placeholder="e.g., nyc, chicago"
          editable={!region}
        />
      </View>

      <View style={styles.formSection}>
        <Text style={styles.formLabel}>City Name *</Text>
        <TextInput
          style={styles.formInput}
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
          placeholder="e.g., New York City"
        />
      </View>

      <View style={styles.formSection}>
        <Text style={styles.formLabel}>Country *</Text>
        <TextInput
          style={styles.formInput}
          value={formData.country}
          onChangeText={(text) => setFormData({ ...formData, country: text })}
          placeholder="e.g., United States"
        />
      </View>

      <View style={styles.formSection}>
        <Text style={styles.formLabel}>Transit API Endpoint</Text>
        <TextInput
          style={styles.formInput}
          value={formData.transitApiEndpoint}
          onChangeText={(text) => setFormData({ ...formData, transitApiEndpoint: text })}
          placeholder="https://api.example.com/"
        />
      </View>

      <View style={styles.formSection}>
        <Text style={styles.formLabel}>Emergency Number</Text>
        <TextInput
          style={styles.formInput}
          value={formData.emergencyNumber}
          onChangeText={(text) => setFormData({ ...formData, emergencyNumber: text })}
          placeholder="911"
        />
      </View>

      <Text style={styles.infoText}>
        Additional configuration options like transit systems, coordinates, and local information
        can be added through the advanced settings or by importing from a configuration file.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  regionCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  currentRegionCard: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  regionHeader: {
    padding: 16,
  },
  regionInfo: {
    gap: 8,
  },
  regionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  regionName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  currentBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currentBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  regionDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 14,
    color: Colors.textLight,
  },
  transitCount: {
    fontSize: 14,
    color: Colors.textLight,
    fontStyle: 'italic',
  },
  regionActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    padding: 12,
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F0F4FF',
    gap: 4,
  },
  actionButtonText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: '#FFF0F0',
  },
  infoSection: {
    padding: 16,
    backgroundColor: Colors.card,
    margin: 16,
    borderRadius: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
    marginBottom: 8,
  },
  formSection: {
    padding: 16,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
});
