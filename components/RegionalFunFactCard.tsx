import React from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import Colors from "@/constants/colors";
import { Lightbulb, X } from "lucide-react-native";
import { useRegionalData } from "@/hooks/useRegionalData";

type RegionalFunFactCardProps = {
  onDismiss?: () => void;
};

const RegionalFunFactCard: React.FC<RegionalFunFactCardProps> = ({ onDismiss }) => {
  const { regionalContent, currentRegion } = useRegionalData();
  
  // Get a random fun fact from the current region
  const randomFact = regionalContent.funFacts[
    Math.floor(Math.random() * regionalContent.funFacts.length)
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Lightbulb size={20} color={Colors.secondary} />
        </View>
        <Text style={styles.title}>
          Fun Fact about {currentRegion.name}
        </Text>
        {onDismiss && (
          <Pressable style={styles.dismissButton} onPress={onDismiss}>
            <X size={16} color={Colors.textLight} />
          </Pressable>
        )}
      </View>
      
      <Text style={styles.factText}>{randomFact}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F0FFF4",
    borderRadius: 12,
    padding: 16,
    margin: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.secondary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  iconContainer: {
    marginRight: 8,
  },
  title: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
  },
  dismissButton: {
    padding: 4,
  },
  factText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
});

export default RegionalFunFactCard;
