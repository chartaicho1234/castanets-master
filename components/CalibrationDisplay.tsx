import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Settings } from 'lucide-react-native';
import { CalibrationResult, GameState } from '@/types/game';

interface CalibrationDisplayProps {
  calibrationResult: CalibrationResult | null;
  calibrationOffset: number;
  onStartCalibration: () => void;
  gameState: GameState;
}

export default function CalibrationDisplay({
  calibrationResult,
  calibrationOffset,
  onStartCalibration,
  gameState,
}: CalibrationDisplayProps) {
  const getCalibrationStatus = () => {
    if (!calibrationResult) {
      return { text: 'キャリブレーション未実行', color: '#ff8800' };
    }
    
    const absOffset = Math.abs(calibrationOffset);
    if (absOffset < 10) {
      return { text: '優秀', color: '#00ff88' };
    } else if (absOffset < 25) {
      return { text: '良好', color: '#ff8800' };
    } else {
      return { text: '要調整', color: '#ff4444' };
    }
  };

  const status = getCalibrationStatus();

  // デバッグ情報の表示（開発時のみ）
  const showDebugInfo = true; // 本番では false に設定

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>タイミング補正</Text>
        <TouchableOpacity
          style={[
            styles.calibrateButton,
            gameState === 'calibration' && styles.calibrateButtonActive
          ]}
          onPress={onStartCalibration}
          disabled={gameState !== 'idle'}
        >
          <Settings size={16} color="#fff" />
          <Text style={styles.calibrateText}>
            {gameState === 'calibration' ? 'キャリブレーション中...' : 'キャリブレート'}
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.statusContainer}>
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>補正値:</Text>
          <Text style={[styles.statusValue, { color: status.color }]}>
            {calibrationOffset > 0 ? '+' : ''}{Math.round(calibrationOffset)}ms
          </Text>
        </View>
        
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>状態:</Text>
          <Text style={[styles.statusValue, { color: status.color }]}>
            {status.text}
          </Text>
        </View>
        
        {calibrationResult && (
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>精度:</Text>
            <Text style={styles.statusValue}>
              ±{Math.round(calibrationResult.standardDeviation)}ms
            </Text>
          </View>
        )}
      </View>
      
      {gameState === 'calibration' && (
        <Text style={styles.instruction}>
          {/* カウントダウンに応じて指示を変更 */}
          準備期間の後、メトロノーム音に合わせて8回正確にタップしてください
        </Text>
      )}

      {/* デバッグ情報 */}
      {showDebugInfo && (
        <View style={styles.debugContainer}>
          <Text style={styles.debugTitle}>🔧 デバッグ情報</Text>
          <Text style={styles.debugText}>
            ゲーム状態: {gameState}
          </Text>
          <Text style={styles.debugText}>
            補正値: {calibrationOffset.toFixed(2)}ms
          </Text>
          {calibrationResult && (
            <>
              <Text style={styles.debugText}>
                平均偏差: {calibrationResult.averageOffset.toFixed(2)}ms
              </Text>
              <Text style={styles.debugText}>
                標準偏差: {calibrationResult.standardDeviation.toFixed(2)}ms
              </Text>
              <Text style={styles.debugText}>
                タップ数: {calibrationResult.tapCount}
              </Text>
            </>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  calibrateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 6,
  },
  calibrateButtonActive: {
    backgroundColor: '#4488ff',
  },
  calibrateText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statusItem: {
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  instruction: {
    fontSize: 12,
    color: '#00ff88',
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },
  debugContainer: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#0f0f0f',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
  },
  debugTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ff8800',
    marginBottom: 5,
  },
  debugText: {
    fontSize: 11,
    color: '#ccc',
    marginBottom: 2,
  },
});