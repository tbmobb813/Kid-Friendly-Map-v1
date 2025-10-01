import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/colors";
import { WifiOff } from "lucide-react-native";
const OfflineIndicator = () => {
    const [isOnline, setIsOnline] = useState(true);
    // Simulate network status checking
    useEffect(() => {
        // In a real app, you'd use NetInfo or similar
        const checkConnection = () => {
            // Mock offline detection
            setIsOnline(Math.random() > 0.1); // 90% chance of being online
        };
        const interval = setInterval(checkConnection, 10000);
        return () => clearInterval(interval);
    }, []);
    if (isOnline)
        return null;
    return (_jsxs(View, { style: styles.container, children: [_jsx(WifiOff, { size: 16, color: "#FFFFFF" }), _jsx(Text, { style: styles.text, children: "Offline Mode - Limited features available" })] }));
};
const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.warning,
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
    },
});
export default OfflineIndicator;
