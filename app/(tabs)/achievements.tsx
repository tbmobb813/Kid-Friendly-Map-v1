import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Dimensions, Platform } from 'react-native';
import Colors from '@/constants/colors';
import AchievementBadge from '@/components/AchievementBadge';
import UserStatsCard from '@/components/UserStatsCard';
import { useGamificationStore } from '@/stores/gamificationStore';
import { Trophy, Star, Target, Calendar } from 'lucide-react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function AchievementsScreen() {
  const { achievements, userStats, tripJournal } = useGamificationStore();
  const [selectedTab, setSelectedTab] = useState<'achievements' | 'journal'>('achievements');

  const unlockedAchievements = achievements.filter((a) => a.unlocked);
  const lockedAchievements = achievements.filter((a) => !a.unlocked);

  const renderJournalEntry = ({ item }: { item: (typeof tripJournal)[0] }) => (
    <View style={styles.journalEntry}>
      <View style={styles.journalHeader}>
        <Text style={styles.journalDate}>{new Date(item.date).toLocaleDateString()}</Text>
        <View style={styles.ratingContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={16}
              color={star <= item.rating ? '#FFD700' : Colors.border}
              fill={star <= item.rating ? '#FFD700' : 'transparent'}
            />
          ))}
        </View>
      </View>

      <Text style={styles.journalRoute}>
        {item.from} → {item.to}
      </Text>

      {item.notes && <Text style={styles.journalNotes}>{item.notes}</Text>}

      {item.funFacts.length > 0 && (
        <View style={styles.funFactsContainer}>
          <Text style={styles.funFactsTitle}>Fun Facts Learned:</Text>
          {item.funFacts.map((fact, index) => (
            <Text key={index} style={styles.funFact}>
              • {fact}
            </Text>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      bounces={true}
    >
      <UserStatsCard stats={userStats} />

      <View style={styles.tabContainer}>
        <Pressable
          style={[styles.tab, selectedTab === 'achievements' && styles.activeTab]}
          onPress={() => setSelectedTab('achievements')}
        >
          <Trophy size={20} color={selectedTab === 'achievements' ? '#FFFFFF' : Colors.primary} />
          <Text style={[styles.tabText, selectedTab === 'achievements' && styles.activeTabText]}>
            Achievements
          </Text>
        </Pressable>

        <Pressable
          style={[styles.tab, selectedTab === 'journal' && styles.activeTab]}
          onPress={() => setSelectedTab('journal')}
        >
          <Calendar size={20} color={selectedTab === 'journal' ? '#FFFFFF' : Colors.primary} />
          <Text style={[styles.tabText, selectedTab === 'journal' && styles.activeTabText]}>
            Trip Journal
          </Text>
        </Pressable>
      </View>

      <View style={styles.content}>
        {selectedTab === 'achievements' ? (
          <>
            {unlockedAchievements.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Unlocked Achievements</Text>
                <View style={styles.achievementsGrid}>
                  {unlockedAchievements.map((achievement) => (
                    <AchievementBadge key={achievement.id} achievement={achievement} size="large" />
                  ))}
                </View>
              </>
            )}

            {lockedAchievements.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Coming Soon</Text>
                <View style={styles.achievementsGrid}>
                  {lockedAchievements.map((achievement) => (
                    <AchievementBadge
                      key={achievement.id}
                      achievement={achievement}
                      size="medium"
                    />
                  ))}
                </View>
              </>
            )}
          </>
        ) : (
          <>
            {tripJournal.length > 0 ? (
              <View style={styles.journalContainer}>
                {tripJournal
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((item) => (
                    <View key={item.id}>{renderJournalEntry({ item })}</View>
                  ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Target size={40} color={Colors.textLight} />
                <Text style={styles.emptyText}>
                  Start your first trip to begin your journey journal!
                </Text>
              </View>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  tabContainer: {
    flexDirection: 'row',
    margin: 16,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  activeTab: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 16,
    minHeight: 200,
  },
  journalContainer: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: Platform.select({
      web: screenWidth > 768 ? 'space-around' : 'center',
      default: 'space-around',
    }),
    gap: 16,
    marginBottom: 24,
  },
  journalList: {
    paddingBottom: 16,
  },
  journalEntry: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  journalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  journalDate: {
    fontSize: 14,
    color: Colors.textLight,
    fontWeight: '500',
  },
  ratingContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  journalRoute: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  journalNotes: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  funFactsContainer: {
    backgroundColor: '#F0FFF4',
    borderRadius: 8,
    padding: 12,
  },
  funFactsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.secondary,
    marginBottom: 4,
  },
  funFact: {
    fontSize: 12,
    color: Colors.text,
    marginBottom: 2,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    minHeight: 300,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
  },
});
