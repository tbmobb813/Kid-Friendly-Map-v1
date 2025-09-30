import React, { useState } from "react";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import Colors from "@/constants/colors";
import { ImageOff } from "lucide-react-native";

type OptimizedImageProps = {
  source: { uri: string } | number;
  style?: any;
  placeholder?: string;
  contentFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  onLoad?: () => void;
  onError?: () => void;
};

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  source,
  style,
  placeholder,
  contentFit = "cover",
  onLoad,
  onError,
}) => {
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
    return (
      <View style={[styles.errorContainer, style]}>
        <ImageOff size={24} color={Colors.textLight} />
      </View>
    );
  }

  return (
    <View style={style}>
      <Image
        source={source}
        style={[StyleSheet.absoluteFill]}
        contentFit={contentFit}
        placeholder={placeholder}
        onLoad={handleLoad}
        onError={handleError}
        cachePolicy="memory-disk"
      />
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={Colors.primary} />
        </View>
      )}
    </View>
  );
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
