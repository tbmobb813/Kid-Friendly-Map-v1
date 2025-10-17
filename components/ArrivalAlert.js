import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { StyleSheet, Text, View, Pressable } from "react-native";
import Colors from "@/constants/colors";
import { Bell, X } from "lucide-react-native";
import TransitStepIndicator from "./TransitStepIndicator";
const ArrivalAlert = ({ arrival, onDismiss }) => {
    return (_jsx(View, { style: styles.container, children: _jsxs(View, { style: styles.content, children: [_jsx(View, { style: styles.iconContainer, children: _jsx(Bell, { size: 20, color: Colors.warning }) }), _jsxs(View, { style: styles.alertInfo, children: [_jsxs(View, { style: styles.trainInfo, children: [_jsx(TransitStepIndicator, { step: {
                                        id: arrival.id,
                                        type: arrival.type,
                                        line: arrival.line,
                                        color: arrival.color,
                                        from: "",
                                        to: "",
                                        duration: 0
                                    }, size: "small" }), _jsxs(Text, { style: styles.alertText, children: ["Line ", arrival.line, " to ", arrival.destination, " is arriving now!"] })] }), arrival.platform && (_jsxs(Text, { style: styles.platformText, children: ["Platform ", arrival.platform] }))] }), _jsx(Pressable, { style: styles.dismissButton, onPress: onDismiss, children: _jsx(X, { size: 16, color: Colors.textLight }) })] }) }));
};
const styles = StyleSheet.create({
    container: {
        backgroundColor: "#FFF9E6",
        borderLeftWidth: 4,
        borderLeftColor: Colors.warning,
        borderRadius: 8,
        margin: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    content: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
    },
    iconContainer: {
        marginRight: 12,
    },
    alertInfo: {
        flex: 1,
    },
    trainInfo: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 4,
    },
    alertText: {
        fontSize: 14,
        fontWeight: "600",
        color: Colors.text,
        marginLeft: 8,
        flex: 1,
    },
    platformText: {
        fontSize: 12,
        color: Colors.textLight,
        marginLeft: 32,
    },
    dismissButton: {
        padding: 4,
    },
});
export default ArrivalAlert;
