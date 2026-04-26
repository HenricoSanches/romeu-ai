import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import OnboardingScreen from './src/screens/OnboardingScreen';
import ChatScreen from './src/screens/ChatScreen';
import { loadUserProfile } from './src/storage/storage';
import { UserProfile } from './src/types';

export default function App() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    const profile = await loadUserProfile();
    setUserProfile(profile);
    setLoading(false);
  };

  if (loading) return null;

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      {userProfile ? (
        <ChatScreen
          userProfile={userProfile}
          onResetProfile={() => setUserProfile(null)}
        />
      ) : (
        <OnboardingScreen onComplete={(profile) => setUserProfile(profile)} />
      )}
    </SafeAreaProvider>
  );
}
