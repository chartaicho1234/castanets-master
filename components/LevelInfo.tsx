import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GameLevel } from '@/types/game';

interface LevelInfoProps {
  level: GameLevel;
}

export default function LevelInfo({ level }: LevelInfoProps) {
  return (
    <View style={styles.container}>
      <Text style={[styles.name, { color: level.color }]}>
        {level.name}
      </Text>
      <Text style={styles.details}>
        {level.description}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 15,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  details: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
});