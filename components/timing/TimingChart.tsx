import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { TapResult, GameLevel } from '@/types/game';

const { width } = Dimensions.get('window');

interface TimingChartProps {
  results: TapResult[];
  level: GameLevel;
  gameStartTime: number;
  expectedBeatTimes: number[];
}

export default function TimingChart({ results, level, gameStartTime, expectedBeatTimes }: TimingChartProps) {
  // アクティブ拍のタップのみを使用（休符中のタップは除外）
  const activeTaps = results.filter(r => !r.isRestTap);
  
  // 0秒から始まる完全なタイムラインを生成
  const totalBeats = level.segmentsPerSet * (level.activeBeatsPerSegment + level.restBeatsPerSegment);
  const beatPattern: ('active' | 'rest')[] = [];
  const allBeatTimes: number[] = [];
  
  // 全拍の時刻を計算（0秒から開始）
  for (let segment = 0; segment < level.segmentsPerSet; segment++) {
    // アクティブ拍
    for (let i = 0; i < level.activeBeatsPerSegment; i++) {
      beatPattern.push('active');
      const beatIndex = segment * (level.activeBeatsPerSegment + level.restBeatsPerSegment) + i;
      allBeatTimes.push(gameStartTime + beatIndex * level.noteLength);
    }
    // 休符拍
    for (let i = 0; i < level.restBeatsPerSegment; i++) {
      beatPattern.push('rest');
      const beatIndex = segment * (level.activeBeatsPerSegment + level.restBeatsPerSegment) + level.activeBeatsPerSegment + i;
      allBeatTimes.push(gameStartTime + beatIndex * level.noteLength);
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

  // アクティブ拍のインデックスマッピングを作成
  const activeBeatIndices: number[] = [];
  beatPattern.forEach((beatType, beatIndex) => {
    if (beatType === 'active') {
      activeBeatIndices.push(beatIndex);
    }
  });

  console.log('TimingChart Debug:', {
    totalBeats,
    activeBeatIndices: activeBeatIndices.slice(0, 10),
    activeTapsCount: activeTaps.length,
    expectedBeatTimesCount: expectedBeatTimes.length,
    beatPattern: beatPattern.slice(0, 16),
    gameStartTime,
    firstFewExpectedTimes: expectedBeatTimes.slice(0, 5).map(t => Math.round(t - gameStartTime))
  });

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
        
        {/* 全拍の期待タイミング点（横線上） */}
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
              
              {/* 拍番号（5拍ごとに表示） */}
              {(beatIndex + 1) % 5 === 0 && (
                <Text style={[styles.beatNumber, { 
                  left: x - 8,
                  bottom: 5,
                  color: isActive ? '#00ff88' : '#666',
                }]}>
                  {beatIndex + 1}
                </Text>
              )}
            </View>
          );
        })}
        
        {/* セグメントラベル（上部に配置） */}
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
        
        {/* 実際のタップ結果（アクティブ拍のみ） */}
        {activeTaps.map((result, tapIndex) => {
          // タップインデックスがアクティブ拍の範囲内かチェック
          if (tapIndex >= activeBeatIndices.length) {
            console.warn(`タップインデックス ${tapIndex} がアクティブ拍の範囲外です (最大: ${activeBeatIndices.length - 1})`);
            return null;
          }
          
          const beatIndex = activeBeatIndices[tapIndex];
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
              
              {/* 偏差値表示（大きな偏差のみ） */}
              {Math.abs(result.deviation) > 30 && (
                <Text style={[styles.deviationLabel, {
                  left: actualX - 20,
                  top: y + 15,
                  color: getPointColor(result.timing),
                }]}>
                  {result.deviation > 0 ? '+' : ''}{Math.round(result.deviation)}ms
                </Text>
              )}
            </View>
          );
        })}
        
        {/* 時間軸ラベル（秒表示） */}
        {Array.from({ length: Math.ceil(totalBeats / 4) }, (_, index) => {
          const beatIndex = index * 4;
          if (beatIndex >= totalBeats) return null;
          
          const x = getXPosition(beatIndex);
          const timeInSeconds = (beatIndex * level.noteLength) / 1000;
          
          return (
            <Text key={`time-${index}`} style={[styles.timeLabel, {
              left: x - 15,
              top: chartHeight - 15,
            }]}>
              {timeInSeconds.toFixed(1)}s
            </Text>
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
  timeLabel: {
    position: 'absolute',
    fontSize: 9,
    color: '#666',
    textAlign: 'center',
    width: 30,
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