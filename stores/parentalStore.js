import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
const DEFAULT_EMERGENCY_CONTACTS = [
    {
        id: 'emergency_911',
        name: 'Emergency Services',
        phone: '911',
        relationship: 'Emergency',
        isPrimary: false,
        canReceiveAlerts: false,
    },
];
const DEFAULT_SETTINGS = {
    requirePinForParentMode: true,
    parentPin: undefined,
    allowChildCategoryCreation: true,
    requireApprovalForCategories: true,
    maxCustomCategories: 20,
    safeZoneAlerts: true,
    checkInReminders: true,
    emergencyContacts: DEFAULT_EMERGENCY_CONTACTS,
};
const STORAGE_KEYS = {
    SETTINGS: 'kidmap_parental_settings',
    SAFE_ZONES: 'kidmap_safe_zones',
    CHECK_IN_REQUESTS: 'kidmap_check_in_requests',
    DASHBOARD_DATA: 'kidmap_dashboard_data',
    DEVICE_PINGS: 'kidmap_device_pings',
};
export const [ParentalProvider, useParentalStore] = createContextHook(() => {
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [safeZones, setSafeZones] = useState([]);
    const [checkInRequests, setCheckInRequests] = useState([]);
    const [dashboardData, setDashboardData] = useState({
        recentCheckIns: [],
        pendingCategoryApprovals: [],
        safeZoneActivity: [],
    });
    const [devicePings, setDevicePings] = useState([]);
    const [isParentMode, setIsParentMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    // Load data from storage
    useEffect(() => {
        const loadData = async () => {
            try {
                const [storedSettings, storedSafeZones, storedCheckInRequests, storedDashboardData, storedDevicePings,] = await Promise.all([
                    AsyncStorage.getItem(STORAGE_KEYS.SETTINGS),
                    AsyncStorage.getItem(STORAGE_KEYS.SAFE_ZONES),
                    AsyncStorage.getItem(STORAGE_KEYS.CHECK_IN_REQUESTS),
                    AsyncStorage.getItem(STORAGE_KEYS.DASHBOARD_DATA),
                    AsyncStorage.getItem(STORAGE_KEYS.DEVICE_PINGS),
                ]);
                if (storedSettings) {
                    setSettings(JSON.parse(storedSettings));
                }
                if (storedSafeZones) {
                    setSafeZones(JSON.parse(storedSafeZones));
                }
                if (storedCheckInRequests) {
                    setCheckInRequests(JSON.parse(storedCheckInRequests));
                }
                if (storedDashboardData) {
                    setDashboardData(JSON.parse(storedDashboardData));
                }
                if (storedDevicePings) {
                    setDevicePings(JSON.parse(storedDevicePings));
                }
            }
            catch (error) {
                console.error('Failed to load parental data:', error);
            }
            finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);
    // Save functions
    const saveSettings = async (newSettings) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(newSettings));
            setSettings(newSettings);
        }
        catch (error) {
            console.error('Failed to save settings:', error);
        }
    };
    const saveSafeZones = async (newSafeZones) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEYS.SAFE_ZONES, JSON.stringify(newSafeZones));
            setSafeZones(newSafeZones);
        }
        catch (error) {
            console.error('Failed to save safe zones:', error);
        }
    };
    const saveCheckInRequests = async (newRequests) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEYS.CHECK_IN_REQUESTS, JSON.stringify(newRequests));
            setCheckInRequests(newRequests);
        }
        catch (error) {
            console.error('Failed to save check-in requests:', error);
        }
    };
    const saveDashboardData = async (newData) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEYS.DASHBOARD_DATA, JSON.stringify(newData));
            setDashboardData(newData);
        }
        catch (error) {
            console.error('Failed to save dashboard data:', error);
        }
    };
    const saveDevicePings = async (newPings) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEYS.DEVICE_PINGS, JSON.stringify(newPings));
            setDevicePings(newPings);
        }
        catch (error) {
            console.error('Failed to save device pings:', error);
        }
    };
    // Parent mode authentication
    const authenticateParentMode = async (pin) => {
        if (!settings.requirePinForParentMode) {
            setIsParentMode(true);
            return true;
        }
        if (settings.parentPin === pin) {
            setIsParentMode(true);
            return true;
        }
        return false;
    };
    const exitParentMode = () => {
        setIsParentMode(false);
    };
    const setParentPin = async (pin) => {
        const newSettings = { ...settings, parentPin: pin };
        await saveSettings(newSettings);
    };
    // Safe zone management
    const addSafeZone = async (safeZone) => {
        const newSafeZone = {
            ...safeZone,
            id: `safe_zone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: Date.now(),
        };
        const updatedSafeZones = [...safeZones, newSafeZone];
        await saveSafeZones(updatedSafeZones);
        return newSafeZone;
    };
    const updateSafeZone = async (id, updates) => {
        const updatedSafeZones = safeZones.map(zone => zone.id === id ? { ...zone, ...updates } : zone);
        await saveSafeZones(updatedSafeZones);
    };
    const deleteSafeZone = async (id) => {
        const updatedSafeZones = safeZones.filter(zone => zone.id !== id);
        await saveSafeZones(updatedSafeZones);
    };
    // Check-in request management
    const requestCheckIn = async (message, isUrgent = false) => {
        const newRequest = {
            id: `check_in_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            childId: 'current_child', // In a real app, this would be the actual child ID
            requestedAt: Date.now(),
            message,
            isUrgent,
            status: 'pending',
        };
        const updatedRequests = [...checkInRequests, newRequest];
        await saveCheckInRequests(updatedRequests);
        return newRequest;
    };
    const completeCheckIn = async (requestId, location) => {
        const updatedRequests = checkInRequests.map(request => request.id === requestId
            ? { ...request, status: 'completed', completedAt: Date.now(), location }
            : request);
        await saveCheckInRequests(updatedRequests);
    };
    // Emergency contact management
    const addEmergencyContact = async (contact) => {
        const newContact = {
            ...contact,
            id: `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        };
        const updatedContacts = [...settings.emergencyContacts, newContact];
        const newSettings = { ...settings, emergencyContacts: updatedContacts };
        await saveSettings(newSettings);
        return newContact;
    };
    const updateEmergencyContact = async (id, updates) => {
        const updatedContacts = settings.emergencyContacts.map(contact => contact.id === id ? { ...contact, ...updates } : contact);
        const newSettings = { ...settings, emergencyContacts: updatedContacts };
        await saveSettings(newSettings);
    };
    const deleteEmergencyContact = async (id) => {
        const updatedContacts = settings.emergencyContacts.filter(contact => contact.id !== id);
        const newSettings = { ...settings, emergencyContacts: updatedContacts };
        await saveSettings(newSettings);
    };
    // Device ping management
    const sendDevicePing = async (type, message) => {
        const newPing = {
            id: `ping_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type,
            message,
            requestedAt: Date.now(),
            status: 'pending',
        };
        const updatedPings = [...devicePings, newPing];
        await saveDevicePings(updatedPings);
        return newPing;
    };
    const acknowledgePing = async (pingId, location) => {
        const updatedPings = devicePings.map(ping => ping.id === pingId
            ? {
                ...ping,
                status: 'acknowledged',
                response: {
                    timestamp: Date.now(),
                    location,
                },
            }
            : ping);
        await saveDevicePings(updatedPings);
    };
    // Dashboard data management
    const addCheckInToDashboard = (checkIn) => {
        const updatedData = {
            ...dashboardData,
            recentCheckIns: [checkIn, ...dashboardData.recentCheckIns].slice(0, 10), // Keep last 10
        };
        saveDashboardData(updatedData);
    };
    const updateLastKnownLocation = (location) => {
        const updatedData = {
            ...dashboardData,
            lastKnownLocation: location,
        };
        saveDashboardData(updatedData);
    };
    return {
        // State
        settings,
        safeZones,
        checkInRequests,
        dashboardData,
        devicePings,
        isParentMode,
        isLoading,
        // Authentication
        authenticateParentMode,
        exitParentMode,
        setParentPin,
        // Settings
        saveSettings,
        // Safe zones
        addSafeZone,
        updateSafeZone,
        deleteSafeZone,
        // Check-ins
        requestCheckIn,
        completeCheckIn,
        // Emergency contacts
        addEmergencyContact,
        updateEmergencyContact,
        deleteEmergencyContact,
        // Device pings
        sendDevicePing,
        acknowledgePing,
        // Dashboard
        addCheckInToDashboard,
        updateLastKnownLocation,
        saveDashboardData,
    };
});
