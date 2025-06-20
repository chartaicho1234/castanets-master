import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { TapResult, GameLevel } from '@/types/game';
import TimingVisualization from './TimingVisualization';

interface GameCompleteModalProps {
  score: number;
  accuracy: number;
  currentLevel: number;
  maxLevels: number;
  results: TapResult[];
  level: GameLevel;
  gameStartTime: number;
  expectedBeatTimes: number[];
  onNextLevel: () => void;
  onRetry: () => void;
}

export default function GameCompleteModal({
  score,
  accuracy,
  currentLevel,
  maxLevels,
  results,
  level,
  gameStartTime,
  expectedBeatTimes,
  onNextLevel,
  onRetry,
}: GameCompleteModalProps) {
  const [showAnalysis, setShowAnalysis] = useState(false);

  const activeTaps = results.filter(r => !r.isRestTap);
  const restTaps = results.filter(r => r.isRestTap);
  
  const perfectTaps = activeTaps.filter(r => r.timing === 'perfect').length;
  const goodTaps = activeTaps.filter(r => r.timing === 'good').length;
  const earlyTaps = activeTaps.filter(r => r.timing === 'early').length;
  const lateTaps = activeTaps.filter(r => r.timing === 'late').length;
  const missedTaps = activeTaps.filter(r => r.timing === 'missed').length;

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>レベルクリア！</Text>
          
          <View style={styles.scoreSection}>
            <Text style={styles.score}>最終スコア: {score}</Text>
            <Text style={styles.accuracy}>精度: {accuracy}%</Text>
          </View>

          <View style={styles.breakdown}>
            <Text style={styles.breakdownTitle}>結果詳細</Text>
            <View style={styles.resultRow}>
              <Text style={[styles.resultLabel, { color: '#00ff88' }]}>パーフェクト:</Text>
              <Text style={styles.resultValue}>{perfectTaps}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={[styles.resultLabel, { color: '#ff8800' }]}>グッド:</Text>
              <Text style={styles.resultValue}>{goodTaps}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={[styles.resultLabel, { color: '#4488ff' }]}>早すぎ:</Text>
              <Text style={styles.resultValue}>{earlyTaps}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={[styles.resultLabel, { color: '#ff4444' }]}>遅すぎ:</Text>
              <Text style={styles.resultValue}>{lateTaps}</Text>
            </View>
            {restTaps.length > 0 && (
              <View style={styles.resultRow}>
                <Text style={[styles.resultLabel, { color: '#888888' }]}>休符中のタップ:</Text>
                <Text style={styles.resultValue}>{restTaps.length}</Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={styles.analysisButton}
            onPress={() => setShowAnalysis(!showAnalysis)}
          >
            <Text style={styles.analysisButtonText}>
              {showAnalysis ? 'タイミング分析を隠す' : 'タイミング分析を表示'}
            </Text>
          </TouchableOpacity>

          <TimingVisualization 
            results={results} 
            visible={showAnalysis} 
            level={level}
            gameStartTime={gameStartTime}
            expectedBeatTimes={expectedBeatTimes}
          />
        </ScrollView>

        {/* ボタンを下部に固定配置 */}
        <View style={styles.fixedButtonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.retryButton]}
            onPress={onRetry}
          >
            <Text style={[styles.buttonText, styles.retryButtonText]}>
              このレベルをやり直し
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.nextButton]}
            onPress={onNextLevel}
          >
            <Text style={styles.buttonText}>
              {currentLevel < maxLevels - 1 ? '次のレベルへ' : '最初からプレイ'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    maxHeight: '90%',
    width: '90%',
    maxWidth: 400,
    borderWidth: 2,
    borderColor: '#00ff88',
    flexDirection: 'column',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00ff88',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  scoreSection: {
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  score: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 10,
  },
  accuracy: {
    fontSize: 20,
    color: '#888',
  },
  breakdown: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  breakdownTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 10,
  },
  resultLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  resultValue: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  analysisButton: {
    backgroundColor: '#333',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  analysisButtonText: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
  fixedButtonContainer: {
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
    backgroundColor: '#1a1a1a',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  button: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  retryButton: {
    backgroundColor: '#333',
    borderWidth: 2,
    borderColor: '#666',
  },
  nextButton: {
    backgroundColor: '#00ff88',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  retryButtonText: {
    color: '#fff',
  },
});