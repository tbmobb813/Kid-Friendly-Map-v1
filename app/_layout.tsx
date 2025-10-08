import { Stack } from 'expo-router';
import { CategoryProvider } from '@/stores/categoryStore';
import { ParentalProvider } from '@/stores/parentalStore';
import { AuthProvider } from '@/hooks/useAuth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import 'react-native-gesture-handler';

// Enable screens before any navigation
import { enableScreens } from 'react-native-screens';
enableScreens();

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CategoryProvider>
          <ParentalProvider>
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
          </ParentalProvider>
        </CategoryProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
