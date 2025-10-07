import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/colors";
import { Cloud, Sun, CloudRain, Snowflake, Wind } from "lucide-react-native";
const WeatherCard = ({ weather, units = 'imperial', testId }) => {
    const getWeatherIcon = () => {
        switch (weather.condition.toLowerCase()) {
            case "sunny":
                return _jsx(Sun, { size: 24, color: "#FFD700" });
            case "cloudy":
                return _jsx(Cloud, { size: 24, color: "#87CEEB" });
            case "rainy":
                return _jsx(CloudRain, { size: 24, color: "#4682B4" });
            case "snowy":
                return _jsx(Snowflake, { size: 24, color: "#B0E0E6" });
            default:
                return _jsx(Wind, { size: 24, color: Colors.textLight });
        }
    };
    const getBackgroundColor = () => {
        switch (weather.condition.toLowerCase()) {
            case "sunny": return "#FFF8DC";
            case "cloudy": return "#F0F8FF";
            case "rainy": return "#E6F3FF";
            case "snowy": return "#F0F8FF";
            default: return Colors.card;
        }
    };
    const unitLabel = units === 'metric' ? '°C' : '°F';
    return (_jsxs(View, { style: [styles.container, { backgroundColor: getBackgroundColor() }], testID: testId, children: [_jsxs(View, { style: styles.weatherInfo, children: [getWeatherIcon(), _jsxs(View, { style: styles.textContainer, children: [_jsxs(Text, { style: styles.temperature, children: [weather.temperature, unitLabel] }), _jsx(Text, { style: styles.condition, children: weather.condition })] })] }), _jsx(Text, { style: styles.recommendation, children: weather.recommendation })] }));
};
const styles = StyleSheet.create({
    container: {
        borderRadius: 12,
        padding: 16,
        margin: 16,
        borderLeftWidth: 4,
        borderLeftColor: Colors.primary,
    },
    weatherInfo: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    textContainer: {
        marginLeft: 12,
    },
    temperature: {
        fontSize: 18,
        fontWeight: "700",
        color: Colors.text,
    },
    condition: {
        fontSize: 14,
        color: Colors.textLight,
        textTransform: "capitalize",
    },
    recommendation: {
        fontSize: 14,
        color: Colors.text,
        fontStyle: "italic",
    },
});
export default WeatherCard;
