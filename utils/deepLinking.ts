import { Linking } from "react-native";
import { router } from "expo-router";

export type DeepLinkParams = {
  screen?: string;
  params?: Record<string, string>;
};

export const handleDeepLink = (url: string) => {
  try {
    const parsedUrl = new URL(url);
    const path = parsedUrl.pathname;
    const searchParams = Object.fromEntries(parsedUrl.searchParams);

    // Handle different deep link patterns
    if (path.startsWith('/route/')) {
      const routeId = path.split('/')[2];
      router.push(`/route/${routeId}`);
    } else if (path === '/search') {
      router.push({
        pathname: '/search',
        params: searchParams,
      });
    } else if (path.startsWith('/place/')) {
      const placeId = path.split('/')[2];
      // Navigate to place details or set as destination
      router.push('/map');
    } else {
      // Default to home
      router.push('/');
    }
  } catch (error) {
    console.error('Error handling deep link:', error);
    router.push('/');
  }
};

export const createShareableLink = (screen: string, params?: Record<string, string>) => {
  const baseUrl = 'https://kidmap.app'; // Replace with your actual domain
  const url = new URL(baseUrl);
  url.pathname = screen;
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }
  
  return url.toString();
};

export const shareRoute = async (routeId: string) => {
  const url = createShareableLink(`/route/${routeId}`);
  try {
    await Linking.openURL(`sms:?body=Check out this route: ${url}`);
  } catch (error) {
    console.error('Error sharing route:', error);
  }
};
