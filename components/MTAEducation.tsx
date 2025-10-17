import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Animated } from 'react-native';
import {
  Train,
  Bus,
  MapPin,
  Clock,
  AlertTriangle,
  Info,
  Award,
  Lightbulb,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { mtaSubwayLines, subwayEducationalContent } from '@/config/transit-data/mta-subway-lines';
import { busEducationalContent } from '@/config/transit-data/mta-bus-routes';

type MTAEducationProps = {
  onClose?: () => void;
};

type EducationSection = 'overview' | 'subway' | 'bus' | 'safety' | 'tips';

const MTAEducation: React.FC<MTAEducationProps> = ({ onClose }) => {
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
      <View style={styles.educationCard}>
        <TouchableOpacity
          style={styles.cardHeader}
          onPress={() => setExpandedCard(isExpanded ? null : cardKey)}
        >
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.expandIcon}>{isExpanded ? '−' : '+'}</Text>
        </TouchableOpacity>
        {isExpanded && <View style={styles.cardContent}>{content}</View>}
      </View>
    );
  };

  const renderOverviewSection = () => (
    <ScrollView style={styles.sectionContent} showsVerticalScrollIndicator={false}>
      <View style={styles.heroSection}>
        <Train size={48} color={Colors.primary} />
        <Text style={styles.heroTitle}>Learn About NYC Transit!</Text>
        <Text style={styles.heroSubtitle}>
          Discover how to safely navigate New York City's amazing subway and bus system
        </Text>
      </View>

      <View style={styles.quickFactsContainer}>
        <Text style={styles.sectionTitle}>Amazing NYC Transit Facts!</Text>

        <View style={styles.factCard}>
          <Award size={24} color="#FFD700" />
          <View style={styles.factContent}>
            <Text style={styles.factTitle}>World's Largest!</Text>
            <Text style={styles.factText}>
              NYC has 472 subway stations - more than any other city!
            </Text>
          </View>
        </View>

        <View style={styles.factCard}>
          <Clock size={24} color="#4CAF50" />
          <View style={styles.factContent}>
            <Text style={styles.factTitle}>Never Sleeps!</Text>
            <Text style={styles.factText}>The subway runs 24 hours a day, 7 days a week!</Text>
          </View>
        </View>

        <View style={styles.factCard}>
          <MapPin size={24} color="#FF9800" />
          <View style={styles.factContent}>
            <Text style={styles.factTitle}>Super Long!</Text>
            <Text style={styles.factText}>
              The longest subway ride takes 2 hours and 45 minutes!
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.safetyHighlight}>
        <AlertTriangle size={32} color="#FFA726" />
        <Text style={styles.safetyTitle}>Safety First!</Text>
        <Text style={styles.safetyText}>
          Always stay with a trusted adult and follow the safety rules to have fun exploring the
          city!
        </Text>
      </View>
    </ScrollView>
  );

  const renderSubwaySection = () => (
    <ScrollView style={styles.sectionContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>All About the Subway 🚇</Text>

      {renderExpandableCard(
        'Express vs Local Trains',
        <View>
          <Text style={styles.explanationText}>
            {subwayEducationalContent.express_vs_local.explanation}
          </Text>
          <View style={styles.tipBox}>
            <Lightbulb size={16} color="#FFA726" />
            <Text style={styles.tipText}>{subwayEducationalContent.express_vs_local.kidTip}</Text>
          </View>
        </View>,
        'express-local',
      )}

      {renderExpandableCard(
        'Uptown vs Downtown',
        <View>
          <Text style={styles.explanationText}>
            {subwayEducationalContent.directions.explanation}
          </Text>
          <View style={styles.tipBox}>
            <Lightbulb size={16} color="#FFA726" />
            <Text style={styles.tipText}>{subwayEducationalContent.directions.kidTip}</Text>
          </View>
        </View>,
        'directions',
      )}

      {renderExpandableCard(
        'How to Transfer Between Trains',
        <View>
          <Text style={styles.explanationText}>
            {subwayEducationalContent.transfers.explanation}
          </Text>
          <View style={styles.tipBox}>
            <Lightbulb size={16} color="#FFA726" />
            <Text style={styles.tipText}>{subwayEducationalContent.transfers.kidTip}</Text>
          </View>
        </View>,
        'transfers',
      )}

      {renderExpandableCard(
        'Popular Subway Lines',
        <View>
          {mtaSubwayLines.slice(0, 3).map((line) => (
            <View key={line.id} style={styles.lineCard}>
              <View style={[styles.lineIndicator, { backgroundColor: line.color }]}>
                <Text style={styles.lineNumber}>{line.name}</Text>
              </View>
              <View style={styles.lineInfo}>
                <Text style={styles.lineName}>{line.kidFriendlyName}</Text>
                <Text style={styles.lineDescription}>{line.description}</Text>
                <Text style={styles.lineFact}>💡 {line.funFacts[0]}</Text>
              </View>
            </View>
          ))}
        </View>,
        'popular-lines',
      )}
    </ScrollView>
  );

  const renderBusSection = () => (
    <ScrollView style={styles.sectionContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>All About MTA Buses 🚌</Text>

      {renderExpandableCard(
        'Types of Buses',
        <View>
          {Object.entries(busEducationalContent.bus_types.explanations).map(
            ([type, explanation]) => (
              <View key={type} style={styles.busTypeCard}>
                <Text style={styles.busTypeName}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
                <Text style={styles.busTypeExplanation}>{explanation}</Text>
              </View>
            ),
          )}
          <View style={styles.tipBox}>
            <Lightbulb size={16} color="#FFA726" />
            <Text style={styles.tipText}>{busEducationalContent.bus_types.kidTip}</Text>
          </View>
        </View>,
        'bus-types',
      )}

      {renderExpandableCard(
        'How to Ride the Bus',
        <View>
          {busEducationalContent.how_to_ride.steps.map((step, index) => (
            <View key={index} style={styles.stepCard}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
          <View style={styles.tipBox}>
            <Lightbulb size={16} color="#FFA726" />
            <Text style={styles.tipText}>{busEducationalContent.how_to_ride.kidTip}</Text>
          </View>
        </View>,
        'how-to-ride',
      )}

      {renderExpandableCard(
        'Cool Bus Features',
        <View>
          {busEducationalContent.bus_features.features.map((feature, index) => (
            <View key={index} style={styles.featureCard}>
              <Text style={styles.featureText}>• {feature}</Text>
            </View>
          ))}
          <View style={styles.tipBox}>
            <Lightbulb size={16} color="#FFA726" />
            <Text style={styles.tipText}>{busEducationalContent.bus_features.kidTip}</Text>
          </View>
        </View>,
        'bus-features',
      )}
    </ScrollView>
  );

  const renderSafetySection = () => (
    <ScrollView style={styles.sectionContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Stay Safe on Transit! 🛡️</Text>

      {renderExpandableCard(
        'Subway Safety Rules',
        <View>
          {/* Use the safetyNote from the first subway line */}
          <View style={styles.safetyTipCard}>
            <AlertTriangle size={16} color="#FF9800" />
            <Text style={styles.safetyTipText}>{mtaSubwayLines[0].safetyNote}</Text>
          </View>
        </View>,
        'subway-safety',
      )}

      {renderExpandableCard(
        'Bus Safety Rules',
        <View>
          {busEducationalContent.how_to_ride.steps.slice(0, 3).map((tip, index) => (
            <View key={index} style={styles.safetyTipCard}>
              <AlertTriangle size={16} color="#FF9800" />
              <Text style={styles.safetyTipText}>{tip}</Text>
            </View>
          ))}
        </View>,
        'bus-safety',
      )}

      {renderExpandableCard(
        'Being Polite on Transit',
        <View>
          {busEducationalContent.bus_etiquette.rules.map((rule, index) => (
            <View key={index} style={styles.etiquetteCard}>
              <Text style={styles.etiquetteText}>😊 {rule}</Text>
            </View>
          ))}
          <View style={styles.tipBox}>
            <Lightbulb size={16} color="#FFA726" />
            <Text style={styles.tipText}>{busEducationalContent.bus_etiquette.kidTip}</Text>
          </View>
        </View>,
        'etiquette',
      )}
    </ScrollView>
  );

  const renderTipsSection = () => (
    <ScrollView style={styles.sectionContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Pro Tips for Young Explorers! 🌟</Text>

      {renderExpandableCard(
        'Payment Methods',
        <View>
          <Text style={styles.explanationText}>{subwayEducationalContent.payment.explanation}</Text>
          <View style={styles.tipBox}>
            <Lightbulb size={16} color="#FFA726" />
            <Text style={styles.tipText}>{subwayEducationalContent.payment.kidTip}</Text>
          </View>
        </View>,
        'payment',
      )}

      {renderExpandableCard(
        'Planning Your Trip',
        <View>
          <View style={styles.planningTip}>
            <MapPin size={20} color="#4CAF50" />
            <Text style={styles.planningText}>Always know your destination station name</Text>
          </View>
          <View style={styles.planningTip}>
            <Clock size={20} color="#4CAF50" />
            <Text style={styles.planningText}>Allow extra time for walking and transfers</Text>
          </View>
          <View style={styles.planningTip}>
            <Info size={20} color="#4CAF50" />
            <Text style={styles.planningText}>Download the MTA app for real-time updates</Text>
          </View>
        </View>,
        'planning',
      )}

      {renderExpandableCard(
        'Accessibility Features',
        <View>
          <Text style={styles.accessibilityTitle}>NYC Transit is for Everyone!</Text>
          <View style={styles.accessibilityFeature}>
            <Text style={styles.accessibilityText}>♿ All buses have wheelchair lifts</Text>
          </View>
          <View style={styles.accessibilityFeature}>
            <Text style={styles.accessibilityText}>🔊 Audio announcements for stops</Text>
          </View>
          <View style={styles.accessibilityFeature}>
            <Text style={styles.accessibilityText}>🚪 Wide doors and priority seating</Text>
          </View>
          <View style={styles.accessibilityFeature}>
            <Text style={styles.accessibilityText}>🐕 Service animals always welcome</Text>
          </View>
        </View>,
        'accessibility',
      )}
    </ScrollView>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return renderOverviewSection();
      case 'subway':
        return renderSubwaySection();
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
        <Text style={styles.headerTitle}>NYC Transit Guide for Kids</Text>
        {onClose && (
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.sectionButtons}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {renderSectionButton(
            'overview',
            <Info size={20} color={activeSection === 'overview' ? '#FFFFFF' : Colors.primary} />,
            'Overview',
          )}
          {renderSectionButton(
            'subway',
            <Train size={20} color={activeSection === 'subway' ? '#FFFFFF' : Colors.primary} />,
            'Subway',
          )}
          {renderSectionButton(
            'bus',
            <Bus size={20} color={activeSection === 'bus' ? '#FFFFFF' : Colors.primary} />,
            'Bus',
          )}
          {renderSectionButton(
            'safety',
            <AlertTriangle
              size={20}
              color={activeSection === 'safety' ? '#FFFFFF' : Colors.primary}
            />,
            'Safety',
          )}
          {renderSectionButton(
            'tips',
            <Lightbulb size={20} color={activeSection === 'tips' ? '#FFFFFF' : Colors.primary} />,
            'Tips',
          )}
        </ScrollView>
      </View>

      {renderContent()}
    </View>
  );
};

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
  closeButtonText: {
    fontSize: 16,
    color: '#666666',
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

export default MTAEducation;
