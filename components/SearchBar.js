import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { StyleSheet, TextInput, View, Pressable } from "react-native";
import { Search, X } from "lucide-react-native";
import Colors from "@/constants/colors";
const SearchBar = ({ value, onChangeText, onClear, placeholder = "Where do you want to go?", }) => {
    return (_jsxs(View, { style: styles.container, children: [_jsx(Search, { size: 20, color: Colors.textLight, style: styles.icon }), _jsx(TextInput, { style: styles.input, value: value, onChangeText: onChangeText, placeholder: placeholder, placeholderTextColor: Colors.textLight, autoCapitalize: "none" }), value.length > 0 && (_jsx(Pressable, { onPress: onClear, style: styles.clearButton, children: _jsx(X, { size: 18, color: Colors.textLight }) }))] }));
};
const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.card,
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 56,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    icon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: Colors.text,
    },
    clearButton: {
        padding: 4,
    },
});
export default SearchBar;
