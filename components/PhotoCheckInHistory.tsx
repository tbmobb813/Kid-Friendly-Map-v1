import React from "react";
import { StyleSheet, Text, View, ScrollView, Image } from "react-native";
import { useNavigationStore } from "@/stores/navigationStore";
import Colors from "@/constants/colors";
import { CheckCircle, XCircle, MapPin, Clock } from "lucide-react-native";
import { formatDistance, getLocationAccuracyDescription } from "@/utils/locationUtils";

const PhotoCheckInHistory: React.FC = () => {
  const { photoCheckIns } = useNavigationStore();

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (photoCheckIns.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MapPin size={40} color={Colors.textLight} />
        <Text style={styles.emptyText}>No check-ins yet</Text>
        <Text style={styles.emptySubtext}>
          Take a photo check-in when you arrive at your destination!
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Photo Check-in History</Text>
      
      {photoCheckIns.map((checkIn) => (
        <View key={checkIn.id} style={styles.checkInCard}>
          <View style={styles.cardHeader}>
            <View style={styles.headerLeft}>
              <Text style={styles.placeName}>{checkIn.placeName}</Text>
              <View style={styles.timestampRow}>
                <Clock size={14} color={Colors.textLight} />
                <Text style={styles.timestamp}>
                  {formatTimestamp(checkIn.timestamp)}
                </Text>
              </View>
            </View>
            
            {checkIn.isLocationVerified !== undefined && (
              <View style={[
                styles.verificationBadge,
                checkIn.isLocationVerified ? styles.verifiedBadge : styles.unverifiedBadge
              ]}>
                {checkIn.isLocationVerified ? (
                  <CheckCircle size={16} color="#10B981" />
                ) : (
                  <XCircle size={16} color="#EF4444" />
                )}
                <Text style={[
                  styles.verificationText,
                  checkIn.isLocationVerified ? styles.verifiedText : styles.unverifiedText
                ]}>
                  {checkIn.isLocationVerified ? "Verified" : "Unverified"}
                </Text>
              </View>
            )}
          </View>

          <Image source={{ uri: checkIn.photoUrl }} style={styles.photo} />
          
          {checkIn.notes && (
            <Text style={styles.notes}>{checkIn.notes}</Text>
          )}
          
          {checkIn.distanceFromPlace !== undefined && (
            <View style={styles.locationInfo}>
              <MapPin size={14} color={Colors.textLight} />
              <Text style={styles.locationText}>
                {getLocationAccuracyDescription(checkIn.distanceFromPlace)} 
                ({formatDistance(checkIn.distanceFromPlace)} from destination)
              </Text>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: "center",
    lineHeight: 20,
  },
  checkInCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
  },
  placeName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 4,
  },
  timestampRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timestamp: {
    fontSize: 12,
    color: Colors.textLight,
  },
  verificationBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  verifiedBadge: {
    backgroundColor: "#DCFCE7",
  },
  unverifiedBadge: {
    backgroundColor: "#FEE2E2",
  },
  verificationText: {
    fontSize: 12,
    fontWeight: "600",
  },
  verifiedText: {
    color: "#10B981",
  },
  unverifiedText: {
    color: "#EF4444",
  },
  photo: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  notes: {
    fontSize: 14,
    color: Colors.text,
    fontStyle: "italic",
    marginBottom: 8,
  },
  locationInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    color: Colors.textLight,
  },
});

export default PhotoCheckInHistory;
