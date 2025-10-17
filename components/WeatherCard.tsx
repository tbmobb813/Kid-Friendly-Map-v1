import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Colors from '@/constants/colors';
import { Cloud, Sun, CloudRain, Snowflake, Wind } from 'lucide-react-native';
import { WeatherInfo } from '@/types/navigation';

type WeatherCardProps = {
  weather: WeatherInfo;
  units?: 'imperial' | 'metric';
  testId?: string;
};

const WeatherCard: React.FC<WeatherCardProps> = ({ weather, units = 'imperial', testId }) => {
  const getWeatherIcon = () => {
    switch (weather.condition.toLowerCase()) {
      case 'sunny':
        return <Sun size={24} color="#FFD700" />;
      case 'cloudy':
        return <Cloud size={24} color="#87CEEB" />;
      case 'rainy':
        return <CloudRain size={24} color="#4682B4" />;
      case 'snowy':
        return <Snowflake size={24} color="#B0E0E6" />;
      default:
        return <Wind size={24} color={Colors.textLight} />;
    }
  };

  const getBackgroundColor = () => {
    switch (weather.condition.toLowerCase()) {
      case 'sunny':
        return '#FFF8DC';
      case 'cloudy':
        return '#F0F8FF';
      case 'rainy':
        return '#E6F3FF';
      case 'snowy':
        return '#F0F8FF';
      default:
        return Colors.card;
    }
  };

  const unitLabel = units === 'metric' ? '°C' : '°F';

  return (
    <View style={[styles.container, { backgroundColor: getBackgroundColor() }]} testID={testId}>
      <View style={styles.weatherInfo}>
        {getWeatherIcon()}
        <View style={styles.textContainer}>
          <Text style={styles.temperature}>
            {weather.temperature}
            {unitLabel}
          </Text>
          <Text style={styles.condition}>{weather.condition}</Text>
        </View>
      </View>
      <Text style={styles.recommendation}>{weather.recommendation}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    margin: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  weatherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  textContainer: {
    marginLeft: 12,
  },
  temperature: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  condition: {
    fontSize: 14,
    color: Colors.textLight,
    textTransform: 'capitalize',
  },
  recommendation: {
    fontSize: 14,
    color: Colors.text,
    fontStyle: 'italic',
  },
});

export default WeatherCard;
