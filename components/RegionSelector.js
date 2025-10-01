import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { StyleSheet, Text, View, FlatList, Pressable } from "react-native";
import Colors from "@/constants/colors";
import { MapPin, Check } from "lucide-react-native";
const RegionSelector = ({ regions, selectedRegion, onSelectRegion, }) => {
    const renderRegion = ({ item }) => (_jsxs(Pressable, { style: [
            styles.regionItem,
            selectedRegion === item.id && styles.selectedRegion
        ], onPress: () => onSelectRegion(item.id), children: [_jsxs(View, { style: styles.regionInfo, children: [_jsx(MapPin, { size: 24, color: Colors.primary }), _jsxs(View, { style: styles.regionText, children: [_jsx(Text, { style: styles.regionName, children: item.name }), _jsx(Text, { style: styles.regionCountry, children: item.country }), _jsxs(Text, { style: styles.regionDetails, children: [item.transitSystems.length, " transit systems \u2022 ", item.currency] })] })] }), selectedRegion === item.id && (_jsx(Check, { size: 24, color: Colors.success }))] }));
    return (_jsxs(View, { style: styles.container, children: [_jsx(Text, { style: styles.title, children: "Choose Your Region" }), _jsx(Text, { style: styles.subtitle, children: "Select your city to get accurate transit information and local content." }), _jsx(FlatList, { data: regions, renderItem: renderRegion, keyExtractor: (item) => item.id, contentContainerStyle: styles.regionsList })] }));
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: "700",
        color: Colors.text,
        marginBottom: 8,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 16,
        color: Colors.textLight,
        textAlign: "center",
        marginBottom: 24,
        lineHeight: 22,
    },
    regionsList: {
        paddingBottom: 16,
    },
    regionItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: Colors.card,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: "transparent",
    },
    selectedRegion: {
        borderColor: Colors.primary,
        backgroundColor: "#F0F4FF",
    },
    regionInfo: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    regionText: {
        marginLeft: 16,
        flex: 1,
    },
    regionName: {
        fontSize: 18,
        fontWeight: "600",
        color: Colors.text,
        marginBottom: 4,
    },
    regionCountry: {
        fontSize: 14,
        color: Colors.textLight,
        marginBottom: 2,
    },
    regionDetails: {
        fontSize: 12,
        color: Colors.textLight,
    },
});
export default RegionSelector;
