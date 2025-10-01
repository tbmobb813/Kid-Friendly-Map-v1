import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { StyleSheet, Text, View, ScrollView, Pressable, Dimensions, Platform } from "react-native";
import Colors from "@/constants/colors";
import AchievementBadge from "@/components/AchievementBadge";
import UserStatsCard from "@/components/UserStatsCard";
import { useGamificationStore } from "@/stores/gamificationStore";
import { Trophy, Star, Target, Calendar } from "lucide-react-native";
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
export default function AchievementsScreen() {
    const { achievements, userStats, tripJournal } = useGamificationStore();
    const [selectedTab, setSelectedTab] = useState("achievements");
    const unlockedAchievements = achievements.filter(a => a.unlocked);
    const lockedAchievements = achievements.filter(a => !a.unlocked);
    const renderJournalEntry = ({ item }) => (_jsxs(View, { style: styles.journalEntry, children: [_jsxs(View, { style: styles.journalHeader, children: [_jsx(Text, { style: styles.journalDate, children: new Date(item.date).toLocaleDateString() }), _jsx(View, { style: styles.ratingContainer, children: [1, 2, 3, 4, 5].map(star => (_jsx(Star, { size: 16, color: star <= item.rating ? "#FFD700" : Colors.border, fill: star <= item.rating ? "#FFD700" : "transparent" }, star))) })] }), _jsxs(Text, { style: styles.journalRoute, children: [item.from, " \u2192 ", item.to] }), item.notes && (_jsx(Text, { style: styles.journalNotes, children: item.notes })), item.funFacts.length > 0 && (_jsxs(View, { style: styles.funFactsContainer, children: [_jsx(Text, { style: styles.funFactsTitle, children: "Fun Facts Learned:" }), item.funFacts.map((fact, index) => (_jsxs(Text, { style: styles.funFact, children: ["\u2022 ", fact] }, index)))] }))] }));
    return (_jsxs(ScrollView, { style: styles.container, contentContainerStyle: styles.scrollContent, showsVerticalScrollIndicator: false, bounces: true, children: [_jsx(UserStatsCard, { stats: userStats }), _jsxs(View, { style: styles.tabContainer, children: [_jsxs(Pressable, { style: [
                            styles.tab,
                            selectedTab === "achievements" && styles.activeTab
                        ], onPress: () => setSelectedTab("achievements"), children: [_jsx(Trophy, { size: 20, color: selectedTab === "achievements" ? "#FFFFFF" : Colors.primary }), _jsx(Text, { style: [
                                    styles.tabText,
                                    selectedTab === "achievements" && styles.activeTabText
                                ], children: "Achievements" })] }), _jsxs(Pressable, { style: [
                            styles.tab,
                            selectedTab === "journal" && styles.activeTab
                        ], onPress: () => setSelectedTab("journal"), children: [_jsx(Calendar, { size: 20, color: selectedTab === "journal" ? "#FFFFFF" : Colors.primary }), _jsx(Text, { style: [
                                    styles.tabText,
                                    selectedTab === "journal" && styles.activeTabText
                                ], children: "Trip Journal" })] })] }), _jsx(View, { style: styles.content, children: selectedTab === "achievements" ? (_jsxs(_Fragment, { children: [unlockedAchievements.length > 0 && (_jsxs(_Fragment, { children: [_jsx(Text, { style: styles.sectionTitle, children: "Unlocked Achievements" }), _jsx(View, { style: styles.achievementsGrid, children: unlockedAchievements.map(achievement => (_jsx(AchievementBadge, { achievement: achievement, size: "large" }, achievement.id))) })] })), lockedAchievements.length > 0 && (_jsxs(_Fragment, { children: [_jsx(Text, { style: styles.sectionTitle, children: "Coming Soon" }), _jsx(View, { style: styles.achievementsGrid, children: lockedAchievements.map(achievement => (_jsx(AchievementBadge, { achievement: achievement, size: "medium" }, achievement.id))) })] }))] })) : (_jsx(_Fragment, { children: tripJournal.length > 0 ? (_jsx(View, { style: styles.journalContainer, children: tripJournal
                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                            .map(item => (_jsx(View, { children: renderJournalEntry({ item }) }, item.id))) })) : (_jsxs(View, { style: styles.emptyState, children: [_jsx(Target, { size: 40, color: Colors.textLight }), _jsx(Text, { style: styles.emptyText, children: "Start your first trip to begin your journey journal!" })] })) })) })] }));
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 32,
    },
    tabContainer: {
        flexDirection: "row",
        margin: 16,
        backgroundColor: Colors.card,
        borderRadius: 12,
        padding: 4,
    },
    tab: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
        borderRadius: 8,
        gap: 8,
    },
    activeTab: {
        backgroundColor: Colors.primary,
    },
    tabText: {
        fontSize: 14,
        fontWeight: "600",
        color: Colors.primary,
    },
    activeTabText: {
        color: "#FFFFFF",
    },
    content: {
        flex: 1,
        padding: 16,
        minHeight: 200,
    },
    journalContainer: {
        gap: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: Colors.text,
        marginBottom: 16,
    },
    achievementsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: Platform.select({
            web: screenWidth > 768 ? "space-around" : "center",
            default: "space-around",
        }),
        gap: 16,
        marginBottom: 24,
    },
    journalList: {
        paddingBottom: 16,
    },
    journalEntry: {
        backgroundColor: Colors.card,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    journalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    journalDate: {
        fontSize: 14,
        color: Colors.textLight,
        fontWeight: "500",
    },
    ratingContainer: {
        flexDirection: "row",
        gap: 2,
    },
    journalRoute: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.text,
        marginBottom: 8,
    },
    journalNotes: {
        fontSize: 14,
        color: Colors.text,
        marginBottom: 8,
        fontStyle: "italic",
    },
    funFactsContainer: {
        backgroundColor: "#F0FFF4",
        borderRadius: 8,
        padding: 12,
    },
    funFactsTitle: {
        fontSize: 12,
        fontWeight: "600",
        color: Colors.secondary,
        marginBottom: 4,
    },
    funFact: {
        fontSize: 12,
        color: Colors.text,
        marginBottom: 2,
    },
    emptyState: {
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
        minHeight: 300,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        color: Colors.textLight,
        textAlign: "center",
    },
});
