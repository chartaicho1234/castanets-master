import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GameState, GameLevel } from '@/types/game';

interface GameStatusProps {
  gameState: GameState;
  currentSet: number;
  currentBeat: number;
  isResting: boolean;
  level: GameLevel;
}

export default function GameStatus({
  gameState,
  currentSet,
  currentBeat,
  isResting,
  level,
}: GameStatusProps) {
  const getCurrentStatusText = () => {
    if (gameState === 'idle') return '待機中';
    if (gameState === 'metronome') return 'メトロノーム練習中';
    if (gameState === 'countdown') return 'お手本表示中';
    if (gameState === 'complete') return 'ゲーム完了';
    if (gameState === 'calibration') return 'キャリブレーション中';
    
    if (isResting) {
      return `セグメント ${currentSet + 1}/${level.segmentsPerSet} - 休憩中 (${currentBeat}/${level.restBeatsPerSegment}拍)`;
    } else {
      return `セグメント ${currentSet + 1}/${level.segmentsPerSet} - 演奏中 (${currentBeat}/${level.activeBeatsPerSegment}拍)`;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {getCurrentStatusText()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  text: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
});