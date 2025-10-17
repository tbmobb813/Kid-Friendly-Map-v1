import React, { useMemo, useState, useCallback } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import Colors from '@/constants/colors';
import { Cloud, Sun, CloudRain, Users, Clock, Zap, MapPin, Heart } from 'lucide-react-native';
import { Place } from '@/types/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { handleApiError, smartRoutesApi, SmartSuggestionDTO } from '@/utils/api';
import { useAuth } from '@/hooks/useAuth';

export type WeatherCondition = 'sunny' | 'cloudy' | 'rainy' | 'stormy';
export type CrowdLevel = 'low' | 'medium' | 'high';
export type RouteType = 'fastest' | 'safest' | 'scenic' | 'covered' | 'quiet';

export type SmartSuggestion = SmartSuggestionDTO & { icon: React.ComponentType<any> };

export type SmartRouteSuggestionsProps = {
  destination: Place;
  currentLocation: { latitude: number; longitude: number };
  weather?: WeatherCondition;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  onSelectRoute: (suggestion: SmartSuggestion) => void;
  testId?: string;
};

const iconForType = (type: RouteType) => {
  switch (type) {
    case 'fastest':
      return Clock;
    case 'safest':
      return Zap;
    case 'scenic':
      return Sun;
    case 'covered':
      return CloudRain;
    case 'quiet':
      return MapPin;
    default:
      return Clock;
  }
};

const SmartRouteSuggestions: React.FC<SmartRouteSuggestionsProps> = ({
  destination,
  currentLocation,
  weather = 'sunny',
  timeOfDay,
  onSelectRoute,
  testId,
}) => {
  const qc = useQueryClient();
  const { toggleLikedSuggestion } = useAuth();
  const [crowdLevel, setCrowdLevel] = useState<CrowdLevel>('medium');

  const simulateCrowdLevel = useCallback(() => {
    const hour = new Date().getHours();
    if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) setCrowdLevel('high');
    else if (hour >= 10 && hour <= 16) setCrowdLevel('medium');
    else setCrowdLevel('low');
  }, []);

  React.useEffect(() => {
    simulateCrowdLevel();
    const id = setInterval(simulateCrowdLevel, 60000);
    return () => clearInterval(id);
  }, [simulateCrowdLevel]);

  const queryKey = useMemo(
    () => [
      'smartSuggestions',
      destination.id,
      currentLocation.latitude,
      currentLocation.longitude,
      weather,
      timeOfDay,
      crowdLevel,
    ],
    [
      destination.id,
      currentLocation.latitude,
      currentLocation.longitude,
      weather,
      timeOfDay,
      crowdLevel,
    ],
  );

  const suggestionsQuery = useQuery({
    queryKey,
    queryFn: async () => {
      const res = await smartRoutesApi.getSuggestions({
        destId: destination.id,
        destLat: destination.coordinates.latitude,
        destLng: destination.coordinates.longitude,
        curLat: currentLocation.latitude,
        curLng: currentLocation.longitude,
        weather,
        timeOfDay,
      });
      if (!res.success) throw new Error(res.message ?? 'Failed to load suggestions');
      return res.data;
    },
    staleTime: 2 * 60 * 1000,
  });

  const likeMutation = useMutation({
    mutationFn: async ({ id, liked }: { id: string; liked: boolean }) => {
      const res = await smartRoutesApi.likeSuggestion(id, liked);
      if (!res.success) throw new Error(res.message ?? 'Failed to save');
      return res.data;
    },
    onMutate: async ({ id, liked }) => {
      await qc.cancelQueries({ queryKey });
      const prev = qc.getQueryData<SmartSuggestionDTO[]>(queryKey);
      const next = prev?.map((s) => (s.id === id ? { ...s, liked } : s)) ?? [];
      qc.setQueryData(queryKey, next);
      // Optimistically sync into profile cache if present
      const profileKey = ['userProfile'];
      const prevProfile = qc.getQueryData<any>(profileKey);
      if (prevProfile) {
        const likedIds: string[] = Array.isArray(prevProfile.likedSuggestions)
          ? prevProfile.likedSuggestions
          : [];
        const updatedLiked = liked
          ? Array.from(new Set([...likedIds, id]))
          : likedIds.filter((x: string) => x !== id);
        qc.setQueryData(profileKey, { ...prevProfile, likedSuggestions: updatedLiked });
      }
      return { prev, prevProfile };
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(queryKey, ctx.prev);
      if (ctx?.prevProfile) qc.setQueryData(['userProfile'], ctx.prevProfile);
      const e = handleApiError(err);
      console.log('like error', e.message);
    },
    onSuccess: async ({ id, liked }) => {
      try {
        await toggleLikedSuggestion(id, liked);
      } catch (e) {
        console.log('Failed to sync like to profile', e);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey });
      qc.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });

  const getWeatherIcon = () => {
    switch (weather) {
      case 'sunny':
        return Sun;
      case 'cloudy':
        return Cloud;
      case 'rainy':
        return CloudRain;
      default:
        return Sun;
    }
  };

  const getCrowdColor = () => {
    switch (crowdLevel) {
      case 'low':
        return '#4CAF50';
      case 'medium':
        return '#FF9800';
      case 'high':
        return '#F44336';
    }
  };

  const mappedSuggestions: SmartSuggestion[] = (suggestionsQuery.data ?? []).map((s) => ({
    ...s,
    icon: iconForType(s.type),
  }));

  return (
    <View style={styles.container} testID={testId ?? 'smart-route-suggestions'}>
      <View style={styles.header}>
        <Text style={styles.title}>Smart Route Suggestions</Text>
        <View style={styles.conditions}>
          <View style={styles.conditionItem}>
            {React.createElement(getWeatherIcon(), { size: 16, color: Colors.primary })}
            <Text style={styles.conditionText}>{weather}</Text>
          </View>
          <View style={styles.conditionItem}>
            <Users size={16} color={getCrowdColor()} />
            <Text style={[styles.conditionText, { color: getCrowdColor() }]}>
              {crowdLevel} traffic
            </Text>
          </View>
        </View>
      </View>

      {suggestionsQuery.isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      ) : suggestionsQuery.isError ? (
        <View style={styles.errorWrap}>
          <Text style={styles.errorText}>Could not load suggestions.</Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.suggestionsScroll}
        >
          {mappedSuggestions.map((suggestion) => (
            <Pressable
              key={suggestion.id}
              style={styles.suggestionCard}
              onPress={() => onSelectRoute(suggestion)}
              testID={`suggestion-${suggestion.id}`}
            >
              <View style={styles.suggestionHeader}>
                <View style={styles.iconContainer}>
                  <suggestion.icon size={20} color={Colors.primary} />
                </View>
                <Text style={styles.suggestionTitle}>{suggestion.title}</Text>
                <Pressable
                  onPress={() =>
                    likeMutation.mutate({ id: suggestion.id, liked: !(suggestion.liked ?? false) })
                  }
                  hitSlop={8}
                  accessibilityRole="button"
                  testID={`like-${suggestion.id}`}
                >
                  <Heart
                    size={18}
                    color={(suggestion.liked ?? false) ? Colors.secondary : Colors.textLight}
                  />
                </Pressable>
              </View>

              <Text style={styles.suggestionDescription}>{suggestion.description}</Text>

              <View style={styles.suggestionFooter}>
                <Text style={styles.estimatedTime}>{suggestion.estimatedTime}</Text>
                <Text style={styles.reason}>{suggestion.reason}</Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      )}

      <View style={styles.smartTip}>
        <Zap size={16} color={Colors.secondary} />
        <Text style={styles.smartTipText}>
          Routes adapt based on weather, time, and crowd levels for the best experience!
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: { marginBottom: 16 },
  title: { fontSize: 18, fontWeight: '700' as const, color: Colors.text, marginBottom: 8 },
  conditions: { flexDirection: 'row', gap: 16 },
  conditionItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  conditionText: {
    fontSize: 12,
    color: Colors.textLight,
    fontWeight: '500' as const,
    textTransform: 'capitalize' as const,
  },
  suggestionsScroll: { marginBottom: 16 },
  suggestionCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 220,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  suggestionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  suggestionTitle: { fontSize: 14, fontWeight: '600' as const, color: Colors.text, flex: 1 },
  suggestionDescription: {
    fontSize: 12,
    color: Colors.textLight,
    lineHeight: 16,
    marginBottom: 12,
  },
  suggestionFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  estimatedTime: { fontSize: 14, fontWeight: '700' as const, color: Colors.primary },
  reason: { fontSize: 10, color: Colors.textLight, fontStyle: 'italic' as const },
  smartTip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondaryLight,
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  smartTipText: { flex: 1, fontSize: 12, color: Colors.secondary, fontWeight: '500' as const },
  loadingWrap: { paddingVertical: 16, alignItems: 'center' },
  errorWrap: { paddingVertical: 16, alignItems: 'center' },
  errorText: { color: Colors.textLight },
});

export default SmartRouteSuggestions;
