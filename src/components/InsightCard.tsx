import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Insight, InsightSeverity } from '../services/insightsService';
import { Colors, Typography, Spacing, Radii } from '../styles/theme';

interface Props { insight: Insight; index: number; }

const PALETTE: Record<InsightSeverity, { bg: string; border: string; text: string }> = {
  positive: { bg: `${Colors.income}14`,       border: `${Colors.income}40`,       text: Colors.income },
  warning:  { bg: `${Colors.warning}14`,      border: `${Colors.warning}40`,      text: Colors.warning },
  danger:   { bg: `${Colors.danger}14`,       border: `${Colors.danger}44`,       text: Colors.danger },
  info:     { bg: `${Colors.primaryLight}14`, border: `${Colors.primaryLight}40`, text: Colors.primaryLight },
};

const InsightCard: React.FC<Props> = ({ insight, index }) => {
  const translateY = useRef(new Animated.Value(20)).current;
  const opacity    = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity,    { toValue: 1, duration: 400, delay: index * 80, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 400, delay: index * 80, useNativeDriver: true }),
    ]).start();
  }, []);
  const p = PALETTE[insight.severity];
  return (
    <Animated.View style={[styles.card, { backgroundColor: p.bg, borderColor: p.border, opacity, transform: [{ translateY }] }]}>
      <Text style={styles.icon}>{insight.icon}</Text>
      <View style={styles.body}>
        <Text style={[styles.title, { color: p.text }]}>{insight.title}</Text>
        <Text style={styles.desc}>{insight.description}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm,
    borderRadius: Radii.md, borderWidth: 1, padding: Spacing.md, marginBottom: Spacing.sm },
  icon: { fontSize: 20, lineHeight: 24 },
  body: { flex: 1, gap: 2 },
  title: { fontSize: Typography.fontSizeSM, fontWeight: Typography.fontWeightSemiBold },
  desc:  { color: Colors.textSecondary, fontSize: Typography.fontSizeSM, lineHeight: 18 },
});

export default InsightCard;