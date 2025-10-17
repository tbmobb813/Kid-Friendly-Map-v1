import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { StyleSheet, Text, View, Pressable, Modal } from "react-native";
import Colors from "@/constants/colors";
import { useRegionStore } from "@/stores/regionStore";
import RegionSelector from "./RegionSelector";
import { Globe, X } from "lucide-react-native";
const RegionSwitcher = () => {
    const [showModal, setShowModal] = useState(false);
    const { currentRegion, availableRegions, userPreferences, setRegion } = useRegionStore();
    const handleRegionSelect = (regionId) => {
        setRegion(regionId);
        setShowModal(false);
    };
    return (_jsxs(_Fragment, { children: [_jsxs(Pressable, { style: styles.trigger, onPress: () => setShowModal(true), children: [_jsx(Globe, { size: 20, color: Colors.primary }), _jsx(Text, { style: styles.triggerText, children: currentRegion.name })] }), _jsx(Modal, { visible: showModal, animationType: "slide", presentationStyle: "pageSheet", children: _jsxs(View, { style: styles.modalContainer, children: [_jsxs(View, { style: styles.modalHeader, children: [_jsx(Text, { style: styles.modalTitle, children: "Switch Region" }), _jsx(Pressable, { style: styles.closeButton, onPress: () => setShowModal(false), children: _jsx(X, { size: 24, color: Colors.text }) })] }), _jsx(RegionSelector, { regions: availableRegions, selectedRegion: userPreferences.selectedRegion, onSelectRegion: handleRegionSelect })] }) })] }));
};
const styles = StyleSheet.create({
    trigger: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.card,
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        gap: 8,
    },
    triggerText: {
        fontSize: 14,
        fontWeight: "500",
        color: Colors.text,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    modalHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: Colors.text,
    },
    closeButton: {
        padding: 4,
    },
});
export default RegionSwitcher;
