import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Tabs } from "expo-router";
import Colors from "@/constants/colors";
import { Home, Map, Train, Settings, Trophy } from "lucide-react-native";
import { Platform } from "react-native";
export default function TabLayout() {
    return (_jsxs(Tabs, { screenOptions: {
            tabBarActiveTintColor: Colors.primary,
            tabBarInactiveTintColor: Colors.textLight,
            tabBarLabelStyle: {
                fontSize: 12,
                fontWeight: "500",
            },
            tabBarStyle: {
                height: Platform.OS === 'android' ? 65 : 60,
                paddingBottom: Platform.OS === 'android' ? 10 : 8,
                paddingTop: Platform.OS === 'android' ? 5 : 0,
            },
            headerShadowVisible: false,
            // Android-specific tab styling
            ...(Platform.OS === 'android' && {
                tabBarStyle: {
                    height: 65,
                    paddingBottom: 10,
                    paddingTop: 5,
                    elevation: 8,
                    borderTopWidth: 0,
                },
            }),
        }, children: [_jsx(Tabs.Screen, { name: "index", options: {
                    title: "Home",
                    tabBarIcon: ({ color }) => _jsx(Home, { size: 24, color: color }),
                    headerTitle: "KidMap",
                } }), _jsx(Tabs.Screen, { name: "map", options: {
                    title: "Map",
                    tabBarIcon: ({ color }) => _jsx(Map, { size: 24, color: color }),
                } }), _jsx(Tabs.Screen, { name: "transit", options: {
                    title: "Transit",
                    tabBarIcon: ({ color }) => _jsx(Train, { size: 24, color: color }),
                } }), _jsx(Tabs.Screen, { name: "achievements", options: {
                    title: "Achievements",
                    tabBarIcon: ({ color }) => _jsx(Trophy, { size: 24, color: color }),
                } }), _jsx(Tabs.Screen, { name: "settings", options: {
                    title: "Settings",
                    tabBarIcon: ({ color }) => _jsx(Settings, { size: 24, color: color }),
                } })] }));
}
