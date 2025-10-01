import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { StyleSheet, View, Text } from "react-native";
import Colors from "@/constants/colors";
import { MapPin } from "lucide-react-native";
const MapPlaceholder = ({ message = "Map will appear here" }) => {
    return (_jsxs(View, { style: styles.container, children: [_jsx(View, { style: styles.iconContainer, children: _jsx(MapPin, { size: 40, color: Colors.primary }) }), _jsx(Text, { style: styles.message, children: message })] }));
};
const styles = StyleSheet.create({
    container: {
        width: "100%",
        height: 300,
        backgroundColor: Colors.mapWater,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 12,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#FFFFFF",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    message: {
        fontSize: 16,
        color: Colors.text,
        fontWeight: "500",
    },
});
export default MapPlaceholder;
