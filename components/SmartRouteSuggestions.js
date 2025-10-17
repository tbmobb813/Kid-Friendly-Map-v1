import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useMemo, useState, useCallback } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import Colors from '@/constants/colors';
import { Cloud, Sun, CloudRain, Users, Clock, Zap, MapPin, Heart } from 'lucide-react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { handleApiError, smartRoutesApi } from '@/utils/api';
import { useAuth } from '@/hooks/useAuth';
const iconForType = (type) => {
    switch (type) {
        case 'fastest': return Clock;
        case 'safest': return Zap;
        case 'scenic': return Sun;
        case 'covered': return CloudRain;
        case 'quiet': return MapPin;
        default: return Clock;
    }
};
const SmartRouteSuggestions = ({ destination, currentLocation, weather = 'sunny', timeOfDay, onSelectRoute, testId, }) => {
    const qc = useQueryClient();
    const { toggleLikedSuggestion } = useAuth();
    const [crowdLevel, setCrowdLevel] = useState('medium');
    const simulateCrowdLevel = useCallback(() => {
        const hour = new Date().getHours();
        if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19))
            setCrowdLevel('high');
        else if (hour >= 10 && hour <= 16)
            setCrowdLevel('medium');
        else
            setCrowdLevel('low');
    }, []);
    React.useEffect(() => {
        simulateCrowdLevel();
        const id = setInterval(simulateCrowdLevel, 60000);
        return () => clearInterval(id);
    }, [simulateCrowdLevel]);
    const queryKey = useMemo(() => [
        'smartSuggestions',
        destination.id,
        currentLocation.latitude,
        currentLocation.longitude,
        weather,
        timeOfDay,
        crowdLevel,
    ], [destination.id, currentLocation.latitude, currentLocation.longitude, weather, timeOfDay, crowdLevel]);
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
            if (!res.success)
                throw new Error(res.message ?? 'Failed to load suggestions');
            return res.data;
        },
        staleTime: 2 * 60 * 1000,
    });
    const likeMutation = useMutation({
        mutationFn: async ({ id, liked }) => {
            const res = await smartRoutesApi.likeSuggestion(id, liked);
            if (!res.success)
                throw new Error(res.message ?? 'Failed to save');
            return res.data;
        },
        onMutate: async ({ id, liked }) => {
            await qc.cancelQueries({ queryKey });
            const prev = qc.getQueryData(queryKey);
            const next = prev?.map((s) => (s.id === id ? { ...s, liked } : s)) ?? [];
            qc.setQueryData(queryKey, next);
            // Optimistically sync into profile cache if present
            const profileKey = ['userProfile'];
            const prevProfile = qc.getQueryData(profileKey);
            if (prevProfile) {
                const likedIds = Array.isArray(prevProfile.likedSuggestions) ? prevProfile.likedSuggestions : [];
                const updatedLiked = liked ? Array.from(new Set([...likedIds, id])) : likedIds.filter((x) => x !== id);
                qc.setQueryData(profileKey, { ...prevProfile, likedSuggestions: updatedLiked });
            }
            return { prev, prevProfile };
        },
        onError: (err, _vars, ctx) => {
            if (ctx?.prev)
                qc.setQueryData(queryKey, ctx.prev);
            if (ctx?.prevProfile)
                qc.setQueryData(['userProfile'], ctx.prevProfile);
            const e = handleApiError(err);
            console.log('like error', e.message);
        },
        onSuccess: async ({ id, liked }) => {
            try {
                await toggleLikedSuggestion(id, liked);
            }
            catch (e) {
                console.log('Failed to sync like to profile', e);
            }
        },
        onSettled: () => {
            qc.invalidateQueries({ queryKey });
            qc.invalidateQueries({ queryKey: ['userProfile'] });
        }
    });
    const getWeatherIcon = () => {
        switch (weather) {
            case 'sunny': return Sun;
            case 'cloudy': return Cloud;
            case 'rainy': return CloudRain;
            default: return Sun;
        }
    };
    const getCrowdColor = () => {
        switch (crowdLevel) {
            case 'low': return '#4CAF50';
            case 'medium': return '#FF9800';
            case 'high': return '#F44336';
        }
    };
    const mappedSuggestions = (suggestionsQuery.data ?? []).map((s) => ({
        ...s,
        icon: iconForType(s.type),
    }));
    return (_jsxs(View, { style: styles.container, testID: testId ?? 'smart-route-suggestions', children: [_jsxs(View, { style: styles.header, children: [_jsx(Text, { style: styles.title, children: "Smart Route Suggestions" }), _jsxs(View, { style: styles.conditions, children: [_jsxs(View, { style: styles.conditionItem, children: [React.createElement(getWeatherIcon(), { size: 16, color: Colors.primary }), _jsx(Text, { style: styles.conditionText, children: weather })] }), _jsxs(View, { style: styles.conditionItem, children: [_jsx(Users, { size: 16, color: getCrowdColor() }), _jsxs(Text, { style: [styles.conditionText, { color: getCrowdColor() }], children: [crowdLevel, " traffic"] })] })] })] }), suggestionsQuery.isLoading ? (_jsx(View, { style: styles.loadingWrap, children: _jsx(ActivityIndicator, { color: Colors.primary }) })) : suggestionsQuery.isError ? (_jsx(View, { style: styles.errorWrap, children: _jsx(Text, { style: styles.errorText, children: "Could not load suggestions." }) })) : (_jsx(ScrollView, { horizontal: true, showsHorizontalScrollIndicator: false, style: styles.suggestionsScroll, children: mappedSuggestions.map((suggestion) => (_jsxs(Pressable, { style: styles.suggestionCard, onPress: () => onSelectRoute(suggestion), testID: `suggestion-${suggestion.id}`, children: [_jsxs(View, { style: styles.suggestionHeader, children: [_jsx(View, { style: styles.iconContainer, children: _jsx(suggestion.icon, { size: 20, color: Colors.primary }) }), _jsx(Text, { style: styles.suggestionTitle, children: suggestion.title }), _jsx(Pressable, { onPress: () => likeMutation.mutate({ id: suggestion.id, liked: !(suggestion.liked ?? false) }), hitSlop: 8, accessibilityRole: "button", testID: `like-${suggestion.id}`, children: _jsx(Heart, { size: 18, color: (suggestion.liked ?? false) ? Colors.secondary : Colors.textLight }) })] }), _jsx(Text, { style: styles.suggestionDescription, children: suggestion.description }), _jsxs(View, { style: styles.suggestionFooter, children: [_jsx(Text, { style: styles.estimatedTime, children: suggestion.estimatedTime }), _jsx(Text, { style: styles.reason, children: suggestion.reason })] })] }, suggestion.id))) })), _jsxs(View, { style: styles.smartTip, children: [_jsx(Zap, { size: 16, color: Colors.secondary }), _jsx(Text, { style: styles.smartTipText, children: "Routes adapt based on weather, time, and crowd levels for the best experience!" })] })] }));
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
    title: { fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: 8 },
    conditions: { flexDirection: 'row', gap: 16 },
    conditionItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    conditionText: { fontSize: 12, color: Colors.textLight, fontWeight: '500', textTransform: 'capitalize' },
    suggestionsScroll: { marginBottom: 16 },
    suggestionCard: { backgroundColor: Colors.background, borderRadius: 12, padding: 16, marginRight: 12, width: 220, borderWidth: 1, borderColor: Colors.border },
    suggestionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
    iconContainer: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center', marginRight: 4 },
    suggestionTitle: { fontSize: 14, fontWeight: '600', color: Colors.text, flex: 1 },
    suggestionDescription: { fontSize: 12, color: Colors.textLight, lineHeight: 16, marginBottom: 12 },
    suggestionFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    estimatedTime: { fontSize: 14, fontWeight: '700', color: Colors.primary },
    reason: { fontSize: 10, color: Colors.textLight, fontStyle: 'italic' },
    smartTip: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.secondaryLight, padding: 12, borderRadius: 8, gap: 8 },
    smartTipText: { flex: 1, fontSize: 12, color: Colors.secondary, fontWeight: '500' },
    loadingWrap: { paddingVertical: 16, alignItems: 'center' },
    errorWrap: { paddingVertical: 16, alignItems: 'center' },
    errorText: { color: Colors.textLight },
});
export default SmartRouteSuggestions;
