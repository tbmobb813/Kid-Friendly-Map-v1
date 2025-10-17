import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import Colors from "@/constants/colors";
import { ImageOff } from "lucide-react-native";
const OptimizedImage = ({ source, style, placeholder, contentFit = "cover", onLoad, onError, }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const handleLoad = () => {
        setLoading(false);
        onLoad?.();
    };
    const handleError = () => {
        setLoading(false);
        setError(true);
        onError?.();
    };
    if (error) {
        return (_jsx(View, { style: [styles.errorContainer, style], children: _jsx(ImageOff, { size: 24, color: Colors.textLight }) }));
    }
    return (_jsxs(View, { style: style, children: [_jsx(Image, { source: source, style: [StyleSheet.absoluteFill], contentFit: contentFit, placeholder: placeholder, onLoad: handleLoad, onError: handleError, cachePolicy: "memory-disk" }), loading && (_jsx(View, { style: styles.loadingContainer, children: _jsx(ActivityIndicator, { size: "small", color: Colors.primary }) }))] }));
};
const styles = StyleSheet.create({
    errorContainer: {
        backgroundColor: Colors.border,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.card,
    },
});
export default OptimizedImage;
