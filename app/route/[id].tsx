import React, { useState } from "react";
import { StyleSheet, Text, View, ScrollView, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Colors from "@/constants/colors";
import DirectionStep from "@/components/DirectionStep";
import MapPlaceholder from "@/components/MapPlaceholder";
import SafetyPanel from "@/components/SafetyPanel";
import { useNavigationStore } from "@/stores/navigationStore";
import { Clock, Navigation, MapPin } from "lucide-react-native";
import VoiceNavigation from "@/components/VoiceNavigation";
import FunFactCard from "@/components/FunFactCard";
import { getRandomFunFact } from "@/mocks/funFacts";
import useLocation from "@/hooks/useLocation";

export default function RouteDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { location } = useLocation();
  
  const { 
    origin,
    destination,
    availableRoutes,
    selectedRoute
  } = useNavigationStore();

  // Find the route by ID
  const route = selectedRoute?.id === id 
    ? selectedRoute 
    : availableRoutes.find(r => r.id === id);

  const [showFunFact, setShowFunFact] = useState(true);
  const [currentFunFact] = useState(getRandomFunFact("subway"));

  if (!route || !origin || !destination) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Route not found</Text>
        <Pressable 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <MapPlaceholder 
        message={`Map showing route from ${origin.name} to ${destination.name}`} 
      />
      
      <VoiceNavigation 
        currentStep={route.steps[0]?.from ? `${route.steps[0].type === 'walk' ? 'Walk' : 'Take'} from ${route.steps[0].from} to ${route.steps[0].to}` : "Starting your journey"}
      />

      <SafetyPanel 
        currentLocation={location} 
        currentPlace={destination ? {
          id: destination.id,
          name: destination.name
        } : undefined}
      />

      {showFunFact && (
        <FunFactCard 
          fact={currentFunFact}
          location="Transit System"
          onDismiss={() => setShowFunFact(false)}
        />
      )}
      
      <View style={styles.contentContainer}>
        <View style={styles.routeSummary}>
          <View style={styles.locationContainer}>
            <View style={styles.locationRow}>
              <View style={[styles.locationPin, styles.originPin]}>
                <Navigation size={16} color="#FFFFFF" />
              </View>
              <Text style={styles.locationText} numberOfLines={1}>
                {origin.name}
              </Text>
            </View>
            
            <View style={styles.locationConnector} />
            
            <View style={styles.locationRow}>
              <View style={[styles.locationPin, styles.destinationPin]}>
                <MapPin size={16} color="#FFFFFF" />
              </View>
              <Text style={styles.locationText} numberOfLines={1}>
                {destination.name}
              </Text>
            </View>
          </View>
          
          <View style={styles.timeInfo}>
            <Text style={styles.duration}>{route.totalDuration} min</Text>
            <View style={styles.timeRow}>
              <Clock size={14} color={Colors.textLight} style={styles.clockIcon} />
              <Text style={styles.timeText}>
                {route.departureTime} - {route.arrivalTime}
              </Text>
            </View>
          </View>
        </View>
        
        <Text style={styles.sectionTitle}>Step by Step Directions</Text>
        
        <View style={styles.stepsContainer}>
          {route.steps.map((step, index) => (
            <DirectionStep
              key={step.id}
              step={step}
              isLast={index === route.steps.length - 1}
            />
          ))}
        </View>
        
        <View style={styles.tipContainer}>
          <Text style={styles.tipTitle}>Kid-Friendly Tip</Text>
          <Text style={styles.tipText}>
            Remember to stay with an adult and keep your phone with you at all times!
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: 16,
  },
  routeSummary: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  locationContainer: {
    marginBottom: 16,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  locationPin: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  originPin: {
    backgroundColor: Colors.primary,
  },
  destinationPin: {
    backgroundColor: Colors.secondary,
  },
  locationText: {
    fontSize: 16,
    color: Colors.text,
    flex: 1,
  },
  locationConnector: {
    width: 2,
    height: 24,
    backgroundColor: Colors.border,
    marginLeft: 13,
    marginBottom: 8,
  },
  timeInfo: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 16,
  },
  duration: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 4,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  clockIcon: {
    marginRight: 4,
  },
  timeText: {
    fontSize: 14,
    color: Colors.textLight,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 16,
  },
  stepsContainer: {
    marginBottom: 24,
  },
  tipContainer: {
    backgroundColor: "#F0F4FF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primary,
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  errorText: {
    fontSize: 18,
    color: Colors.text,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
