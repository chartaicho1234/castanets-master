import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { Music } from 'lucide-react-native';
import { GameState } from '@/types/game';

interface BeatIndicatorProps {
  gameState: GameState;
  onPress: () => void;
  animatedStyle: any;
}

export default function BeatIndicator({ gameState, onPress, animatedStyle }: BeatIndicatorProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <Animated.View style={[styles.indicator, animatedStyle]}>
          <Music size={28} color="#000" />
        </Animated.View>
      </TouchableOpacity>
      <Text style={styles.label}>
        {gameState === 'metronome' ? 'タップで停止' : 'メトロノーム練習'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 20,
  },
  indicator: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#00ff88',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#00ff88',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  label: {
    fontSize: 12,
    color: '#888',
    marginTop: 8,
    textAlign: 'center',
  },
});