import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { StyleSheet, Text, View, Pressable } from "react-native";
import Colors from "@/constants/colors";
import { Clock, ArrowRight } from "lucide-react-native";
import TransitStepIndicator from "./TransitStepIndicator";
const RouteCard = ({ route, onPress, isSelected = false }) => {
    return (_jsxs(Pressable, { style: ({ pressed }) => [
            styles.container,
            isSelected && styles.selected,
            pressed && styles.pressed,
        ], onPress: () => onPress(route), children: [_jsxs(View, { style: styles.timeContainer, children: [_jsxs(Text, { style: styles.duration, children: [route.totalDuration, " min"] }), _jsxs(View, { style: styles.timeRow, children: [_jsx(Clock, { size: 14, color: Colors.textLight, style: styles.clockIcon }), _jsxs(Text, { style: styles.timeText, children: [route.departureTime, " - ", route.arrivalTime] })] })] }), _jsx(View, { style: styles.stepsContainer, children: route.steps.map((step, index) => (_jsxs(View, { style: styles.stepRow, children: [_jsx(TransitStepIndicator, { step: step }), index < route.steps.length - 1 && (_jsx(ArrowRight, { size: 14, color: Colors.textLight, style: styles.arrowIcon }))] }, step.id))) })] }));
};
const styles = StyleSheet.create({
    container: {
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
    selected: {
        borderWidth: 2,
        borderColor: Colors.primary,
    },
    pressed: {
        opacity: 0.8,
        backgroundColor: "#EAEAEA",
    },
    timeContainer: {
        marginBottom: 12,
    },
    duration: {
        fontSize: 18,
        fontWeight: "700",
        color: Colors.text,
        marginBottom: 4,
    },
    timeRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    clockIcon: {
        marginRight: 4,
    },
    timeText: {
        fontSize: 14,
        color: Colors.textLight,
    },
    stepsContainer: {
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "wrap",
    },
    stepRow: {
        flexDirection: "row",
        alignItems: "center",
        marginRight: 4,
    },
    arrowIcon: {
        marginHorizontal: 4,
    },
});
export default RouteCard;
