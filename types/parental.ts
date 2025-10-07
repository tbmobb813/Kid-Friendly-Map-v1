export type SafeZone = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number; // in meters
  isActive: boolean;
  createdAt: number;
  notifications: {
    onEntry: boolean;
    onExit: boolean;
  };
};

export type CheckInRequest = {
  id: string;
  childId: string;
  requestedAt: number;
  message: string;
  isUrgent: boolean;
  status: 'pending' | 'completed' | 'ignored';
  completedAt?: number;
  location?: {
    latitude: number;
    longitude: number;
    placeName?: string;
  };
};

export type ParentalSettings = {
  requirePinForParentMode: boolean;
  parentPin?: string;
  allowChildCategoryCreation: boolean;
  requireApprovalForCategories: boolean;
  maxCustomCategories: number;
  safeZoneAlerts: boolean;
  checkInReminders: boolean;
  emergencyContacts: EmergencyContact[];
};

export type EmergencyContact = {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  isPrimary: boolean;
  canReceiveAlerts: boolean;
};

export type ParentDashboardData = {
  recentCheckIns: Array<{
    id: string;
    timestamp: number;
    placeName: string;
    photoUrl?: string;
    location?: {
      latitude: number;
      longitude: number;
    };
  }>;
  pendingCategoryApprovals: Array<{
    id: string;
    name: string;
    icon: string;
    color: string;
    requestedAt: number;
  }>;
  safeZoneActivity: Array<{
    id: string;
    safeZoneId: string;
    safeZoneName: string;
    type: 'entry' | 'exit';
    timestamp: number;
  }>;
  lastKnownLocation?: {
    latitude: number;
    longitude: number;
    timestamp: number;
    placeName?: string;
  };
};

export type DevicePingRequest = {
  id: string;
  type: 'location' | 'ring' | 'message';
  message?: string;
  requestedAt: number;
  status: 'pending' | 'acknowledged' | 'failed';
  response?: {
    timestamp: number;
    location?: {
      latitude: number;
      longitude: number;
    };
  };
};
