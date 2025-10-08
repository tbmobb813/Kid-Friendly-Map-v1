/**
 * ORS and OTP2 Routing Demo Component
 * Demonstrates comprehensive routing capabilities
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { orsService } from '../utils/orsService';
import { otp2Service } from '../utils/otp2Service';
import { unifiedRoutingService, UnifiedRoute } from '../utils/unifiedRoutingService';
import { monitoring } from '../utils/monitoring';

interface Location {
  lat: number;
  lng: number;
  name: string;
}

export default function RoutingDemo() {
  const [fromLocation, setFromLocation] = useState<Location>({
    lat: 40.7128,
    lng: -74.006,
    name: 'New York City Hall',
  });

  const [toLocation, setToLocation] = useState<Location>({
    lat: 40.7505,
    lng: -73.9934,
    name: 'Times Square',
  });

  const [childAge, setChildAge] = useState<string>('8');
  const [wheelchair, setWheelchair] = useState(false);
  const [prioritizeSafety, setPrioritizeSafety] = useState(true);

  const [routes, setRoutes] = useState<UnifiedRoute[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedModes, setSelectedModes] = useState<string[]>(['WALK', 'TRANSIT']);

  useEffect(() => {
    monitoring.trackUserAction({
      action: 'screen_view',
      screen: 'routing_demo',
    });
  }, []);

  const modes = [
    { id: 'WALK', label: 'Walking', icon: '🚶' },
    { id: 'BIKE', label: 'Cycling', icon: '🚴' },
    { id: 'TRANSIT', label: 'Transit', icon: '🚌' },
    { id: 'CAR', label: 'Driving', icon: '🚗' },
  ];

  const testLocations = [
    {
      name: 'NYC: City Hall → Times Square',
      from: { lat: 40.7128, lng: -74.006, name: 'NYC City Hall' },
      to: { lat: 40.7505, lng: -73.9934, name: 'Times Square' },
    },
    {
      name: 'NYC: Central Park → Brooklyn Bridge',
      from: { lat: 40.7829, lng: -73.9654, name: 'Central Park' },
      to: { lat: 40.7061, lng: -73.9969, name: 'Brooklyn Bridge' },
    },
    {
      name: 'SF: Union Square → Golden Gate',
      from: { lat: 37.7879, lng: -122.4075, name: 'Union Square' },
      to: { lat: 37.8199, lng: -122.4783, name: 'Golden Gate Bridge' },
    },
  ];

  const handleFindRoutes = async () => {
    if (!fromLocation.lat || !toLocation.lat) {
      Alert.alert('Error', 'Please enter valid locations');
      return;
    }

    setLoading(true);
    monitoring.trackUserAction({
      action: 'find_routes',
      screen: 'routing_demo',
      metadata: {
        modes: selectedModes,
        childAge: parseInt(childAge) || undefined,
        wheelchair,
        prioritizeSafety,
      },
    });

    try {
      const routeRequest = {
        from: fromLocation,
        to: toLocation,
        preferences: {
          modes: selectedModes as ('WALK' | 'BIKE' | 'TRANSIT' | 'CAR')[],
          childAge: parseInt(childAge) || undefined,
          wheelchair,
          prioritizeSafety,
          maxWalkDistance: 800,
          maxTransfers: 2,
        },
      };

      const foundRoutes = await unifiedRoutingService.getRoutes(routeRequest);
      setRoutes(foundRoutes);

      if (foundRoutes.length === 0) {
        Alert.alert('No Routes', 'No routes found for the selected criteria');
      }
    } catch (error) {
      console.error('Route finding error:', error);
      Alert.alert('Error', 'Failed to find routes. Please try again.');

      monitoring.captureError({
        error: error as Error,
        context: 'Routing Demo - Find Routes',
        severity: 'medium',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestORS = async () => {
    setLoading(true);
    monitoring.trackUserAction({
      action: 'test_ors',
      screen: 'routing_demo',
    });

    try {
      const coordinates: [number, number][] = [
        [fromLocation.lng, fromLocation.lat],
        [toLocation.lng, toLocation.lat],
      ];

      if (parseInt(childAge) > 0) {
        const route = await orsService.getKidFriendlyRoute(coordinates, parseInt(childAge));
        Alert.alert(
          'ORS Kid-Friendly Route',
          `Found route: ${Math.round(route.routes[0].summary.duration / 60)} min, ${Math.round(
            route.routes[0].summary.distance,
          )} m`,
        );
      } else {
        const route = await orsService.getRoute({
          coordinates,
          profile: 'foot-walking',
          geometry: true,
          instructions: true,
        });
        Alert.alert(
          'ORS Walking Route',
          `Found route: ${Math.round(route.routes[0].summary.duration / 60)} min, ${Math.round(
            route.routes[0].summary.distance,
          )} m`,
        );
      }
    } catch (error) {
      console.error('ORS test error:', error);
      Alert.alert('ORS Error', 'Failed to test ORS. Check configuration and API key.');
    } finally {
      setLoading(false);
    }
  };

  const handleTestOTP2 = async () => {
    setLoading(true);
    monitoring.trackUserAction({
      action: 'test_otp2',
      screen: 'routing_demo',
    });

    try {
      const fromPlace = `${fromLocation.lat},${fromLocation.lng}`;
      const toPlace = `${toLocation.lat},${toLocation.lng}`;

      if (parseInt(childAge) > 0) {
        const plan = await otp2Service.getKidFriendlyTrip(fromPlace, toPlace, parseInt(childAge));
        if (plan.plan?.itineraries?.length > 0) {
          const itinerary = plan.plan.itineraries[0];
          Alert.alert(
            'OTP2 Kid-Friendly Transit',
            `Found route: ${Math.round(itinerary.duration / 60)} min, ${
              itinerary.transfers
            } transfers`,
          );
        } else {
          Alert.alert('OTP2', 'No transit routes found');
        }
      } else {
        const plan = await otp2Service.planTrip({
          fromPlace,
          toPlace,
          mode: 'TRANSIT,WALK',
        });
        if (plan.plan?.itineraries?.length > 0) {
          const itinerary = plan.plan.itineraries[0];
          Alert.alert(
            'OTP2 Transit Plan',
            `Found route: ${Math.round(itinerary.duration / 60)} min, ${
              itinerary.transfers
            } transfers`,
          );
        } else {
          Alert.alert('OTP2', 'No transit routes found');
        }
      }
    } catch (error) {
      console.error('OTP2 test error:', error);
      Alert.alert('OTP2 Error', 'Failed to test OTP2. Check server configuration.');
    } finally {
      setLoading(false);
    }
  };

  const renderRouteCard = (route: UnifiedRoute, index: number) => (
    <View key={route.id} style={styles.routeCard}>
      <View style={styles.routeHeader}>
        <Text style={styles.routeTitle}>
          {route.type.charAt(0).toUpperCase() + route.type.slice(1)} Route {index + 1}
        </Text>
        <Text style={styles.routeSource}>{route.source}</Text>
      </View>

      <Text style={styles.routeDescription}>{route.description}</Text>

      <View style={styles.routeStats}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Duration</Text>
          <Text style={styles.statValue}>{route.summary.duration} min</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Distance</Text>
          <Text style={styles.statValue}>
            {Math.round((route.summary.distance / 1000) * 10) / 10} km
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Safety</Text>
          <Text style={styles.statValue}>{route.safetyScore}/100</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Kid-Friendly</Text>
          <Text style={styles.statValue}>{route.kidFriendlyScore}/100</Text>
        </View>
      </View>

      {route.summary.transfers !== undefined && (
        <Text style={styles.transferInfo}>Transfers: {route.summary.transfers}</Text>
      )}

      {route.alerts && route.alerts.length > 0 && (
        <View style={styles.alertsContainer}>
          <Text style={styles.alertsTitle}>Alerts:</Text>
          {route.alerts.slice(0, 2).map((alert, i) => (
            <Text key={i} style={styles.alertText}>
              • {alert}
            </Text>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🗺️ ORS + OTP2 Routing Demo</Text>

      {/* Quick Test Locations */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Test Locations</Text>
        {testLocations.map((location, index) => (
          <TouchableOpacity
            key={index}
            style={styles.testLocationButton}
            onPress={() => {
              setFromLocation(location.from);
              setToLocation(location.to);
            }}
          >
            <Text style={styles.testLocationText}>{location.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* From Location */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>From Location</Text>
        <View style={styles.locationInputs}>
          <TextInput
            style={styles.input}
            placeholder="Latitude"
            value={fromLocation.lat.toString()}
            onChangeText={(text) =>
              setFromLocation((prev) => ({ ...prev, lat: parseFloat(text) || 0 }))
            }
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Longitude"
            value={fromLocation.lng.toString()}
            onChangeText={(text) =>
              setFromLocation((prev) => ({ ...prev, lng: parseFloat(text) || 0 }))
            }
            keyboardType="numeric"
          />
        </View>
        <TextInput
          style={styles.input}
          placeholder="Location Name"
          value={fromLocation.name}
          onChangeText={(text) => setFromLocation((prev) => ({ ...prev, name: text }))}
        />
      </View>

      {/* To Location */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>To Location</Text>
        <View style={styles.locationInputs}>
          <TextInput
            style={styles.input}
            placeholder="Latitude"
            value={toLocation.lat.toString()}
            onChangeText={(text) =>
              setToLocation((prev) => ({ ...prev, lat: parseFloat(text) || 0 }))
            }
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Longitude"
            value={toLocation.lng.toString()}
            onChangeText={(text) =>
              setToLocation((prev) => ({ ...prev, lng: parseFloat(text) || 0 }))
            }
            keyboardType="numeric"
          />
        </View>
        <TextInput
          style={styles.input}
          placeholder="Location Name"
          value={toLocation.name}
          onChangeText={(text) => setToLocation((prev) => ({ ...prev, name: text }))}
        />
      </View>

      {/* Transport Modes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Transport Modes</Text>
        <View style={styles.modesContainer}>
          {modes.map((mode) => (
            <TouchableOpacity
              key={mode.id}
              style={[
                styles.modeButton,
                selectedModes.includes(mode.id) && styles.modeButtonSelected,
              ]}
              onPress={() => {
                if (selectedModes.includes(mode.id)) {
                  setSelectedModes((prev) => prev.filter((m) => m !== mode.id));
                } else {
                  setSelectedModes((prev) => [...prev, mode.id]);
                }
              }}
            >
              <Text style={styles.modeIcon}>{mode.icon}</Text>
              <Text
                style={[
                  styles.modeLabel,
                  selectedModes.includes(mode.id) && styles.modeLabelSelected,
                ]}
              >
                {mode.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Preferences */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>

        <View style={styles.preferenceRow}>
          <Text style={styles.preferenceLabel}>Child Age (0 for adult)</Text>
          <TextInput
            style={styles.ageInput}
            value={childAge}
            onChangeText={setChildAge}
            keyboardType="numeric"
            placeholder="8"
          />
        </View>

        <TouchableOpacity style={styles.checkboxRow} onPress={() => setWheelchair(!wheelchair)}>
          <View style={[styles.checkbox, wheelchair && styles.checkboxChecked]}>
            {wheelchair && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>Wheelchair Accessible</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => setPrioritizeSafety(!prioritizeSafety)}
        >
          <View style={[styles.checkbox, prioritizeSafety && styles.checkboxChecked]}>
            {prioritizeSafety && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>Prioritize Safety</Text>
        </TouchableOpacity>
      </View>

      {/* Action Buttons */}
      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.actionButton, styles.primaryButton]}
          onPress={handleFindRoutes}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.actionButtonText}>🔍 Find All Routes</Text>
          )}
        </TouchableOpacity>

        <View style={styles.testButtonsRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={handleTestORS}
            disabled={loading}
          >
            <Text style={styles.secondaryButtonText}>Test ORS</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={handleTestOTP2}
            disabled={loading}
          >
            <Text style={styles.secondaryButtonText}>Test OTP2</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Results */}
      {routes.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Found Routes ({routes.length})</Text>
          {routes.map((route, index) => renderRouteCard(route, index))}
        </View>
      )}

      {/* Configuration Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Configuration</Text>
        <View style={styles.configInfo}>
          <Text style={styles.configText}>
            ORS Base URL: {process.env.ORS_BASE_URL || 'https://api.openrouteservice.org'}
          </Text>
          <Text style={styles.configText}>
            ORS API Key: {process.env.ORS_API_KEY ? '✓ Configured' : '⚠️ Missing'}
          </Text>
          <Text style={styles.configText}>
            OTP2 Base URL: {process.env.OTP2_BASE_URL || 'http://localhost:8080'}
          </Text>
          <Text style={styles.configText}>
            OTP2 Router ID: {process.env.OTP2_ROUTER_ID || 'default'}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  testLocationButton: {
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  testLocationText: {
    color: '#1976d2',
    fontWeight: '500',
  },
  locationInputs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fafafa',
  },
  modesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fafafa',
    minWidth: 100,
  },
  modeButtonSelected: {
    backgroundColor: '#e3f2fd',
    borderColor: '#1976d2',
  },
  modeIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  modeLabel: {
    color: '#666',
  },
  modeLabelSelected: {
    color: '#1976d2',
    fontWeight: '500',
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  preferenceLabel: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  ageInput: {
    width: 60,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 8,
    textAlign: 'center',
    backgroundColor: '#fafafa',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#4caf50',
    borderColor: '#4caf50',
  },
  checkmark: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333',
  },
  actionButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#1976d2',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  testButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  secondaryButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  routeCard: {
    backgroundColor: '#fafafa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  routeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  routeSource: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  routeDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  routeStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statItem: {
    flex: 1,
    minWidth: 80,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  transferInfo: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  alertsContainer: {
    marginTop: 12,
    padding: 8,
    backgroundColor: '#fff3cd',
    borderRadius: 4,
  },
  alertsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 4,
  },
  alertText: {
    fontSize: 12,
    color: '#856404',
  },
  configInfo: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 6,
  },
  configText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
});
