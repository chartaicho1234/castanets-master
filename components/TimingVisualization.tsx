import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TapResult, GameLevel } from '@/types/game';
import TimingChart from './timing/TimingChart';
import TimingStats from './timing/TimingStats';
import SegmentAnalysis from './timing/SegmentAnalysis';
import TimingAdvice from './timing/TimingAdvice';

interface TimingVisualizationProps {
  results: TapResult[];
  visible: boolean;
  level?: GameLevel;
  gameStartTime?: number;
  expectedBeatTimes?: number[];
}

export default function TimingVisualization({ 
  results, 
  visible, 
  level, 
  gameStartTime, 
  expectedBeatTimes 
}: TimingVisualizationProps) {
  if (!visible || results.length === 0) {
    return null;
  }

  if (!level) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>タイミング分析</Text>
        <Text style={styles.noDataText}>レベル情報が不足しています</Text>
      </View>
    );
  }

  const totalBeats = level.segmentsPerSet * (level.activeBeatsPerSegment + level.restBeatsPerSegment);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>タイミング分析（全{totalBeats}拍表示）</Text>
      <Text style={styles.subtitle}>
        青線: 期待タイミング | 点: 期待位置 | 色付き点: 実際のタップ位置 | 灰色背景: 休符拍
      </Text>
      
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#4488ff' }]} />
          <Text style={styles.legendText}>早すぎ（左側）</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#00ff88' }]} />
          <Text style={styles.legendText}>パーフェクト</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#ff8800' }]} />
          <Text style={styles.legendText}>グッド</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#ff4444' }]} />
          <Text style={styles.legendText}>遅すぎ（右側）</Text>
        </View>
      </View>

      <TimingChart 
        results={results} 
        level={level} 
        gameStartTime={gameStartTime}
        expectedBeatTimes={expectedBeatTimes}
      />
      
      {/* 横軸の説明 */}
      <View style={styles.axisExplanation}>
        <Text style={styles.axisText}>← 早すぎ　　　期待タイミング（青線上の点）　　　遅すぎ →</Text>
      </View>
      
      <TimingStats results={results} level={level} />
      <SegmentAnalysis results={results} level={level} />
      <TimingAdvice results={results} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 20,
    margin: 20,
    borderWidth: 2,
    borderColor: '#333',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginBottom: 15,
  },
  noDataText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 5,
  },
  legendText: {
    fontSize: 11,
    color: '#ccc',
  },
  axisExplanation: {
    alignItems: 'center',
    marginBottom: 15,
    paddingVertical: 8,
    backgroundColor: '#0f0f0f',
    borderRadius: 8,
  },
  axisText: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
});