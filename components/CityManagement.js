import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { StyleSheet, Text, View, ScrollView, Pressable, TextInput, Alert } from "react-native";
import Colors from "@/constants/colors";
import { Search, Plus, MapPin, Trash2, Edit3, Globe, Clock, Phone } from "lucide-react-native";
import { useRegionStore } from "@/stores/regionStore";
export default function CityManagement({ onBack }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingRegion, setEditingRegion] = useState(null);
    const { availableRegions, currentRegion, setRegion, addCustomRegion, removeRegion, updateRegionTransitData, searchRegions, getRegionsByCountry } = useRegionStore();
    const filteredRegions = searchQuery
        ? searchRegions(searchQuery)
        : availableRegions;
    const usRegions = getRegionsByCountry("United States");
    const internationalRegions = availableRegions.filter(r => r.country !== "United States");
    const handleDeleteRegion = (regionId) => {
        if (regionId === currentRegion.id) {
            Alert.alert("Cannot Delete", "You cannot delete the currently selected region.");
            return;
        }
        Alert.alert("Delete Region", "Are you sure you want to delete this region? This action cannot be undone.", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: () => removeRegion(regionId)
            }
        ]);
    };
    const handleUpdateTransitData = (regionId) => {
        Alert.alert("Update Transit Data", "This would typically connect to the region's transit API to fetch the latest schedules and route information.", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Update",
                onPress: () => {
                    // In a real app, this would make API calls to update transit data
                    Alert.alert("Success", "Transit data updated successfully!");
                }
            }
        ]);
    };
    const RegionCard = ({ region }) => (_jsxs(View, { style: [
            styles.regionCard,
            region.id === currentRegion.id && styles.currentRegionCard
        ], children: [_jsx(Pressable, { style: styles.regionHeader, onPress: () => setRegion(region.id), children: _jsxs(View, { style: styles.regionInfo, children: [_jsxs(View, { style: styles.regionTitleRow, children: [_jsx(MapPin, { size: 20, color: Colors.primary }), _jsx(Text, { style: styles.regionName, children: region.name }), region.id === currentRegion.id && (_jsx(View, { style: styles.currentBadge, children: _jsx(Text, { style: styles.currentBadgeText, children: "Current" }) }))] }), _jsxs(View, { style: styles.regionDetails, children: [_jsxs(View, { style: styles.detailItem, children: [_jsx(Globe, { size: 14, color: Colors.textLight }), _jsx(Text, { style: styles.detailText, children: region.country })] }), _jsxs(View, { style: styles.detailItem, children: [_jsx(Clock, { size: 14, color: Colors.textLight }), _jsx(Text, { style: styles.detailText, children: region.timezone })] }), _jsxs(View, { style: styles.detailItem, children: [_jsx(Phone, { size: 14, color: Colors.textLight }), _jsx(Text, { style: styles.detailText, children: region.emergencyNumber })] })] }), _jsxs(Text, { style: styles.transitCount, children: [region.transitSystems.length, " transit system", region.transitSystems.length !== 1 ? 's' : ''] })] }) }), _jsxs(View, { style: styles.regionActions, children: [_jsx(Pressable, { style: styles.actionButton, onPress: () => handleUpdateTransitData(region.id), children: _jsx(Text, { style: styles.actionButtonText, children: "Update Transit" }) }), _jsx(Pressable, { style: styles.actionButton, onPress: () => setEditingRegion(region), children: _jsx(Edit3, { size: 16, color: Colors.primary }) }), _jsx(Pressable, { style: [styles.actionButton, styles.deleteButton], onPress: () => handleDeleteRegion(region.id), children: _jsx(Trash2, { size: 16, color: "#FF4444" }) })] })] }));
    if (showAddForm || editingRegion) {
        return (_jsx(AddEditRegionForm, { region: editingRegion, onSave: (region) => {
                if (editingRegion) {
                    updateRegionTransitData(region.id, region);
                }
                else {
                    addCustomRegion(region);
                }
                setShowAddForm(false);
                setEditingRegion(null);
            }, onCancel: () => {
                setShowAddForm(false);
                setEditingRegion(null);
            } }));
    }
    return (_jsxs(ScrollView, { style: styles.container, children: [_jsxs(View, { style: styles.header, children: [_jsx(Pressable, { style: styles.backButton, onPress: onBack, children: _jsx(Text, { style: styles.backButtonText, children: "\u2190 Back" }) }), _jsx(Text, { style: styles.title, children: "City Management" }), _jsxs(Pressable, { style: styles.addButton, onPress: () => setShowAddForm(true), children: [_jsx(Plus, { size: 20, color: "#FFFFFF" }), _jsx(Text, { style: styles.addButtonText, children: "Add City" })] })] }), _jsxs(View, { style: styles.searchContainer, children: [_jsx(Search, { size: 20, color: Colors.textLight }), _jsx(TextInput, { style: styles.searchInput, placeholder: "Search cities...", value: searchQuery, onChangeText: setSearchQuery, placeholderTextColor: Colors.textLight })] }), _jsxs(View, { style: styles.section, children: [_jsxs(Text, { style: styles.sectionTitle, children: ["United States (", usRegions.length, ")"] }), (searchQuery ? filteredRegions.filter(r => r.country === "United States") : usRegions).map((region) => (_jsx(RegionCard, { region: region }, region.id)))] }), _jsxs(View, { style: styles.section, children: [_jsxs(Text, { style: styles.sectionTitle, children: ["International (", internationalRegions.length, ")"] }), (searchQuery ? filteredRegions.filter(r => r.country !== "United States") : internationalRegions).map((region) => (_jsx(RegionCard, { region: region }, region.id)))] }), _jsxs(View, { style: styles.infoSection, children: [_jsx(Text, { style: styles.infoTitle, children: "Transit Data Updates" }), _jsx(Text, { style: styles.infoText, children: "Transit schedules and route information are automatically updated when available. You can manually refresh data for any city by tapping \"Update Transit\"." }), _jsx(Text, { style: styles.infoText, children: "Custom cities can be added with their own transit API endpoints for real-time data integration." })] })] }));
}
function AddEditRegionForm({ region, onSave, onCancel }) {
    const [formData, setFormData] = useState({
        id: region?.id || "",
        name: region?.name || "",
        country: region?.country || "United States",
        timezone: region?.timezone || "America/New_York",
        currency: region?.currency || "USD",
        language: region?.language || "en",
        coordinates: region?.coordinates || { latitude: 0, longitude: 0 },
        emergencyNumber: region?.emergencyNumber || "911",
        transitApiEndpoint: region?.transitApiEndpoint || "",
        mapStyle: region?.mapStyle || "standard",
        transitSystems: region?.transitSystems || [],
        safetyTips: region?.safetyTips || [],
        funFacts: region?.funFacts || [],
        popularPlaces: region?.popularPlaces || []
    });
    const handleSave = () => {
        if (!formData.id || !formData.name || !formData.country) {
            Alert.alert("Error", "Please fill in all required fields.");
            return;
        }
        onSave(formData);
    };
    return (_jsxs(ScrollView, { style: styles.container, children: [_jsxs(View, { style: styles.header, children: [_jsx(Pressable, { style: styles.backButton, onPress: onCancel, children: _jsx(Text, { style: styles.backButtonText, children: "Cancel" }) }), _jsxs(Text, { style: styles.title, children: [region ? "Edit" : "Add", " City"] }), _jsx(Pressable, { style: styles.saveButton, onPress: handleSave, children: _jsx(Text, { style: styles.saveButtonText, children: "Save" }) })] }), _jsxs(View, { style: styles.formSection, children: [_jsx(Text, { style: styles.formLabel, children: "City ID *" }), _jsx(TextInput, { style: styles.formInput, value: formData.id, onChangeText: (text) => setFormData({ ...formData, id: text }), placeholder: "e.g., nyc, chicago", editable: !region })] }), _jsxs(View, { style: styles.formSection, children: [_jsx(Text, { style: styles.formLabel, children: "City Name *" }), _jsx(TextInput, { style: styles.formInput, value: formData.name, onChangeText: (text) => setFormData({ ...formData, name: text }), placeholder: "e.g., New York City" })] }), _jsxs(View, { style: styles.formSection, children: [_jsx(Text, { style: styles.formLabel, children: "Country *" }), _jsx(TextInput, { style: styles.formInput, value: formData.country, onChangeText: (text) => setFormData({ ...formData, country: text }), placeholder: "e.g., United States" })] }), _jsxs(View, { style: styles.formSection, children: [_jsx(Text, { style: styles.formLabel, children: "Transit API Endpoint" }), _jsx(TextInput, { style: styles.formInput, value: formData.transitApiEndpoint, onChangeText: (text) => setFormData({ ...formData, transitApiEndpoint: text }), placeholder: "https://api.example.com/" })] }), _jsxs(View, { style: styles.formSection, children: [_jsx(Text, { style: styles.formLabel, children: "Emergency Number" }), _jsx(TextInput, { style: styles.formInput, value: formData.emergencyNumber, onChangeText: (text) => setFormData({ ...formData, emergencyNumber: text }), placeholder: "911" })] }), _jsx(Text, { style: styles.infoText, children: "Additional configuration options like transit systems, coordinates, and local information can be added through the advanced settings or by importing from a configuration file." })] }));
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    backButton: {
        padding: 8,
    },
    backButtonText: {
        fontSize: 16,
        color: Colors.primary,
        fontWeight: "600",
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
        color: Colors.text,
    },
    addButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 4,
    },
    addButtonText: {
        color: "#FFFFFF",
        fontWeight: "600",
        fontSize: 14,
    },
    saveButton: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    saveButtonText: {
        color: "#FFFFFF",
        fontWeight: "600",
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.card,
        margin: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        gap: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: Colors.text,
    },
    section: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: Colors.text,
        marginBottom: 16,
    },
    regionCard: {
        backgroundColor: Colors.card,
        borderRadius: 12,
        marginBottom: 12,
        overflow: "hidden",
    },
    currentRegionCard: {
        borderWidth: 2,
        borderColor: Colors.primary,
    },
    regionHeader: {
        padding: 16,
    },
    regionInfo: {
        gap: 8,
    },
    regionTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    regionName: {
        fontSize: 18,
        fontWeight: "600",
        color: Colors.text,
        flex: 1,
    },
    currentBadge: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    currentBadgeText: {
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: "600",
    },
    regionDetails: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 16,
    },
    detailItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    detailText: {
        fontSize: 14,
        color: Colors.textLight,
    },
    transitCount: {
        fontSize: 14,
        color: Colors.textLight,
        fontStyle: "italic",
    },
    regionActions: {
        flexDirection: "row",
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        padding: 12,
        gap: 8,
    },
    actionButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: "#F0F4FF",
        gap: 4,
    },
    actionButtonText: {
        fontSize: 14,
        color: Colors.primary,
        fontWeight: "500",
    },
    deleteButton: {
        backgroundColor: "#FFF0F0",
    },
    infoSection: {
        padding: 16,
        backgroundColor: Colors.card,
        margin: 16,
        borderRadius: 12,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.text,
        marginBottom: 8,
    },
    infoText: {
        fontSize: 14,
        color: Colors.textLight,
        lineHeight: 20,
        marginBottom: 8,
    },
    formSection: {
        padding: 16,
    },
    formLabel: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.text,
        marginBottom: 8,
    },
    formInput: {
        backgroundColor: Colors.card,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: Colors.text,
        borderWidth: 1,
        borderColor: Colors.border,
    },
});
