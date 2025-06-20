import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TapResult } from '@/types/game';

interface TimingAdviceProps {
  results: TapResult[];
}

export default function TimingAdvice({ results }: TimingAdviceProps) {
  const activeTaps = results.filter(r => !r.isRestTap);
  const restTaps = results.filter(r => r.isRestTap);
  const maxDeviation = activeTaps.length > 0 ? Math.max(...activeTaps.map(r => Math.abs(r.deviation))) : 0;

  return (
    <View style={styles.advice}>
      <Text style={styles.adviceTitle}>改善のヒント</Text>
      {activeTaps.filter(r => r.timing === 'early').length > activeTaps.length * 0.3 && (
        <Text style={styles.adviceText}>• 早すぎる傾向があります（緑線の左側に偏り）。少し待ってからタップしてみましょう</Text>
      )}
      {activeTaps.filter(r => r.timing === 'late').length > activeTaps.length * 0.3 && (
        <Text style={styles.adviceText}>• 遅すぎる傾向があります（緑線の右側に偏り）。もう少し早めにタップしてみましょう</Text>
      )}
      {maxDeviation > 100 && (
        <Text style={styles.adviceText}>• タイミングのばらつきが大きいです（横方向の散らばり）。一定のリズムを意識しましょう</Text>
      )}
      {restTaps.length > 0 && (
        <Text style={styles.adviceText}>• 休符中にタップしています（灰色の線）。休符時は手を止めましょう</Text>
      )}
      {activeTaps.filter(r => r.timing === 'perfect' || r.timing === 'good').length > activeTaps.length * 0.8 && (
        <Text style={styles.adviceText}>• 素晴らしい精度です！緑線に近い位置でタップできています</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  advice: {
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 15,
  },
  adviceTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ff8800',
    marginBottom: 8,
  },
  adviceText: {
    fontSize: 12,
    color: '#ccc',
    lineHeight: 18,
    marginBottom: 4,
  },
});