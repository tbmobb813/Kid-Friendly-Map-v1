import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CustomCategory, CategoryManagementSettings, PlaceCategory } from '@/types/navigation';

const DEFAULT_CATEGORIES: CustomCategory[] = [
  {
    id: 'home',
    name: 'Home',
    icon: 'Home',
    color: '#007AFF',
    isDefault: true,
    createdBy: 'parent',
    isApproved: true,
    createdAt: Date.now(),
  },
  {
    id: 'school',
    name: 'School',
    icon: 'GraduationCap',
    color: '#FF9500',
    isDefault: true,
    createdBy: 'parent',
    isApproved: true,
    createdAt: Date.now(),
  },
  {
    id: 'park',
    name: 'Park',
    icon: 'Trees',
    color: '#34C759',
    isDefault: true,
    createdBy: 'parent',
    isApproved: true,
    createdAt: Date.now(),
  },
  {
    id: 'library',
    name: 'Library',
    icon: 'BookOpen',
    color: '#9C27B0',
    isDefault: true,
    createdBy: 'parent',
    isApproved: true,
    createdAt: Date.now(),
  },
  {
    id: 'store',
    name: 'Store',
    icon: 'ShoppingBag',
    color: '#4285F4',
    isDefault: true,
    createdBy: 'parent',
    isApproved: true,
    createdAt: Date.now(),
  },
  {
    id: 'restaurant',
    name: 'Food',
    icon: 'Pizza',
    color: '#FF6B6B',
    isDefault: true,
    createdBy: 'parent',
    isApproved: true,
    createdAt: Date.now(),
  },
  {
    id: 'friend',
    name: 'Friends',
    icon: 'Users',
    color: '#00BCD4',
    isDefault: true,
    createdBy: 'parent',
    isApproved: true,
    createdAt: Date.now(),
  },
  {
    id: 'family',
    name: 'Family',
    icon: 'Heart',
    color: '#FF4081',
    isDefault: true,
    createdBy: 'parent',
    isApproved: true,
    createdAt: Date.now(),
  },
];

const DEFAULT_SETTINGS: CategoryManagementSettings = {
  allowChildToCreateCategories: true,
  requireParentApproval: true,
  maxCustomCategories: 20,
};

const STORAGE_KEYS = {
  CATEGORIES: 'kidmap_custom_categories',
  SETTINGS: 'kidmap_category_settings',
};

export const [CategoryProvider, useCategoryStoreInternal] = createContextHook(() => {
  const [categories, setCategories] = useState<CustomCategory[]>(DEFAULT_CATEGORIES);
  const [settings, setSettings] = useState<CategoryManagementSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from storage
  useEffect(() => {
    const loadData = async () => {
      try {
        const [storedCategories, storedSettings] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.CATEGORIES),
          AsyncStorage.getItem(STORAGE_KEYS.SETTINGS),
        ]);

        if (storedCategories) {
          const parsedCategories = JSON.parse(storedCategories);
          setCategories(parsedCategories);
        }

        if (storedSettings) {
          const parsedSettings = JSON.parse(storedSettings);
          setSettings(parsedSettings);
        }
      } catch (error) {
        console.error('Failed to load category data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Save categories to storage
  const saveCategories = async (newCategories: CustomCategory[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(newCategories));
      setCategories(newCategories);
    } catch (error) {
      console.error('Failed to save categories:', error);
    }
  };

  // Save settings to storage
  const saveSettings = async (newSettings: CategoryManagementSettings) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  // Add a new category
  const addCategory = async (category: Omit<CustomCategory, 'id' | 'createdAt'>) => {
    const newCategory: CustomCategory = {
      ...category,
      id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
    };

    const updatedCategories = [...categories, newCategory];
    await saveCategories(updatedCategories);
    return newCategory;
  };

  // Update an existing category
  const updateCategory = async (id: string, updates: Partial<CustomCategory>) => {
    const updatedCategories = categories.map(cat => 
      cat.id === id ? { ...cat, ...updates } : cat
    );
    await saveCategories(updatedCategories);
  };

  // Delete a category (only custom ones)
  const deleteCategory = async (id: string) => {
    const category = categories.find(cat => cat.id === id);
    if (category && !category.isDefault) {
      const updatedCategories = categories.filter(cat => cat.id !== id);
      await saveCategories(updatedCategories);
    }
  };

  // Approve a category (parent action)
  const approveCategory = async (id: string) => {
    await updateCategory(id, { isApproved: true });
  };

  // Get approved categories only
  const getApprovedCategories = (): CustomCategory[] => {
    return categories.filter(cat => cat.isApproved);
  };

  // Get pending categories (waiting for approval)
  const getPendingCategories = (): CustomCategory[] => {
    return categories.filter(cat => !cat.isApproved && cat.createdBy === 'child');
  };

  // Convert custom category to place category for compatibility
  const getPlaceCategory = (customCategoryId: string): PlaceCategory => {
    const category = categories.find(cat => cat.id === customCategoryId);
    if (category && category.isDefault) {
      return customCategoryId as PlaceCategory;
    }
    return 'other';
  };

  // Get available icons for category creation
  const getAvailableIcons = () => [
    'Home', 'GraduationCap', 'Trees', 'BookOpen', 'ShoppingBag', 'Pizza',
    'Users', 'Heart', 'Car', 'Bike', 'Bus', 'Train', 'Plane', 'Hospital',
    'Church', 'Building', 'Gamepad2', 'Music', 'Camera', 'Gift',
    'Coffee', 'IceCream', 'Candy', 'Apple', 'Dumbbell', 'Palette',
    'Star', 'Sun', 'Moon', 'Cloud', 'Umbrella', 'Flower'
  ];

  // Get available colors for category creation
  const getAvailableColors = () => [
    '#007AFF', '#FF9500', '#34C759', '#9C27B0', '#4285F4', '#FF6B6B',
    '#00BCD4', '#FF4081', '#FFC107', '#795548', '#607D8B', '#E91E63',
    '#3F51B5', '#009688', '#8BC34A', '#CDDC39', '#FFEB3B', '#FF5722',
    '#9E9E9E', '#673AB7', '#2196F3', '#03DAC6', '#FF1744', '#00E676'
  ];

  return {
    categories,
    settings,
    isLoading,
    addCategory,
    updateCategory,
    deleteCategory,
    approveCategory,
    getApprovedCategories,
    getPendingCategories,
    getPlaceCategory,
    getAvailableIcons,
    getAvailableColors,
    saveSettings,
  };
});

// Safe wrapper that provides fallback values
export const useCategoryStore = () => {
  try {
    return useCategoryStoreInternal();
  } catch (error) {
    console.warn('CategoryStore not available, using fallback');
    // Return fallback values
    return {
      categories: DEFAULT_CATEGORIES,
      settings: DEFAULT_SETTINGS,
      isLoading: false,
      addCategory: async () => DEFAULT_CATEGORIES[0],
      updateCategory: async () => {},
      deleteCategory: async () => {},
      approveCategory: async () => {},
      getApprovedCategories: () => DEFAULT_CATEGORIES,
      getPendingCategories: () => [],
      getPlaceCategory: () => 'other' as const,
      getAvailableIcons: () => ['Home', 'GraduationCap', 'Trees'],
      getAvailableColors: () => ['#007AFF', '#FF9500', '#34C759'],
      saveSettings: async () => {},
    };
  }
};

export const useCategoryManagement = () => {
  const store = useCategoryStore();
  
  return {
    ...store,
    canCreateCategory: (createdBy: 'parent' | 'child') => {
      if (createdBy === 'parent') return true;
      if (!store.settings.allowChildToCreateCategories) return false;
      
      const customCategoriesCount = store.categories.filter(cat => !cat.isDefault).length;
      return customCategoriesCount < store.settings.maxCustomCategories;
    },
    needsApproval: (createdBy: 'parent' | 'child') => {
      return createdBy === 'child' && store.settings.requireParentApproval;
    },
  };
};
