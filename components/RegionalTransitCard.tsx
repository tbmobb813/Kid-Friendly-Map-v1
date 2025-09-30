import React from "react";
import { StyleSheet, Text, View, FlatList } from "react-native";
import Colors from "@/constants/colors";
import { useRegionStore } from "@/stores/regionStore";
import TransitStepIndicator from "./TransitStepIndicator";
import { Train, Bus, Navigation, Ship } from "lucide-react-native";

const RegionalTransitCard: React.FC = () => {
  const { currentRegion, getCurrentTransitSystems } = useRegionStore();
  const transitSystems = getCurrentTransitSystems();

  const getTransitIcon = (type: string) => {
    switch (type) {
      case "subway":
      case "train":
        return <Train size={20} color="#FFFFFF" />;
      case "bus":
        return <Bus size={20} color="#FFFFFF" />;
      case "tram":
        return <Navigation size={20} color="#FFFFFF" />;
      case "ferry":
        return <Ship size={20} color="#FFFFFF" />;
      default:
        return <Train size={20} color="#FFFFFF" />;
    }
  };

  const renderTransitSystem = ({ item }: { item: typeof transitSystems[0] }) => (
    <View style={styles.transitItem}>
      <View style={[styles.transitIcon, { backgroundColor: item.color }]}>
        {getTransitIcon(item.type)}
      </View>
      <View style={styles.transitInfo}>
        <Text style={styles.transitName}>{item.name}</Text>
        <Text style={styles.transitType}>
          {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
          {item.routes && ` • ${item.routes.length} lines`}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Transit Systems in {currentRegion.name}</Text>
        <Text style={styles.subtitle}>{currentRegion.country}</Text>
      </View>

      <FlatList
        data={transitSystems}
        renderItem={renderTransitSystem}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        contentContainerStyle={styles.transitList}
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Emergency: {currentRegion.emergencyNumber}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    margin: 16,
  },
  header: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textLight,
  },
  transitList: {
    gap: 12,
  },
  transitItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  transitIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  transitInfo: {
    flex: 1,
  },
  transitName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 2,
  },
  transitType: {
    fontSize: 12,
    color: Colors.textLight,
  },
  footer: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  footerText: {
    fontSize: 14,
    color: Colors.error,
    fontWeight: "600",
    textAlign: "center",
  },
});

export default RegionalTransitCard;
