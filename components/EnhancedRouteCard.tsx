/**
 * Enhanced RouteCard with ORS/OTP2 Integration
 * Shows safety scores, kid-friendly ratings, and service source
 */

import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { Route } from '@/types/navigation';
import { UnifiedRoute } from '@/utils/unifiedRoutingService';
import Colors from '@/constants/colors';
import {
  Clock,
  ArrowRight,
  Shield,
  Heart,
  Accessibility,
  AlertTriangle,
  MapPin,
  Zap,
} from 'lucide-react-native';
import TransitStepIndicator from './TransitStepIndicator';

type EnhancedRouteCardProps = {
  route: Route;
  unifiedRoute?: UnifiedRoute;
  onPress: (route: Route) => void;
  isSelected?: boolean;
  showDetailedScores?: boolean;
};

const ScoreIndicator: React.FC<{
  icon: React.ReactNode;
  score: number;
  label: string;
  color: string;
}> = ({ icon, score, label, color }) => (
  <View style={styles.scoreContainer}>
    <View style={[styles.scoreIcon, { backgroundColor: color + '15' }]}>{icon}</View>
    <Text style={[styles.scoreText, { color }]}>{score}</Text>
    <Text style={styles.scoreLabel}>{label}</Text>
  </View>
);

const AlertBadge: React.FC<{ alerts: string[] }> = ({ alerts }) => {
  if (!alerts.length) return null;

  return (
    <View style={styles.alertBadge}>
      <AlertTriangle size={12} color={Colors.warning} />
      <Text style={styles.alertText}>
        {alerts.length} alert{alerts.length > 1 ? 's' : ''}
      </Text>
    </View>
  );
};

const ServiceBadge: React.FC<{ source: string }> = ({ source }) => (
  <View style={[styles.serviceBadge, { backgroundColor: getServiceColor(source) }]}>
    <Text style={styles.serviceText}>{source}</Text>
  </View>
);

const getServiceColor = (source: string): string => {
  switch (source) {
    case 'ORS':
      return '#4CAF50';
    case 'OTP2':
      return '#2196F3';
    case 'AI':
      return '#9C27B0';
    default:
      return '#757575';
  }
};

const getScoreColor = (score: number): string => {
  if (score >= 80) return '#4CAF50'; // Green
  if (score >= 60) return '#FF9800'; // Orange
  return '#F44336'; // Red
};

const EnhancedRouteCard: React.FC<EnhancedRouteCardProps> = ({
  route,
  unifiedRoute,
  onPress,
  isSelected = false,
  showDetailedScores = false,
}) => {
  const hasEnhancedData = !!unifiedRoute;
  const safetyScore = unifiedRoute?.safetyScore ?? route.metadata?.safetyScore;
  const kidFriendlyScore = unifiedRoute?.kidFriendlyScore ?? route.metadata?.kidFriendlyScore;
  const accessibilityScore = unifiedRoute?.accessibilityScore ?? route.metadata?.accessibilityScore;
  const alerts = unifiedRoute?.alerts ?? route.metadata?.alerts ?? [];
  const source = unifiedRoute?.source ?? route.metadata?.source ?? 'Legacy';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        isSelected && styles.selected,
        pressed && styles.pressed,
        hasEnhancedData && styles.enhanced,
      ]}
      onPress={() => onPress(route)}
    >
      {/* Header with duration and service badge */}
      <View style={styles.header}>
        <View style={styles.timeContainer}>
          <Text style={styles.duration}>{route.totalDuration} min</Text>
          {route.departureTime && route.arrivalTime && (
            <View style={styles.timeRow}>
              <Clock size={14} color={Colors.textLight} style={styles.clockIcon} />
              <Text style={styles.timeText}>
                {route.departureTime} - {route.arrivalTime}
              </Text>
            </View>
          )}
          {unifiedRoute && (
            <Text style={styles.distanceText}>
              {Math.round((unifiedRoute.summary.distance / 1000) * 10) / 10} km
            </Text>
          )}
        </View>

        <View style={styles.badgeContainer}>
          <ServiceBadge source={source} />
          <AlertBadge alerts={alerts} />
        </View>
      </View>

      {/* Enhanced scores section */}
      {hasEnhancedData && showDetailedScores && (
        <View style={styles.scoresSection}>
          {safetyScore !== undefined && (
            <ScoreIndicator
              icon={<Shield size={14} color={getScoreColor(safetyScore)} />}
              score={safetyScore}
              label="Safety"
              color={getScoreColor(safetyScore)}
            />
          )}
          {kidFriendlyScore !== undefined && (
            <ScoreIndicator
              icon={<Heart size={14} color={getScoreColor(kidFriendlyScore)} />}
              score={kidFriendlyScore}
              label="Kid-Friendly"
              color={getScoreColor(kidFriendlyScore)}
            />
          )}
          {accessibilityScore !== undefined && (
            <ScoreIndicator
              icon={<Accessibility size={14} color={getScoreColor(accessibilityScore)} />}
              score={accessibilityScore}
              label="Accessible"
              color={getScoreColor(accessibilityScore)}
            />
          )}
        </View>
      )}

      {/* Quick scores row for compact view */}
      {hasEnhancedData && !showDetailedScores && (
        <View style={styles.quickScoresRow}>
          {safetyScore !== undefined && (
            <View style={styles.quickScore}>
              <Shield size={12} color={getScoreColor(safetyScore)} />
              <Text style={[styles.quickScoreText, { color: getScoreColor(safetyScore) }]}>
                {safetyScore}
              </Text>
            </View>
          )}
          {kidFriendlyScore !== undefined && (
            <View style={styles.quickScore}>
              <Heart size={12} color={getScoreColor(kidFriendlyScore)} />
              <Text style={[styles.quickScoreText, { color: getScoreColor(kidFriendlyScore) }]}>
                {kidFriendlyScore}
              </Text>
            </View>
          )}
          {accessibilityScore !== undefined && (
            <View style={styles.quickScore}>
              <Accessibility size={12} color={getScoreColor(accessibilityScore)} />
              <Text style={[styles.quickScoreText, { color: getScoreColor(accessibilityScore) }]}>
                {accessibilityScore}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Route description for unified routes */}
      {unifiedRoute?.description && (
        <Text style={styles.description} numberOfLines={2}>
          {unifiedRoute.description}
        </Text>
      )}

      {/* Transit transfers info */}
      {unifiedRoute?.summary.transfers !== undefined && (
        <View style={styles.transferInfo}>
          <MapPin size={14} color={Colors.textLight} />
          <Text style={styles.transferText}>
            {unifiedRoute.summary.transfers === 0
              ? 'Direct route'
              : `${unifiedRoute.summary.transfers} transfer${
                  unifiedRoute.summary.transfers > 1 ? 's' : ''
                }`}
          </Text>
        </View>
      )}

      {/* Steps container */}
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

      {/* Performance indicator for fast routes */}
      {unifiedRoute && unifiedRoute.summary.duration <= 15 && (
        <View style={styles.performanceBadge}>
          <Zap size={12} color={Colors.success} />
          <Text style={styles.performanceText}>Fast route</Text>
        </View>
      )}

      {/* Alerts preview */}
      {alerts.length > 0 && showDetailedScores && (
        <View style={styles.alertsPreview}>
          <Text style={styles.alertsTitle}>Service Alerts:</Text>
          <Text style={styles.alertsText} numberOfLines={2}>
            {alerts[0]}
          </Text>
        </View>
      )}
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
  enhanced: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  selected: {
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '05',
  },
  pressed: {
    opacity: 0.8,
    backgroundColor: '#EAEAEA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  timeContainer: {
    flex: 1,
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
    marginBottom: 2,
  },
  clockIcon: {
    marginRight: 4,
  },
  timeText: {
    fontSize: 14,
    color: Colors.textLight,
  },
  distanceText: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 2,
  },
  badgeContainer: {
    alignItems: 'flex-end',
    gap: 4,
  },
  serviceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  serviceText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  alertBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warning + '15',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },
  alertText: {
    fontSize: 10,
    color: Colors.warning,
    fontWeight: '500',
  },
  scoresSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
    paddingVertical: 8,
    backgroundColor: Colors.background,
    borderRadius: 8,
  },
  scoreContainer: {
    alignItems: 'center',
    flex: 1,
  },
  scoreIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  scoreText: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  scoreLabel: {
    fontSize: 10,
    color: Colors.textLight,
  },
  quickScoresRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  quickScore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  quickScoreText: {
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 8,
    lineHeight: 20,
  },
  transferInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  transferText: {
    fontSize: 12,
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
  performanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: Colors.success + '15',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 8,
    gap: 2,
  },
  performanceText: {
    fontSize: 10,
    color: Colors.success,
    fontWeight: '500',
  },
  alertsPreview: {
    marginTop: 8,
    padding: 8,
    backgroundColor: Colors.warning + '10',
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: Colors.warning,
  },
  alertsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.warning,
    marginBottom: 2,
  },
  alertsText: {
    fontSize: 11,
    color: Colors.text,
    lineHeight: 16,
  },
});

export default EnhancedRouteCard;
