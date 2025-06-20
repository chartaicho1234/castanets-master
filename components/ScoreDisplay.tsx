import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TapResult } from '@/types/game';

interface ScoreDisplayProps {
  score: number;
  totalTaps: number;
  results: TapResult[];
}

export default function ScoreDisplay({ score, totalTaps, results }: ScoreDisplayProps) {
  const accuracy = totalTaps > 0 ? Math.round((score / (totalTaps * 100)) * 100) : 0;
  const perfectTaps = results.filter(r => r.timing === 'perfect').length;
  const goodTaps = results.filter(r => r.timing === 'good').length;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>スコア</Text>
      <Text style={styles.value}>{score}</Text>
      <Text style={styles.accuracy}>精度: {accuracy}%</Text>
      
      {totalTaps > 0 && (
        <View style={styles.breakdown}>
          <Text style={styles.resultText}>
            パーフェクト: {perfectTaps} | グッド: {goodTaps} | ミス: {totalTaps - perfectTaps - goodTaps}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    color: '#888',
    marginBottom: 5,
  },
  value: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#00ff88',
    marginBottom: 8,
  },
  accuracy: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 8,
  },
  breakdown: {
    marginTop: 5,
  },
  resultText: {
    fontSize: 12,
    color: '#888',
  },
});