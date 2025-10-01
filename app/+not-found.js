import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
export default function NotFoundScreen() {
    return (_jsxs(_Fragment, { children: [_jsx(Stack.Screen, { options: { title: "Oops!" } }), _jsxs(View, { style: styles.container, children: [_jsx(Text, { style: styles.title, children: "This screen doesn't exist." }), _jsx(Link, { href: "/", style: styles.link, children: _jsx(Text, { style: styles.linkText, children: "Go to home screen!" }) })] })] }));
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
    },
    link: {
        marginTop: 15,
        paddingVertical: 15,
    },
    linkText: {
        fontSize: 14,
        color: "#2e78b7",
    },
});
