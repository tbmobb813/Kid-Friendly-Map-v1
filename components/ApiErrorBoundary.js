import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Component } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Colors from '@/constants/colors';
import { AlertTriangle, RefreshCw, Wifi } from 'lucide-react-native';
import { offlineManager } from '@/utils/offlineManager';
import { backendHealthMonitor } from '@/utils/api';
export default class ApiErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.handleRetry = async () => {
            this.setState({ isRetrying: true });
            try {
                // Check network connectivity
                if (offlineManager.isOffline()) {
                    throw new Error('No internet connection');
                }
                // Check backend health
                const healthStatus = await backendHealthMonitor.checkHealth();
                if (healthStatus === 'down') {
                    throw new Error('Backend services are currently unavailable');
                }
                // Custom retry logic
                if (this.props.onRetry) {
                    await this.props.onRetry();
                }
                // Reset error state
                this.setState({
                    hasError: false,
                    error: null,
                    errorInfo: null,
                    isRetrying: false
                });
            }
            catch (error) {
                console.warn('Retry failed:', error);
                this.setState({ isRetrying: false });
            }
        };
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            isRetrying: false,
            networkState: offlineManager.getNetworkState()
        };
    }
    componentDidMount() {
        if (this.props.showNetworkStatus) {
            this.networkUnsubscribe = offlineManager.addNetworkListener((networkState) => {
                this.setState({ networkState });
                // Auto-retry when coming back online
                if (this.state.hasError && networkState.isConnected) {
                    this.handleRetry();
                }
            });
        }
    }
    componentWillUnmount() {
        if (this.networkUnsubscribe) {
            this.networkUnsubscribe();
        }
    }
    static getDerivedStateFromError(error) {
        return {
            hasError: true,
            error
        };
    }
    componentDidCatch(error, errorInfo) {
        this.setState({
            error,
            errorInfo
        });
        // Log the error
        console.error('API Error Boundary caught an error:', error, errorInfo);
    }
    getErrorMessage() {
        const { error } = this.state;
        if (!error) {
            return 'An unexpected error occurred';
        }
        if (error.message.includes('Network request failed')) {
            return 'Unable to connect to server. Please check your internet connection.';
        }
        if (error.message.includes('timeout')) {
            return 'Request timed out. Please try again.';
        }
        if (error.message.includes('401')) {
            return 'Your session has expired. Please sign in again.';
        }
        if (error.message.includes('403')) {
            return 'You do not have permission to access this feature.';
        }
        if (error.message.includes('500')) {
            return 'Server error. Please try again later.';
        }
        return error.message || 'Something went wrong. Please try again.';
    }
    getErrorIcon() {
        const { error, networkState } = this.state;
        if (!networkState.isConnected) {
            return Wifi;
        }
        if (error?.message.includes('timeout') || error?.message.includes('Network')) {
            return Wifi;
        }
        return AlertTriangle;
    }
    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }
            const ErrorIcon = this.getErrorIcon();
            const { networkState, isRetrying } = this.state;
            const canRetry = !isRetrying && (networkState.isConnected || this.props.onRetry);
            return (_jsx(View, { style: styles.container, children: _jsxs(View, { style: styles.content, children: [_jsx(ErrorIcon, { size: 48, color: Colors.error, style: styles.icon }), _jsx(Text, { style: styles.title, children: "Oops! Something went wrong" }), _jsx(Text, { style: styles.message, children: this.getErrorMessage() }), this.props.showNetworkStatus && (_jsxs(View, { style: styles.networkStatus, children: [_jsxs(Text, { style: styles.networkText, children: ["Network: ", networkState.isConnected ? 'Connected' : 'Disconnected'] }), networkState.type && (_jsxs(Text, { style: styles.networkType, children: ["(", networkState.type, ")"] }))] })), canRetry && (_jsxs(Pressable, { style: [styles.retryButton, isRetrying && styles.retryButtonDisabled], onPress: this.handleRetry, disabled: isRetrying, testID: "retry-button", children: [_jsx(RefreshCw, { size: 20, color: "white", style: [styles.retryIcon, isRetrying && styles.retryIconSpinning] }), _jsx(Text, { style: styles.retryText, children: isRetrying ? 'Retrying...' : 'Try Again' })] })), !networkState.isConnected && (_jsx(Text, { style: styles.offlineNote, children: "You're currently offline. The app will retry automatically when your connection is restored." }))] }) }));
        }
        return this.props.children;
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        backgroundColor: Colors.background,
    },
    content: {
        alignItems: 'center',
        maxWidth: 300,
    },
    icon: {
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.text,
        textAlign: 'center',
        marginBottom: 8,
    },
    message: {
        fontSize: 16,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    networkStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: Colors.surface,
        borderRadius: 8,
    },
    networkText: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    networkType: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginLeft: 4,
    },
    retryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    retryButtonDisabled: {
        opacity: 0.6,
    },
    retryIcon: {
        marginRight: 8,
    },
    retryIconSpinning: {
    // Add rotation animation if needed
    },
    retryText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    offlineNote: {
        fontSize: 14,
        color: Colors.textSecondary,
        textAlign: 'center',
        fontStyle: 'italic',
    },
});
