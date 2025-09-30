import React from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import { Achievement } from "@/types/gamification";
import Colors from "@/constants/colors";
import { Star, Lock } from "lucide-react-native";

type AchievementBadgeProps = {
  achievement: Achievement;
  onPress?: () => void;
  size?: "small" | "medium" | "large";
};

const AchievementBadge: React.FC<AchievementBadgeProps> = ({ 
  achievement, 
  onPress,
  size = "medium" 
}) => {
  const getDimensions = () => {
    switch (size) {
      case "small": return { width: 60, height: 60, fontSize: 20, textSize: 10 };
      case "medium": return { width: 80, height: 80, fontSize: 28, textSize: 12 };
      case "large": return { width: 100, height: 100, fontSize: 36, textSize: 14 };
    }
  };

  const dimensions = getDimensions();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        {
          width: dimensions.width,
          height: dimensions.height,
          backgroundColor: achievement.unlocked ? Colors.secondary : Colors.border
        },
        pressed && styles.pressed
      ]}
      onPress={onPress}
      disabled={!achievement.unlocked}
    >
      {achievement.unlocked ? (
        <>
          <Text style={[styles.icon, { fontSize: dimensions.fontSize }]}>
            {achievement.icon}
          </Text>
          <Star size={16} color="#FFD700" style={styles.star} />
        </>
      ) : (
        <Lock size={24} color={Colors.textLight} />
      )}
      
      <Text 
        style={[
          styles.title, 
          { fontSize: dimensions.textSize },
          !achievement.unlocked && styles.lockedText
        ]} 
        numberOfLines={2}
      >
        {achievement.title}
      </Text>
      
      {achievement.unlocked && (
        <Text style={[styles.points, { fontSize: dimensions.textSize - 2 }]}>
          +{achievement.points}
        </Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
    margin: 4,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
  icon: {
    marginBottom: 4,
  },
  star: {
    position: "absolute",
    top: 4,
    right: 4,
  },
  title: {
    fontWeight: "600",
    color: Colors.text,
    textAlign: "center",
    marginBottom: 2,
  },
  lockedText: {
    color: Colors.textLight,
  },
  points: {
    color: Colors.primary,
    fontWeight: "700",
  },
});

export default AchievementBadge;
