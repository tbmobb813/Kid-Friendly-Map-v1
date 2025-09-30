import React from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import OnboardingFlow from "@/components/OnboardingFlow";
import Colors from "@/constants/colors";

export default function OnboardingScreen() {
  const router = useRouter();

  const handleOnboardingComplete = () => {
    router.replace("/(tabs)");
  };

  return (
    <View style={styles.container}>
      <OnboardingFlow onComplete={handleOnboardingComplete} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
