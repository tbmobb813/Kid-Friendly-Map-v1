import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { StyleSheet, Text, View, FlatList } from "react-native";
import Colors from "@/constants/colors";
import { useRegionStore } from "@/stores/regionStore";
import { Train, Bus, Navigation, Ship } from "lucide-react-native";
const RegionalTransitCard = () => {
    const { currentRegion, getCurrentTransitSystems } = useRegionStore();
    const transitSystems = getCurrentTransitSystems();
    const getTransitIcon = (type) => {
        switch (type) {
            case "subway":
            case "train":
                return _jsx(Train, { size: 20, color: "#FFFFFF" });
            case "bus":
                return _jsx(Bus, { size: 20, color: "#FFFFFF" });
            case "tram":
                return _jsx(Navigation, { size: 20, color: "#FFFFFF" });
            case "ferry":
                return _jsx(Ship, { size: 20, color: "#FFFFFF" });
            default:
                return _jsx(Train, { size: 20, color: "#FFFFFF" });
        }
    };
    const renderTransitSystem = ({ item }) => (_jsxs(View, { style: styles.transitItem, children: [_jsx(View, { style: [styles.transitIcon, { backgroundColor: item.color }], children: getTransitIcon(item.type) }), _jsxs(View, { style: styles.transitInfo, children: [_jsx(Text, { style: styles.transitName, children: item.name }), _jsxs(Text, { style: styles.transitType, children: [item.type.charAt(0).toUpperCase() + item.type.slice(1), item.routes && ` • ${item.routes.length} lines`] })] })] }));
    return (_jsxs(View, { style: styles.container, children: [_jsxs(View, { style: styles.header, children: [_jsxs(Text, { style: styles.title, children: ["Transit Systems in ", currentRegion.name] }), _jsx(Text, { style: styles.subtitle, children: currentRegion.country })] }), _jsx(FlatList, { data: transitSystems, renderItem: renderTransitSystem, keyExtractor: (item) => item.id, scrollEnabled: false, contentContainerStyle: styles.transitList }), _jsx(View, { style: styles.footer, children: _jsxs(Text, { style: styles.footerText, children: ["Emergency: ", currentRegion.emergencyNumber] }) })] }));
};
const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.card,
        borderRadius: 12,
        padding: 16,
        margin: 16,
    },
    header: {
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    title: {
        fontSize: 18,
        fontWeight: "600",
        color: Colors.text,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: Colors.textLight,
    },
    transitList: {
        gap: 12,
    },
    transitItem: {
        flexDirection: "row",
        alignItems: "center",
    },
    transitIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    transitInfo: {
        flex: 1,
    },
    transitName: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.text,
        marginBottom: 2,
    },
    transitType: {
        fontSize: 12,
        color: Colors.textLight,
    },
    footer: {
        marginTop: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    footerText: {
        fontSize: 14,
        color: Colors.error,
        fontWeight: "600",
        textAlign: "center",
    },
});
export default RegionalTransitCard;
