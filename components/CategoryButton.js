import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { StyleSheet, Text, Pressable, View } from "react-native";
import Colors from "@/constants/colors";
import { Home, GraduationCap, BookOpen, Trees, ShoppingBag, Pizza, Users, Heart, MapPin, Car, Bike, Bus, Train, Plane, Hospital, Church, Building, Gamepad2, Music, Camera, Gift, Coffee, Apple, Dumbbell, Palette, Star, Sun, Moon, Cloud, Umbrella, Flower } from "lucide-react-native";
const CategoryButton = ({ category, customCategory, onPress, size = 'large' }) => {
    const getIcon = (iconName, iconSize) => {
        const iconProps = { size: iconSize, color: "#FFF" };
        switch (iconName) {
            case "Home": return _jsx(Home, { ...iconProps });
            case "GraduationCap": return _jsx(GraduationCap, { ...iconProps });
            case "BookOpen": return _jsx(BookOpen, { ...iconProps });
            case "Trees": return _jsx(Trees, { ...iconProps });
            case "ShoppingBag": return _jsx(ShoppingBag, { ...iconProps });
            case "Pizza": return _jsx(Pizza, { ...iconProps });
            case "Users": return _jsx(Users, { ...iconProps });
            case "Heart": return _jsx(Heart, { ...iconProps });
            case "Car": return _jsx(Car, { ...iconProps });
            case "Bike": return _jsx(Bike, { ...iconProps });
            case "Bus": return _jsx(Bus, { ...iconProps });
            case "Train": return _jsx(Train, { ...iconProps });
            case "Plane": return _jsx(Plane, { ...iconProps });
            case "Hospital": return _jsx(Hospital, { ...iconProps });
            case "Church": return _jsx(Church, { ...iconProps });
            case "Building": return _jsx(Building, { ...iconProps });
            case "Gamepad2": return _jsx(Gamepad2, { ...iconProps });
            case "Music": return _jsx(Music, { ...iconProps });
            case "Camera": return _jsx(Camera, { ...iconProps });
            case "Gift": return _jsx(Gift, { ...iconProps });
            case "Coffee": return _jsx(Coffee, { ...iconProps });
            case "Apple": return _jsx(Apple, { ...iconProps });
            case "Dumbbell": return _jsx(Dumbbell, { ...iconProps });
            case "Palette": return _jsx(Palette, { ...iconProps });
            case "Star": return _jsx(Star, { ...iconProps });
            case "Sun": return _jsx(Sun, { ...iconProps });
            case "Moon": return _jsx(Moon, { ...iconProps });
            case "Cloud": return _jsx(Cloud, { ...iconProps });
            case "Umbrella": return _jsx(Umbrella, { ...iconProps });
            case "Flower": return _jsx(Flower, { ...iconProps });
            default: return _jsx(MapPin, { ...iconProps });
        }
    };
    const getSizeStyles = () => {
        switch (size) {
            case 'small':
                return { width: 80, height: 80, iconSize: 24 };
            case 'medium':
                return { width: 100, height: 100, iconSize: 28 };
            case 'large':
                return { width: 120, height: 120, iconSize: 36 };
            default:
                return { width: 120, height: 120, iconSize: 36 };
        }
    };
    const sizeStyles = getSizeStyles();
    // Use custom category data if provided, otherwise fall back to default category
    const displayName = customCategory ? customCategory.name : (category ? category.charAt(0).toUpperCase() + category.slice(1) : 'Other');
    const iconName = customCategory ? customCategory.icon : getDefaultIcon(category || 'other');
    const backgroundColor = customCategory ? customCategory.color : getDefaultColor(category || 'other');
    const categoryId = customCategory ? customCategory.id : category;
    function getDefaultIcon(cat) {
        switch (cat) {
            case "home": return "Home";
            case "school": return "GraduationCap";
            case "library": return "BookOpen";
            case "park": return "Trees";
            case "store": return "ShoppingBag";
            case "restaurant": return "Pizza";
            case "friend": return "Users";
            case "family": return "Heart";
            default: return "MapPin";
        }
    }
    function getDefaultColor(cat) {
        switch (cat) {
            case "home": return Colors.primary;
            case "school": return "#FF9500";
            case "library": return "#9C27B0";
            case "park": return Colors.secondary;
            case "store": return "#4285F4";
            case "restaurant": return "#FF6B6B";
            case "friend": return "#00BCD4";
            case "family": return "#FF4081";
            default: return Colors.primary;
        }
    }
    return (_jsxs(Pressable, { style: ({ pressed }) => [
            styles.container,
            {
                backgroundColor,
                width: sizeStyles.width,
                height: sizeStyles.height,
            },
            pressed && styles.pressed
        ], onPress: () => onPress(categoryId || 'other'), testID: `category-button-${categoryId}`, children: [_jsx(View, { style: styles.iconContainer, children: getIcon(iconName, sizeStyles.iconSize) }), _jsx(Text, { style: [styles.text, { fontSize: size === 'small' ? 12 : size === 'medium' ? 14 : 16 }], children: displayName })] }));
};
const styles = StyleSheet.create({
    container: {
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        margin: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
    },
    pressed: {
        opacity: 0.8,
        transform: [{ scale: 0.95 }],
    },
    iconContainer: {
        marginBottom: 8,
    },
    text: {
        color: "#FFF",
        fontWeight: "700",
        textAlign: "center",
        textShadowColor: "rgba(0,0,0,0.3)",
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
});
export default CategoryButton;
