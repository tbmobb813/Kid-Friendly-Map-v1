import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAsyncStorage } from './errorHandling';
import { log } from './logger';
import { backendHealthMonitor } from './api';

type OfflineAction = {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
};

type NetworkState = {
  isConnected: boolean;
  isInternetReachable: boolean;
  type: string;
  isWifiEnabled: boolean;
};

class OfflineManager {
  private static instance: OfflineManager;
  private networkState: NetworkState = {
    isConnected: false,
    isInternetReachable: false,
    type: 'unknown',
    isWifiEnabled: false
  };
  private offlineActions: OfflineAction[] = [];
  private listeners: ((state: NetworkState) => void)[] = [];
  private syncInProgress = false;
  private readonly OFFLINE_ACTIONS_KEY = 'offline_actions';

  private constructor() {
    this.initializeNetworkMonitoring();
    this.loadOfflineActions();
  }

  static getInstance(): OfflineManager {
    if (!OfflineManager.instance) {
      OfflineManager.instance = new OfflineManager();
    }
    return OfflineManager.instance;
  }

  private async initializeNetworkMonitoring() {
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
    } catch (error) {
      log.error('Failed to initialize network monitoring', error as Error);
    }
  }

  private updateNetworkState(state: any) {
    const newState: NetworkState = {
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

  private notifyListeners(state: NetworkState) {
    this.listeners.forEach(listener => {
      try {
        listener(state);
      } catch (error) {
        log.warn('Network state listener error', error as Error);
      }
    });
  }

  private async loadOfflineActions() {
    try {
      const actions = await SafeAsyncStorage.getItem<OfflineAction[]>(
        this.OFFLINE_ACTIONS_KEY,
        [],
        { strategy: 'fallback', fallbackValue: [] }
      );
      
      this.offlineActions = actions || [];
      log.debug(`Loaded ${this.offlineActions.length} offline actions`);
    } catch (error) {
      log.error('Failed to load offline actions', error as Error);
      this.offlineActions = [];
    }
  }

  private async saveOfflineActions() {
    try {
      await SafeAsyncStorage.setItem(
        this.OFFLINE_ACTIONS_KEY,
        this.offlineActions,
        { strategy: 'retry' }
      );
    } catch (error) {
      log.error('Failed to save offline actions', error as Error);
    }
  }

  async queueAction(
    type: string,
    payload: any,
    maxRetries = 3
  ): Promise<string> {
    const action: OfflineAction = {
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

  async syncOfflineActions(): Promise<void> {
    if (this.syncInProgress || !this.networkState.isConnected) {
      return;
    }

    this.syncInProgress = true;
    log.info(`Starting sync of ${this.offlineActions.length} offline actions`);

    const actionsToSync = [...this.offlineActions];
    const successfulActions: string[] = [];
    const failedActions: OfflineAction[] = [];

    for (const action of actionsToSync) {
      try {
        const success = await this.executeAction(action);
        
        if (success) {
          successfulActions.push(action.id);
          log.debug('Offline action synced successfully', {
            id: action.id,
            type: action.type
          });
        } else {
          action.retryCount++;
          if (action.retryCount < action.maxRetries) {
            failedActions.push(action);
            log.warn('Offline action failed, will retry', {
              id: action.id,
              type: action.type,
              retryCount: action.retryCount
            });
          } else {
            log.error('Offline action exceeded max retries', {
              id: action.id,
              type: action.type,
              retryCount: action.retryCount
            });
          }
        }
      } catch (error) {
        log.error('Error executing offline action', error as Error, {
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

  private async executeAction(action: OfflineAction): Promise<boolean> {
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

  private async syncPhotoCheckin(payload: any): Promise<boolean> {
    try {
      // Implement photo check-in sync logic
      log.debug('Syncing photo check-in', payload);
      return true;
    } catch (error) {
      log.error('Failed to sync photo check-in', error as Error);
      return false;
    }
  }

  private async syncProfileUpdate(payload: any): Promise<boolean> {
    try {
      // Implement profile update sync logic
      log.debug('Syncing profile update', payload);
      return true;
    } catch (error) {
      log.error('Failed to sync profile update', error as Error);
      return false;
    }
  }

  private async syncSaveRoute(payload: any): Promise<boolean> {
    try {
      // Implement route save sync logic
      log.debug('Syncing saved route', payload);
      return true;
    } catch (error) {
      log.error('Failed to sync saved route', error as Error);
      return false;
    }
  }

  // Public API
  getNetworkState(): NetworkState {
    return { ...this.networkState };
  }

  isOnline(): boolean {
    return this.networkState.isConnected && this.networkState.isInternetReachable;
  }

  isOffline(): boolean {
    return !this.isOnline();
  }

  getPendingActionsCount(): number {
    return this.offlineActions.length;
  }

  async clearPendingActions(): Promise<void> {
    this.offlineActions = [];
    await this.saveOfflineActions();
    log.info('Cleared all pending offline actions');
  }

  addNetworkListener(callback: (state: NetworkState) => void): () => void {
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
  async forcSync(): Promise<void> {
    if (this.isOnline()) {
      await this.syncOfflineActions();
    } else {
      throw new Error('Cannot sync while offline');
    }
  }

  // Get network quality indicator
  getNetworkQuality(): 'excellent' | 'good' | 'poor' | 'offline' {
    if (!this.networkState.isConnected) {
      return 'offline';
    }

    const healthStatus = backendHealthMonitor.getHealthStatus();
    
    if (healthStatus === 'down') {
      return 'poor';
    } else if (healthStatus === 'degraded') {
      return 'poor';
    } else if (this.networkState.isWifiEnabled) {
      return 'excellent';
    } else {
      return 'good';
    }
  }
}

export const offlineManager = OfflineManager.getInstance();
export type { NetworkState, OfflineAction };
export default offlineManager;
