import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { StyleSheet, Text, View, Pressable } from "react-native";
import Colors from "@/constants/colors";
import { Home, School, BookOpen, Trees, Store, Utensils, Users, Heart, MapPin } from "lucide-react-native";
const PlaceCard = ({ place, onPress }) => {
    const getIcon = () => {
        switch (place.category) {
            case "home":
                return _jsx(Home, { size: 24, color: Colors.primary });
            case "school":
                return _jsx(School, { size: 24, color: Colors.primary });
            case "library":
                return _jsx(BookOpen, { size: 24, color: Colors.primary });
            case "park":
                return _jsx(Trees, { size: 24, color: Colors.primary });
            case "store":
                return _jsx(Store, { size: 24, color: Colors.primary });
            case "restaurant":
                return _jsx(Utensils, { size: 24, color: Colors.primary });
            case "friend":
                return _jsx(Users, { size: 24, color: Colors.primary });
            case "family":
                return _jsx(Heart, { size: 24, color: Colors.primary });
            default:
                return _jsx(MapPin, { size: 24, color: Colors.primary });
        }
    };
    return (_jsxs(Pressable, { style: ({ pressed }) => [
            styles.container,
            pressed && styles.pressed
        ], onPress: () => onPress(place), children: [_jsx(View, { style: styles.iconContainer, children: getIcon() }), _jsxs(View, { style: styles.textContainer, children: [_jsx(Text, { style: styles.name, children: place.name }), _jsx(Text, { style: styles.address, numberOfLines: 1, children: place.address })] })] }));
};
const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.card,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    pressed: {
        opacity: 0.8,
        backgroundColor: "#EAEAEA",
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#EEF2FF",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
    },
    textContainer: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.text,
        marginBottom: 4,
    },
    address: {
        fontSize: 14,
        color: Colors.textLight,
    },
});
export default PlaceCard;
