import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TapResult, GameLevel } from '@/types/game';

interface TimingStatsProps {
  results: TapResult[];
  level: GameLevel;
}

export default function TimingStats({ results, level }: TimingStatsProps) {
  const activeTaps = results.filter(r => !r.isRestTap);
  const restTaps = results.filter(r => r.isRestTap);
  const totalBeats = level.segmentsPerSet * (level.activeBeatsPerSegment + level.restBeatsPerSegment);

  return (
    <View style={styles.summary}>
      <Text style={styles.summaryTitle}>統計情報</Text>
      <View style={styles.summaryGrid}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>総拍数:</Text>
          <Text style={styles.summaryValue}>{totalBeats}拍</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>アクティブ拍:</Text>
          <Text style={styles.summaryValue}>{level.activeBeatsPerSegment * level.segmentsPerSet}拍</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>休符拍:</Text>
          <Text style={styles.summaryValue}>{level.restBeatsPerSegment * level.segmentsPerSet}拍</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>タップ数:</Text>
          <Text style={styles.summaryValue}>{activeTaps.length}回</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>平均偏差:</Text>
          <Text style={styles.summaryValue}>
            {activeTaps.length > 0 ? Math.round(activeTaps.reduce((sum, r) => sum + r.deviation, 0) / activeTaps.length) : 0}ms
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>休符中タップ:</Text>
          <Text style={[styles.summaryValue, { 
            color: restTaps.length === 0 ? '#00ff88' : '#ff4444' 
          }]}>
            {restTaps.length}回
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  summary: {
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 15,
    marginBottom: 15,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryRow: {
    width: '48%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 5,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#ccc',
    flex: 1,
  },
  summaryValue: {
    fontSize: 14,
    color: '#00ff88',
    fontWeight: 'bold',
    textAlign: 'right',
  },
});