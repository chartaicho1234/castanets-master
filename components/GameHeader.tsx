import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function GameHeader() {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>カスタネットマスター v2.2</Text>
      <Text style={styles.bpm}>BPM 180 - Single Output版</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  bpm: {
    fontSize: 18,
    color: '#00ff88',
    fontWeight: '600',
  },
});