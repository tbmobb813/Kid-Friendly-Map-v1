import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { Platform, View, Text } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Colors from "@/constants/colors";
import ErrorBoundary from "@/components/ErrorBoundary";
import NetworkStatusBar from "@/components/NetworkStatusBar";
import DevicePingHandler from "@/components/DevicePingHandler";
import ApiErrorBoundary from "@/components/ApiErrorBoundary";
import BackendStatusIndicator from "@/components/BackendStatusIndicator";
import { trackScreenView } from "@/utils/analytics";
import { performanceMonitor } from "@/utils/performance";
import { useRegionStore } from "@/stores/regionStore";
import { CategoryProvider } from "@/stores/categoryStore";
import { ParentalProvider } from "@/stores/parentalStore";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import InAppNotificationHost from "@/components/InAppNotificationHost";
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes
            retry: 2,
            refetchOnWindowFocus: false,
        },
    },
});
export const unstable_settings = {
    initialRouteName: "(tabs)",
};
// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();
export default function RootLayout() {
    const [loaded, error] = useFonts({
        ...FontAwesome.font,
    });
    const [appReady, setAppReady] = useState(false);
    useEffect(() => {
        performanceMonitor.startTimer('app_startup');
        async function prepare() {
            try {
                // Pre-load fonts, make any API calls you need to do here
                if (loaded || error) {
                    setAppReady(true);
                    performanceMonitor.endTimer('app_startup');
                    trackScreenView('app_startup');
                }
            }
            catch (e) {
                console.warn(e);
                // Even if there's an error, we should still show the app
                setAppReady(true);
                performanceMonitor.endTimer('app_startup');
            }
            finally {
                // Tell the application to render
                await SplashScreen.hideAsync();
            }
        }
        // Add a minimum delay to ensure splash screen shows briefly
        const timer = setTimeout(() => {
            if (!appReady) {
                console.log("Font loading timeout, showing app anyway");
                setAppReady(true);
                performanceMonitor.endTimer('app_startup');
                SplashScreen.hideAsync();
            }
        }, 3000); // Increased to 3 seconds for better Android compatibility
        if (loaded || error) {
            prepare();
        }
        return () => clearTimeout(timer);
    }, [loaded, error, appReady]);
    // Show app if ready
    if (!appReady) {
        return null;
    }
    return (_jsx(QueryClientProvider, { client: queryClient, children: _jsx(AuthProvider, { children: _jsx(ParentalProvider, { children: _jsx(CategoryProvider, { children: _jsx(ApiErrorBoundary, { showNetworkStatus: true, children: _jsx(ErrorBoundary, { children: _jsx(RootLayoutNav, {}) }) }) }) }) }) }));
}
function RootLayoutNav() {
    const { isConfigured, isHydrated } = useRegionStore();
    const { isAuthenticated, isInitialized, isLoading } = useAuth();
    // Show loading screen while hydrating or initializing auth
    if (!isHydrated || !isInitialized || isLoading) {
        return (_jsx(View, { style: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }, children: _jsx(Text, { style: { fontSize: 18, color: Colors.text }, children: "Loading..." }) }));
    }
    return (_jsxs(_Fragment, { children: [_jsx(StatusBar, { style: Platform.OS === 'android' ? 'dark' : 'dark', backgroundColor: Platform.OS === 'android' ? Colors.background : undefined }), _jsx(BackendStatusIndicator, {}), _jsx(NetworkStatusBar, {}), _jsx(InAppNotificationHost, {}), _jsx(Stack, { screenOptions: {
                    headerBackTitle: "Back",
                    headerTitleStyle: {
                        fontWeight: "600",
                    },
                    headerShadowVisible: false,
                    headerStyle: {
                        backgroundColor: Colors.background,
                    },
                }, children: !isAuthenticated ? (_jsx(Stack.Screen, { name: "auth", options: {
                        headerShown: false,
                        gestureEnabled: false,
                    } })) : !isConfigured ? (_jsx(Stack.Screen, { name: "onboarding", options: {
                        headerShown: false,
                        gestureEnabled: false,
                    } })) : (_jsxs(_Fragment, { children: [_jsx(Stack.Screen, { name: "(tabs)", options: { headerShown: false } }), _jsx(Stack.Screen, { name: "route/[id]", options: {
                                title: "Route Details",
                                animation: Platform.OS === 'android' ? 'slide_from_right' : 'slide_from_right',
                            } }), _jsx(Stack.Screen, { name: "search", options: {
                                title: "Search Places",
                                animation: Platform.OS === 'android' ? 'slide_from_bottom' : 'slide_from_bottom',
                                presentation: Platform.OS === 'android' ? 'modal' : 'modal',
                            } })] })) }), _jsx(DevicePingHandler, { testId: "device-ping-handler" })] }));
}
