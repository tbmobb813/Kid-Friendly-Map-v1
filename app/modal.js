import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { StatusBar } from "expo-status-bar";
import { Platform, StyleSheet, Text, View } from "react-native";
export default function ModalScreen() {
    return (_jsxs(View, { style: styles.container, children: [_jsx(Text, { style: styles.title, children: "Modal" }), _jsx(View, { style: styles.separator }), _jsx(Text, { children: "This is an example modal. You can edit it in app/modal.tsx." }), _jsx(StatusBar, { style: Platform.OS === "ios" ? "light" : "auto" })] }));
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
    },
    separator: {
        marginVertical: 30,
        height: 1,
        width: "80%",
    },
});
