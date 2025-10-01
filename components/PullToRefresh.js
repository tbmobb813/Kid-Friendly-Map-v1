import { jsx as _jsx } from "react/jsx-runtime";
import { useState } from "react";
import { ScrollView, RefreshControl, Platform } from "react-native";
import Colors from "@/constants/colors";
const PullToRefresh = ({ children, onRefresh, refreshing = false, }) => {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await onRefresh();
        }
        finally {
            setIsRefreshing(false);
        }
    };
    return (_jsx(ScrollView, { refreshControl: _jsx(RefreshControl, { refreshing: refreshing || isRefreshing, onRefresh: handleRefresh, tintColor: Colors.primary, colors: [Colors.primary], progressBackgroundColor: Colors.card, ...(Platform.OS === 'android' && {
                progressViewOffset: 20,
            }) }), children: children }));
};
export default PullToRefresh;
