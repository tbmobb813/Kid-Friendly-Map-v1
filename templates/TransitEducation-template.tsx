/**
 * Transit Education Component Template
 *
 * This template provides a starting point for creating educational components
 * about transit systems for any city. Based on the MTA Education component
 * but adaptable to any transit system worldwide.
 *
 * INSTRUCTIONS:
 * 1. Copy this file to components/YourCityEducation.tsx (e.g., LondonEducation.tsx)
 * 2. Replace all "REPLACE_" placeholders with your city's information
 * 3. Update section content to match your transit system type
 * 4. Add or remove sections based on your city's transit modes
 * 5. Customize colors and icons to match your transit authority's branding
 */

import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import {
  Train,
  Bus,
  Shield,
  Lightbulb,
  Map,
  Clock,
  Users,
  AlertTriangle,
  CheckCircle,
  Info,
  X,
} from 'lucide-react-native';
import Colors from '@/constants/colors';

type YourCityEducationProps = {
  onClose?: () => void;
};

type EducationSection = 'overview' | 'rail' | 'bus' | 'safety' | 'tips';

const YourCityEducation: React.FC<YourCityEducationProps> = ({ onClose }) => {
  const [activeSection, setActiveSection] = useState<EducationSection>('overview');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const renderSectionButton = (section: EducationSection, icon: React.ReactNode, title: string) => (
    <TouchableOpacity
      style={[styles.sectionButton, activeSection === section && styles.activeSectionButton]}
      onPress={() => setActiveSection(section)}
    >
      {icon}
      <Text
        style={[
          styles.sectionButtonText,
          activeSection === section && styles.activeSectionButtonText,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderExpandableCard = (title: string, content: React.ReactNode, cardKey: string) => {
    const isExpanded = expandedCard === cardKey;

    return (
      <TouchableOpacity
        style={styles.educationCard}
        onPress={() => setExpandedCard(isExpanded ? null : cardKey)}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.expandIcon}>{isExpanded ? '−' : '+'}</Text>
        </View>
        {isExpanded && <View style={styles.cardContent}>{content}</View>}
      </TouchableOpacity>
    );
  };

  const renderOverviewSection = () => (
    <ScrollView style={styles.sectionContent} showsVerticalScrollIndicator={false}>
      <View style={styles.heroSection}>
        <Train size={64} color={Colors.primary} />
        <Text style={styles.heroTitle}>REPLACE_CITY_NAME Transit Guide</Text>
        <Text style={styles.heroSubtitle}>
          REPLACE_HERO_SUBTITLE
          {/* e.g., "Learn how to navigate London's amazing transport system safely and easily!" */}
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Quick Facts</Text>
      <View style={styles.quickFactsContainer}>
        <View style={styles.factCard}>
          <Clock size={24} color={Colors.primary} />
          <View style={styles.factContent}>
            <Text style={styles.factTitle}>Operating Hours</Text>
            <Text style={styles.factText}>REPLACE_OPERATING_HOURS</Text>
            {/* e.g., "Most lines run from 5 AM to midnight, with some 24-hour services on weekends" */}
          </View>
        </View>

        <View style={styles.factCard}>
          <Users size={24} color={Colors.primary} />
          <View style={styles.factContent}>
            <Text style={styles.factTitle}>Daily Riders</Text>
            <Text style={styles.factText}>REPLACE_DAILY_RIDERS</Text>
            {/* e.g., "Over 5 million people use London's transport every day!" */}
          </View>
        </View>

        <View style={styles.factCard}>
          <Map size={24} color={Colors.primary} />
          <View style={styles.factContent}>
            <Text style={styles.factTitle}>System Size</Text>
            <Text style={styles.factText}>REPLACE_SYSTEM_SIZE</Text>
            {/* e.g., "270 Underground stations across 9 lines covering 250 miles" */}
          </View>
        </View>
      </View>

      <View style={styles.safetyHighlight}>
        <Shield size={32} color="#F57C00" />
        <Text style={styles.safetyTitle}>Stay Safe & Have Fun!</Text>
        <Text style={styles.safetyText}>
          REPLACE_SAFETY_OVERVIEW
          {/* e.g., "London's transport is very safe when you follow the rules and stay with your adults!" */}
        </Text>
      </View>
    </ScrollView>
  );

  const renderRailSection = () => (
    <ScrollView style={styles.sectionContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>REPLACE_RAIL_SYSTEM_NAME</Text>
      {/* e.g., "The Underground" for London, "Metro" for Paris, "Subway" for NYC */}

      {renderExpandableCard(
        'REPLACE_SERVICE_TYPE_CARD_TITLE', // e.g., "District vs Circle Lines", "Local vs Express"
        <View>
          <Text style={styles.explanationText}>
            REPLACE_SERVICE_TYPE_EXPLANATION
            {/* e.g., "Some lines go in a circle around the city, while others go straight across!" */}
          </Text>
          <View style={styles.tipBox}>
            <Lightbulb size={16} color="#F57C00" />
            <Text style={styles.tipText}>
              REPLACE_SERVICE_TYPE_TIP
              {/* e.g., "Look at the map to see which direction your train is going!" */}
            </Text>
          </View>
        </View>,
        'service-types',
      )}

      {renderExpandableCard(
        'REPLACE_DIRECTIONS_CARD_TITLE', // e.g., "Northbound vs Southbound", "Inbound vs Outbound"
        <View>
          <Text style={styles.explanationText}>
            REPLACE_DIRECTIONS_EXPLANATION
            {/* e.g., "Northbound trains go towards the north part of the city, southbound go towards the south!" */}
          </Text>
          <View style={styles.tipBox}>
            <Lightbulb size={16} color="#F57C00" />
            <Text style={styles.tipText}>
              REPLACE_DIRECTIONS_TIP
              {/* e.g., "If you're not sure which way to go, ask a staff member - they're there to help!" */}
            </Text>
          </View>
        </View>,
        'directions',
      )}

      {renderExpandableCard(
        'How to Transfer Between Lines',
        <View>
          <Text style={styles.explanationText}>
            REPLACE_TRANSFER_EXPLANATION
            {/* e.g., "To change from one line to another, follow the signs to the other platform!" */}
          </Text>
          <View style={styles.tipBox}>
            <Lightbulb size={16} color="#F57C00" />
            <Text style={styles.tipText}>
              REPLACE_TRANSFER_TIP
              {/* e.g., "Some stations are very big - give yourself extra time to walk between platforms!" */}
            </Text>
          </View>
        </View>,
        'transfers',
      )}

      {renderExpandableCard(
        'Popular Lines',
        <View>
          {/* Add 2-3 popular lines from your city */}
          <View style={styles.lineCard}>
            <View style={[styles.lineIndicator, { backgroundColor: 'REPLACE_LINE_COLOR_1' }]}>
              <Text style={styles.lineNumber}>REPLACE_LINE_ID_1</Text>
            </View>
            <View style={styles.lineInfo}>
              <Text style={styles.lineName}>REPLACE_LINE_NAME_1</Text>
              <Text style={styles.lineDescription}>REPLACE_LINE_DESCRIPTION_1</Text>
              <Text style={styles.lineFact}>REPLACE_LINE_FUN_FACT_1</Text>
            </View>
          </View>

          <View style={styles.lineCard}>
            <View style={[styles.lineIndicator, { backgroundColor: 'REPLACE_LINE_COLOR_2' }]}>
              <Text style={styles.lineNumber}>REPLACE_LINE_ID_2</Text>
            </View>
            <View style={styles.lineInfo}>
              <Text style={styles.lineName}>REPLACE_LINE_NAME_2</Text>
              <Text style={styles.lineDescription}>REPLACE_LINE_DESCRIPTION_2</Text>
              <Text style={styles.lineFact}>REPLACE_LINE_FUN_FACT_2</Text>
            </View>
          </View>
        </View>,
        'popular-lines',
      )}
    </ScrollView>
  );

  const renderBusSection = () => (
    <ScrollView style={styles.sectionContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>REPLACE_BUS_SYSTEM_NAME</Text>
      {/* e.g., "London Buses", "City Buses", "Metro Bus" */}

      {renderExpandableCard(
        'Types of Buses',
        <View>
          <View style={styles.busTypeCard}>
            <Text style={styles.busTypeName}>REPLACE_BUS_TYPE_1</Text>
            <Text style={styles.busTypeExplanation}>REPLACE_BUS_TYPE_1_EXPLANATION</Text>
          </View>
          <View style={styles.busTypeCard}>
            <Text style={styles.busTypeName}>REPLACE_BUS_TYPE_2</Text>
            <Text style={styles.busTypeExplanation}>REPLACE_BUS_TYPE_2_EXPLANATION</Text>
          </View>
          <View style={styles.busTypeCard}>
            <Text style={styles.busTypeName}>REPLACE_BUS_TYPE_3</Text>
            <Text style={styles.busTypeExplanation}>REPLACE_BUS_TYPE_3_EXPLANATION</Text>
          </View>
        </View>,
        'bus-types',
      )}

      {renderExpandableCard(
        'How to Ride the Bus',
        <View>
          <Text style={styles.explanationText}>
            REPLACE_HOW_TO_RIDE_EXPLANATION
            {/* e.g., "Riding the bus is easy when you know the steps!" */}
          </Text>

          <View style={styles.stepCard}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.stepText}>REPLACE_STEP_1</Text>
          </View>

          <View style={styles.stepCard}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.stepText}>REPLACE_STEP_2</Text>
          </View>

          <View style={styles.stepCard}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.stepText}>REPLACE_STEP_3</Text>
          </View>

          <View style={styles.stepCard}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>4</Text>
            </View>
            <Text style={styles.stepText}>REPLACE_STEP_4</Text>
          </View>
        </View>,
        'how-to-ride',
      )}

      {renderExpandableCard(
        'Cool Bus Features',
        <View>
          <View style={styles.featureCard}>
            <Text style={styles.featureText}>REPLACE_FEATURE_1</Text>
          </View>
          <View style={styles.featureCard}>
            <Text style={styles.featureText}>REPLACE_FEATURE_2</Text>
          </View>
          <View style={styles.featureCard}>
            <Text style={styles.featureText}>REPLACE_FEATURE_3</Text>
          </View>
          <View style={styles.featureCard}>
            <Text style={styles.featureText}>REPLACE_FEATURE_4</Text>
          </View>
        </View>,
        'bus-features',
      )}
    </ScrollView>
  );

  const renderSafetySection = () => (
    <ScrollView style={styles.sectionContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Safety First!</Text>

      <View style={styles.safetyTipCard}>
        <AlertTriangle size={20} color="#FF9800" />
        <Text style={styles.safetyTipText}>REPLACE_SAFETY_TIP_1</Text>
      </View>

      <View style={styles.safetyTipCard}>
        <AlertTriangle size={20} color="#FF9800" />
        <Text style={styles.safetyTipText}>REPLACE_SAFETY_TIP_2</Text>
      </View>

      <View style={styles.safetyTipCard}>
        <AlertTriangle size={20} color="#FF9800" />
        <Text style={styles.safetyTipText}>REPLACE_SAFETY_TIP_3</Text>
      </View>

      <View style={styles.safetyTipCard}>
        <AlertTriangle size={20} color="#FF9800" />
        <Text style={styles.safetyTipText}>REPLACE_SAFETY_TIP_4</Text>
      </View>

      <Text style={styles.accessibilityTitle}>Everyone Can Use Transit!</Text>
      <View style={styles.accessibilityFeature}>
        <Text style={styles.accessibilityText}>REPLACE_ACCESSIBILITY_INFO_1</Text>
      </View>
      <View style={styles.accessibilityFeature}>
        <Text style={styles.accessibilityText}>REPLACE_ACCESSIBILITY_INFO_2</Text>
      </View>
      <View style={styles.accessibilityFeature}>
        <Text style={styles.accessibilityText}>REPLACE_ACCESSIBILITY_INFO_3</Text>
      </View>
    </ScrollView>
  );

  const renderTipsSection = () => (
    <ScrollView style={styles.sectionContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Smart Travel Tips</Text>

      <View style={styles.planningTip}>
        <Clock size={20} color={Colors.primary} />
        <Text style={styles.planningText}>REPLACE_PLANNING_TIP_1</Text>
      </View>

      <View style={styles.planningTip}>
        <Map size={20} color={Colors.primary} />
        <Text style={styles.planningText}>REPLACE_PLANNING_TIP_2</Text>
      </View>

      <View style={styles.planningTip}>
        <Users size={20} color={Colors.primary} />
        <Text style={styles.planningText}>REPLACE_PLANNING_TIP_3</Text>
      </View>

      <View style={styles.planningTip}>
        <Lightbulb size={20} color={Colors.primary} />
        <Text style={styles.planningText}>REPLACE_PLANNING_TIP_4</Text>
      </View>

      <Text style={styles.sectionTitle}>Be Polite!</Text>
      <View style={styles.etiquetteCard}>
        <Text style={styles.etiquetteText}>REPLACE_ETIQUETTE_TIP_1</Text>
      </View>
      <View style={styles.etiquetteCard}>
        <Text style={styles.etiquetteText}>REPLACE_ETIQUETTE_TIP_2</Text>
      </View>
      <View style={styles.etiquetteCard}>
        <Text style={styles.etiquetteText}>REPLACE_ETIQUETTE_TIP_3</Text>
      </View>
      <View style={styles.etiquetteCard}>
        <Text style={styles.etiquetteText}>REPLACE_ETIQUETTE_TIP_4</Text>
      </View>
    </ScrollView>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return renderOverviewSection();
      case 'rail':
        return renderRailSection();
      case 'bus':
        return renderBusSection();
      case 'safety':
        return renderSafetySection();
      case 'tips':
        return renderTipsSection();
      default:
        return renderOverviewSection();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>REPLACE_CITY_NAME Transit Guide</Text>
        {onClose && (
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={20} color="#666666" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.sectionButtons}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {renderSectionButton(
            'overview',
            <Info size={16} color={activeSection === 'overview' ? '#FFFFFF' : Colors.primary} />,
            'Overview',
          )}
          {renderSectionButton(
            'rail',
            <Train size={16} color={activeSection === 'rail' ? '#FFFFFF' : Colors.primary} />,
            'REPLACE_RAIL_TAB_NAME',
          )}
          {renderSectionButton(
            'bus',
            <Bus size={16} color={activeSection === 'bus' ? '#FFFFFF' : Colors.primary} />,
            'REPLACE_BUS_TAB_NAME',
          )}
          {renderSectionButton(
            'safety',
            <Shield size={16} color={activeSection === 'safety' ? '#FFFFFF' : Colors.primary} />,
            'Safety',
          )}
          {renderSectionButton(
            'tips',
            <Lightbulb size={16} color={activeSection === 'tips' ? '#FFFFFF' : Colors.primary} />,
            'Tips',
          )}
        </ScrollView>
      </View>

      {renderContent()}
    </View>
  );
};

// Copy the styles from MTAEducation.tsx and customize colors as needed
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionButtons: {
    paddingVertical: 16,
    paddingLeft: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  sectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  activeSectionButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  sectionButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  activeSectionButtonText: {
    color: '#FFFFFF',
  },
  sectionContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: 16,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: Colors.textLight,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginVertical: 16,
  },
  quickFactsContainer: {
    marginBottom: 24,
  },
  factCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  factContent: {
    marginLeft: 16,
    flex: 1,
  },
  factTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  factText: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
  },
  safetyHighlight: {
    backgroundColor: '#FFF3E0',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  safetyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F57C00',
    marginTop: 12,
  },
  safetyText: {
    fontSize: 14,
    color: '#E65100',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  educationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  expandIcon: {
    fontSize: 20,
    color: Colors.primary,
    fontWeight: '600',
  },
  cardContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  explanationText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 22,
    marginBottom: 12,
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF8E1',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  tipText: {
    fontSize: 13,
    color: '#F57C00',
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  lineCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  lineIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  lineNumber: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  lineInfo: {
    flex: 1,
  },
  lineName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  lineDescription: {
    fontSize: 13,
    color: Colors.textLight,
    marginBottom: 4,
    lineHeight: 18,
  },
  lineFact: {
    fontSize: 12,
    color: Colors.primary,
    fontStyle: 'italic',
  },
  busTypeCard: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  busTypeName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 4,
  },
  busTypeExplanation: {
    fontSize: 13,
    color: Colors.text,
    lineHeight: 18,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  stepText: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
    lineHeight: 20,
  },
  featureCard: {
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  safetyTipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  safetyTipText: {
    fontSize: 13,
    color: '#E65100',
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  etiquetteCard: {
    backgroundColor: '#F1F8E9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  etiquetteText: {
    fontSize: 14,
    color: '#2E7D32',
    lineHeight: 20,
  },
  planningTip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  planningText: {
    fontSize: 14,
    color: Colors.text,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  accessibilityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  accessibilityFeature: {
    backgroundColor: '#E8F5E8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  accessibilityText: {
    fontSize: 14,
    color: '#2E7D32',
    lineHeight: 20,
  },
});

export default YourCityEducation;

/*
 * CUSTOMIZATION CHECKLIST:
 *
 * □ Replace component name: YourCityEducation -> LondonEducation, TokyoEducation, etc.
 * □ Update all "REPLACE_" placeholders with your city's information
 * □ Customize tab names: "REPLACE_RAIL_TAB_NAME" (e.g., "Underground", "Metro", "Subway")
 * □ Update section titles and content for your transit system
 * □ Add your city's specific lines with correct colors and IDs
 * □ Customize safety tips for local conditions
 * □ Update accessibility information for your system
 * □ Adjust colors in styles to match your transit authority's branding
 * □ Add or remove sections based on your city's transit modes (tram, ferry, etc.)
 * □ Test with local transit experts to ensure accuracy
 */
