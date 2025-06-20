import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TapResult, GameLevel } from '@/types/game';

interface SegmentAnalysisProps {
  results: TapResult[];
  level: GameLevel;
}

export default function SegmentAnalysis({ results, level }: SegmentAnalysisProps) {
  const activeTaps = results.filter(r => !r.isRestTap);

  return (
    <View style={styles.segmentAnalysis}>
      <Text style={styles.segmentTitle}>セグメント別分析</Text>
      <View style={styles.segmentGrid}>
        {Array.from({ length: level.segmentsPerSet }, (_, segmentIndex) => {
          const startIndex = segmentIndex * level.activeBeatsPerSegment;
          const endIndex = Math.min(startIndex + level.activeBeatsPerSegment, activeTaps.length);
          const segmentTaps = activeTaps.slice(startIndex, endIndex);
          
          const perfectCount = segmentTaps.filter(r => r.timing === 'perfect').length;
          const goodCount = segmentTaps.filter(r => r.timing === 'good').length;
          const missCount = segmentTaps.filter(r => r.timing !== 'perfect' && r.timing !== 'good').length;
          const accuracy = segmentTaps.length > 0 ? Math.round((perfectCount * 100 + goodCount * 50) / (segmentTaps.length * 100) * 100) : 0;
          
          return (
            <View key={`segment-stats-${segmentIndex}`} style={styles.segmentStats}>
              <Text style={styles.segmentStatsTitle}>セグメント {segmentIndex + 1}</Text>
              <Text style={styles.segmentStatsText}>
                拍数: {segmentTaps.length}/{level.activeBeatsPerSegment}
              </Text>
              <Text style={styles.segmentStatsText}>
                精度: <Text style={{color: accuracy > 80 ? '#00ff88' : accuracy > 60 ? '#ff8800' : '#ff4444'}}>{accuracy}%</Text>
              </Text>
              <Text style={styles.segmentStatsText}>
                P: {perfectCount} | G: {goodCount} | M: {missCount}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  segmentAnalysis: {
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 15,
    marginBottom: 15,
  },
  segmentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  segmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  segmentStats: {
    width: '48%',
    backgroundColor: '#0f0f0f',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  segmentStatsTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ff8800',
    marginBottom: 5,
  },
  segmentStatsText: {
    fontSize: 11,
    color: '#ccc',
    marginBottom: 3,
  },
});