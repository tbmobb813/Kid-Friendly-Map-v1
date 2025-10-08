import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TransitStep } from '@/types/navigation';
import Colors from '@/constants/colors';
import TransitStepIndicator from './TransitStepIndicator';
import { Clock, ArrowRight } from 'lucide-react-native';

type DirectionStepProps = {
  step: TransitStep;
  isLast: boolean;
};

const DirectionStep: React.FC<DirectionStepProps> = ({ step, isLast }) => {
  return (
    <View style={styles.container}>
      <View style={styles.leftColumn}>
        <TransitStepIndicator step={step} size="large" />
        {!isLast && <View style={styles.connector} />}
      </View>

      <View style={styles.rightColumn}>
        <View style={styles.headerRow}>
          <Text style={styles.stepType}>
            {step.type.charAt(0).toUpperCase() + step.type.slice(1)}
            {step.line && ` Line ${step.line}`}
          </Text>
          <Text style={styles.duration}>{step.duration} min</Text>
        </View>

        <View style={styles.locationContainer}>
          <View style={styles.locationRow}>
            <Text style={styles.locationLabel}>From:</Text>
            <Text style={styles.locationText}>{step.from}</Text>
          </View>

          <View style={styles.locationRow}>
            <Text style={styles.locationLabel}>To:</Text>
            <Text style={styles.locationText}>{step.to}</Text>
          </View>
        </View>

        {step.departureTime && step.arrivalTime && (
          <View style={styles.timeContainer}>
            <Clock size={14} color={Colors.textLight} style={styles.clockIcon} />
            <Text style={styles.timeText}>
              {step.departureTime} - {step.arrivalTime}
            </Text>
            {step.stops !== undefined && (
              <Text style={styles.stopsText}>
                {step.stops} {step.stops === 1 ? 'stop' : 'stops'}
              </Text>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  leftColumn: {
    alignItems: 'center',
    marginRight: 16,
  },
  connector: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.border,
    marginTop: 8,
    marginBottom: -8,
  },
  rightColumn: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepType: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  duration: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  locationContainer: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  locationLabel: {
    width: 50,
    fontSize: 14,
    color: Colors.textLight,
  },
  locationText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clockIcon: {
    marginRight: 4,
  },
  timeText: {
    fontSize: 14,
    color: Colors.textLight,
    marginRight: 8,
  },
  stopsText: {
    fontSize: 14,
    color: Colors.textLight,
  },
});

export default DirectionStep;
