import React, { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import Colors from '@/constants/colors';
import useLocation from '@/hooks/useLocation';
import { useRegionStore } from '@/stores/regionStore';
import { useWeather } from '@/hooks/useWeather';
import WeatherCard from '@/components/WeatherCard';
import { RefreshCw, AlertCircle } from 'lucide-react-native';

const WeatherWidget: React.FC<{ testId?: string }> = ({ testId }) => {
  const { location, loading } = useLocation();
  const { userPreferences } = useRegionStore();
  const units = userPreferences.preferredUnits;

  const { data, isLoading, isError, refetch } = useWeather({
    lat: location?.latitude,
    lon: location?.longitude,
    units,
  });

  const content = useMemo(() => {
    if (loading || isLoading) {
      return (
        <View style={styles.loading} testID={testId ? `${testId}-loading` : undefined}>
          <ActivityIndicator color={Colors.primary} />
          <Text style={styles.loadingText}>Fetching weather…</Text>
        </View>
      );
    }

    if (isError || !data) {
      return (
        <View style={styles.error} testID={testId ? `${testId}-error` : undefined}>
          <AlertCircle size={18} color={Colors.error} />
          <Text style={styles.errorText}>Unable to load weather</Text>
          <Pressable
            style={styles.retry}
            onPress={() => refetch()}
            testID={testId ? `${testId}-retry` : undefined}
          >
            <RefreshCw size={14} color={'#FFFFFF'} />
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      );
    }

    return (
      <WeatherCard
        weather={{
          condition: data.condition,
          temperature: data.temperature,
          recommendation: data.recommendation,
        }}
      />
    );
  }, [loading, isLoading, isError, data, refetch, testId]);

  return (
    <View style={styles.container} testID={testId}>
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 12,
  },
  loading: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  loadingText: {
    color: Colors.textLight,
    fontSize: 14,
    marginLeft: 8,
  },
  error: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  errorText: {
    color: Colors.error,
    fontSize: 14,
    flex: 1,
  },
  retry: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default WeatherWidget;
