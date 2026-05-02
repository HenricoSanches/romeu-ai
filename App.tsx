import React, { useEffect, useState, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, Animated } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import OnboardingScreen from './src/screens/OnboardingScreen';
import ChatScreen from './src/screens/ChatScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import TabBar, { TabName } from './src/components/TabBar';
import { loadUserProfile } from './src/storage/storage';
import { UserProfile } from './src/types';
import { Colors } from './src/styles/theme';

export default function App() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabName>('chat');
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => { checkOnboarding(); }, []);

  const checkOnboarding = async () => {
    const profile = await loadUserProfile();
    setUserProfile(profile);
    setLoading(false);
  };

  const handleTabChange = (tab: TabName) => {
    if (tab === activeTab) return;
    Animated.timing(fadeAnim, { toValue: 0, duration: 120, useNativeDriver: true }).start(() => {
      setActiveTab(tab);
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    });
  };

  if (loading) return null;

  if (!userProfile) {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" />
        <OnboardingScreen onComplete={(profile) => setUserProfile(profile)} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <View style={styles.container}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {activeTab === 'chat' ? (
            <ChatScreen
              userProfile={userProfile}
              onResetProfile={() => setUserProfile(null)}
              onGoToDashboard={() => handleTabChange('dashboard')}
            />
          ) : (
            <DashboardScreen userProfile={userProfile} />
          )}
        </Animated.View>
        <TabBar activeTab={activeTab} onTabChange={handleTabChange} />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgBase },
  content: { flex: 1 },
});