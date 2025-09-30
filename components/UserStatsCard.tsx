import React from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import Colors from "@/constants/colors";
import { Trophy, MapPin, Zap, Target } from "lucide-react-native";
import { UserStats } from "@/types/gamification";

type UserStatsCardProps = {
  stats: UserStats;
  onPetClick?: () => void;
};

const UserStatsCard: React.FC<UserStatsCardProps> = ({ stats, onPetClick }) => {
  const getProgressToNextLevel = () => {
    const pointsForCurrentLevel = (stats.level - 1) * 200;
    const pointsForNextLevel = stats.level * 200;
    const progress = (stats.totalPoints - pointsForCurrentLevel) / (pointsForNextLevel - pointsForCurrentLevel);
    return Math.max(0, Math.min(1, progress));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.levelContainer}>
          <Trophy size={24} color={Colors.primary} />
          <Text style={styles.levelText}>Level {stats.level}</Text>
        </View>
        
        <View style={styles.headerRight}>
          <Text style={styles.pointsText}>{stats.totalPoints} points</Text>
          {onPetClick && (
            <Pressable style={styles.petButton} onPress={onPetClick}>
              <Text style={styles.petEmoji}>🐲</Text>
              <Text style={styles.petText}>Pet</Text>
            </Pressable>
          )}
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${getProgressToNextLevel() * 100}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {Math.round(getProgressToNextLevel() * 100)}% to Level {stats.level + 1}
        </Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <MapPin size={20} color={Colors.secondary} />
          <Text style={styles.statNumber}>{stats.totalTrips}</Text>
          <Text style={styles.statLabel}>Trips</Text>
        </View>

        <View style={styles.statItem}>
          <Target size={20} color={Colors.primary} />
          <Text style={styles.statNumber}>{stats.placesVisited}</Text>
          <Text style={styles.statLabel}>Places</Text>
        </View>

        <View style={styles.statItem}>
          <Zap size={20} color={Colors.warning} />
          <Text style={styles.statNumber}>{stats.streakDays}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    margin: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  levelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  levelText: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text,
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  pointsText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primary,
  },
  petButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryLight,
    borderRadius: 8,
    padding: 8,
    minWidth: 50,
  },
  petEmoji: {
    fontSize: 20,
    marginBottom: 2,
  },
  petText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.primary,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: "center",
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
    gap: 4,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textLight,
    fontWeight: "500",
  },
});

export default UserStatsCard;
