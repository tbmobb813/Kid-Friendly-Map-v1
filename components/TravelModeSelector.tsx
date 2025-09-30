import React from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import { TravelMode } from "@/types/navigation";
import Colors from "@/constants/colors";
import { Train, Car, Bike, MapPin } from "lucide-react-native";

type TravelModeSelectorProps = {
  selectedMode: TravelMode;
  onModeChange: (mode: TravelMode) => void;
};

const TravelModeSelector: React.FC<TravelModeSelectorProps> = ({ selectedMode, onModeChange }) => {
  const modes: { mode: TravelMode; icon: React.ReactNode; label: string }[] = [
    { mode: "transit", icon: <Train size={20} />, label: "Transit" },
    { mode: "walking", icon: <MapPin size={20} />, label: "Walk" },
    { mode: "biking", icon: <Bike size={20} />, label: "Bike" },
    { mode: "driving", icon: <Car size={20} />, label: "Drive" },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Travel Mode</Text>
      <View style={styles.modesContainer}>
        {modes.map(({ mode, icon, label }) => {
          const isSelected = selectedMode === mode;
          return (
            <Pressable
              key={mode}
              style={[styles.modeButton, isSelected && styles.selectedMode]}
              onPress={() => onModeChange(mode)}
            >
              <View style={[styles.iconContainer, isSelected && styles.selectedIcon]}>
                {React.cloneElement(icon as React.ReactElement<{ color?: string }>, {
                  color: isSelected ? "#FFFFFF" : Colors.textLight,
                })}
              </View>
              <Text style={[styles.modeLabel, isSelected && styles.selectedLabel]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 12,
  },
  modesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  modeButton: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectedMode: {
    borderColor: Colors.primary,
    backgroundColor: "#F0F4FF",
  },
  iconContainer: {
    marginBottom: 4,
  },
  selectedIcon: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 4,
  },
  modeLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: Colors.textLight,
  },
  selectedLabel: {
    color: Colors.primary,
    fontWeight: "600",
  },
});

export default TravelModeSelector;
