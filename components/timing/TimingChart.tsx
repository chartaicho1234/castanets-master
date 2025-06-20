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

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chartScrollContainer}>
      <View style={[styles.chart, { width: chartWidth }]}>
        {/* 基準横線 */}
        <View style={[styles.baselineLine, { top: chartHeight / 2 }]} />
        
        {/* 全拍の縦線と許容範囲 */}
        {beatPattern.map((beatType, beatIndex) => {
          const x = getXPosition(beatIndex);
          const isActive = beatType === 'active';
          
          return (
            <View key={`beat-${beatIndex}`}>
              {/* 拍の縦線 */}
              <View style={[styles.beatLine, {
                left: x,
                top: 20,
                bottom: 20,
                backgroundColor: isActive ? '#00ff88' : '#666',
                opacity: isActive ? 0.8 : 0.4,
              }]} />
              
              {/* アクティブ拍のみ許容範囲を表示 */}
              {isActive && (
                <>
                  <View style={[styles.toleranceRange, {
                    left: x - (50 / displayRange) * 20,
                    width: (100 / displayRange) * 20,
                    top: chartHeight / 2 - 15,
                    height: 30,
                    backgroundColor: 'rgba(255, 136, 0, 0.1)',
                  }]} />
                  
                  <View style={[styles.toleranceRange, {
                    left: x - (25 / displayRange) * 20,
                    width: (50 / displayRange) * 20,
                    top: chartHeight / 2 - 10,
                    height: 20,
                    backgroundColor: 'rgba(0, 255, 136, 0.2)',
                  }]} />
                </>
              )}
              
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
        
        {/* セグメント区切り線 */}
        {segmentBreaks.map((breakIndex, index) => {
          const x = getXPosition(breakIndex);
          
          return (
            <View key={`segment-${index}`} style={[styles.segmentLine, { 
              left: x,
              top: 10,
              bottom: 10,
            }]}>
              <Text style={styles.segmentLabel}>
                セグメント {index + 2}
              </Text>
            </View>
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
              <View style={[styles.connectionLine, {
                left: Math.min(baseX, actualX),
                top: y - 1,
                width: Math.abs(actualX - baseX),
                height: 2,
                backgroundColor: getPointColor(result.timing),
                opacity: 0.6,
              }]} />
              
              <View style={[styles.tapPoint, {
                left: actualX - 6,
                top: y - 6,
                backgroundColor: getPointColor(result.timing),
                borderColor: getPointColor(result.timing),
              }]} />
              
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
    height: 1,
    backgroundColor: '#444',
    opacity: 0.5,
    zIndex: 1,
  },
  beatLine: {
    position: 'absolute',
    width: 2,
    zIndex: 2,
  },
  toleranceRange: {
    position: 'absolute',
    borderRadius: 2,
    zIndex: 0,
  },
  segmentLine: {
    position: 'absolute',
    width: 3,
    backgroundColor: '#ff8800',
    opacity: 0.7,
    zIndex: 3,
  },
  segmentLabel: {
    position: 'absolute',
    top: -25,
    left: 5,
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