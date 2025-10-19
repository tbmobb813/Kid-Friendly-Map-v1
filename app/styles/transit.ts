import { StyleSheet, Platform, Dimensions } from 'react-native';
import Colors from '@/constants/colors';

const { width: screenWidth } = Dimensions.get('window');

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 32,
  },
  searchContainer: {
    marginBottom: 16,
  },
  statusSummaryContainer: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    color: Colors.textLight,
    marginLeft: 4,
  },
  alertContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    borderRadius: 8,
    padding: 12,
  },
  alertIcon: {
    marginRight: 8,
  },
  alertText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  linesContainer: {
    gap: 12,
    marginBottom: 16,
  },
  lineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  selectedLine: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  lineCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  lineText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  statusContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: Colors.text,
  },
  lineDetailsContainer: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  nextTrainsContainer: {
    marginTop: 8,
  },
  nextTrainsTitle: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 8,
  },
  trainTimesContainer: {
    flexDirection: Platform.select({
      web: screenWidth > 600 ? 'row' : 'column',
      default: 'row',
    }),
    justifyContent: 'space-between',
    gap: 8,
  },
  trainTime: {
    alignItems: 'center',
    backgroundColor: '#F0F4FF',
    borderRadius: 8,
    padding: 12,
    minWidth: Platform.select({
      web: screenWidth > 600 ? 80 : '100%',
      default: 80,
    }),
    flex: Platform.select({
      web: screenWidth > 600 ? 1 : undefined,
      default: 1,
    }),
  },
  trainTimeText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  trainDirectionText: {
    fontSize: 12,
    color: Colors.textLight,
  },
  stationsScroll: {
    marginBottom: 16,
  },
  stationsContainer: {
    paddingHorizontal: 4,
    gap: 12,
  },
  stationButton: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    minWidth: 140,
  },
  selectedStationButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  stationButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  selectedStationButtonText: {
    color: '#FFFFFF',
  },
  stationDistance: {
    fontSize: 12,
    color: Colors.textLight,
  },
  quickActionsContainer: {
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: Platform.select({
      web: screenWidth > 768 ? 'row' : 'column',
      default: 'row',
    }),
    justifyContent: 'space-between',
    gap: 12,
  },
  quickActionButton: {
    flex: Platform.select({
      web: screenWidth > 768 ? 1 : undefined,
      default: 1,
    }),
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    minHeight: 80,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
});
