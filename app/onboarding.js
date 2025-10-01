import { jsx as _jsx } from "react/jsx-runtime";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import OnboardingFlow from "@/components/OnboardingFlow";
import Colors from "@/constants/colors";
export default function OnboardingScreen() {
    const router = useRouter();
    const handleOnboardingComplete = () => {
        router.replace("/(tabs)");
    };
    return (_jsx(View, { style: styles.container, children: _jsx(OnboardingFlow, { onComplete: handleOnboardingComplete }) }));
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
});
