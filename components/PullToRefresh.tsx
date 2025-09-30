import React, { useState } from "react";
import { ScrollView, RefreshControl, Platform } from "react-native";
import Colors from "@/constants/colors";

type PullToRefreshProps = {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  refreshing?: boolean;
};

const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  refreshing = false,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={refreshing || isRefreshing}
          onRefresh={handleRefresh}
          tintColor={Colors.primary}
          colors={[Colors.primary]}
          progressBackgroundColor={Colors.card}
          // Android-specific styling
          {...(Platform.OS === 'android' && {
            progressViewOffset: 20,
          })}
        />
      }
    >
      {children}
    </ScrollView>
  );
};

export default PullToRefresh;
