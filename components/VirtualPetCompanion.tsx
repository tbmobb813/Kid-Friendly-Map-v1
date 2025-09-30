import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Pressable, Animated } from 'react-native';
import Colors from '@/constants/colors';
import { Heart, Star, MapPin, Zap } from 'lucide-react-native';
import { useGamificationStore } from '@/stores/gamificationStore';

type PetType = 'dragon' | 'unicorn' | 'robot' | 'phoenix';

type VirtualPet = {
  id: string;
  name: string;
  type: PetType;
  level: number;
  happiness: number;
  energy: number;
  experience: number;
  lastFed: Date;
  evolutionStage: number;
};

type VirtualPetCompanionProps = {
  visible: boolean;
  onClose: () => void;
};

const VirtualPetCompanion: React.FC<VirtualPetCompanionProps> = ({ visible, onClose }) => {
  const { userStats, addPoints } = useGamificationStore();
  const [pet, setPet] = useState<VirtualPet>({
    id: 'buddy-pet',
    name: 'Explorer',
    type: 'dragon',
    level: Math.floor(userStats.totalPoints / 100) + 1,
    happiness: 85,
    energy: 90,
    experience: userStats.totalPoints % 100,
    lastFed: new Date(),
    evolutionStage: Math.floor(userStats.totalPoints / 500)
  });
  
  const [bounceAnim] = useState(new Animated.Value(1));
  const [glowAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      startAnimations();
    }
  }, [visible]);

  useEffect(() => {
    // Update pet based on user progress
    setPet(prev => ({
      ...prev,
      level: Math.floor(userStats.totalPoints / 100) + 1,
      experience: userStats.totalPoints % 100,
      evolutionStage: Math.floor(userStats.totalPoints / 500)
    }));
  }, [userStats.totalPoints]);

  const startAnimations = () => {
    // Bounce animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const getPetEmoji = (): string => {
    const stage = pet.evolutionStage;
    switch (pet.type) {
      case 'dragon':
        if (stage >= 3) return '🐲'; // Ancient Dragon
        if (stage >= 2) return '🐉'; // Mature Dragon  
        if (stage >= 1) return '🦎'; // Young Dragon
        return '🥚'; // Dragon Egg
      case 'unicorn':
        if (stage >= 3) return '🦄'; // Majestic Unicorn
        if (stage >= 2) return '🐴'; // Magic Horse
        if (stage >= 1) return '🐎'; // Young Unicorn
        return '🥚'; // Unicorn Egg
      case 'robot':
        if (stage >= 3) return '🤖'; // Advanced Robot
        if (stage >= 2) return '⚙️'; // Mechanical Pet
        if (stage >= 1) return '🔧'; // Robot Parts
        return '🥚'; // Robot Egg
      case 'phoenix':
        if (stage >= 3) return '🔥'; // Phoenix Fire
        if (stage >= 2) return '🦅'; // Fire Bird
        if (stage >= 1) return '🐣'; // Phoenix Chick
        return '🥚'; // Phoenix Egg
      default:
        return '🐾';
    }
  };

  const getPetStage = (): string => {
    const stage = pet.evolutionStage;
    if (stage >= 3) return 'Legendary';
    if (stage >= 2) return 'Evolved';
    if (stage >= 1) return 'Growing';
    return 'Baby';
  };

  const feedPet = () => {
    setPet(prev => ({
      ...prev,
      happiness: Math.min(100, prev.happiness + 10),
      energy: Math.min(100, prev.energy + 15),
      lastFed: new Date()
    }));
    addPoints(5);
  };

  const playWithPet = () => {
    setPet(prev => ({
      ...prev,
      happiness: Math.min(100, prev.happiness + 15),
      energy: Math.max(0, prev.energy - 10)
    }));
    addPoints(10);
  };

  const getHappinessColor = () => {
    if (pet.happiness >= 80) return '#4CAF50';
    if (pet.happiness >= 50) return '#FF9800';
    return '#F44336';
  };

  const getEnergyColor = () => {
    if (pet.energy >= 70) return '#2196F3';
    if (pet.energy >= 40) return '#FF9800';
    return '#F44336';
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Pet Companion</Text>
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>×</Text>
          </Pressable>
        </View>

        <View style={styles.petContainer}>
          <Animated.View 
            style={[
              styles.petAvatar,
              { 
                transform: [{ scale: bounceAnim }],
                opacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1]
                })
              }
            ]}
          >
            <Text style={styles.petEmoji}>{getPetEmoji()}</Text>
          </Animated.View>
          
          <View style={styles.petInfo}>
            <Text style={styles.petName}>{pet.name}</Text>
            <Text style={styles.petStage}>{getPetStage()} {pet.type}</Text>
            <Text style={styles.petLevel}>Level {pet.level}</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statBar}>
            <View style={styles.statHeader}>
              <Heart size={16} color={getHappinessColor()} />
              <Text style={styles.statLabel}>Happiness</Text>
              <Text style={styles.statValue}>{pet.happiness}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${pet.happiness}%`,
                    backgroundColor: getHappinessColor()
                  }
                ]} 
              />
            </View>
          </View>

          <View style={styles.statBar}>
            <View style={styles.statHeader}>
              <Zap size={16} color={getEnergyColor()} />
              <Text style={styles.statLabel}>Energy</Text>
              <Text style={styles.statValue}>{pet.energy}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${pet.energy}%`,
                    backgroundColor: getEnergyColor()
                  }
                ]} 
              />
            </View>
          </View>

          <View style={styles.statBar}>
            <View style={styles.statHeader}>
              <Star size={16} color={Colors.secondary} />
              <Text style={styles.statLabel}>Experience</Text>
              <Text style={styles.statValue}>{pet.experience}/100</Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${pet.experience}%`,
                    backgroundColor: Colors.secondary
                  }
                ]} 
              />
            </View>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <Pressable style={styles.actionButton} onPress={feedPet}>
            <Text style={styles.actionEmoji}>🍎</Text>
            <Text style={styles.actionText}>Feed</Text>
          </Pressable>
          
          <Pressable style={styles.actionButton} onPress={playWithPet}>
            <Text style={styles.actionEmoji}>🎾</Text>
            <Text style={styles.actionText}>Play</Text>
          </Pressable>
          
          <Pressable style={styles.actionButton}>
            <MapPin size={16} color={Colors.primary} />
            <Text style={styles.actionText}>Adventure</Text>
          </Pressable>
        </View>

        <View style={styles.evolutionHint}>
          <Text style={styles.hintText}>
            {pet.evolutionStage < 3 
              ? `${500 - (userStats.totalPoints % 500)} more points to evolve!`
              : 'Your pet has reached maximum evolution! 🌟'
            }
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  container: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    margin: 20,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 20,
    color: Colors.textLight,
    fontWeight: '600',
  },
  petContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    padding: 16,
    backgroundColor: Colors.primaryLight,
    borderRadius: 16,
  },
  petAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  petEmoji: {
    fontSize: 40,
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  petStage: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  petLevel: {
    fontSize: 12,
    color: Colors.textLight,
  },
  statsContainer: {
    marginBottom: 24,
  },
  statBar: {
    marginBottom: 16,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 8,
  },
  statValue: {
    fontSize: 12,
    color: Colors.textLight,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.background,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  actionEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  evolutionHint: {
    backgroundColor: Colors.secondaryLight,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  hintText: {
    fontSize: 12,
    color: Colors.secondary,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default VirtualPetCompanion;
