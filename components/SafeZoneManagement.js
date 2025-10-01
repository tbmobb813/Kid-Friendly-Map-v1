import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Alert, TextInput } from 'react-native';
import Colors from '@/constants/colors';
import { Shield, Plus, MapPin, Edit, Trash2, ArrowLeft, ToggleLeft, ToggleRight } from 'lucide-react-native';
import { useParentalStore } from '@/stores/parentalStore';
const SafeZoneManagement = ({ onBack }) => {
    const { safeZones, addSafeZone, updateSafeZone, deleteSafeZone } = useParentalStore();
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingZone, setEditingZone] = useState(null);
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
            }
            else {
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
        }
        catch (error) {
            Alert.alert('Error', 'Failed to save safe zone');
        }
    };
    const handleEdit = (zone) => {
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
    const handleDelete = (zone) => {
        Alert.alert('Delete Safe Zone', `Are you sure you want to delete "${zone.name}"?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: () => deleteSafeZone(zone.id),
            },
        ]);
    };
    const handleToggleActive = (zone) => {
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
        return (_jsxs(View, { style: styles.container, children: [_jsxs(View, { style: styles.header, children: [_jsx(Pressable, { style: styles.backButton, onPress: resetForm, children: _jsx(ArrowLeft, { size: 24, color: Colors.primary }) }), _jsx(Text, { style: styles.headerTitle, children: editingZone ? 'Edit Safe Zone' : 'Add Safe Zone' })] }), _jsxs(ScrollView, { style: styles.content, showsVerticalScrollIndicator: false, children: [_jsxs(View, { style: styles.form, children: [_jsxs(View, { style: styles.inputGroup, children: [_jsx(Text, { style: styles.label, children: "Name" }), _jsx(TextInput, { style: styles.input, value: formData.name, onChangeText: (text) => setFormData(prev => ({ ...prev, name: text })), placeholder: "e.g., Home, School, Grandma's House", placeholderTextColor: Colors.textLight })] }), _jsxs(View, { style: styles.inputGroup, children: [_jsx(Text, { style: styles.label, children: "Location" }), _jsxs(View, { style: styles.locationInputs, children: [_jsx(TextInput, { style: [styles.input, styles.coordinateInput], value: formData.latitude, onChangeText: (text) => setFormData(prev => ({ ...prev, latitude: text })), placeholder: "Latitude", placeholderTextColor: Colors.textLight, keyboardType: "numeric" }), _jsx(TextInput, { style: [styles.input, styles.coordinateInput], value: formData.longitude, onChangeText: (text) => setFormData(prev => ({ ...prev, longitude: text })), placeholder: "Longitude", placeholderTextColor: Colors.textLight, keyboardType: "numeric" })] }), _jsxs(Pressable, { style: styles.locationButton, onPress: getCurrentLocation, children: [_jsx(MapPin, { size: 16, color: Colors.primary }), _jsx(Text, { style: styles.locationButtonText, children: "Use Current Location" })] })] }), _jsxs(View, { style: styles.inputGroup, children: [_jsx(Text, { style: styles.label, children: "Radius (meters)" }), _jsx(TextInput, { style: styles.input, value: formData.radius, onChangeText: (text) => setFormData(prev => ({ ...prev, radius: text })), placeholder: "100", placeholderTextColor: Colors.textLight, keyboardType: "numeric" }), _jsx(Text, { style: styles.helperText, children: "Distance from the center point to trigger notifications (10-1000m)" })] }), _jsxs(View, { style: styles.inputGroup, children: [_jsx(Text, { style: styles.label, children: "Notifications" }), _jsxs(Pressable, { style: styles.toggleRow, onPress: () => setFormData(prev => ({
                                                ...prev,
                                                notifications: {
                                                    ...prev.notifications,
                                                    onEntry: !prev.notifications.onEntry,
                                                },
                                            })), children: [_jsx(Text, { style: styles.toggleLabel, children: "Notify on entry" }), formData.notifications.onEntry ? (_jsx(ToggleRight, { size: 24, color: Colors.primary })) : (_jsx(ToggleLeft, { size: 24, color: Colors.textLight }))] }), _jsxs(Pressable, { style: styles.toggleRow, onPress: () => setFormData(prev => ({
                                                ...prev,
                                                notifications: {
                                                    ...prev.notifications,
                                                    onExit: !prev.notifications.onExit,
                                                },
                                            })), children: [_jsx(Text, { style: styles.toggleLabel, children: "Notify on exit" }), formData.notifications.onExit ? (_jsx(ToggleRight, { size: 24, color: Colors.primary })) : (_jsx(ToggleLeft, { size: 24, color: Colors.textLight }))] })] })] }), _jsxs(View, { style: styles.actions, children: [_jsx(Pressable, { style: styles.saveButton, onPress: handleSave, children: _jsx(Text, { style: styles.saveButtonText, children: editingZone ? 'Update Safe Zone' : 'Create Safe Zone' }) }), _jsx(Pressable, { style: styles.cancelButton, onPress: resetForm, children: _jsx(Text, { style: styles.cancelButtonText, children: "Cancel" }) })] })] })] }));
    }
    return (_jsxs(View, { style: styles.container, children: [_jsxs(View, { style: styles.header, children: [_jsx(Pressable, { style: styles.backButton, onPress: onBack, children: _jsx(ArrowLeft, { size: 24, color: Colors.primary }) }), _jsx(Text, { style: styles.headerTitle, children: "Safe Zones" }), _jsx(Pressable, { style: styles.addButton, onPress: () => setShowAddForm(true), children: _jsx(Plus, { size: 24, color: Colors.primary }) })] }), _jsx(ScrollView, { style: styles.content, showsVerticalScrollIndicator: false, children: safeZones.length === 0 ? (_jsxs(View, { style: styles.emptyState, children: [_jsx(Shield, { size: 48, color: Colors.textLight }), _jsx(Text, { style: styles.emptyTitle, children: "No Safe Zones" }), _jsx(Text, { style: styles.emptySubtitle, children: "Create safe zones to get notified when your child enters or leaves specific areas" }), _jsxs(Pressable, { style: styles.emptyButton, onPress: () => setShowAddForm(true), children: [_jsx(Plus, { size: 20, color: "#FFFFFF" }), _jsx(Text, { style: styles.emptyButtonText, children: "Add First Safe Zone" })] })] })) : (safeZones.map((zone) => (_jsxs(View, { style: styles.zoneCard, children: [_jsxs(View, { style: styles.zoneHeader, children: [_jsxs(View, { style: styles.zoneInfo, children: [_jsx(Text, { style: styles.zoneName, children: zone.name }), _jsxs(Text, { style: styles.zoneDetails, children: [zone.latitude.toFixed(4), ", ", zone.longitude.toFixed(4), " \u2022 ", zone.radius, "m radius"] }), _jsxs(Text, { style: styles.zoneNotifications, children: ["Notifications: ", zone.notifications.onEntry ? 'Entry' : '', zone.notifications.onEntry && zone.notifications.onExit ? ' & ' : '', zone.notifications.onExit ? 'Exit' : ''] })] }), _jsx(Pressable, { style: styles.toggleButton, onPress: () => handleToggleActive(zone), children: zone.isActive ? (_jsx(ToggleRight, { size: 32, color: Colors.success })) : (_jsx(ToggleLeft, { size: 32, color: Colors.textLight })) })] }), _jsxs(View, { style: styles.zoneActions, children: [_jsxs(Pressable, { style: styles.actionButton, onPress: () => handleEdit(zone), children: [_jsx(Edit, { size: 16, color: Colors.primary }), _jsx(Text, { style: styles.actionButtonText, children: "Edit" })] }), _jsxs(Pressable, { style: [styles.actionButton, styles.deleteButton], onPress: () => handleDelete(zone), children: [_jsx(Trash2, { size: 16, color: Colors.error }), _jsx(Text, { style: [styles.actionButtonText, styles.deleteButtonText], children: "Delete" })] })] })] }, zone.id)))) })] }));
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
