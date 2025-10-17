import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import Colors from '@/constants/colors';
import { Lightbulb, X } from 'lucide-react-native';

type FunFactCardProps = {
  fact: string;
  location?: string;
  onDismiss?: () => void;
};

const FunFactCard: React.FC<FunFactCardProps> = ({ fact, location, onDismiss }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Lightbulb size={20} color={Colors.secondary} />
        </View>
        <Text style={styles.title}>
          {location ? `Fun Fact about ${location}` : 'Did You Know?'}
        </Text>
        {onDismiss && (
          <Pressable style={styles.dismissButton} onPress={onDismiss}>
            <X size={16} color={Colors.textLight} />
          </Pressable>
        )}
      </View>

      <Text style={styles.factText}>{fact}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F0FFF4',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.secondary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    marginRight: 8,
  },
  title: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  dismissButton: {
    padding: 4,
  },
  factText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
});

export default FunFactCard;
