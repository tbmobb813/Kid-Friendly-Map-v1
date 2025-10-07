import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/colors";
import TransitStepIndicator from "./TransitStepIndicator";
import { Clock } from "lucide-react-native";
const DirectionStep = ({ step, isLast }) => {
    return (_jsxs(View, { style: styles.container, children: [_jsxs(View, { style: styles.leftColumn, children: [_jsx(TransitStepIndicator, { step: step, size: "large" }), !isLast && _jsx(View, { style: styles.connector })] }), _jsxs(View, { style: styles.rightColumn, children: [_jsxs(View, { style: styles.headerRow, children: [_jsxs(Text, { style: styles.stepType, children: [step.type.charAt(0).toUpperCase() + step.type.slice(1), step.line && ` Line ${step.line}`] }), _jsxs(Text, { style: styles.duration, children: [step.duration, " min"] })] }), _jsxs(View, { style: styles.locationContainer, children: [_jsxs(View, { style: styles.locationRow, children: [_jsx(Text, { style: styles.locationLabel, children: "From:" }), _jsx(Text, { style: styles.locationText, children: step.from })] }), _jsxs(View, { style: styles.locationRow, children: [_jsx(Text, { style: styles.locationLabel, children: "To:" }), _jsx(Text, { style: styles.locationText, children: step.to })] })] }), (step.departureTime && step.arrivalTime) && (_jsxs(View, { style: styles.timeContainer, children: [_jsx(Clock, { size: 14, color: Colors.textLight, style: styles.clockIcon }), _jsxs(Text, { style: styles.timeText, children: [step.departureTime, " - ", step.arrivalTime] }), step.stops !== undefined && (_jsxs(Text, { style: styles.stopsText, children: [step.stops, " ", step.stops === 1 ? "stop" : "stops"] }))] }))] })] }));
};
const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        marginBottom: 16,
    },
    leftColumn: {
        alignItems: "center",
        marginRight: 16,
    },
    connector: {
        width: 2,
        flex: 1,
        backgroundColor: Colors.border,
        marginTop: 8,
        marginBottom: -8,
    },
    rightColumn: {
        flex: 1,
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    stepType: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.text,
    },
    duration: {
        fontSize: 14,
        fontWeight: "600",
        color: Colors.primary,
    },
    locationContainer: {
        backgroundColor: Colors.card,
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
    },
    locationRow: {
        flexDirection: "row",
        marginBottom: 4,
    },
    locationLabel: {
        width: 50,
        fontSize: 14,
        color: Colors.textLight,
    },
    locationText: {
        flex: 1,
        fontSize: 14,
        color: Colors.text,
        fontWeight: "500",
    },
    timeContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    clockIcon: {
        marginRight: 4,
    },
    timeText: {
        fontSize: 14,
        color: Colors.textLight,
        marginRight: 8,
    },
    stopsText: {
        fontSize: 14,
        color: Colors.textLight,
    },
});
export default DirectionStep;
