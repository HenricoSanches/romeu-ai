import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { CategorySlice } from '../services/insightsService';
import { Colors, Typography, Spacing } from '../styles/theme';
import { formatCurrency } from '../services/financialService';

const SIZE = 140, STROKE = 22;

interface Segment { color: string; startDeg: number; sweepDeg: number; }

const buildSegments = (slices: CategorySlice[]): Segment[] => {
  let cur = -90;
  return slices.map((s) => {
    const sweep = (s.percentage / 100) * 360;
    const seg = { color: s.color, startDeg: cur, sweepDeg: sweep };
    cur += sweep;
    return seg;
  });
};

const HalfArc: React.FC<{ color: string; rotateDeg: number; sweepDeg: number }> = ({ color, rotateDeg, sweepDeg }) => (
  <View style={[styles.segBase, { transform: [{ rotate: `${rotateDeg}deg` }] }]}>
    <View style={[styles.halfPie, { backgroundColor: color, transform: [{ rotate: `${sweepDeg}deg` }] }]} />
  </View>
);

const SegmentArc: React.FC<{ seg: Segment }> = ({ seg: { color, startDeg, sweepDeg } }) => {
  if (sweepDeg <= 180) return <HalfArc color={color} rotateDeg={startDeg} sweepDeg={sweepDeg} />;
  return (
    <>
      <HalfArc color={color} rotateDeg={startDeg}       sweepDeg={180} />
      <HalfArc color={color} rotateDeg={startDeg + 180} sweepDeg={sweepDeg - 180} />
    </>
  );
};

const ChartPie: React.FC<{ slices: CategorySlice[]; totalExpenses: number }> = ({ slices, totalExpenses }) => {
  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, [slices.length]);

  if (slices.length === 0)
    return <View style={styles.empty}><Text style={styles.emptyText}>Sem gastos este mês</Text></View>;

  return (
    <Animated.View style={[styles.container, { opacity: fade }]}>
      <View style={styles.donutWrap}>
        <View style={{ width: SIZE, height: SIZE, position: 'relative' }}>
          {buildSegments(slices).map((seg, i) => <SegmentArc key={i} seg={seg} />)}
          <View style={[styles.hole, {
            width: SIZE - STROKE * 2, height: SIZE - STROKE * 2,
            borderRadius: (SIZE - STROKE * 2) / 2, top: STROKE, left: STROKE,
          }]} />
        </View>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>{formatCurrency(totalExpenses)}</Text>
      </View>
      <View style={styles.legend}>
        {slices.slice(0, 5).map((s) => (
          <View key={s.category} style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: s.color }]} />
            <Text style={styles.legendLabel} numberOfLines={1}>{s.label}</Text>
            <Text style={styles.legendPct}>{s.percentage}%</Text>
          </View>
        ))}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  donutWrap: { alignItems: 'center' },
  segBase: { position: 'absolute', top: 0, left: 0, width: SIZE, height: SIZE,
    borderRadius: SIZE / 2, overflow: 'hidden' },
  halfPie: { position: 'absolute', top: 0, left: '50%', width: '50%', height: '100%',
    transformOrigin: 'left center' },
  hole: { position: 'absolute', backgroundColor: Colors.bgElevated, zIndex: 10 },
  totalLabel: { color: Colors.textMuted, fontSize: Typography.fontSizeXS, marginTop: Spacing.sm, letterSpacing: 0.5 },
  totalValue: { color: Colors.textPrimary, fontSize: Typography.fontSizeSM, fontWeight: Typography.fontWeightBold },
  legend: { flex: 1, gap: 6 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  legendDot: { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
  legendLabel: { color: Colors.textSecondary, fontSize: Typography.fontSizeSM, flex: 1 },
  legendPct: { color: Colors.textMuted, fontSize: Typography.fontSizeSM },
  empty: { height: 100, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: Colors.textMuted, fontSize: Typography.fontSizeSM },
});

export default ChartPie;