import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { StyleSheet, Text, View, Pressable } from "react-native";
import Colors from "@/constants/colors";
import { Lightbulb, X } from "lucide-react-native";
const FunFactCard = ({ fact, location, onDismiss }) => {
    return (_jsxs(View, { style: styles.container, children: [_jsxs(View, { style: styles.header, children: [_jsx(View, { style: styles.iconContainer, children: _jsx(Lightbulb, { size: 20, color: Colors.secondary }) }), _jsx(Text, { style: styles.title, children: location ? `Fun Fact about ${location}` : "Did You Know?" }), onDismiss && (_jsx(Pressable, { style: styles.dismissButton, onPress: onDismiss, children: _jsx(X, { size: 16, color: Colors.textLight }) }))] }), _jsx(Text, { style: styles.factText, children: fact })] }));
};
const styles = StyleSheet.create({
    container: {
        backgroundColor: "#F0FFF4",
        borderRadius: 12,
        padding: 16,
        margin: 16,
        borderLeftWidth: 4,
        borderLeftColor: Colors.secondary,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    iconContainer: {
        marginRight: 8,
    },
    title: {
        flex: 1,
        fontSize: 14,
        fontWeight: "600",
        color: Colors.text,
    },
    dismissButton: {
        padding: 4,
    },
    factText: {
        fontSize: 14,
        color: Colors.text,
        lineHeight: 20,
    },
});
export default FunFactCard;
