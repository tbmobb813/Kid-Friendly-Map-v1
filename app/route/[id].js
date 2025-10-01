import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { StyleSheet, Text, View, ScrollView, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Colors from "@/constants/colors";
import DirectionStep from "@/components/DirectionStep";
import MapPlaceholder from "@/components/MapPlaceholder";
import SafetyPanel from "@/components/SafetyPanel";
import { useNavigationStore } from "@/stores/navigationStore";
import { Clock, Navigation, MapPin } from "lucide-react-native";
import VoiceNavigation from "@/components/VoiceNavigation";
import FunFactCard from "@/components/FunFactCard";
import { getRandomFunFact } from "@/mocks/funFacts";
import useLocation from "@/hooks/useLocation";
export default function RouteDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const { location } = useLocation();
    const { origin, destination, availableRoutes, selectedRoute } = useNavigationStore();
    // Find the route by ID
    const route = selectedRoute?.id === id
        ? selectedRoute
        : availableRoutes.find(r => r.id === id);
    const [showFunFact, setShowFunFact] = useState(true);
    const [currentFunFact] = useState(getRandomFunFact("subway"));
    if (!route || !origin || !destination) {
        return (_jsxs(View, { style: styles.errorContainer, children: [_jsx(Text, { style: styles.errorText, children: "Route not found" }), _jsx(Pressable, { style: styles.backButton, onPress: () => router.back(), children: _jsx(Text, { style: styles.backButtonText, children: "Go Back" }) })] }));
    }
    return (_jsxs(ScrollView, { style: styles.container, children: [_jsx(MapPlaceholder, { message: `Map showing route from ${origin.name} to ${destination.name}` }), _jsx(VoiceNavigation, { currentStep: route.steps[0]?.from ? `${route.steps[0].type === 'walk' ? 'Walk' : 'Take'} from ${route.steps[0].from} to ${route.steps[0].to}` : "Starting your journey" }), _jsx(SafetyPanel, { currentLocation: location, currentPlace: destination ? {
                    id: destination.id,
                    name: destination.name
                } : undefined }), showFunFact && (_jsx(FunFactCard, { fact: currentFunFact, location: "Transit System", onDismiss: () => setShowFunFact(false) })), _jsxs(View, { style: styles.contentContainer, children: [_jsxs(View, { style: styles.routeSummary, children: [_jsxs(View, { style: styles.locationContainer, children: [_jsxs(View, { style: styles.locationRow, children: [_jsx(View, { style: [styles.locationPin, styles.originPin], children: _jsx(Navigation, { size: 16, color: "#FFFFFF" }) }), _jsx(Text, { style: styles.locationText, numberOfLines: 1, children: origin.name })] }), _jsx(View, { style: styles.locationConnector }), _jsxs(View, { style: styles.locationRow, children: [_jsx(View, { style: [styles.locationPin, styles.destinationPin], children: _jsx(MapPin, { size: 16, color: "#FFFFFF" }) }), _jsx(Text, { style: styles.locationText, numberOfLines: 1, children: destination.name })] })] }), _jsxs(View, { style: styles.timeInfo, children: [_jsxs(Text, { style: styles.duration, children: [route.totalDuration, " min"] }), _jsxs(View, { style: styles.timeRow, children: [_jsx(Clock, { size: 14, color: Colors.textLight, style: styles.clockIcon }), _jsxs(Text, { style: styles.timeText, children: [route.departureTime, " - ", route.arrivalTime] })] })] })] }), _jsx(Text, { style: styles.sectionTitle, children: "Step by Step Directions" }), _jsx(View, { style: styles.stepsContainer, children: route.steps.map((step, index) => (_jsx(DirectionStep, { step: step, isLast: index === route.steps.length - 1 }, step.id))) }), _jsxs(View, { style: styles.tipContainer, children: [_jsx(Text, { style: styles.tipTitle, children: "Kid-Friendly Tip" }), _jsx(Text, { style: styles.tipText, children: "Remember to stay with an adult and keep your phone with you at all times!" })] })] })] }));
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    contentContainer: {
        padding: 16,
    },
    routeSummary: {
        backgroundColor: Colors.card,
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },
    locationContainer: {
        marginBottom: 16,
    },
    locationRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    locationPin: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    originPin: {
        backgroundColor: Colors.primary,
    },
    destinationPin: {
        backgroundColor: Colors.secondary,
    },
    locationText: {
        fontSize: 16,
        color: Colors.text,
        flex: 1,
    },
    locationConnector: {
        width: 2,
        height: 24,
        backgroundColor: Colors.border,
        marginLeft: 13,
        marginBottom: 8,
    },
    timeInfo: {
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        paddingTop: 16,
    },
    duration: {
        fontSize: 18,
        fontWeight: "700",
        color: Colors.text,
        marginBottom: 4,
    },
    timeRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    clockIcon: {
        marginRight: 4,
    },
    timeText: {
        fontSize: 14,
        color: Colors.textLight,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: Colors.text,
        marginBottom: 16,
    },
    stepsContainer: {
        marginBottom: 24,
    },
    tipContainer: {
        backgroundColor: "#F0F4FF",
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        borderLeftWidth: 4,
        borderLeftColor: Colors.primary,
    },
    tipTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.primary,
        marginBottom: 8,
    },
    tipText: {
        fontSize: 14,
        color: Colors.text,
        lineHeight: 20,
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
    },
    errorText: {
        fontSize: 18,
        color: Colors.text,
        marginBottom: 24,
    },
    backButton: {
        backgroundColor: Colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    backButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },
});
