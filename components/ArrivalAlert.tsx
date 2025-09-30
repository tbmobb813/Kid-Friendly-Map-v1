import React from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import Colors from "@/constants/colors";
import { Bell, X } from "lucide-react-native";
import TransitStepIndicator from "./TransitStepIndicator";
import { LiveArrival } from "./LiveArrivalsCard";

type ArrivalAlertProps = {
  arrival: LiveArrival;
  onDismiss: () => void;
};

const ArrivalAlert: React.FC<ArrivalAlertProps> = ({ arrival, onDismiss }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Bell size={20} color={Colors.warning} />
        </View>
        
        <View style={styles.alertInfo}>
          <View style={styles.trainInfo}>
            <TransitStepIndicator 
              step={{
                id: arrival.id,
                type: arrival.type,
                line: arrival.line,
                color: arrival.color,
                from: "",
                to: "",
                duration: 0
              }}
              size="small"
            />
            <Text style={styles.alertText}>
              Line {arrival.line} to {arrival.destination} is arriving now!
            </Text>
          </View>
          
          {arrival.platform && (
            <Text style={styles.platformText}>
              Platform {arrival.platform}
            </Text>
          )}
        </View>
        
        <Pressable style={styles.dismissButton} onPress={onDismiss}>
          <X size={16} color={Colors.textLight} />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFF9E6",
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning,
    borderRadius: 8,
    margin: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  iconContainer: {
    marginRight: 12,
  },
  alertInfo: {
    flex: 1,
  },
  trainInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  alertText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    marginLeft: 8,
    flex: 1,
  },
  platformText: {
    fontSize: 12,
    color: Colors.textLight,
    marginLeft: 32,
  },
  dismissButton: {
    padding: 4,
  },
});

export default ArrivalAlert;
