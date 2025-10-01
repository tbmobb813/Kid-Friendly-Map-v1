import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { StyleSheet, Text, View, ScrollView, Pressable, Dimensions, Platform } from "react-native";
import Colors from "@/constants/colors";
import { subwayLines } from "@/mocks/transit";
import SearchBar from "@/components/SearchBar";
import { Clock, MapPin, AlertCircle, Bell } from "lucide-react-native";
import LiveArrivalsCard from "@/components/LiveArrivalsCard";
import { mockLiveArrivals, nearbyStations } from "@/mocks/liveArrivals";
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
export default function TransitScreen() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedLine, setSelectedLine] = useState(null);
    const [selectedStation, setSelectedStation] = useState("main-st-station");
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastRefresh, setLastRefresh] = useState(new Date());
    // Auto-refresh arrivals every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            handleRefreshArrivals();
        }, 30000);
        return () => clearInterval(interval);
    }, []);
    const handleRefreshArrivals = () => {
        setIsRefreshing(true);
        setLastRefresh(new Date());
        // Simulate API call delay
        setTimeout(() => {
            setIsRefreshing(false);
        }, 1000);
    };
    const getTimeAgo = (date) => {
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
        if (seconds < 60)
            return `${seconds} sec ago`;
        const minutes = Math.floor(seconds / 60);
        return `${minutes} min ago`;
    };
    // Mock subway status data
    const subwayStatus = [
        { id: "a", name: "A", status: "normal", message: "Good service" },
        { id: "b", name: "B", status: "delayed", message: "Delays of 10-15 minutes" },
        { id: "c", name: "C", status: "normal", message: "Good service" },
        { id: "d", name: "D", status: "normal", message: "Good service" },
        { id: "e", name: "E", status: "alert", message: "Service changes this weekend" },
        { id: "f", name: "F", status: "normal", message: "Good service" },
        { id: "g", name: "G", status: "normal", message: "Good service" },
    ];
    const getStatusColor = (status) => {
        switch (status) {
            case "normal": return Colors.success;
            case "delayed": return Colors.warning;
            case "alert": return Colors.error;
            default: return Colors.textLight;
        }
    };
    const renderStationButton = (station) => (_jsxs(Pressable, { style: [
            styles.stationButton,
            selectedStation === station.id && styles.selectedStationButton
        ], onPress: () => setSelectedStation(station.id), children: [_jsx(Text, { style: [
                    styles.stationButtonText,
                    selectedStation === station.id && styles.selectedStationButtonText
                ], children: station.name }), _jsx(Text, { style: styles.stationDistance, children: station.distance })] }, station.id));
    const renderLineItem = (item) => {
        const status = subwayStatus.find(s => s.id === item.id);
        return (_jsxs(Pressable, { style: [
                styles.lineItem,
                selectedLine === item.id && styles.selectedLine
            ], onPress: () => setSelectedLine(item.id), children: [_jsx(View, { style: [styles.lineCircle, { backgroundColor: item.color }], children: _jsx(Text, { style: styles.lineText, children: item.name }) }), _jsxs(View, { style: styles.statusContainer, children: [_jsx(View, { style: [styles.statusDot, { backgroundColor: getStatusColor(status?.status || 'normal') }] }), _jsx(Text, { style: styles.statusText, children: status?.message || 'No information available' })] })] }, item.id));
    };
    return (_jsxs(ScrollView, { style: styles.container, contentContainerStyle: styles.scrollContent, showsVerticalScrollIndicator: false, bounces: true, children: [_jsx(View, { style: styles.searchContainer, children: _jsx(SearchBar, { value: searchQuery, onChangeText: setSearchQuery, onClear: () => setSearchQuery(""), placeholder: "Search for subway or train lines" }) }), _jsx(Text, { style: styles.sectionTitle, children: "Live Arrivals" }), _jsx(ScrollView, { horizontal: true, showsHorizontalScrollIndicator: false, style: styles.stationsScroll, contentContainerStyle: styles.stationsContainer, children: nearbyStations.map(renderStationButton) }), selectedStation && (_jsx(LiveArrivalsCard, { stationName: nearbyStations.find(s => s.id === selectedStation)?.name || "Station", stationId: selectedStation, arrivals: mockLiveArrivals[selectedStation] || [], lastUpdated: getTimeAgo(lastRefresh), onRefresh: handleRefreshArrivals, isRefreshing: isRefreshing })), _jsxs(View, { style: styles.quickActionsContainer, children: [_jsx(Text, { style: styles.sectionTitle, children: "Quick Actions" }), _jsxs(View, { style: styles.quickActions, children: [_jsxs(Pressable, { style: styles.quickActionButton, children: [_jsx(Bell, { size: 20, color: Colors.primary }), _jsx(Text, { style: styles.quickActionText, children: "Set Alerts" })] }), _jsxs(Pressable, { style: styles.quickActionButton, children: [_jsx(MapPin, { size: 20, color: Colors.primary }), _jsx(Text, { style: styles.quickActionText, children: "Find Station" })] }), _jsxs(Pressable, { style: styles.quickActionButton, children: [_jsx(Clock, { size: 20, color: Colors.primary }), _jsx(Text, { style: styles.quickActionText, children: "Schedule" })] })] })] }), _jsxs(View, { style: styles.statusSummaryContainer, children: [_jsxs(View, { style: styles.statusHeader, children: [_jsx(Text, { style: styles.sectionTitle, children: "Subway Status" }), _jsxs(View, { style: styles.timeContainer, children: [_jsx(Clock, { size: 14, color: Colors.textLight }), _jsx(Text, { style: styles.timeText, children: "Updated 5 min ago" })] })] }), _jsxs(View, { style: styles.alertContainer, children: [_jsx(AlertCircle, { size: 20, color: Colors.warning, style: styles.alertIcon }), _jsx(Text, { style: styles.alertText, children: "Some lines are experiencing delays or service changes" })] })] }), _jsx(Text, { style: styles.sectionTitle, children: "Subway Lines" }), _jsx(View, { style: styles.linesContainer, children: subwayLines.map(renderLineItem) }), selectedLine && (_jsxs(View, { style: styles.lineDetailsContainer, children: [_jsxs(Text, { style: styles.detailsTitle, children: ["Line ", subwayLines.find(l => l.id === selectedLine)?.name, " Details"] }), _jsxs(View, { style: styles.nextTrainsContainer, children: [_jsx(Text, { style: styles.nextTrainsTitle, children: "Next trains:" }), _jsxs(View, { style: styles.trainTimesContainer, children: [_jsxs(View, { style: styles.trainTime, children: [_jsx(Text, { style: styles.trainTimeText, children: "3 min" }), _jsx(Text, { style: styles.trainDirectionText, children: "Uptown" })] }), _jsxs(View, { style: styles.trainTime, children: [_jsx(Text, { style: styles.trainTimeText, children: "7 min" }), _jsx(Text, { style: styles.trainDirectionText, children: "Downtown" })] }), _jsxs(View, { style: styles.trainTime, children: [_jsx(Text, { style: styles.trainTimeText, children: "12 min" }), _jsx(Text, { style: styles.trainDirectionText, children: "Uptown" })] })] })] })] }))] }));
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 16,
        paddingBottom: 32,
    },
    searchContainer: {
        marginBottom: 16,
    },
    statusSummaryContainer: {
        backgroundColor: Colors.card,
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },
    statusHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    timeContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    timeText: {
        fontSize: 12,
        color: Colors.textLight,
        marginLeft: 4,
    },
    alertContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFF9E6",
        borderRadius: 8,
        padding: 12,
    },
    alertIcon: {
        marginRight: 8,
    },
    alertText: {
        flex: 1,
        fontSize: 14,
        color: Colors.text,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: Colors.text,
        marginBottom: 16,
    },
    linesContainer: {
        gap: 12,
        marginBottom: 16,
    },
    lineItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.card,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    selectedLine: {
        borderWidth: 2,
        borderColor: Colors.primary,
    },
    lineCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
    },
    lineText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "700",
    },
    statusContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
    },
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 8,
    },
    statusText: {
        fontSize: 14,
        color: Colors.text,
    },
    lineDetailsContainer: {
        backgroundColor: Colors.card,
        borderRadius: 12,
        padding: 16,
        marginTop: 8,
    },
    detailsTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.text,
        marginBottom: 12,
    },
    nextTrainsContainer: {
        marginTop: 8,
    },
    nextTrainsTitle: {
        fontSize: 14,
        color: Colors.textLight,
        marginBottom: 8,
    },
    trainTimesContainer: {
        flexDirection: Platform.select({
            web: screenWidth > 600 ? "row" : "column",
            default: "row",
        }),
        justifyContent: "space-between",
        gap: 8,
    },
    trainTime: {
        alignItems: "center",
        backgroundColor: "#F0F4FF",
        borderRadius: 8,
        padding: 12,
        minWidth: Platform.select({
            web: screenWidth > 600 ? 80 : "100%",
            default: 80,
        }),
        flex: Platform.select({
            web: screenWidth > 600 ? 1 : undefined,
            default: 1,
        }),
    },
    trainTimeText: {
        fontSize: 16,
        fontWeight: "700",
        color: Colors.primary,
        marginBottom: 4,
    },
    trainDirectionText: {
        fontSize: 12,
        color: Colors.textLight,
    },
    stationsScroll: {
        marginBottom: 16,
    },
    stationsContainer: {
        paddingHorizontal: 4,
        gap: 12,
    },
    stationButton: {
        backgroundColor: Colors.card,
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: Colors.border,
        minWidth: 140,
    },
    selectedStationButton: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    stationButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: Colors.text,
        marginBottom: 4,
    },
    selectedStationButtonText: {
        color: "#FFFFFF",
    },
    stationDistance: {
        fontSize: 12,
        color: Colors.textLight,
    },
    quickActionsContainer: {
        marginBottom: 16,
    },
    quickActions: {
        flexDirection: Platform.select({
            web: screenWidth > 768 ? "row" : "column",
            default: "row",
        }),
        justifyContent: "space-between",
        gap: 12,
    },
    quickActionButton: {
        flex: Platform.select({
            web: screenWidth > 768 ? 1 : undefined,
            default: 1,
        }),
        backgroundColor: Colors.card,
        borderRadius: 12,
        padding: 16,
        alignItems: "center",
        gap: 8,
        minHeight: 80,
    },
    quickActionText: {
        fontSize: 12,
        fontWeight: "600",
        color: Colors.text,
        textAlign: "center",
    },
});
