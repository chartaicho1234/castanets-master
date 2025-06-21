import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { GameState } from '@/types/game';

interface TapButtonProps {
  gameState: GameState;
  isResting: boolean;
  countdown: number;
  levelColor: string;
  levelCountdownText: string;
  onPress: () => void;
  animatedStyle: any;
}

export default function TapButton({
  gameState,
  isResting,
  countdown,
  levelColor,
  levelCountdownText,
  onPress,
  animatedStyle,
}: TapButtonProps) {
  const getButtonText = () => {
    switch (gameState) {
      case 'idle': return 'ゲーム開始';
      case 'metronome': return 'メトロノーム停止';
      case 'countdown': 
        // 4分拍は4、8分拍は8、16分拍は16の準備期間
        const preparationBeats = levelCountdownText === '4ビート！' ? 4 : 
                                levelCountdownText === '8ビート！' ? 8 : 16;
        
        if (countdown > preparationBeats) {
          return `準備中...\n${countdown - preparationBeats}拍後にカウント開始`;
        } else {
          return `カウント: ${countdown}\n${levelCountdownText}`;
        }
      case 'playing': return isResting ? '休符中' : 'タップ！';
      case 'paused': return 'ゲーム再開';
      case 'complete': return 'ゲーム完了';
      case 'calibration': 
        // キャリブレーションの準備期間を考慮
        const calibrationPreparationBeats = 3;
        const totalCalibrationBeats = calibrationPreparationBeats + 8; // 準備3拍 + キャリブレーション8拍
        
        if (countdown > 8) {
          // 準備期間中
          return `キャリブレーション準備中\n${countdown - 8}拍後に音が鳴ります`;
        } else {
          // キャリブレーション期間中
          return `キャリブレーション\n${countdown}拍残り`;
        }
      default: return 'ゲーム開始';
    }
  };

  const getButtonColor = () => {
    switch (gameState) {
      case 'countdown': 
        // 4分拍は4、8分拍は8、16分拍は16の準備期間
        const preparationBeats = levelCountdownText === '4ビート！' ? 4 : 
                                levelCountdownText === '8ビート！' ? 8 : 16;
        
        if (countdown > preparationBeats) {
          return '#666'; // 準備期間は暗いグレー
        } else {
          return '#ffaa00'; // アクティブなカウントダウンは明るいオレンジ
        }
      case 'calibration':
        if (countdown > 8) {
          return '#666'; // 準備期間は暗いグレー
        } else {
          return '#4488ff'; // アクティブなキャリブレーションは青
        }
      case 'playing': return isResting ? '#666' : levelColor;
      case 'complete': return '#00ff88';
      default: return levelColor;
    }
  };

  const getDescription = () => {
    switch (gameState) {
      case 'countdown': 
        // 4分拍は4、8分拍は8、16分拍は16の準備期間
        const preparationBeats = levelCountdownText === '4ビート！' ? 4 : 
                                levelCountdownText === '8ビート！' ? 8 : 16;
        
        if (countdown > preparationBeats) {
          return `${preparationBeats}拍無音の後、カウントダウンが始まります`;
        } else {
          return `${levelCountdownText}のカウントダウン中（1まで数えます）`;
        }
      case 'calibration': 
        if (countdown > 8) {
          return '3拍無音の後、メトロノーム音が鳴り始めます';
        } else {
          return 'メトロノームに合わせて正確にタップしてください';
        }
      default: return null;
    }
  };

  // onPressInを使用してタップの瞬間を正確に捉える
  const handlePressIn = () => {
    if (gameState === 'playing' || gameState === 'calibration') {
      onPress();
    }
  };

  const handlePress = () => {
    if (gameState !== 'playing' && gameState !== 'calibration') {
      onPress();
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        onPress={handlePress}
        onPressIn={handlePressIn}
        activeOpacity={0.8}
        disabled={gameState === 'countdown' && countdown === 0}
      >
        <Animated.View style={[
          styles.button, 
          animatedStyle, 
          { 
            borderColor: getButtonColor(),
            backgroundColor: gameState === 'countdown' || gameState === 'calibration' 
              ? `${getButtonColor()}20` 
              : 'rgba(255, 255, 255, 0.05)',
            // 準備期間中は少し透明度を下げる
            opacity: (() => {
              if (gameState === 'countdown') {
                const preparationBeats = levelCountdownText === '4ビート！' ? 4 : 
                                        levelCountdownText === '8ビート！' ? 8 : 16;
                return countdown > preparationBeats ? 0.7 : 1.0;
              } else if (gameState === 'calibration') {
                return countdown > 8 ? 0.7 : 1.0;
              }
              return 1.0;
            })()
          }
        ]}>
          <Text style={[
            styles.text, 
            { 
              color: getButtonColor(),
              // 準備期間中はテキストも少し暗く
              opacity: (() => {
                if (gameState === 'countdown') {
                  const preparationBeats = levelCountdownText === '4ビート！' ? 4 : 
                                          levelCountdownText === '8ビート！' ? 8 : 16;
                  return countdown > preparationBeats ? 0.8 : 1.0;
                } else if (gameState === 'calibration') {
                  return countdown > 8 ? 0.8 : 1.0;
                }
                return 1.0;
              })()
            }
          ]}>
            {getButtonText()}
          </Text>
        </Animated.View>
      </TouchableOpacity>
      
      {getDescription() && (
        <Text style={[
          styles.description,
          {
            // 準備期間とアクティブ期間で色を変える
            color: (() => {
              if (gameState === 'countdown') {
                const preparationBeats = levelCountdownText === '4ビート！' ? 4 : 
                                        levelCountdownText === '8ビート！' ? 8 : 16;
                return countdown > preparationBeats ? '#666' : '#888';
              } else if (gameState === 'calibration') {
                return countdown > 8 ? '#666' : '#888';
              }
              return '#888';
            })()
          }
        ]}>
          {getDescription()}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  button: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 30,
  },
  description: {
    fontSize: 14,
    marginTop: 15,
    textAlign: 'center',
  },
});