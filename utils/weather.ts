import { Config } from '@/utils/config';

export type WeatherUnits = 'imperial' | 'metric';

export type RawWeatherResponse = {
  current: {
    temperature_2m: number;
    weather_code: number;
    wind_speed_10m?: number;
  };
};

export type NormalizedWeather = {
  condition: string;
  temperature: number;
  recommendation: string;
};

const weatherCodeToCondition: Record<number, string> = {
  0: 'sunny',
  1: 'sunny',
  2: 'cloudy',
  3: 'cloudy',
  45: 'cloudy',
  48: 'cloudy',
  51: 'rainy',
  53: 'rainy',
  55: 'rainy',
  56: 'rainy',
  57: 'rainy',
  61: 'rainy',
  63: 'rainy',
  65: 'rainy',
  66: 'rainy',
  67: 'rainy',
  71: 'snowy',
  73: 'snowy',
  75: 'snowy',
  77: 'snowy',
  80: 'rainy',
  81: 'rainy',
  82: 'rainy',
  85: 'snowy',
  86: 'snowy',
  95: 'rainy',
  96: 'rainy',
  99: 'rainy',
};

function toFahrenheit(celsius: number): number {
  return Math.round((celsius * 9) / 5 + 32);
}

function buildRecommendation(condition: string, tempF: number): string {
  if (condition === 'rainy') return 'Bring a raincoat or umbrella.';
  if (condition === 'snowy') return 'Wear warm layers and watch your step.';
  if (tempF >= 90) return 'Stay hydrated and seek shade when possible.';
  if (tempF <= 32) return "Bundle up, it's quite cold outside.";
  return 'Great time to head out!';
}

export async function fetchWeather(
  lat: number,
  lon: number,
  units: WeatherUnits,
): Promise<NormalizedWeather> {
  const isMetric = units === 'metric';
  const temperature_unit = isMetric ? 'celsius' : 'fahrenheit';
  const wind_speed_unit = isMetric ? 'kmh' : 'mph';

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m&temperature_unit=${temperature_unit}&wind_speed_unit=${wind_speed_unit}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), Config.API_TIMEOUT);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) {
      throw new Error(`Weather HTTP ${res.status}`);
    }
    const data: RawWeatherResponse = await res.json();
    const wmo = data.current?.weather_code ?? 0;
    const condition = weatherCodeToCondition[wmo] ?? 'cloudy';
    const rawTemp = data.current?.temperature_2m ?? 0;
    const tempF = isMetric ? toFahrenheit(rawTemp) : Math.round(rawTemp);

    return {
      condition,
      temperature: tempF,
      recommendation: buildRecommendation(condition, tempF),
    };
  } catch (e) {
    clearTimeout(timeoutId);
    throw e as Error;
  }
}
