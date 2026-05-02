import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Radii } from '../styles/theme';

export type TabName = 'chat' | 'dashboard';

interface Props { activeTab: TabName; onTabChange: (tab: TabName) => void; }

const TABS = [
  { id: 'chat'      as TabName, label: 'Chat',      icon: '💬' },
  { id: 'dashboard' as TabName, label: 'Dashboard', icon: '📊' },
];

const TabBar: React.FC<Props> = ({ activeTab, onTabChange }) => (
  <SafeAreaView edges={['bottom']} style={styles.safe}>
    <View style={styles.container}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <TouchableOpacity key={tab.id} style={styles.tab} onPress={() => onTabChange(tab.id)} activeOpacity={0.7}>
            {isActive && <View style={styles.indicator} />}
            <Text style={[styles.icon, !isActive && styles.iconMuted]}>{tab.icon}</Text>
            <Text style={[styles.label, isActive && styles.labelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  safe: { backgroundColor: Colors.bgSurface, borderTopWidth: 1, borderTopColor: Colors.border },
  container: { flexDirection: 'row', paddingTop: Spacing.sm, paddingBottom: 2 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: Spacing.xs, gap: 3, position: 'relative' },
  indicator: { position: 'absolute', top: 0, width: 32, height: 3, borderRadius: Radii.full, backgroundColor: Colors.primary },
  icon: { fontSize: 20 },
  iconMuted: { opacity: 0.4 },
  label: { color: Colors.textMuted, fontSize: Typography.fontSizeXS, fontWeight: Typography.fontWeightMedium },
  labelActive: { color: Colors.primary, fontWeight: Typography.fontWeightBold },
});

export default TabBar;