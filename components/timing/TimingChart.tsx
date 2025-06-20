import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { TapResult, GameLevel } from '@/types/game';

const { width } = Dimensions.get('window');

interface TimingChartProps {
  results: TapResult[];
  level: GameLevel;
}

export default function TimingChart({ results, level }: TimingChartProps) {
  const activeTaps = results.filter(r => !r.isRestTap);
  const restTaps = results.filter(r => r.isRestTap);
  
  // 全拍パターンを生成
  const totalBeats = level.segmentsPerSet * (level.activeBeatsPerSegment + level.restBeatsPerSegment);
  const beatPattern: ('active' | 'rest')[] = [];
  
  for (let segment = 0; segment < level.segmentsPerSet; segment++) {
    for (let i = 0; i < level.activeBeatsPerSegment; i++) {
      beatPattern.push('active');
    }
    for (let i = 0; i < level.restBeatsPerSegment; i++) {
      beatPattern.push('rest');
    }
  }

  const chartWidth = Math.max(width - 60, totalBeats * 50);
  const chartHeight = 120;
  
  const maxDeviation = activeTaps.length > 0 ? Math.max(...activeTaps.map(r => Math.abs(r.deviation))) : 100;
  const displayRange = Math.max(maxDeviation, 100);
  
  const getPointColor = (timing: TapResult['timing']) => {
    switch (timing) {
      case 'perfect': return '#00ff88';
      case 'good': return '#ff8800';
      case 'early': return '#4488ff';
      case 'late': return '#ff4444';
      default: return '#666';
    }
  };

  const getXPosition = (beatIndex: number) => {
    return 80 + (beatIndex * (chartWidth - 160) / Math.max(totalBeats - 1, 1));
  };

  const getDeviationOffset = (deviation: number) => {
    const maxOffset = 20;
    return (deviation / displayRange) * maxOffset;
  };

  const getSegmentBreaks = () => {
    const breaks: number[] = [];
    const beatsPerSegment = level.activeBeatsPerSegment + level.restBeatsPerSegment;
    
    for (let i = 1; i < level.segmentsPerSet; i++) {
      breaks.push(i * beatsPerSegment);
    }
    
    return breaks;
  };

  const segmentBreaks = getSegmentBreaks();

  const activeBeatPositions: number[] = [];
  beatPattern.forEach((beatType, beatIndex) => {
    if (beatType === 'active') {
      activeBeatPositions.push(beatIndex);
    }
  });

  // 休符期間の背景を計算
  const getRestPeriods = () => {
    const periods: { start: number, end: number }[] = [];
    let currentStart = -1;
    
    beatPattern.forEach((beatType, beatIndex) => {
      if (beatType === 'rest' && currentStart === -1) {
        currentStart = beatIndex;
      } else if (beatType === 'active' && currentStart !== -1) {
        periods.push({ start: currentStart, end: beatIndex - 1 });
        currentStart = -1;
      }
    });
    
    // 最後が休符で終わる場合
    if (currentStart !== -1) {
      periods.push({ start: currentStart, end: beatPattern.length - 1 });
    }
    
    return periods;
  };

  const restPeriods = getRestPeriods();

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chartScrollContainer}>
      <View style={[styles.chart, { width: chartWidth }]}>
        {/* 基準横線（期待タイミングライン） */}
        <View style={[styles.baselineLine, { top: chartHeight / 2 }]} />
        
        {/* 休符期間の背景 */}
        {restPeriods.map((period, index) => {
          const startX = getXPosition(period.start);
          const endX = getXPosition(period.end);
          
          return (
            <View key={`rest-period-${index}`} style={[styles.restPeriod, {
              left: startX,
              width: endX - startX + 20,
              top: 20,
              bottom: 20,
            }]}>
              <Text style={styles.restLabel}>休符</Text>
            </View>
          );
        })}
        
        {/* 期待タイミングの点（横線上） */}
        {beatPattern.map((beatType, beatIndex) => {
          const x = getXPosition(beatIndex);
          const isActive = beatType === 'active';
          
          return (
            <View key={`expected-${beatIndex}`}>
              {/* 期待タイミングの点 */}
              <View style={[styles.expectedPoint, {
                left: x - 4,
                top: chartHeight / 2 - 4,
                backgroundColor: isActive ? '#00ff88' : '#666',
                borderColor: isActive ? '#00ff88' : '#666',
              }]} />
              
              {/* 拍番号 */}
              <Text style={[styles.beatNumber, { 
                left: x - 8,
                bottom: 5,
                color: isActive ? '#00ff88' : '#666',
              }]}>
                {beatIndex + 1}
              </Text>
            </View>
          );
        })}
        
        {/* セグメントラベル（上部に配置、縦線なし） */}
        {segmentBreaks.map((breakIndex, index) => {
          const x = getXPosition(breakIndex);
          
          return (
            <Text key={`segment-label-${index}`} style={[styles.segmentLabel, {
              left: x - 30,
              top: 5,
            }]}>
              セグメント {index + 2}
            </Text>
          );
        })}
        
        {/* 実際のタップ結果 */}
        {activeTaps.map((result, tapIndex) => {
          if (tapIndex >= activeBeatPositions.length) return null;
          
          const beatIndex = activeBeatPositions[tapIndex];
          const baseX = getXPosition(beatIndex);
          const deviationOffset = getDeviationOffset(result.deviation);
          const actualX = baseX + deviationOffset;
          const y = chartHeight / 2;
          
          return (
            <View key={`tap-${tapIndex}`}>
              {/* 期待位置から実際のタップ位置への横線 */}
              <View style={[styles.connectionLine, {
                left: Math.min(baseX, actualX),
                top: y - 1,
                width: Math.abs(actualX - baseX),
                height: 2,
                backgroundColor: getPointColor(result.timing),
                opacity: 0.6,
              }]} />
              
              {/* 実際のタップポイント */}
              <View style={[styles.tapPoint, {
                left: actualX - 6,
                top: y - 6,
                backgroundColor: getPointColor(result.timing),
                borderColor: getPointColor(result.timing),
              }]} />
              
              {/* 偏差値表示 */}
              <Text style={[styles.deviationLabel, {
                left: actualX - 20,
                top: y + 15,
                color: getPointColor(result.timing),
              }]}>
                {result.deviation > 0 ? '+' : ''}{Math.round(result.deviation)}ms
              </Text>
            </View>
          );
        })}
        
        {/* 休符中のタップ表示 */}
        {restTaps.map((result, restIndex) => {
          const restBeatIndices = beatPattern
            .map((type, index) => type === 'rest' ? index : -1)
            .filter(index => index !== -1);
          
          if (restBeatIndices.length === 0) return null;
          
          const beatIndex = restBeatIndices[restIndex % restBeatIndices.length];
          const x = getXPosition(beatIndex);
          const y = chartHeight / 2;
          
          return (
            <View key={`rest-tap-${restIndex}`}>
              <View style={[styles.tapPoint, {
                left: x - 6,
                top: y - 6,
                backgroundColor: '#ff4444',
                borderColor: '#ff4444',
                borderWidth: 3,
              }]} />
              
              <Text style={[styles.deviationLabel, {
                left: x - 20,
                top: y + 15,
                color: '#ff4444',
              }]}>
                休符中
              </Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  chartScrollContainer: {
    marginBottom: 10,
  },
  chart: {
    height: 120,
    position: 'relative',
    paddingVertical: 30,
  },
  baselineLine: {
    position: 'absolute',
    left: 70,
    right: 70,
    height: 2,
    backgroundColor: '#4488ff',
    opacity: 0.8,
    zIndex: 1,
  },
  restPeriod: {
    position: 'absolute',
    backgroundColor: 'rgba(100, 100, 100, 0.2)',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 0,
  },
  restLabel: {
    fontSize: 10,
    color: '#888',
    fontStyle: 'italic',
  },
  expectedPoint: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#fff',
    zIndex: 2,
  },
  segmentLabel: {
    position: 'absolute',
    fontSize: 10,
    color: '#ff8800',
    fontWeight: 'bold',
  },
  beatNumber: {
    position: 'absolute',
    fontSize: 10,
    textAlign: 'center',
    width: 16,
    fontWeight: 'bold',
  },
  connectionLine: {
    position: 'absolute',
    zIndex: 1,
  },
  tapPoint: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
    zIndex: 4,
  },
  deviationLabel: {
    position: 'absolute',
    fontSize: 9,
    fontWeight: 'bold',
    textAlign: 'center',
    width: 40,
  },
});