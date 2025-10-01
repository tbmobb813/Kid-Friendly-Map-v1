import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { StyleSheet, Text, View, Pressable } from "react-native";
import Colors from "@/constants/colors";
const EmptyState = ({ icon: Icon, title, description, actionText, onAction, }) => {
    return (_jsxs(View, { style: styles.container, children: [_jsx(View, { style: styles.iconContainer, children: _jsx(Icon, { size: 48, color: Colors.textLight }) }), _jsx(Text, { style: styles.title, children: title }), _jsx(Text, { style: styles.description, children: description }), actionText && onAction && (_jsx(Pressable, { style: styles.actionButton, onPress: onAction, children: _jsx(Text, { style: styles.actionText, children: actionText }) }))] }));
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 32,
    },
    iconContainer: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: Colors.card,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 24,
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
        color: Colors.text,
        marginBottom: 8,
        textAlign: "center",
    },
    description: {
        fontSize: 16,
        color: Colors.textLight,
        textAlign: "center",
        lineHeight: 24,
        marginBottom: 24,
    },
    actionButton: {
        backgroundColor: Colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    actionText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },
});
export default EmptyState;
