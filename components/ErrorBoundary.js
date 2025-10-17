import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import Colors from "@/constants/colors";
import { AlertTriangle, RefreshCw } from "lucide-react-native";
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.retry = () => {
            this.setState({ hasError: false, error: null });
        };
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error("Error caught by boundary:", error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                const FallbackComponent = this.props.fallback;
                return _jsx(FallbackComponent, { error: this.state.error, retry: this.retry });
            }
            return (_jsxs(View, { style: styles.container, children: [_jsx(AlertTriangle, { size: 48, color: Colors.error }), _jsx(Text, { style: styles.title, children: "Oops! Something went wrong" }), _jsx(Text, { style: styles.message, children: this.state.error?.message || "An unexpected error occurred" }), _jsxs(Pressable, { style: styles.retryButton, onPress: this.retry, children: [_jsx(RefreshCw, { size: 20, color: "#FFFFFF" }), _jsx(Text, { style: styles.retryText, children: "Try Again" })] })] }));
        }
        return this.props.children;
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 32,
        backgroundColor: Colors.background,
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
        color: Colors.text,
        marginTop: 16,
        marginBottom: 8,
        textAlign: "center",
    },
    message: {
        fontSize: 16,
        color: Colors.textLight,
        textAlign: "center",
        marginBottom: 24,
        lineHeight: 24,
    },
    retryButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        gap: 8,
    },
    retryText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },
});
export default ErrorBoundary;
