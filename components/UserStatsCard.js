import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { StyleSheet, Text, View, Pressable } from "react-native";
import Colors from "@/constants/colors";
import { Trophy, MapPin, Zap, Target } from "lucide-react-native";
const UserStatsCard = ({ stats, onPetClick }) => {
    const getProgressToNextLevel = () => {
        const pointsForCurrentLevel = (stats.level - 1) * 200;
        const pointsForNextLevel = stats.level * 200;
        const progress = (stats.totalPoints - pointsForCurrentLevel) / (pointsForNextLevel - pointsForCurrentLevel);
        return Math.max(0, Math.min(1, progress));
    };
    return (_jsxs(View, { style: styles.container, children: [_jsxs(View, { style: styles.header, children: [_jsxs(View, { style: styles.levelContainer, children: [_jsx(Trophy, { size: 24, color: Colors.primary }), _jsxs(Text, { style: styles.levelText, children: ["Level ", stats.level] })] }), _jsxs(View, { style: styles.headerRight, children: [_jsxs(Text, { style: styles.pointsText, children: [stats.totalPoints, " points"] }), onPetClick && (_jsxs(Pressable, { style: styles.petButton, onPress: onPetClick, children: [_jsx(Text, { style: styles.petEmoji, children: "\uD83D\uDC32" }), _jsx(Text, { style: styles.petText, children: "Pet" })] }))] })] }), _jsxs(View, { style: styles.progressContainer, children: [_jsx(View, { style: styles.progressBar, children: _jsx(View, { style: [
                                styles.progressFill,
                                { width: `${getProgressToNextLevel() * 100}%` }
                            ] }) }), _jsxs(Text, { style: styles.progressText, children: [Math.round(getProgressToNextLevel() * 100), "% to Level ", stats.level + 1] })] }), _jsxs(View, { style: styles.statsGrid, children: [_jsxs(View, { style: styles.statItem, children: [_jsx(MapPin, { size: 20, color: Colors.secondary }), _jsx(Text, { style: styles.statNumber, children: stats.totalTrips }), _jsx(Text, { style: styles.statLabel, children: "Trips" })] }), _jsxs(View, { style: styles.statItem, children: [_jsx(Target, { size: 20, color: Colors.primary }), _jsx(Text, { style: styles.statNumber, children: stats.placesVisited }), _jsx(Text, { style: styles.statLabel, children: "Places" })] }), _jsxs(View, { style: styles.statItem, children: [_jsx(Zap, { size: 20, color: Colors.warning }), _jsx(Text, { style: styles.statNumber, children: stats.streakDays }), _jsx(Text, { style: styles.statLabel, children: "Day Streak" })] })] })] }));
};
const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.card,
        borderRadius: 16,
        padding: 20,
        margin: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    levelContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    levelText: {
        fontSize: 20,
        fontWeight: "700",
        color: Colors.text,
    },
    headerRight: {
        alignItems: 'flex-end',
        gap: 8,
    },
    pointsText: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.primary,
    },
    petButton: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.primaryLight,
        borderRadius: 8,
        padding: 8,
        minWidth: 50,
    },
    petEmoji: {
        fontSize: 20,
        marginBottom: 2,
    },
    petText: {
        fontSize: 10,
        fontWeight: '600',
        color: Colors.primary,
    },
    progressContainer: {
        marginBottom: 20,
    },
    progressBar: {
        height: 8,
        backgroundColor: Colors.border,
        borderRadius: 4,
        overflow: "hidden",
        marginBottom: 8,
    },
    progressFill: {
        height: "100%",
        backgroundColor: Colors.primary,
        borderRadius: 4,
    },
    progressText: {
        fontSize: 12,
        color: Colors.textLight,
        textAlign: "center",
    },
    statsGrid: {
        flexDirection: "row",
        justifyContent: "space-around",
    },
    statItem: {
        alignItems: "center",
        gap: 4,
    },
    statNumber: {
        fontSize: 18,
        fontWeight: "700",
        color: Colors.text,
    },
    statLabel: {
        fontSize: 12,
        color: Colors.textLight,
        fontWeight: "500",
    },
});
export default UserStatsCard;
