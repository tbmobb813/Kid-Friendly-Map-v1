import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { StyleSheet, Text, View, Pressable } from "react-native";
import Colors from "@/constants/colors";
import { WifiOff, RefreshCw } from "lucide-react-native";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
const NetworkStatusBar = ({ onRetry }) => {
    const { isConnected, isInternetReachable } = useNetworkStatus();
    if (isConnected && isInternetReachable)
        return null;
    return (_jsxs(View, { style: styles.container, children: [_jsx(WifiOff, { size: 16, color: "#FFFFFF" }), _jsx(Text, { style: styles.text, children: !isConnected ? "No connection" : "Limited connectivity" }), onRetry && (_jsx(Pressable, { style: styles.retryButton, onPress: onRetry, children: _jsx(RefreshCw, { size: 14, color: "#FFFFFF" }) }))] }));
};
const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.error,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 8,
        paddingHorizontal: 16,
        gap: 8,
    },
    text: {
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: "600",
        flex: 1,
        textAlign: "center",
    },
    retryButton: {
        padding: 4,
    },
});
export default NetworkStatusBar;
