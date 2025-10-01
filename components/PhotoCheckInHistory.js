import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { StyleSheet, Text, View, ScrollView, Image } from "react-native";
import { useNavigationStore } from "@/stores/navigationStore";
import Colors from "@/constants/colors";
import { CheckCircle, XCircle, MapPin, Clock } from "lucide-react-native";
import { formatDistance, getLocationAccuracyDescription } from "@/utils/locationUtils";
const PhotoCheckInHistory = () => {
    const { photoCheckIns } = useNavigationStore();
    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };
    if (photoCheckIns.length === 0) {
        return (_jsxs(View, { style: styles.emptyContainer, children: [_jsx(MapPin, { size: 40, color: Colors.textLight }), _jsx(Text, { style: styles.emptyText, children: "No check-ins yet" }), _jsx(Text, { style: styles.emptySubtext, children: "Take a photo check-in when you arrive at your destination!" })] }));
    }
    return (_jsxs(ScrollView, { style: styles.container, showsVerticalScrollIndicator: false, children: [_jsx(Text, { style: styles.title, children: "Photo Check-in History" }), photoCheckIns.map((checkIn) => (_jsxs(View, { style: styles.checkInCard, children: [_jsxs(View, { style: styles.cardHeader, children: [_jsxs(View, { style: styles.headerLeft, children: [_jsx(Text, { style: styles.placeName, children: checkIn.placeName }), _jsxs(View, { style: styles.timestampRow, children: [_jsx(Clock, { size: 14, color: Colors.textLight }), _jsx(Text, { style: styles.timestamp, children: formatTimestamp(checkIn.timestamp) })] })] }), checkIn.isLocationVerified !== undefined && (_jsxs(View, { style: [
                                    styles.verificationBadge,
                                    checkIn.isLocationVerified ? styles.verifiedBadge : styles.unverifiedBadge
                                ], children: [checkIn.isLocationVerified ? (_jsx(CheckCircle, { size: 16, color: "#10B981" })) : (_jsx(XCircle, { size: 16, color: "#EF4444" })), _jsx(Text, { style: [
                                            styles.verificationText,
                                            checkIn.isLocationVerified ? styles.verifiedText : styles.unverifiedText
                                        ], children: checkIn.isLocationVerified ? "Verified" : "Unverified" })] }))] }), _jsx(Image, { source: { uri: checkIn.photoUrl }, style: styles.photo }), checkIn.notes && (_jsx(Text, { style: styles.notes, children: checkIn.notes })), checkIn.distanceFromPlace !== undefined && (_jsxs(View, { style: styles.locationInfo, children: [_jsx(MapPin, { size: 14, color: Colors.textLight }), _jsxs(Text, { style: styles.locationText, children: [getLocationAccuracyDescription(checkIn.distanceFromPlace), "(", formatDistance(checkIn.distanceFromPlace), " from destination)"] })] }))] }, checkIn.id)))] }));
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        padding: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
        color: Colors.text,
        marginBottom: 16,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 32,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: "600",
        color: Colors.text,
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: Colors.textLight,
        textAlign: "center",
        lineHeight: 20,
    },
    checkInCard: {
        backgroundColor: Colors.card,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    headerLeft: {
        flex: 1,
    },
    placeName: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.text,
        marginBottom: 4,
    },
    timestampRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    timestamp: {
        fontSize: 12,
        color: Colors.textLight,
    },
    verificationBadge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    verifiedBadge: {
        backgroundColor: "#DCFCE7",
    },
    unverifiedBadge: {
        backgroundColor: "#FEE2E2",
    },
    verificationText: {
        fontSize: 12,
        fontWeight: "600",
    },
    verifiedText: {
        color: "#10B981",
    },
    unverifiedText: {
        color: "#EF4444",
    },
    photo: {
        width: "100%",
        height: 200,
        borderRadius: 8,
        marginBottom: 12,
    },
    notes: {
        fontSize: 14,
        color: Colors.text,
        fontStyle: "italic",
        marginBottom: 8,
    },
    locationInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    locationText: {
        fontSize: 12,
        color: Colors.textLight,
    },
});
export default PhotoCheckInHistory;
