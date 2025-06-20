import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface FeedbackDisplayProps {
  feedback: string;
}

export default function FeedbackDisplay({ feedback }: FeedbackDisplayProps) {
  if (!feedback) {
    return <View style={styles.container} />;
  }

  const getFeedbackColor = () => {
    if (feedback.includes('パーフェクト')) return '#00ff88';
    if (feedback.includes('グッド')) return '#ff8800';
    if (feedback.includes('早すぎ')) return '#4488ff';
    if (feedback.includes('遅すぎ')) return '#ff4444';
    if (feedback.includes('キャリブレーション')) return '#4488ff';
    return '#ff4444';
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.text, { color: getFeedbackColor() }]}>
        {feedback}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 30,
    height: 40,
    justifyContent: 'center',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});