import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import {
  MapPin,
  Navigation,
  Clock,
  Train,
  Bus,
  AlertTriangle,
  CheckCircle,
  Star,
  Users,
  Shield,
  Heart,
  Play,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { subwayLineColors } from '@/config/transit-data/mta-subway-lines';

type KidTripPlannerProps = {
  onTripReady?: (trip: TripPlan) => void;
  userLocation?: { lat: number; lng: number; name?: string };
};

type TripSegment = {
  id: string;
  type: 'walk' | 'subway' | 'bus' | 'transfer';
  line?: string;
  from: string;
  to: string;
  duration: number; // in minutes
  instructions: string;
  kidFriendlyTip: string;
  safetyNote?: string;
  funThingsToSee?: string[];
  accessibility: {
    wheelchairAccessible: boolean;
    strollerFriendly: boolean;
    elevatorRequired: boolean;
  };
};

type TripPlan = {
  id: string;
  from: string;
  to: string;
  totalDuration: number;
  totalWalkingTime: number;
  segments: TripSegment[];
  kidFriendlyRating: number; // 1-5 stars
  difficulty: 'Easy' | 'Medium' | 'Hard';
  bestTimeToGo: string;
  thingsToRemember: string[];
  emergencyInfo: {
    nearestHospital: string;
    transitPolice: string;
    helpfulStaff: string[];
  };
  funAlongTheWay: string[];
  estimatedCost: {
    adult: number;
    child: number; // under 44 inches ride free
  };
};

const KidTripPlanner: React.FC<KidTripPlannerProps> = ({ onTripReady, userLocation }) => {
  const [fromLocation, setFromLocation] = useState(userLocation?.name || '');
  const [toLocation, setToLocation] = useState('');
  const [selectedTrip, setSelectedTrip] = useState<TripPlan | null>(null);
  const [tripOptions, setTripOptions] = useState<TripPlan[]>([]);
  const [isPlanning, setIsPlanning] = useState(false);
  const [travelTime, setTravelTime] = useState<'now' | 'later'>('now');
  const [groupSize, setGroupSize] = useState({ adults: 1, children: 1 });
  const [accessibilityNeeds, setAccessibilityNeeds] = useState({
    wheelchair: false,
    stroller: false,
    elevatorOnly: false,
  });

  // Mock trip planning function with comprehensive kid-friendly routes
  const planTrip = async () => {
    if (!fromLocation.trim() || !toLocation.trim()) {
      Alert.alert('Missing Information', 'Please enter both starting point and destination!');
      return;
    }

    setIsPlanning(true);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const mockTripOptions: TripPlan[] = [
      {
        id: 'option-1',
        from: fromLocation,
        to: toLocation,
        totalDuration: 35,
        totalWalkingTime: 12,
        difficulty: 'Easy',
        kidFriendlyRating: 5,
        bestTimeToGo: 'Weekday mornings (9-11 AM) or early afternoons (1-3 PM) are less crowded',
        segments: [
          {
            id: 'walk-1',
            type: 'walk',
            from: fromLocation,
            to: 'Times Sq-42nd St Station',
            duration: 5,
            instructions: 'Walk 3 blocks north to Times Square station',
            kidFriendlyTip: "Look for the big red stairs and bright lights - that's your landmark!",
            safetyNote: 'Hold hands tight - Times Square is very busy with lots of people',
            funThingsToSee: [
              'Street performers',
              'Costume characters',
              'Giant billboards',
              'Police horses',
            ],
            accessibility: {
              wheelchairAccessible: true,
              strollerFriendly: true,
              elevatorRequired: false,
            },
          },
          {
            id: 'subway-1',
            type: 'subway',
            line: '1',
            from: 'Times Sq-42nd St',
            to: '59th St-Columbus Circle',
            duration: 8,
            instructions: 'Take the 1 train uptown (northbound) for 3 stops',
            kidFriendlyTip:
              'The 1 train is red on the map - count the stops on your fingers: 50th, then 59th!',
            safetyNote: 'Stand clear of closing doors and hold the pole or sit down',
            funThingsToSee: [
              'Underground musicians',
              'Colorful tile work',
              'People from all over the world',
            ],
            accessibility: {
              wheelchairAccessible: true,
              strollerFriendly: true,
              elevatorRequired: true,
            },
          },
          {
            id: 'walk-2',
            type: 'walk',
            from: '59th St-Columbus Circle Station',
            to: toLocation,
            duration: 7,
            instructions: 'Exit at Central Park South and walk 2 blocks to destination',
            kidFriendlyTip:
              "You'll see Central Park right outside the station - perfect for a quick playground stop!",
            funThingsToSee: [
              'Central Park entrance',
              'Horse carriages',
              'Street vendors',
              'Columbus statue',
            ],
            accessibility: {
              wheelchairAccessible: true,
              strollerFriendly: true,
              elevatorRequired: false,
            },
          },
        ],
        thingsToRemember: [
          'Bring MetroCard or tap your phone/card',
          'Keep your group together at all times',
          'Emergency button is on every subway car',
          "Ask MTA staff if you need help - they're there to help!",
          'Have a backup plan if trains are delayed',
        ],
        emergencyInfo: {
          nearestHospital: 'Mount Sinai West (59th St & 10th Ave)',
          transitPolice: 'Call 911 or find any MTA employee',
          helpfulStaff: ['Station booth clerks', 'Transit police', 'Train conductors'],
        },
        funAlongTheWay: [
          'Count the number of different languages you hear',
          'Look for subway art and murals',
          'Spot different types of dogs in Central Park',
          'Find the Columbus statue at Columbus Circle',
        ],
        estimatedCost: {
          adult: 2.9,
          child: 0, // Children under 44 inches ride free
        },
      },
      {
        id: 'option-2',
        from: fromLocation,
        to: toLocation,
        totalDuration: 42,
        totalWalkingTime: 15,
        difficulty: 'Medium',
        kidFriendlyRating: 4,
        bestTimeToGo: "Afternoons (2-4 PM) when it's less crowded but still daylight",
        segments: [
          {
            id: 'walk-1',
            type: 'walk',
            from: fromLocation,
            to: '42nd St-Port Authority',
            duration: 8,
            instructions: 'Walk west to Port Authority Bus Terminal',
            kidFriendlyTip: "The Port Authority is HUGE - it's like a train station for buses!",
            safetyNote: 'Very busy area - stay close to your adult',
            funThingsToSee: [
              'Giant bus terminal',
              'Food court',
              'Lots of travelers with suitcases',
            ],
            accessibility: {
              wheelchairAccessible: true,
              strollerFriendly: true,
              elevatorRequired: false,
            },
          },
          {
            id: 'bus-1',
            type: 'bus',
            line: 'M11',
            from: '42nd St-Port Authority',
            to: '59th St & 9th Ave',
            duration: 18,
            instructions: 'Take M11 bus northbound for about 15 minutes',
            kidFriendlyTip: 'Buses let you see the city from above ground - look out the windows!',
            safetyNote: 'Hold on tight when the bus stops and starts',
            funThingsToSee: [
              'Street level view of NYC',
              'Different neighborhoods',
              'Bike lanes and bike riders',
            ],
            accessibility: {
              wheelchairAccessible: true,
              strollerFriendly: true,
              elevatorRequired: false,
            },
          },
          {
            id: 'walk-2',
            type: 'walk',
            from: '59th St & 9th Ave',
            to: toLocation,
            duration: 7,
            instructions: 'Walk east 3 blocks to Central Park',
            kidFriendlyTip: 'You can see the park getting closer - look for the trees!',
            funThingsToSee: ['Tree-lined streets', 'Brownstone buildings', 'People walking dogs'],
            accessibility: {
              wheelchairAccessible: true,
              strollerFriendly: true,
              elevatorRequired: false,
            },
          },
        ],
        thingsToRemember: [
          'Have exact change or MetroCard for bus',
          'Board at the front door, exit at the back',
          'Buses stop at every stop unless you request',
          'Press the stop button or pull the cord when you want to get off',
        ],
        emergencyInfo: {
          nearestHospital: 'Mount Sinai West (59th St & 10th Ave)',
          transitPolice: 'Call 911 or ask bus driver for help',
          helpfulStaff: ['Bus drivers', 'Transit supervisors at major stops'],
        },
        funAlongTheWay: [
          'Count how many yellow taxi cabs you see',
          'Look for street art and murals',
          'Spot different types of street food vendors',
          'Find fire escapes on old buildings',
        ],
        estimatedCost: {
          adult: 2.9,
          child: 0,
        },
      },
    ];

    setTripOptions(mockTripOptions);
    setIsPlanning(false);
  };

  const selectTrip = (trip: TripPlan) => {
    setSelectedTrip(trip);
    if (onTripReady) {
      onTripReady(trip);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} size={16} color="#FFD700" fill={i < rating ? '#FFD700' : 'none'} />
    ));
  };

  const renderDifficultyBadge = (difficulty: string) => {
    const colors = {
      Easy: '#4CAF50',
      Medium: '#FF9800',
      Hard: '#F44336',
    };

    return (
      <View
        style={[
          styles.difficultyBadge,
          { backgroundColor: colors[difficulty as keyof typeof colors] },
        ]}
      >
        <Text style={styles.difficultyText}>{difficulty}</Text>
      </View>
    );
  };

  const renderSegment = (segment: TripSegment, index: number) => {
    const getSegmentIcon = () => {
      switch (segment.type) {
        case 'walk':
          return <Navigation size={20} color={Colors.primary} />;
        case 'subway':
          return (
            <Train
              size={20}
              color={
                segment.line ? subwayLineColors[segment.line] || Colors.primary : Colors.primary
              }
            />
          );
        case 'bus':
          return <Bus size={20} color={Colors.primary} />;
        default:
          return <Navigation size={20} color={Colors.primary} />;
      }
    };

    return (
      <View key={segment.id} style={styles.segmentCard}>
        <View style={styles.segmentHeader}>
          <View style={styles.segmentIcon}>{getSegmentIcon()}</View>
          <View style={styles.segmentDetails}>
            <Text style={styles.segmentTitle}>
              {segment.type === 'walk'
                ? 'Walk'
                : segment.type === 'subway'
                ? `${segment.line} Train`
                : `${segment.line} Bus`}
            </Text>
            <Text style={styles.segmentRoute}>
              {segment.from} → {segment.to}
            </Text>
            <Text style={styles.segmentDuration}>
              <Clock size={14} color={Colors.textLight} /> {segment.duration} minutes
            </Text>
          </View>
        </View>

        <Text style={styles.segmentInstructions}>{segment.instructions}</Text>

        <View style={styles.kidTipContainer}>
          <Text style={styles.kidTip}>👶 {segment.kidFriendlyTip}</Text>
        </View>

        {segment.safetyNote && (
          <View style={styles.safetyContainer}>
            <AlertTriangle size={14} color="#FF9800" />
            <Text style={styles.safetyNote}>{segment.safetyNote}</Text>
          </View>
        )}

        {segment.funThingsToSee && segment.funThingsToSee.length > 0 && (
          <View style={styles.funThingsContainer}>
            <Text style={styles.funThingsTitle}>👀 Look for:</Text>
            {segment.funThingsToSee.map((thing, idx) => (
              <Text key={idx} style={styles.funThing}>
                • {thing}
              </Text>
            ))}
          </View>
        )}

        {/* Accessibility Info */}
        <View style={styles.accessibilityContainer}>
          <View style={styles.accessibilityItem}>
            <Shield
              size={12}
              color={segment.accessibility.wheelchairAccessible ? '#4CAF50' : '#CCCCCC'}
            />
            <Text
              style={[
                styles.accessibilityText,
                { color: segment.accessibility.wheelchairAccessible ? '#4CAF50' : '#CCCCCC' },
              ]}
            >
              Wheelchair
            </Text>
          </View>
          <View style={styles.accessibilityItem}>
            <Heart
              size={12}
              color={segment.accessibility.strollerFriendly ? '#4CAF50' : '#CCCCCC'}
            />
            <Text
              style={[
                styles.accessibilityText,
                { color: segment.accessibility.strollerFriendly ? '#4CAF50' : '#CCCCCC' },
              ]}
            >
              Stroller
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderTripOption = (trip: TripPlan) => (
    <TouchableOpacity key={trip.id} style={styles.tripCard} onPress={() => selectTrip(trip)}>
      <View style={styles.tripHeader}>
        <View style={styles.tripInfo}>
          <Text style={styles.tripDuration}>{trip.totalDuration} min total</Text>
          <Text style={styles.walkingTime}>{trip.totalWalkingTime} min walking</Text>
        </View>
        <View style={styles.tripRating}>
          <View style={styles.starsContainer}>{renderStars(trip.kidFriendlyRating)}</View>
          {renderDifficultyBadge(trip.difficulty)}
        </View>
      </View>

      <Text style={styles.bestTime}>🕐 Best time: {trip.bestTimeToGo}</Text>

      <View style={styles.costContainer}>
        <Text style={styles.costText}>
          💰 Adult: ${trip.estimatedCost.adult} • Child: Free (under 44 inches)
        </Text>
      </View>

      <TouchableOpacity style={styles.selectTripButton} onPress={() => selectTrip(trip)}>
        <Play size={16} color="#FFFFFF" />
        <Text style={styles.selectTripText}>Choose This Route</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Kid-Friendly Trip Planner</Text>
          <Text style={styles.subtitle}>Plan safe and fun trips around NYC!</Text>
        </View>

        {/* Trip Planning Form */}
        <View style={styles.planningForm}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>From (Starting Point)</Text>
            <TextInput
              style={styles.input}
              value={fromLocation}
              onChangeText={setFromLocation}
              placeholder="Enter starting location..."
              placeholderTextColor={Colors.textLight}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>To (Destination)</Text>
            <TextInput
              style={styles.input}
              value={toLocation}
              onChangeText={setToLocation}
              placeholder="Enter destination..."
              placeholderTextColor={Colors.textLight}
            />
          </View>

          {/* Group Size */}
          <View style={styles.groupSizeContainer}>
            <Text style={styles.inputLabel}>Group Size</Text>
            <View style={styles.groupSizeControls}>
              <View style={styles.groupItem}>
                <Text style={styles.groupLabel}>Adults:</Text>
                <View style={styles.counterContainer}>
                  <TouchableOpacity
                    style={styles.counterButton}
                    onPress={() =>
                      setGroupSize((prev) => ({ ...prev, adults: Math.max(1, prev.adults - 1) }))
                    }
                  >
                    <Text style={styles.counterButtonText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.counterValue}>{groupSize.adults}</Text>
                  <TouchableOpacity
                    style={styles.counterButton}
                    onPress={() => setGroupSize((prev) => ({ ...prev, adults: prev.adults + 1 }))}
                  >
                    <Text style={styles.counterButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.groupItem}>
                <Text style={styles.groupLabel}>Children:</Text>
                <View style={styles.counterContainer}>
                  <TouchableOpacity
                    style={styles.counterButton}
                    onPress={() =>
                      setGroupSize((prev) => ({
                        ...prev,
                        children: Math.max(0, prev.children - 1),
                      }))
                    }
                  >
                    <Text style={styles.counterButtonText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.counterValue}>{groupSize.children}</Text>
                  <TouchableOpacity
                    style={styles.counterButton}
                    onPress={() =>
                      setGroupSize((prev) => ({ ...prev, children: prev.children + 1 }))
                    }
                  >
                    <Text style={styles.counterButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* Accessibility Options */}
          <View style={styles.accessibilityOptions}>
            <Text style={styles.inputLabel}>Accessibility Needs</Text>
            <TouchableOpacity
              style={[
                styles.accessibilityOption,
                accessibilityNeeds.wheelchair && styles.accessibilityOptionActive,
              ]}
              onPress={() =>
                setAccessibilityNeeds((prev) => ({ ...prev, wheelchair: !prev.wheelchair }))
              }
            >
              <Shield
                size={16}
                color={accessibilityNeeds.wheelchair ? '#FFFFFF' : Colors.primary}
              />
              <Text
                style={[
                  styles.accessibilityOptionText,
                  accessibilityNeeds.wheelchair && styles.accessibilityOptionTextActive,
                ]}
              >
                Wheelchair Access
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.accessibilityOption,
                accessibilityNeeds.stroller && styles.accessibilityOptionActive,
              ]}
              onPress={() =>
                setAccessibilityNeeds((prev) => ({ ...prev, stroller: !prev.stroller }))
              }
            >
              <Heart size={16} color={accessibilityNeeds.stroller ? '#FFFFFF' : Colors.primary} />
              <Text
                style={[
                  styles.accessibilityOptionText,
                  accessibilityNeeds.stroller && styles.accessibilityOptionTextActive,
                ]}
              >
                Stroller Friendly
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.planButton} onPress={planTrip} disabled={isPlanning}>
            <MapPin size={20} color="#FFFFFF" />
            <Text style={styles.planButtonText}>
              {isPlanning ? 'Planning Your Trip...' : 'Plan My Trip!'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Trip Options */}
        {tripOptions.length > 0 && (
          <View style={styles.tripOptionsContainer}>
            <Text style={styles.sectionTitle}>Trip Options</Text>
            {tripOptions.map(renderTripOption)}
          </View>
        )}

        {/* Selected Trip Details */}
        {selectedTrip && (
          <View style={styles.selectedTripContainer}>
            <Text style={styles.sectionTitle}>Your Selected Route</Text>

            <View style={styles.selectedTripHeader}>
              <Text style={styles.selectedTripTitle}>
                {selectedTrip.from} → {selectedTrip.to}
              </Text>
              <View style={styles.selectedTripMeta}>
                <Text style={styles.selectedTripDuration}>
                  {selectedTrip.totalDuration} minutes
                </Text>
                <View style={styles.starsContainer}>
                  {renderStars(selectedTrip.kidFriendlyRating)}
                </View>
              </View>
            </View>

            {/* Trip Segments */}
            <View style={styles.segmentsContainer}>
              <Text style={styles.segmentsTitle}>Step-by-Step Directions</Text>
              {selectedTrip.segments.map(renderSegment)}
            </View>

            {/* Important Reminders */}
            <View style={styles.remindersContainer}>
              <Text style={styles.remindersTitle}>📝 Things to Remember</Text>
              {selectedTrip.thingsToRemember.map((reminder, index) => (
                <View key={index} style={styles.reminderItem}>
                  <CheckCircle size={16} color="#4CAF50" />
                  <Text style={styles.reminderText}>{reminder}</Text>
                </View>
              ))}
            </View>

            {/* Fun Activities */}
            <View style={styles.funActivitiesContainer}>
              <Text style={styles.funActivitiesTitle}>🎉 Fun Things to Do Along the Way</Text>
              {selectedTrip.funAlongTheWay.map((activity, index) => (
                <Text key={index} style={styles.funActivity}>
                  • {activity}
                </Text>
              ))}
            </View>

            {/* Emergency Information */}
            <View style={styles.emergencyContainer}>
              <Text style={styles.emergencyTitle}>🚨 Emergency Information</Text>
              <Text style={styles.emergencyItem}>
                🏥 Hospital: {selectedTrip.emergencyInfo.nearestHospital}
              </Text>
              <Text style={styles.emergencyItem}>
                👮 Transit Police: {selectedTrip.emergencyInfo.transitPolice}
              </Text>
              <Text style={styles.emergencyItem}>
                👥 Helpful Staff: {selectedTrip.emergencyInfo.helpfulStaff.join(', ')}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: Colors.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 4,
    opacity: 0.9,
  },
  planningForm: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: '#F8F9FA',
  },
  groupSizeContainer: {
    marginBottom: 16,
  },
  groupSizeControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  groupItem: {
    flex: 1,
    marginHorizontal: 8,
  },
  groupLabel: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 8,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 8,
  },
  counterButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  counterValue: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginHorizontal: 16,
    minWidth: 24,
    textAlign: 'center',
  },
  accessibilityOptions: {
    marginBottom: 20,
  },
  accessibilityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 8,
    backgroundColor: '#F8F9FA',
  },
  accessibilityOptionActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  accessibilityOptionText: {
    fontSize: 14,
    color: Colors.primary,
    marginLeft: 8,
    fontWeight: '500',
  },
  accessibilityOptionTextActive: {
    color: '#FFFFFF',
  },
  planButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  planButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  tripOptionsContainer: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  tripCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tripInfo: {
    flex: 1,
  },
  tripDuration: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  walkingTime: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 2,
  },
  tripRating: {
    alignItems: 'flex-end',
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  bestTime: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 8,
    lineHeight: 18,
  },
  costContainer: {
    marginBottom: 12,
  },
  costText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  selectTripButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
  },
  selectTripText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  selectedTripContainer: {
    padding: 20,
    paddingTop: 0,
  },
  selectedTripHeader: {
    marginBottom: 20,
  },
  selectedTripTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  selectedTripMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedTripDuration: {
    fontSize: 16,
    color: Colors.textLight,
  },
  segmentsContainer: {
    marginBottom: 24,
  },
  segmentsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  segmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  segmentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  segmentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  segmentDetails: {
    flex: 1,
  },
  segmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  segmentRoute: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 4,
  },
  segmentDuration: {
    fontSize: 12,
    color: Colors.textLight,
  },
  segmentInstructions: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
    marginBottom: 12,
  },
  kidTipContainer: {
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  kidTip: {
    fontSize: 13,
    color: '#1565C0',
    lineHeight: 18,
  },
  safetyContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF3E0',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  safetyNote: {
    fontSize: 12,
    color: '#E65100',
    marginLeft: 6,
    flex: 1,
    lineHeight: 16,
  },
  funThingsContainer: {
    backgroundColor: '#F3E5F5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  funThingsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7B1FA2',
    marginBottom: 6,
  },
  funThing: {
    fontSize: 12,
    color: '#7B1FA2',
    lineHeight: 16,
  },
  accessibilityContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  accessibilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  accessibilityText: {
    fontSize: 11,
    marginLeft: 4,
    fontWeight: '500',
  },
  remindersContainer: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  remindersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  reminderItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reminderText: {
    fontSize: 14,
    color: Colors.text,
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  funActivitiesContainer: {
    backgroundColor: '#E8F5E8',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  funActivitiesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 12,
  },
  funActivity: {
    fontSize: 14,
    color: '#2E7D32',
    lineHeight: 20,
    marginBottom: 4,
  },
  emergencyContainer: {
    backgroundColor: '#FFEBEE',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#C62828',
    marginBottom: 12,
  },
  emergencyItem: {
    fontSize: 14,
    color: '#C62828',
    lineHeight: 20,
    marginBottom: 4,
  },
});

export default KidTripPlanner;
