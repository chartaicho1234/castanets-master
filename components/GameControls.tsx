import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Play, Pause, RotateCcw, Settings } from 'lucide-react-native';
import { GameState } from '@/types/game';

interface GameControlsProps {
  gameState: GameState;
  onReset: () => void;
  onPlayPause: () => void;
  onLevelChange: () => void;
  onCalibrate: () => void;
}

export default function GameControls({
  gameState,
  onReset,
  onPlayPause,
  onLevelChange,
  onCalibrate,
}: GameControlsProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={onReset}>
        <RotateCcw size={24} color="#fff" />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.playButton]}
        onPress={onPlayPause}
      >
        {gameState === 'idle' ? (
          <Play size={32} color="#000" />
        ) : (
          <Pause size={32} color="#000" />
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={onLevelChange}
        disabled={gameState !== 'idle'}
      >
        <Text style={styles.levelText}>レベル</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#00ff88',
  },
  levelText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
});