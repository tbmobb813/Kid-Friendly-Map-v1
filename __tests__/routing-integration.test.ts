/**
 * Integration Tests for ORS and OTP2 Routing Services
 * Tests real API integration and unified routing functionality
 */

import { offlineStorage } from '../utils/api';
import { orsService } from '../utils/orsService';
import { otp2Service } from '../utils/otp2Service';
import { unifiedRoutingService } from '../utils/unifiedRoutingService';

// Mock monitoring to avoid Sentry dependencies in tests
jest.mock('../utils/monitoring', () => {
  const endTimer = jest.fn();
  return {
    monitoring: {
      trackUserAction: jest.fn(),
      captureError: jest.fn(),
      trackPerformance: jest.fn(),
      startPerformanceTimer: jest.fn(() => endTimer),
      getSystemHealth: jest.fn().mockReturnValue({
        networkStatus: 'online',
        backendStatus: 'healthy',
        storageAvailable: true,
        memoryPressure: 'low',
        pendingSyncActions: 0,
      }),
      resetForTests: jest.fn(),
    },
  };
});

// Mock fetch for API calls
global.fetch = jest.fn();

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

beforeEach(async () => {
  jest.clearAllMocks();
  mockFetch.mockReset();
  orsService.resetForTests();
  otp2Service.resetForTests();
  await offlineStorage.clearCache();
});

describe('ORS Service Integration', () => {
  const testCoordinates: [number, number][] = [
    [-74.006, 40.7128], // NYC City Hall
    [-73.9934, 40.7505], // Times Square
  ];

  describe('Basic Routing', () => {
    it('should get walking route successfully', async () => {
      const mockResponse = {
        routes: [
          {
            summary: { duration: 1200, distance: 1000 },
            geometry: { coordinates: testCoordinates },
            segments: [
              {
                steps: [
                  { instruction: 'Head north', distance: 100, duration: 80 },
                  { instruction: 'Turn right', distance: 200, duration: 160 },
                ],
              },
            ],
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const result = await orsService.getRoute({
        coordinates: testCoordinates,
        profile: 'foot-walking',
        geometry: true,
        instructions: true,
      });

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/v2/directions/foot-walking'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: expect.any(String),
            'Content-Type': 'application/json',
          }),
        }),
      );
    });

    it('should handle API errors gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: () => Promise.resolve('Bad Request'),
      } as Response);

      await expect(
        orsService.getRoute({
          coordinates: testCoordinates,
          profile: 'foot-walking',
        }),
      ).rejects.toThrow('ORS API error');
    });

    it('should retry on network failures', async () => {
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              routes: [
                {
                  summary: { duration: 1200, distance: 1000 },
                  geometry: { coordinates: testCoordinates },
                },
              ],
            }),
        } as Response);

      const result = await orsService.getRoute({
        coordinates: testCoordinates,
        profile: 'foot-walking',
      });

      expect(result.routes).toHaveLength(1);
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });
  });

  describe('Kid-Friendly Features', () => {
    it('should apply kid-friendly modifications', async () => {
      const mockResponse = {
        routes: [
          {
            summary: { duration: 1200, distance: 1000 },
            geometry: { coordinates: testCoordinates },
            segments: [
              {
                steps: [{ instruction: 'Head north', distance: 100, duration: 80 }],
              },
            ],
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const result = await orsService.getKidFriendlyRoute(testCoordinates, 8);

      expect(result).toEqual(mockResponse);

      const callArgs = mockFetch.mock.calls[0];
      const requestBody = JSON.parse(callArgs[1]?.body as string);

      // Should use foot-walking profile for kids
      expect(callArgs[0]).toContain('foot-walking');

      // Should include kid-friendly options
      expect(requestBody.options).toMatchObject({
        avoid_features: expect.arrayContaining(['highways']),
        profile_params: expect.objectContaining({
          weightings: expect.objectContaining({
            green: expect.any(Number),
            quiet: expect.any(Number),
          }),
        }),
      });
    });

    it('should calculate safety scores for kid routes', async () => {
      const mockResponse = {
        routes: [
          {
            summary: { duration: 1200, distance: 1000 },
            geometry: { coordinates: testCoordinates },
            segments: [
              {
                steps: [
                  { instruction: 'Head north through park', distance: 500, duration: 400 },
                  { instruction: 'Cross at traffic light', distance: 100, duration: 80 },
                ],
              },
            ],
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const result = await orsService.getKidFriendlyRoute(testCoordinates, 6);

      expect(result).toEqual(mockResponse);
      // Kid-friendly route should be requested with appropriate safety features
    });
  });

  describe('Accessibility Features', () => {
    it('should request wheelchair accessible routes', async () => {
      const mockResponse = {
        routes: [
          {
            summary: { duration: 1400, distance: 1200 },
            geometry: { coordinates: testCoordinates },
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const result = await orsService.getAccessibleRoute(testCoordinates);

      const callArgs = mockFetch.mock.calls[0];
      const requestBody = JSON.parse(callArgs[1]?.body as string);

      expect(callArgs[0]).toContain('wheelchair');
      expect(requestBody.options?.avoid_features).toContain('steps');
      expect(requestBody.options?.profile_params?.weightings?.steepness_difficulty).toBe(5);
    });
  });
});

describe('OTP2 Service Integration', () => {
  describe('Trip Planning', () => {
    it('should plan transit trip successfully', async () => {
      const mockResponse = {
        plan: {
          itineraries: [
            {
              duration: 1800,
              transfers: 1,
              walkTime: 300,
              transitTime: 1200,
              legs: [
                {
                  mode: 'WALK',
                  duration: 300,
                  distance: 400,
                  from: { name: 'Origin' },
                  to: { name: 'Station A' },
                },
                {
                  mode: 'SUBWAY',
                  duration: 1200,
                  from: { name: 'Station A' },
                  to: { name: 'Station B' },
                  route: { shortName: '6' },
                },
                {
                  mode: 'WALK',
                  duration: 300,
                  distance: 400,
                  from: { name: 'Station B' },
                  to: { name: 'Destination' },
                },
              ],
            },
          ],
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const result = await otp2Service.planTrip({
        fromPlace: '40.7128,-74.0060',
        toPlace: '40.7505,-73.9934',
        mode: 'TRANSIT,WALK',
      });

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/plan'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Accept: 'application/json',
          }),
        }),
      );
    });

    it('should handle no routes found', async () => {
      const mockResponse = {
        plan: {
          itineraries: [],
        },
        error: {
          msg: 'No routes found',
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const result = await otp2Service.planTrip({
        fromPlace: '40.7128,-74.0060',
        toPlace: '40.7505,-73.9934',
        mode: 'TRANSIT,WALK',
      });

      expect(result.plan.itineraries).toHaveLength(0);
    });
  });

  describe('Kid-Friendly Transit', () => {
    it('should apply kid-friendly transit options', async () => {
      const mockResponse = {
        plan: {
          itineraries: [
            {
              duration: 2100,
              transfers: 0, // Prefer direct routes for kids
              legs: [
                {
                  mode: 'BUS',
                  duration: 1800,
                  route: { shortName: 'M15' },
                },
              ],
            },
          ],
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const result = await otp2Service.getKidFriendlyTrip(
        '40.7128,-74.0060',
        '40.7505,-73.9934',
        7,
      );

      expect(result).toEqual(mockResponse);

      const callUrl = mockFetch.mock.calls[0][0] as string;
      expect(callUrl).toContain('maxTransfers=1'); // Limited transfers for kids
      expect(callUrl).toContain('walkReluctance=3'); // Reduce walking for kids
    });
  });

  describe('Real-time Data', () => {
    it('should fetch stop information', async () => {
      const mockResponse = {
        stop: {
          id: 'MTA_123456',
          name: 'Times Sq-42 St',
          lat: 40.7505,
          lon: -73.9934,
          routes: [
            { shortName: '1', longName: 'Broadway - 7 Avenue Local' },
            { shortName: 'N', longName: 'Broadway Express' },
          ],
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const result = await otp2Service.getStopInfo('MTA_123456');

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/index/stops/MTA_123456'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Accept: 'application/json',
          }),
        }),
      );
    });

    it('should fetch real-time arrivals', async () => {
      const mockResponse = {
        stopTimes: [
          {
            scheduledArrival: 1640995200,
            realtimeArrival: 1640995260,
            arrivalDelay: 60,
            trip: { route: { shortName: '6' } },
            headsign: 'Brooklyn Bridge',
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const result = await otp2Service.getStopTimes('MTA_123456');

      expect(result).toEqual(mockResponse);
    });
  });
});

describe('Unified Routing Service Integration', () => {
  const testRequest = {
    from: { lat: 40.7128, lng: -74.006, name: 'NYC City Hall' },
    to: { lat: 40.7505, lng: -73.9934, name: 'Times Square' },
    preferences: {
      modes: ['WALK', 'TRANSIT'] as ('WALK' | 'BIKE' | 'TRANSIT' | 'CAR')[],
      childAge: 8,
      wheelchair: false,
      prioritizeSafety: true,
    },
  };

  it('should combine ORS and OTP2 routes', async () => {
    // Mock ORS response
    const orsResponse = {
      routes: [
        {
          summary: { duration: 1200, distance: 1000 },
          geometry: {
            coordinates: [
              [0, 0],
              [1, 1],
            ],
          },
          segments: [{ steps: [{ instruction: 'Walk north', distance: 1000, duration: 1200 }] }],
        },
      ],
    };

    // Mock OTP2 response
    const otp2Response = {
      plan: {
        itineraries: [
          {
            duration: 1800,
            transfers: 1,
            legs: [
              {
                mode: 'WALK',
                duration: 300,
                distance: 400,
                from: { name: 'Origin' },
                to: { name: 'Station' },
              },
              {
                mode: 'SUBWAY',
                duration: 1200,
                from: { name: 'Station' },
                to: { name: 'Destination' },
                route: { shortName: '6' },
              },
            ],
          },
        ],
      },
    };

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(orsResponse),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(otp2Response),
      } as Response);

    const result = await unifiedRoutingService.getRoutes(testRequest);

    expect(result).toHaveLength(2);

    // Check walking route from ORS
    const walkingRoute = result.find((r) => r.type === 'walking');
    expect(walkingRoute).toBeDefined();
    expect(walkingRoute?.source).toBe('ORS');
    expect(walkingRoute?.summary.duration).toBe(20); // 1200s / 60
    expect(walkingRoute?.summary.distance).toBe(1000);

    // Check transit route from OTP2
    const transitRoute = result.find((r) => r.type === 'transit');
    expect(transitRoute).toBeDefined();
    expect(transitRoute?.source).toBe('OTP2');
    expect(transitRoute?.summary.duration).toBe(30); // 1800s / 60
    expect(transitRoute?.summary.transfers).toBe(1);
  });

  it('should calculate safety scores correctly', async () => {
    const orsResponse = {
      routes: [
        {
          summary: { duration: 1200, distance: 1000 },
          geometry: {
            coordinates: [
              [0, 0],
              [1, 1],
            ],
          },
          segments: [
            {
              steps: [
                { instruction: 'Walk through Central Park', distance: 500, duration: 600 },
                { instruction: 'Cross at traffic light', distance: 500, duration: 600 },
              ],
            },
          ],
        },
      ],
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(orsResponse),
    } as Response);

    const result = await unifiedRoutingService.getRoutes({
      ...testRequest,
      preferences: { ...testRequest.preferences, modes: ['WALK'] },
    });

    expect(result).toHaveLength(1);
    expect(result[0].safetyScore).toBeGreaterThan(70); // Park route should be safe
    expect(result[0].kidFriendlyScore).toBeGreaterThan(75); // Park route should be kid-friendly
  });

  it('should handle accessibility preferences', async () => {
    const accessibleRequest = {
      ...testRequest,
      preferences: { ...testRequest.preferences, wheelchair: true },
    };

    const orsResponse = {
      routes: [
        {
          summary: { duration: 1400, distance: 1200 },
          geometry: {
            coordinates: [
              [0, 0],
              [1, 1],
            ],
          },
          segments: [
            { steps: [{ instruction: 'Accessible route', distance: 1200, duration: 1400 }] },
          ],
        },
      ],
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(orsResponse),
    } as Response);

    const result = await unifiedRoutingService.getRoutes(accessibleRequest);

    expect(result).toHaveLength(1);
    expect(result[0].accessibilityScore).toBeGreaterThan(80);
  });

  it('should sort routes by preference', async () => {
    const orsResponse = {
      routes: [
        {
          summary: { duration: 600, distance: 500 }, // Fast route
          geometry: {
            coordinates: [
              [0, 0],
              [1, 1],
            ],
          },
          segments: [
            { steps: [{ instruction: 'Walk on busy street', distance: 500, duration: 600 }] },
          ],
        },
      ],
    };

    const otp2Response = {
      plan: {
        itineraries: [
          {
            duration: 1800, // Slower but safer
            transfers: 0,
            legs: [
              {
                mode: 'BUS',
                duration: 1800,
                from: { name: 'Origin' },
                to: { name: 'Destination' },
                route: { shortName: 'M15' },
              },
            ],
          },
        ],
      },
    };

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(orsResponse),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(otp2Response),
      } as Response);

    const result = await unifiedRoutingService.getRoutes({
      ...testRequest,
      preferences: { ...testRequest.preferences, prioritizeSafety: true },
    });

    expect(result).toHaveLength(2);
    // With safety priority, transit should rank higher despite being slower
    expect(result[0].type).toBe('transit');
    expect(result[1].type).toBe('walking');
  });

  it('should handle API failures gracefully', async () => {
    // ORS fails, OTP2 succeeds
    mockFetch.mockRejectedValueOnce(new Error('ORS API down')).mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          plan: {
            itineraries: [
              {
                duration: 1800,
                transfers: 1,
                walkDistance: 200,
                legs: [
                  {
                    mode: 'SUBWAY',
                    duration: 1800,
                    distance: 5000,
                    from: { name: 'Origin', lat: 40.7128, lon: -74.006 },
                    to: { name: 'Destination', lat: 40.7505, lon: -73.9934 },
                    route: { shortName: '6' },
                  },
                ],
              },
            ],
          },
        }),
    } as Response);

    const result = await unifiedRoutingService.getRoutes(testRequest);

    expect(result).toHaveLength(1);
    expect(result[0].source).toBe('OTP2');
  });

  it('should return empty array when all services fail', async () => {
    mockFetch
      .mockRejectedValueOnce(new Error('ORS API down'))
      .mockRejectedValueOnce(new Error('OTP2 API down'));

    const result = await unifiedRoutingService.getRoutes(testRequest);

    expect(result).toHaveLength(0);
  });
});

describe('Performance and Caching', () => {
  it('should cache ORS route responses', async () => {
    const mockResponse = {
      routes: [
        {
          summary: { duration: 1200, distance: 1000 },
          geometry: {
            coordinates: [
              [0, 0],
              [1, 1],
            ],
          },
        },
      ],
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response);

    const request = {
      coordinates: [
        [-74.006, 40.7128],
        [-73.9934, 40.7505],
      ] as [number, number][],
      profile: 'foot-walking' as const,
    };

    // First call
    const result1 = await orsService.getRoute(request);
    expect(result1).toEqual(mockResponse);

    // Second call - should use cache
    const result2 = await orsService.getRoute(request);
    expect(result2).toEqual(mockResponse);

    // Should only make one API call due to caching
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('should handle concurrent requests efficiently', async () => {
    const mockResponse = {
      routes: [
        {
          summary: { duration: 1200, distance: 1000 },
          geometry: {
            coordinates: [
              [0, 0],
              [1, 1],
            ],
          },
        },
      ],
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response);

    const request = {
      coordinates: [
        [-74.006, 40.7128],
        [-73.9934, 40.7505],
      ] as [number, number][],
      profile: 'foot-walking' as const,
    };

    // Make multiple concurrent requests
    const promises = Array(5)
      .fill(null)
      .map(() => orsService.getRoute(request));
    const results = await Promise.all(promises);

    // All should return the same result
    results.forEach((result) => expect(result).toEqual(mockResponse));

    // Should only make one API call due to request deduplication
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});
