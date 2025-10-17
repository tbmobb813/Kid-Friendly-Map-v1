import React from 'react';
import { StyleSheet, Text, View, FlatList, Pressable } from 'react-native';
import Colors from '@/constants/colors';
import { RegionConfig } from '@/types/region';
import { MapPin, Check } from 'lucide-react-native';

type RegionSelectorProps = {
  regions: RegionConfig[];
  selectedRegion: string;
  onSelectRegion: (regionId: string) => void;
};

const RegionSelector: React.FC<RegionSelectorProps> = ({
  regions,
  selectedRegion,
  onSelectRegion,
}) => {
  const renderRegion = ({ item }: { item: RegionConfig }) => (
    <Pressable
      style={[styles.regionItem, selectedRegion === item.id && styles.selectedRegion]}
      onPress={() => onSelectRegion(item.id)}
    >
      <View style={styles.regionInfo}>
        <MapPin size={24} color={Colors.primary} />
        <View style={styles.regionText}>
          <Text style={styles.regionName}>{item.name}</Text>
          <Text style={styles.regionCountry}>{item.country}</Text>
          <Text style={styles.regionDetails}>
            {item.transitSystems.length} transit systems • {item.currency}
          </Text>
        </View>
      </View>
      {selectedRegion === item.id && <Check size={24} color={Colors.success} />}
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Your Region</Text>
      <Text style={styles.subtitle}>
        Select your city to get accurate transit information and local content.
      </Text>

      <FlatList
        data={regions}
        renderItem={renderRegion}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.regionsList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  regionsList: {
    paddingBottom: 16,
  },
  regionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedRegion: {
    borderColor: Colors.primary,
    backgroundColor: '#F0F4FF',
  },
  regionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  regionText: {
    marginLeft: 16,
    flex: 1,
  },
  regionName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  regionCountry: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 2,
  },
  regionDetails: {
    fontSize: 12,
    color: Colors.textLight,
  },
});

export default RegionSelector;
