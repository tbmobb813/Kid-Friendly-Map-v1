import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { StyleSheet, Text, View, FlatList, Pressable } from "react-native";
import Colors from "@/constants/colors";
import SearchBar from "./SearchBar";
import { MapPin, Clock, Star } from "lucide-react-native";
import { useDebounce } from "@/hooks/useDebounce";
const SearchWithSuggestions = ({ value, onChangeText, onSelectSuggestion, placeholder, suggestions = [], }) => {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const debouncedValue = useDebounce(value, 300);
    useEffect(() => {
        setShowSuggestions(debouncedValue.length > 0 && suggestions.length > 0);
    }, [debouncedValue, suggestions]);
    const getSuggestionIcon = (type) => {
        switch (type) {
            case "recent": return _jsx(Clock, { size: 16, color: Colors.textLight });
            case "popular": return _jsx(Star, { size: 16, color: Colors.warning });
            case "place": return _jsx(MapPin, { size: 16, color: Colors.primary });
            default: return _jsx(MapPin, { size: 16, color: Colors.textLight });
        }
    };
    const renderSuggestion = ({ item }) => (_jsxs(Pressable, { style: styles.suggestionItem, onPress: () => {
            onSelectSuggestion(item);
            setShowSuggestions(false);
        }, children: [getSuggestionIcon(item.type), _jsx(Text, { style: styles.suggestionText, numberOfLines: 1, children: item.text })] }));
    return (_jsxs(View, { style: styles.container, children: [_jsx(SearchBar, { value: value, onChangeText: onChangeText, onClear: () => {
                    onChangeText("");
                    setShowSuggestions(false);
                }, placeholder: placeholder }), showSuggestions && (_jsx(View, { style: styles.suggestionsContainer, children: _jsx(FlatList, { data: suggestions.slice(0, 5), renderItem: renderSuggestion, keyExtractor: (item) => item.id, keyboardShouldPersistTaps: "handled", style: styles.suggestionsList }) }))] }));
};
const styles = StyleSheet.create({
    container: {
        position: "relative",
    },
    suggestionsContainer: {
        position: "absolute",
        top: 60,
        left: 0,
        right: 0,
        backgroundColor: Colors.card,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
        zIndex: 1000,
    },
    suggestionsList: {
        maxHeight: 200,
    },
    suggestionItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        gap: 12,
    },
    suggestionText: {
        flex: 1,
        fontSize: 16,
        color: Colors.text,
    },
});
export default SearchWithSuggestions;
