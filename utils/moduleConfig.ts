// Modular Architecture Configuration
// This file defines the module structure and dependencies for the app

export interface ModuleConfig {
  name: string;
  version: string;
  dependencies: string[];
  exports: string[];
  lazy?: boolean;
  platform?: 'ios' | 'android' | 'web' | 'all';
}

export const MODULES: Record<string, ModuleConfig> = {
  // Core modules (always loaded)
  core: {
    name: 'Core',
    version: '1.0.0',
    dependencies: [],
    exports: ['colors', 'types', 'utils/logger', 'utils/config'],
    lazy: false,
    platform: 'all'
  },

  // Safety module (high priority)
  safety: {
    name: 'Safety',
    version: '1.0.0',
    dependencies: ['core', 'location'],
    exports: [
      'components/SafetyPanel',
      'components/SafeZoneIndicator',
      'components/SafeZoneManagement',
      'components/ParentDashboard',
      'stores/parentalStore',
      'utils/errorHandling'
    ],
    lazy: false,
    platform: 'all'
  },

  // Location services module
  location: {
    name: 'Location',
    version: '1.0.0',
    dependencies: ['core'],
    exports: [
      'hooks/useLocation',
      'hooks/useSafeZoneMonitor',
      'utils/locationUtils'
    ],
    lazy: false,
    platform: 'all'
  },

  // Navigation module
  navigation: {
    name: 'Navigation',
    version: '1.0.0',
    dependencies: ['core', 'location'],
    exports: [
      'stores/navigationStore',
      'components/RouteCard',
      'components/DirectionStep',
      'components/SmartRouteSuggestions'
    ],
    lazy: false,
    platform: 'all'
  },

  // Regional content module
  regional: {
    name: 'Regional',
    version: '1.0.0',
    dependencies: ['core'],
    exports: [
      'stores/regionStore',
      'hooks/useRegionalData',
      'components/RegionSelector',
      'config/regions/*'
    ],
    lazy: true,
    platform: 'all'
  },

  // Gamification module (can be lazy loaded)
  gamification: {
    name: 'Gamification',
    version: '1.0.0',
    dependencies: ['core'],
    exports: [
      'stores/gamificationStore',
      'components/AchievementBadge',
      'components/UserStatsCard',
      'components/VirtualPetCompanion'
    ],
    lazy: true,
    platform: 'all'
  },

  // AI features module (lazy loaded)
  ai: {
    name: 'AI',
    version: '1.0.0',
    dependencies: ['core', 'location'],
    exports: [
      'components/AIJourneyCompanion',
      'components/SmartRouteSuggestions'
    ],
    lazy: true,
    platform: 'all'
  },

  // UI components module
  ui: {
    name: 'UI',
    version: '1.0.0',
    dependencies: ['core'],
    exports: [
      'components/SearchBar',
      'components/PlaceCard',
      'components/CategoryButton',
      'components/EmptyState',
      'components/LoadingSpinner',
      'components/Toast'
    ],
    lazy: false,
    platform: 'all'
  },

  // Platform-specific modules
  ios: {
    name: 'iOS',
    version: '1.0.0',
    dependencies: ['core'],
    exports: ['utils/ios-specific'],
    lazy: true,
    platform: 'ios'
  },

  android: {
    name: 'Android',
    version: '1.0.0',
    dependencies: ['core'],
    exports: ['utils/android-specific'],
    lazy: true,
    platform: 'android'
  },

  web: {
    name: 'Web',
    version: '1.0.0',
    dependencies: ['core'],
    exports: ['utils/web-specific'],
    lazy: true,
    platform: 'web'
  }
};

// Module loading priorities
export const LOAD_PRIORITIES = {
  CRITICAL: ['core', 'safety', 'location'],
  HIGH: ['navigation', 'ui'],
  MEDIUM: ['regional', 'gamification'],
  LOW: ['ai', 'ios', 'android', 'web']
};

// Dependency validation
export function validateModuleDependencies(): boolean {
  for (const [moduleName, config] of Object.entries(MODULES)) {
    for (const dep of config.dependencies) {
      if (!MODULES[dep]) {
        console.error(`Module ${moduleName} depends on non-existent module: ${dep}`);
        return false;
      }
    }
  }
  return true;
}

// Get modules for current platform
export function getModulesForPlatform(platform: 'ios' | 'android' | 'web'): ModuleConfig[] {
  return Object.values(MODULES).filter(
    module => module.platform === 'all' || module.platform === platform
  );
}

// Module loader utility
export class ModuleLoader {
  private loadedModules = new Set<string>();
  private loadingPromises = new Map<string, Promise<void>>();

  async loadModule(moduleName: string): Promise<void> {
    if (this.loadedModules.has(moduleName)) {
      return;
    }

    if (this.loadingPromises.has(moduleName)) {
      return this.loadingPromises.get(moduleName);
    }

    const config = MODULES[moduleName];
    if (!config) {
      throw new Error(`Module ${moduleName} not found`);
    }

    const loadPromise = this.loadModuleInternal(moduleName, config);
    this.loadingPromises.set(moduleName, loadPromise);

    try {
      await loadPromise;
      this.loadedModules.add(moduleName);
    } finally {
      this.loadingPromises.delete(moduleName);
    }
  }

  private async loadModuleInternal(moduleName: string, config: ModuleConfig): Promise<void> {
    // Load dependencies first
    for (const dep of config.dependencies) {
      await this.loadModule(dep);
    }

    console.log(`Loading module: ${moduleName}`);
    
    // In a real implementation, this would dynamically import the module
    // For now, we'll just simulate the loading
    await new Promise(resolve => setTimeout(resolve, 100));
    
    console.log(`Module loaded: ${moduleName}`);
  }

  isModuleLoaded(moduleName: string): boolean {
    return this.loadedModules.has(moduleName);
  }

  getLoadedModules(): string[] {
    return Array.from(this.loadedModules);
  }
}

export const moduleLoader = new ModuleLoader();
