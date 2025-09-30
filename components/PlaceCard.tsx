import React from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import { Place } from "@/types/navigation";
import Colors from "@/constants/colors";
import { Home, School, BookOpen, Trees, Store, Utensils, Users, Heart, MapPin } from "lucide-react-native";

type PlaceCardProps = {
  place: Place;
  onPress: (place: Place) => void;
};

const PlaceCard: React.FC<PlaceCardProps> = ({ place, onPress }) => {
  const getIcon = () => {
    switch (place.category) {
      case "home":
        return <Home size={24} color={Colors.primary} />;
      case "school":
        return <School size={24} color={Colors.primary} />;
      case "library":
        return <BookOpen size={24} color={Colors.primary} />;
      case "park":
        return <Trees size={24} color={Colors.primary} />;
      case "store":
        return <Store size={24} color={Colors.primary} />;
      case "restaurant":
        return <Utensils size={24} color={Colors.primary} />;
      case "friend":
        return <Users size={24} color={Colors.primary} />;
      case "family":
        return <Heart size={24} color={Colors.primary} />;
      default:
        return <MapPin size={24} color={Colors.primary} />;
    }
  };

  return (
    <Pressable 
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed
      ]}
      onPress={() => onPress(place)}
    >
      <View style={styles.iconContainer}>
        {getIcon()}
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.name}>{place.name}</Text>
        <Text style={styles.address} numberOfLines={1}>{place.address}</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  pressed: {
    opacity: 0.8,
    backgroundColor: "#EAEAEA",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 4,
  },
  address: {
    fontSize: 14,
    color: Colors.textLight,
  },
});

export default PlaceCard;
