import { useState, useCallback } from "react";
export function useToast() {
    const [toast, setToast] = useState({
        message: "",
        type: "info",
        visible: false,
    });
    const showToast = useCallback((message, type = "info") => {
        setToast({
            message,
            type,
            visible: true,
        });
    }, []);
    const hideToast = useCallback(() => {
        setToast(prev => ({ ...prev, visible: false }));
    }, []);
    return {
        toast,
        showToast,
        hideToast,
    };
}
