import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import Colors from '@/constants/colors';
import useLocation from '@/hooks/useLocation';
import { useRegionStore } from '@/stores/regionStore';
import { useWeather } from '@/hooks/useWeather';
import WeatherCard from '@/components/WeatherCard';
import { RefreshCw, AlertCircle } from 'lucide-react-native';
const WeatherWidget = ({ testId }) => {
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
            return (_jsxs(View, { style: styles.loading, testID: testId ? `${testId}-loading` : undefined, children: [_jsx(ActivityIndicator, { color: Colors.primary }), _jsx(Text, { style: styles.loadingText, children: "Fetching weather\u2026" })] }));
        }
        if (isError || !data) {
            return (_jsxs(View, { style: styles.error, testID: testId ? `${testId}-error` : undefined, children: [_jsx(AlertCircle, { size: 18, color: Colors.error }), _jsx(Text, { style: styles.errorText, children: "Unable to load weather" }), _jsxs(Pressable, { style: styles.retry, onPress: () => refetch(), testID: testId ? `${testId}-retry` : undefined, children: [_jsx(RefreshCw, { size: 14, color: '#FFFFFF' }), _jsx(Text, { style: styles.retryText, children: "Retry" })] })] }));
        }
        return (_jsx(WeatherCard, { weather: {
                condition: data.condition,
                temperature: data.temperature,
                recommendation: data.recommendation,
            } }));
    }, [loading, isLoading, isError, data, refetch, testId]);
    return _jsx(View, { style: styles.container, testID: testId, children: content });
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
