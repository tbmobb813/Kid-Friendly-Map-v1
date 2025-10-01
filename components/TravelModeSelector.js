import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import Colors from "@/constants/colors";
import { Train, Car, Bike, MapPin } from "lucide-react-native";
const TravelModeSelector = ({ selectedMode, onModeChange }) => {
    const modes = [
        { mode: "transit", icon: _jsx(Train, { size: 20 }), label: "Transit" },
        { mode: "walking", icon: _jsx(MapPin, { size: 20 }), label: "Walk" },
        { mode: "biking", icon: _jsx(Bike, { size: 20 }), label: "Bike" },
        { mode: "driving", icon: _jsx(Car, { size: 20 }), label: "Drive" },
    ];
    return (_jsxs(View, { style: styles.container, children: [_jsx(Text, { style: styles.title, children: "Travel Mode" }), _jsx(View, { style: styles.modesContainer, children: modes.map(({ mode, icon, label }) => {
                    const isSelected = selectedMode === mode;
                    return (_jsxs(Pressable, { style: [styles.modeButton, isSelected && styles.selectedMode], onPress: () => onModeChange(mode), children: [_jsx(View, { style: [styles.iconContainer, isSelected && styles.selectedIcon], children: React.cloneElement(icon, {
                                    color: isSelected ? "#FFFFFF" : Colors.textLight,
                                }) }), _jsx(Text, { style: [styles.modeLabel, isSelected && styles.selectedLabel], children: label })] }, mode));
                }) })] }));
};
const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    title: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.text,
        marginBottom: 12,
    },
    modesContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 8,
    },
    modeButton: {
        flex: 1,
        alignItems: "center",
        padding: 12,
        borderRadius: 12,
        backgroundColor: Colors.card,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    selectedMode: {
        borderColor: Colors.primary,
        backgroundColor: "#F0F4FF",
    },
    iconContainer: {
        marginBottom: 4,
    },
    selectedIcon: {
        backgroundColor: Colors.primary,
        borderRadius: 16,
        padding: 4,
    },
    modeLabel: {
        fontSize: 12,
        fontWeight: "500",
        color: Colors.textLight,
    },
    selectedLabel: {
        color: Colors.primary,
        fontWeight: "600",
    },
});
export default TravelModeSelector;
