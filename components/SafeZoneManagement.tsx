import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Alert, TextInput } from 'react-native';
import Colors from '@/constants/colors';
import { Shield, Plus, MapPin, Edit, Trash2, ArrowLeft, ToggleLeft, ToggleRight } from 'lucide-react-native';
import { useParentalStore } from '@/stores/parentalStore';
import { SafeZone } from '@/types/parental';

type SafeZoneManagementProps = {
  onBack: () => void;
};

const SafeZoneManagement: React.FC<SafeZoneManagementProps> = ({ onBack }) => {
  const { safeZones, addSafeZone, updateSafeZone, deleteSafeZone } = useParentalStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingZone, setEditingZone] = useState<SafeZone | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    latitude: '',
    longitude: '',
    radius: '100',
    notifications: {
      onEntry: true,
      onExit: true,
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      latitude: '',
      longitude: '',
      radius: '100',
      notifications: {
        onEntry: true,
        onExit: true,
      },
    });
    setEditingZone(null);
    setShowAddForm(false);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter a name for the safe zone');
      return;
    }

    const latitude = parseFloat(formData.latitude);
    const longitude = parseFloat(formData.longitude);
    const radius = parseInt(formData.radius);

    if (isNaN(latitude) || isNaN(longitude)) {
      Alert.alert('Error', 'Please enter valid coordinates');
      return;
    }

    if (isNaN(radius) || radius < 10 || radius > 1000) {
      Alert.alert('Error', 'Radius must be between 10 and 1000 meters');
      return;
    }

    try {
      if (editingZone) {
        await updateSafeZone(editingZone.id, {
          name: formData.name.trim(),
          latitude,
          longitude,
          radius,
          notifications: formData.notifications,
        });
        Alert.alert('Success', 'Safe zone updated successfully');
      } else {
        await addSafeZone({
          name: formData.name.trim(),
          latitude,
          longitude,
          radius,
          isActive: true,
          notifications: formData.notifications,
        });
        Alert.alert('Success', 'Safe zone created successfully');
      }
      resetForm();
    } catch (error) {
      Alert.alert('Error', 'Failed to save safe zone');
    }
  };

  const handleEdit = (zone: SafeZone) => {
    setFormData({
      name: zone.name,
      latitude: zone.latitude.toString(),
      longitude: zone.longitude.toString(),
      radius: zone.radius.toString(),
      notifications: zone.notifications,
    });
    setEditingZone(zone);
    setShowAddForm(true);
  };

  const handleDelete = (zone: SafeZone) => {
    Alert.alert(
      'Delete Safe Zone',
      `Are you sure you want to delete "${zone.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteSafeZone(zone.id),
        },
      ]
    );
  };

  const handleToggleActive = (zone: SafeZone) => {
    updateSafeZone(zone.id, { isActive: !zone.isActive });
  };

  const getCurrentLocation = () => {
    // In a real app, this would use the device's GPS
    // For demo purposes, we'll use a default location (New York City)
    setFormData(prev => ({
      ...prev,
      latitude: '40.7128',
      longitude: '-74.0060',
    }));
    Alert.alert('Location Set', 'Current location has been set as coordinates');
  };

  if (showAddForm) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={resetForm}>
            <ArrowLeft size={24} color={Colors.primary} />
          </Pressable>
          <Text style={styles.headerTitle}>
            {editingZone ? 'Edit Safe Zone' : 'Add Safe Zone'}
          </Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                placeholder="e.g., Home, School, Grandma's House"
                placeholderTextColor={Colors.textLight}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Location</Text>
              <View style={styles.locationInputs}>
                <TextInput
                  style={[styles.input, styles.coordinateInput]}
                  value={formData.latitude}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, latitude: text }))}
                  placeholder="Latitude"
                  placeholderTextColor={Colors.textLight}
                  keyboardType="numeric"
                />
                <TextInput
                  style={[styles.input, styles.coordinateInput]}
                  value={formData.longitude}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, longitude: text }))}
                  placeholder="Longitude"
                  placeholderTextColor={Colors.textLight}
                  keyboardType="numeric"
                />
              </View>
              <Pressable style={styles.locationButton} onPress={getCurrentLocation}>
                <MapPin size={16} color={Colors.primary} />
                <Text style={styles.locationButtonText}>Use Current Location</Text>
              </Pressable>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Radius (meters)</Text>
              <TextInput
                style={styles.input}
                value={formData.radius}
                onChangeText={(text) => setFormData(prev => ({ ...prev, radius: text }))}
                placeholder="100"
                placeholderTextColor={Colors.textLight}
                keyboardType="numeric"
              />
              <Text style={styles.helperText}>
                Distance from the center point to trigger notifications (10-1000m)
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Notifications</Text>
              
              <Pressable
                style={styles.toggleRow}
                onPress={() => setFormData(prev => ({
                  ...prev,
                  notifications: {
                    ...prev.notifications,
                    onEntry: !prev.notifications.onEntry,
                  },
                }))}
              >
                <Text style={styles.toggleLabel}>Notify on entry</Text>
                {formData.notifications.onEntry ? (
                  <ToggleRight size={24} color={Colors.primary} />
                ) : (
                  <ToggleLeft size={24} color={Colors.textLight} />
                )}
              </Pressable>

              <Pressable
                style={styles.toggleRow}
                onPress={() => setFormData(prev => ({
                  ...prev,
                  notifications: {
                    ...prev.notifications,
                    onExit: !prev.notifications.onExit,
                  },
                }))}
              >
                <Text style={styles.toggleLabel}>Notify on exit</Text>
                {formData.notifications.onExit ? (
                  <ToggleRight size={24} color={Colors.primary} />
                ) : (
                  <ToggleLeft size={24} color={Colors.textLight} />
                )}
              </Pressable>
            </View>
          </View>

          <View style={styles.actions}>
            <Pressable style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>
                {editingZone ? 'Update Safe Zone' : 'Create Safe Zone'}
              </Text>
            </Pressable>
            
            <Pressable style={styles.cancelButton} onPress={resetForm}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={onBack}>
          <ArrowLeft size={24} color={Colors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Safe Zones</Text>
        <Pressable style={styles.addButton} onPress={() => setShowAddForm(true)}>
          <Plus size={24} color={Colors.primary} />
        </Pressable>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {safeZones.length === 0 ? (
          <View style={styles.emptyState}>
            <Shield size={48} color={Colors.textLight} />
            <Text style={styles.emptyTitle}>No Safe Zones</Text>
            <Text style={styles.emptySubtitle}>
              Create safe zones to get notified when your child enters or leaves specific areas
            </Text>
            <Pressable style={styles.emptyButton} onPress={() => setShowAddForm(true)}>
              <Plus size={20} color="#FFFFFF" />
              <Text style={styles.emptyButtonText}>Add First Safe Zone</Text>
            </Pressable>
          </View>
        ) : (
          safeZones.map((zone) => (
            <View key={zone.id} style={styles.zoneCard}>
              <View style={styles.zoneHeader}>
                <View style={styles.zoneInfo}>
                  <Text style={styles.zoneName}>{zone.name}</Text>
                  <Text style={styles.zoneDetails}>
                    {zone.latitude.toFixed(4)}, {zone.longitude.toFixed(4)} • {zone.radius}m radius
                  </Text>
                  <Text style={styles.zoneNotifications}>
                    Notifications: {zone.notifications.onEntry ? 'Entry' : ''} 
                    {zone.notifications.onEntry && zone.notifications.onExit ? ' & ' : ''}
                    {zone.notifications.onExit ? 'Exit' : ''}
                  </Text>
                </View>
                
                <Pressable
                  style={styles.toggleButton}
                  onPress={() => handleToggleActive(zone)}
                >
                  {zone.isActive ? (
                    <ToggleRight size={32} color={Colors.success} />
                  ) : (
                    <ToggleLeft size={32} color={Colors.textLight} />
                  )}
                </Pressable>
              </View>

              <View style={styles.zoneActions}>
                <Pressable
                  style={styles.actionButton}
                  onPress={() => handleEdit(zone)}
                >
                  <Edit size={16} color={Colors.primary} />
                  <Text style={styles.actionButtonText}>Edit</Text>
                </Pressable>

                <Pressable
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDelete(zone)}
                >
                  <Trash2 size={16} color={Colors.error} />
                  <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
                </Pressable>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

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
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  addButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  zoneCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  zoneHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  zoneInfo: {
    flex: 1,
  },
  zoneName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  zoneDetails: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 2,
  },
  zoneNotifications: {
    fontSize: 12,
    color: Colors.textLight,
  },
  toggleButton: {
    padding: 4,
  },
  zoneActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
  },
  deleteButton: {
    backgroundColor: '#FFF5F5',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  deleteButtonText: {
    color: Colors.error,
  },
  form: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  locationInputs: {
    flexDirection: 'row',
    gap: 8,
  },
  coordinateInput: {
    flex: 1,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  locationButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  helperText: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 4,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  toggleLabel: {
    fontSize: 16,
    color: Colors.text,
  },
  actions: {
    gap: 12,
    paddingBottom: 24,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SafeZoneManagement;
