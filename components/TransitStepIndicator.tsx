import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { TransitStep } from "@/types/navigation";
import Colors from "@/constants/colors";
import { Train, Bus, Navigation, Bike, Car } from "lucide-react-native";

type TransitStepIndicatorProps = {
  step: TransitStep;
  size?: "small" | "medium" | "large";
};

const TransitStepIndicator: React.FC<TransitStepIndicatorProps> = ({ 
  step, 
  size = "medium" 
}) => {
  const getIcon = () => {
    const iconSize = size === "small" ? 14 : size === "medium" ? 18 : 24;
    const iconColor = "#FFFFFF";
    
    switch (step.type) {
      case "subway":
      case "train":
        return <Train size={iconSize} color={iconColor} />;
      case "bus":
        return <Bus size={iconSize} color={iconColor} />;
      case "walk":
        return <Navigation size={iconSize} color={iconColor} />;
      case "bike":
        return <Bike size={iconSize} color={iconColor} />;
      case "car":
        return <Car size={iconSize} color={iconColor} />;
      default:
        return null;
    }
  };

  const getBackgroundColor = () => {
    if (step.color) return step.color;
    
    switch (step.type) {
      case "subway": return Colors.subway;
      case "train": return Colors.train;
      case "bus": return Colors.bus;
      case "walk": return Colors.textLight;
      case "bike": return "#10B981"; // Green for biking
      case "car": return "#6366F1"; // Indigo for driving
      default: return Colors.primary;
    }
  };

  const getDimensionsBySize = () => {
    switch (size) {
      case "small":
        return { width: 24, height: 24, borderRadius: 12, fontSize: 10 };
      case "medium":
        return { width: 32, height: 32, borderRadius: 16, fontSize: 14 };
      case "large":
        return { width: 40, height: 40, borderRadius: 20, fontSize: 18 };
      default:
        return { width: 32, height: 32, borderRadius: 16, fontSize: 14 };
    }
  };

  const dimensions = getDimensionsBySize();

  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor: getBackgroundColor(),
        width: dimensions.width,
        height: dimensions.height,
        borderRadius: dimensions.borderRadius
      }
    ]}>
      {step.line ? (
        <Text style={[styles.lineText, { fontSize: dimensions.fontSize }]}>
          {step.line}
        </Text>
      ) : (
        getIcon()
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  lineText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});

export default TransitStepIndicator;
