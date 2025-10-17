import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { Route } from '@/types/navigation';
import Colors from '@/constants/colors';
import { Clock, ArrowRight } from 'lucide-react-native';
import TransitStepIndicator from './TransitStepIndicator';

type RouteCardProps = {
  route: Route;
  onPress: (route: Route) => void;
  isSelected?: boolean;
};

const RouteCard: React.FC<RouteCardProps> = ({ route, onPress, isSelected = false }) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        isSelected && styles.selected,
        pressed && styles.pressed,
      ]}
      onPress={() => onPress(route)}
    >
      <View style={styles.timeContainer}>
        <Text style={styles.duration}>{route.totalDuration} min</Text>
        <View style={styles.timeRow}>
          <Clock size={14} color={Colors.textLight} style={styles.clockIcon} />
          <Text style={styles.timeText}>
            {route.departureTime} - {route.arrivalTime}
          </Text>
        </View>
      </View>

      <View style={styles.stepsContainer}>
        {route.steps.map((step, index) => (
          <View key={step.id} style={styles.stepRow}>
            <TransitStepIndicator step={step} />
            {index < route.steps.length - 1 && (
              <ArrowRight size={14} color={Colors.textLight} style={styles.arrowIcon} />
            )}
          </View>
        ))}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selected: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  pressed: {
    opacity: 0.8,
    backgroundColor: '#EAEAEA',
  },
  timeContainer: {
    marginBottom: 12,
  },
  duration: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clockIcon: {
    marginRight: 4,
  },
  timeText: {
    fontSize: 14,
    color: Colors.textLight,
  },
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 4,
  },
  arrowIcon: {
    marginHorizontal: 4,
  },
});

export default RouteCard;
