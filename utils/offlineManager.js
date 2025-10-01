import NetInfo from '@react-native-community/netinfo';
import { SafeAsyncStorage } from './errorHandling';
import { log } from './logger';
import { backendHealthMonitor } from './api';
class OfflineManager {
    constructor() {
        this.networkState = {
            isConnected: false,
            isInternetReachable: false,
            type: 'unknown',
            isWifiEnabled: false
        };
        this.offlineActions = [];
        this.listeners = [];
        this.syncInProgress = false;
        this.OFFLINE_ACTIONS_KEY = 'offline_actions';
        this.initializeNetworkMonitoring();
        this.loadOfflineActions();
    }
    static getInstance() {
        if (!OfflineManager.instance) {
            OfflineManager.instance = new OfflineManager();
        }
        return OfflineManager.instance;
    }
    async initializeNetworkMonitoring() {
        try {
            // Get initial network state
            const state = await NetInfo.fetch();
            this.updateNetworkState(state);
            // Listen for network changes
            NetInfo.addEventListener(this.updateNetworkState.bind(this));
            log.info('Network monitoring initialized', {
                isConnected: this.networkState.isConnected,
                type: this.networkState.type
            });
        }
        catch (error) {
            log.error('Failed to initialize network monitoring', error);
        }
    }
    updateNetworkState(state) {
        const newState = {
            isConnected: state.isConnected ?? false,
            isInternetReachable: state.isInternetReachable ?? false,
            type: state.type || 'unknown',
            isWifiEnabled: state.type === 'wifi'
        };
        const wasOffline = !this.networkState.isConnected;
        const isNowOnline = newState.isConnected;
        this.networkState = newState;
        this.notifyListeners(newState);
        log.debug('Network state updated', newState);
        // Trigger sync when coming back online
        if (wasOffline && isNowOnline) {
            log.info('Device came back online, triggering sync');
            this.syncOfflineActions();
        }
    }
    notifyListeners(state) {
        this.listeners.forEach(listener => {
            try {
                listener(state);
            }
            catch (error) {
                log.warn('Network state listener error', error);
            }
        });
    }
    async loadOfflineActions() {
        try {
            const actions = await SafeAsyncStorage.getItem(this.OFFLINE_ACTIONS_KEY, [], { strategy: 'fallback', fallbackValue: [] });
            this.offlineActions = actions || [];
            log.debug(`Loaded ${this.offlineActions.length} offline actions`);
        }
        catch (error) {
            log.error('Failed to load offline actions', error);
            this.offlineActions = [];
        }
    }
    async saveOfflineActions() {
        try {
            await SafeAsyncStorage.setItem(this.OFFLINE_ACTIONS_KEY, this.offlineActions, { strategy: 'retry' });
        }
        catch (error) {
            log.error('Failed to save offline actions', error);
        }
    }
    async queueAction(type, payload, maxRetries = 3) {
        const action = {
            id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type,
            payload,
            timestamp: Date.now(),
            retryCount: 0,
            maxRetries
        };
        this.offlineActions.push(action);
        await this.saveOfflineActions();
        log.info('Action queued for offline sync', {
            id: action.id,
            type: action.type
        });
        // Try to sync immediately if online
        if (this.networkState.isConnected) {
            this.syncOfflineActions();
        }
        return action.id;
    }
    async syncOfflineActions() {
        if (this.syncInProgress || !this.networkState.isConnected) {
            return;
        }
        this.syncInProgress = true;
        log.info(`Starting sync of ${this.offlineActions.length} offline actions`);
        const actionsToSync = [...this.offlineActions];
        const successfulActions = [];
        const failedActions = [];
        for (const action of actionsToSync) {
            try {
                const success = await this.executeAction(action);
                if (success) {
                    successfulActions.push(action.id);
                    log.debug('Offline action synced successfully', {
                        id: action.id,
                        type: action.type
                    });
                }
                else {
                    action.retryCount++;
                    if (action.retryCount < action.maxRetries) {
                        failedActions.push(action);
                        log.warn('Offline action failed, will retry', {
                            id: action.id,
                            type: action.type,
                            retryCount: action.retryCount
                        });
                    }
                    else {
                        log.error('Offline action exceeded max retries', undefined, {
                            id: action.id,
                            type: action.type,
                            retryCount: action.retryCount
                        });
                    }
                }
            }
            catch (error) {
                log.error('Error executing offline action', error, {
                    id: action.id,
                    type: action.type
                });
                action.retryCount++;
                if (action.retryCount < action.maxRetries) {
                    failedActions.push(action);
                }
            }
        }
        // Update offline actions list
        this.offlineActions = failedActions;
        await this.saveOfflineActions();
        log.info('Offline sync completed', {
            successful: successfulActions.length,
            failed: failedActions.length,
            remaining: this.offlineActions.length
        });
        this.syncInProgress = false;
    }
    async executeAction(action) {
        // This would be implemented based on your specific action types
        // For now, we'll simulate the execution
        switch (action.type) {
            case 'PHOTO_CHECKIN':
                return this.syncPhotoCheckin(action.payload);
            case 'UPDATE_PROFILE':
                return this.syncProfileUpdate(action.payload);
            case 'SAVE_ROUTE':
                return this.syncSaveRoute(action.payload);
            default:
                log.warn('Unknown offline action type', { type: action.type });
                return false;
        }
    }
    async syncPhotoCheckin(payload) {
        try {
            // Implement photo check-in sync logic
            log.debug('Syncing photo check-in', payload);
            return true;
        }
        catch (error) {
            log.error('Failed to sync photo check-in', error);
            return false;
        }
    }
    async syncProfileUpdate(payload) {
        try {
            // Implement profile update sync logic
            log.debug('Syncing profile update', payload);
            return true;
        }
        catch (error) {
            log.error('Failed to sync profile update', error);
            return false;
        }
    }
    async syncSaveRoute(payload) {
        try {
            // Implement route save sync logic
            log.debug('Syncing saved route', payload);
            return true;
        }
        catch (error) {
            log.error('Failed to sync saved route', error);
            return false;
        }
    }
    // Public API
    getNetworkState() {
        return { ...this.networkState };
    }
    isOnline() {
        return this.networkState.isConnected && this.networkState.isInternetReachable;
    }
    isOffline() {
        return !this.isOnline();
    }
    getPendingActionsCount() {
        return this.offlineActions.length;
    }
    async clearPendingActions() {
        this.offlineActions = [];
        await this.saveOfflineActions();
        log.info('Cleared all pending offline actions');
    }
    addNetworkListener(callback) {
        this.listeners.push(callback);
        // Return unsubscribe function
        return () => {
            const index = this.listeners.indexOf(callback);
            if (index > -1) {
                this.listeners.splice(index, 1);
            }
        };
    }
    // Force sync (useful for manual retry)
    async forcSync() {
        if (this.isOnline()) {
            await this.syncOfflineActions();
        }
        else {
            throw new Error('Cannot sync while offline');
        }
    }
    // Get network quality indicator
    getNetworkQuality() {
        if (!this.networkState.isConnected) {
            return 'offline';
        }
        const healthStatus = backendHealthMonitor.getHealthStatus();
        if (healthStatus === 'down') {
            return 'poor';
        }
        else if (healthStatus === 'degraded') {
            return 'poor';
        }
        else if (this.networkState.isWifiEnabled) {
            return 'excellent';
        }
        else {
            return 'good';
        }
    }
}
export const offlineManager = OfflineManager.getInstance();
export default offlineManager;
