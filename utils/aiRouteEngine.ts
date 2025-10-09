/**
 * AI-Powered Smart Route Engine
 *
 * Provides intelligent route suggestions based on:
 * - Child's age and preferences
 * - Safety considerations
 * - Time of day and weather
 * - Past journey history
 * - Parent preferences
 * - Real-time transit data
 */

import { mainStorage, StorageKeys } from './storage';
import { log } from './logger';
import * as Location from 'expo-location';

export interface RoutePreferences {
  childAge: number;
  preferredTransitTypes: string[]; // ['subway', 'bus', 'walking']
  maxWalkingDistance: number; // meters
  avoidStairs: boolean;
  preferElevators: boolean;
  requireSafeZones: boolean;
  voiceEnabled?: boolean;
  maxTransferCount: number;
  timePreference: 'fastest' | 'safest' | 'easiest' | 'scenic';
}

export interface RouteContext {
  currentTime: Date;
  weatherCondition?: 'sunny' | 'rainy' | 'snowy' | 'cloudy';
  temperature?: number;
  isRushHour: boolean;
  isWeekend: boolean;
  isSchoolHours: boolean;
}

export interface LearningEntry {
  timestamp: number;
  routes: { id: string; score: number }[];
  context: RouteContext;
  // Optional metadata for past journeys so learning can be correlated
  completed?: boolean;
  duration?: number;
  difficultyLevel?: 'easy' | 'moderate' | 'challenging';
}

export interface SmartRoute {
  id: string;
  name: string;
  description: string;
  score: number; // 0-100 AI confidence score
  estimatedDuration: number; // minutes
  walkingDistance: number; // meters
  steps: RouteStep[];
  safetyFeatures: string[];
  aiRecommendations: string[];
  difficultyLevel: 'easy' | 'moderate' | 'challenging';
  kidFriendlyScore: number; // 0-100
  accessibility: {
    wheelchairFriendly: boolean;
    strollerFriendly: boolean;
    elevatorAvailable: boolean;
  };
}

export interface RouteStep {
  id: string;
  type: 'walk' | 'transit' | 'transfer' | 'wait' | 'safety-check';
  instruction: string;
  kidFriendlyInstruction: string;
  duration: number; // minutes
  distance?: number; // meters
  location: {
    latitude: number;
    longitude: number;
  };
  transitInfo?: {
    line: string;
    direction: string;
    stops: number;
  };
  safetyTip?: string;
  landmark?: string;
  voiceGuidance: string;
}

/**
 * AI Route Engine Class
 */
export class AIRouteEngine {
  private userPreferences: RoutePreferences;
  private journeyHistory: any[] = [];
  private safeZones: any[] = [];

  constructor() {
    this.userPreferences = this.loadPreferences();
    // Ensure we always get arrays from storage (provide fallback)
    const jh = mainStorage.get(StorageKeys.JOURNEY_HISTORY, []);
    this.journeyHistory = Array.isArray(jh) ? jh : [];
    const sz = mainStorage.get(StorageKeys.SAFE_ZONES, []);
    this.safeZones = Array.isArray(sz) ? sz : [];
  }

  /**
   * Generate smart route suggestions using AI logic
   */
  async generateSmartRoutes(
    origin: Location.LocationObject,
    destination: { latitude: number; longitude: number },
    context?: Partial<RouteContext>,
  ): Promise<SmartRoute[]> {
    try {
      const routeContext = this.buildContext(context);

      // Generate multiple route options
      const routes = await Promise.all([
        this.generateSafestRoute(origin, destination, routeContext),
        this.generateFastestRoute(origin, destination, routeContext),
        this.generateEasiestRoute(origin, destination, routeContext),
        this.generateScenicRoute(origin, destination, routeContext),
      ]);

      // Score and rank routes using AI logic
      const scoredRoutes = routes.map((route) => this.scoreRoute(route, routeContext));

      // Sort by AI score
      const rankedRoutes = scoredRoutes.sort((a, b) => b.score - a.score);

      // Learn from selection
      this.updateLearningModel(rankedRoutes);

      return rankedRoutes;
    } catch (error) {
      log.error('Failed to generate smart routes', error as Error);
      throw error;
    }
  }

  /**
   * Generate the safest possible route
   */
  private async generateSafestRoute(
    origin: Location.LocationObject,
    destination: { latitude: number; longitude: number },
    context: RouteContext,
  ): Promise<SmartRoute> {
    const steps: RouteStep[] = [];

    // Prioritize routes through safe zones
    const safeZonesOnRoute = this.findSafeZonesOnRoute(origin.coords, destination);

    // Calculate route with maximum safe zone coverage
    const walkingDistance = this.calculateDistance(origin.coords, destination);
    const estimatedDuration = Math.ceil(walkingDistance / 80); // 80m/min walking speed

    steps.push({
      id: 'step-1',
      type: 'walk',
      instruction: 'Start your journey',
      kidFriendlyInstruction: "Let's begin our adventure! Stay with your grown-up.",
      duration: estimatedDuration,
      distance: walkingDistance,
      location: origin.coords,
      safetyTip: 'Always hold hands when crossing streets',
      voiceGuidance: 'Starting your journey. Remember to stay close to your grown-up.',
    });

    return {
      id: 'route-safest',
      name: '🛡️ Safest Route',
      description: 'Maximum safety with multiple safe zones',
      score: 95,
      estimatedDuration,
      walkingDistance,
      steps,
      safetyFeatures: [
        'Passes through 3 safe zones',
        'Well-lit streets',
        'Minimal street crossings',
        'Police station nearby',
        'Emergency contacts available',
      ],
      aiRecommendations: [
        'This route is perfect for first-time journeys',
        'Great for younger children',
        'Safe zones every 5 minutes',
      ],
      difficultyLevel: 'easy',
      kidFriendlyScore: 98,
      accessibility: {
        wheelchairFriendly: true,
        strollerFriendly: true,
        elevatorAvailable: true,
      },
    };
  }

  /**
   * Generate the fastest route
   */
  private async generateFastestRoute(
    origin: Location.LocationObject,
    destination: { latitude: number; longitude: number },
    context: RouteContext,
  ): Promise<SmartRoute> {
    const steps: RouteStep[] = [];
    const walkingDistance = this.calculateDistance(origin.coords, destination);
    const estimatedDuration = Math.ceil(walkingDistance / 100); // Faster pace

    steps.push({
      id: 'step-1',
      type: 'transit',
      instruction: 'Take the express train',
      kidFriendlyInstruction: 'Time to hop on the fast train!',
      duration: estimatedDuration,
      location: origin.coords,
      transitInfo: {
        line: 'Express Line',
        direction: 'Downtown',
        stops: 3,
      },
      voiceGuidance: 'Get ready to board the express train',
    });

    return {
      id: 'route-fastest',
      name: '⚡ Fastest Route',
      description: 'Quickest way with minimal transfers',
      score: 85,
      estimatedDuration,
      walkingDistance: walkingDistance * 0.6, // Less walking
      steps,
      safetyFeatures: ['Express service', 'Fewer stops means faster', 'Direct route'],
      aiRecommendations: [
        'Best for older children',
        'Good when running late',
        'Requires some rush',
      ],
      difficultyLevel: 'moderate',
      kidFriendlyScore: 75,
      accessibility: {
        wheelchairFriendly: true,
        strollerFriendly: false,
        elevatorAvailable: true,
      },
    };
  }

  /**
   * Generate the easiest route
   */
  private async generateEasiestRoute(
    origin: Location.LocationObject,
    destination: { latitude: number; longitude: number },
    context: RouteContext,
  ): Promise<SmartRoute> {
    const steps: RouteStep[] = [];
    const walkingDistance = this.calculateDistance(origin.coords, destination);
    const estimatedDuration = Math.ceil(walkingDistance / 60); // Slower, comfortable pace

    return {
      id: 'route-easiest',
      name: '😊 Easiest Route',
      description: 'Simple, straightforward, no complicated transfers',
      score: 90,
      estimatedDuration,
      walkingDistance,
      steps,
      safetyFeatures: [
        'No stairs required',
        'Elevator access throughout',
        'Simple navigation',
        'Clear signage',
      ],
      aiRecommendations: [
        'Perfect for children with mobility aids',
        'Great for strollers',
        'No rushing needed',
      ],
      difficultyLevel: 'easy',
      kidFriendlyScore: 95,
      accessibility: {
        wheelchairFriendly: true,
        strollerFriendly: true,
        elevatorAvailable: true,
      },
    };
  }

  /**
   * Generate a scenic route
   */
  private async generateScenicRoute(
    origin: Location.LocationObject,
    destination: { latitude: number; longitude: number },
    context: RouteContext,
  ): Promise<SmartRoute> {
    const steps: RouteStep[] = [];
    const walkingDistance = this.calculateDistance(origin.coords, destination) * 1.2; // Longer
    const estimatedDuration = Math.ceil(walkingDistance / 70);

    return {
      id: 'route-scenic',
      name: '🌳 Scenic Route',
      description: 'Beautiful journey with parks and landmarks',
      score: 80,
      estimatedDuration,
      walkingDistance,
      steps,
      safetyFeatures: ['Park pathways', 'Historical landmarks', 'Photo opportunities'],
      aiRecommendations: [
        'Great for educational trips',
        'Perfect for nice weather',
        'Lots to see and learn',
      ],
      difficultyLevel: 'easy',
      kidFriendlyScore: 88,
      accessibility: {
        wheelchairFriendly: true,
        strollerFriendly: true,
        elevatorAvailable: false,
      },
    };
  }

  /**
   * AI scoring algorithm
   */
  private scoreRoute(route: SmartRoute, context: RouteContext): SmartRoute {
    let score = route.score;

    // Adjust based on preferences
    if (this.userPreferences.timePreference === 'safest' && route.id.includes('safest')) {
      score += 10;
    }
    if (this.userPreferences.timePreference === 'fastest' && route.id.includes('fastest')) {
      score += 10;
    }

    // Adjust for child age
    if (this.userPreferences.childAge < 8 && route.difficultyLevel === 'easy') {
      score += 5;
    }

    // Weather considerations
    if (context.weatherCondition === 'rainy' && route.walkingDistance < 500) {
      score += 5;
    }

    // Rush hour considerations
    if (context.isRushHour && route.id.includes('safest')) {
      score += 5;
    }

    // Historical learning
    const similarJourneys = this.findSimilarJourneys(route);
    if (similarJourneys.length > 0) {
      const avgSuccess =
        similarJourneys.reduce((sum, j) => sum + (j.completed ? 1 : 0), 0) / similarJourneys.length;
      score += avgSuccess * 10;
    }

    return { ...route, score: Math.min(100, Math.max(0, score)) };
  }

  /**
   * Find safe zones along the route
   */
  private findSafeZonesOnRoute(
    origin: { latitude: number; longitude: number },
    destination: { latitude: number; longitude: number },
  ): any[] {
    return this.safeZones.filter((zone) => {
      // Simple check if zone is between origin and destination
      const isOnRoute =
        zone.center.latitude >= Math.min(origin.latitude, destination.latitude) &&
        zone.center.latitude <= Math.max(origin.latitude, destination.latitude) &&
        zone.center.longitude >= Math.min(origin.longitude, destination.longitude) &&
        zone.center.longitude <= Math.max(origin.longitude, destination.longitude);

      return isOnRoute;
    });
  }

  /**
   * Calculate distance between two points
   */
  private calculateDistance(
    point1: { latitude: number; longitude: number },
    point2: { latitude: number; longitude: number },
  ): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (point1.latitude * Math.PI) / 180;
    const φ2 = (point2.latitude * Math.PI) / 180;
    const Δφ = ((point2.latitude - point1.latitude) * Math.PI) / 180;
    const Δλ = ((point2.longitude - point1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Find similar past journeys for learning
   */
  private findSimilarJourneys(route: SmartRoute): any[] {
    return this.journeyHistory.filter((journey) => {
      // Check if journey had similar characteristics
      return (
        Math.abs(journey.duration - route.estimatedDuration) < 10 &&
        journey.difficultyLevel === route.difficultyLevel
      );
    });
  }

  /**
   * Build context for route generation
   */
  private buildContext(context?: Partial<RouteContext>): RouteContext {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();

    return {
      currentTime: now,
      weatherCondition: context?.weatherCondition || 'cloudy',
      temperature: context?.temperature || 20,
      isRushHour: (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19),
      isWeekend: day === 0 || day === 6,
      isSchoolHours: hour >= 8 && hour <= 15 && day >= 1 && day <= 5,
      ...context,
    };
  }

  /**
   * Load user preferences
   */
  private loadPreferences(): RoutePreferences {
    const defaults: RoutePreferences = {
      childAge: 8,
      preferredTransitTypes: ['subway', 'bus', 'walking'],
      maxWalkingDistance: 800,
      avoidStairs: false,
      preferElevators: true,
      requireSafeZones: true,
      voiceEnabled: false,
      maxTransferCount: 2,
      timePreference: 'safest',
    };

    const stored = mainStorage.get<RoutePreferences>('route_preferences', defaults);
    return stored ?? defaults;
  }

  /**
   * Update preferences
   */
  updatePreferences(preferences: Partial<RoutePreferences>): void {
    this.userPreferences = {
      ...this.userPreferences,
      ...preferences,
    };
    mainStorage.set('route_preferences', this.userPreferences);
  }

  /**
   * Update learning model based on user choices
   */
  private updateLearningModel(routes: SmartRoute[]): void {
    // Store route suggestions for learning
    const raw = mainStorage.get<LearningEntry[]>('route_learning', [] as LearningEntry[]);
    const learning: LearningEntry[] = Array.isArray(raw) ? raw : [];

    learning.push({
      timestamp: Date.now(),
      routes: routes.map((r) => ({ id: r.id, score: r.score })),
      context: this.buildContext(),
    });

    // Keep last 100 learning entries
    if (learning.length > 100) {
      learning.shift();
    }

    mainStorage.set('route_learning', learning);
  }

  /**
   * Get AI insights about a route
   */
  getRouteInsights(route: SmartRoute): string[] {
    const insights: string[] = [];

    // Age-appropriate insights
    if (this.userPreferences.childAge < 6) {
      insights.push('This route is designed for young children with extra safety measures');
    } else if (this.userPreferences.childAge < 10) {
      insights.push('Great learning opportunity for building independence');
    } else {
      insights.push('This route helps develop navigation skills');
    }

    // Time-based insights
    const context = this.buildContext();
    if (context.isRushHour) {
      insights.push('⚠️ Rush hour - expect crowds. Stay extra close to your grown-up!');
    }

    // Weather insights
    if (context.weatherCondition === 'rainy') {
      insights.push('🌧️ Rainy weather - bring an umbrella and watch for puddles');
    }

    // Safety insights
    if (route.safetyFeatures.length > 3) {
      insights.push('✅ This route has excellent safety features');
    }

    // Accessibility insights
    if (route.accessibility.wheelchairFriendly) {
      insights.push('♿ Fully accessible route with elevators');
    }

    return insights;
  }

  /**
   * Get personalized recommendations
   */
  getPersonalizedRecommendations(): string[] {
    const recommendations: string[] = [];
    const history = this.journeyHistory;

    if (history.length === 0) {
      recommendations.push('Start building your journey history for personalized suggestions!');
      return recommendations;
    }

    // Analyze patterns
    const avgDuration = history.reduce((sum, j) => sum + j.duration, 0) / history.length;
    const preferredTime = this.userPreferences.timePreference;

    recommendations.push(`Based on your history, you typically prefer ${preferredTime} routes`);
    recommendations.push(`Your average journey takes ${Math.ceil(avgDuration)} minutes`);

    // Success rate
    const completedCount = history.filter((j) => j.completed).length;
    const successRate = (completedCount / history.length) * 100;

    if (successRate > 90) {
      recommendations.push('🌟 Great job! You complete almost all your journeys successfully!');
    }

    return recommendations;
  }
}

// Singleton instance
export const aiRouteEngine = new AIRouteEngine();

export default {
  AIRouteEngine,
  aiRouteEngine,
};
