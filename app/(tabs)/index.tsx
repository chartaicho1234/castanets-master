import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
} from 'react-native-reanimated';

// Hooks
import { useAudio } from '@/hooks/useAudio';
import { useGameLogic } from '@/hooks/useGameLogic';

// Components
import GameHeader from '@/components/GameHeader';
import BeatIndicator from '@/components/BeatIndicator';
import LevelInfo from '@/components/LevelInfo';
import GameStatus from '@/components/GameStatus';
import FeedbackDisplay from '@/components/FeedbackDisplay';
import TapButton from '@/components/TapButton';
import ScoreDisplay from '@/components/ScoreDisplay';
import GameControls from '@/components/GameControls';
import GameCompleteModal from '@/components/GameCompleteModal';
import CalibrationDisplay from '@/components/CalibrationDisplay';

// Constants
import { LEVELS } from '@/constants/gameConfig';

export default function RhythmGame() {
  const [currentLevel, setCurrentLevel] = useState(0);

  // Animation values
  const beatIndicatorScale = useSharedValue(1);
  const beatIndicatorOpacity = useSharedValue(0.3);
  const tapButtonScale = useSharedValue(1);

  const level = LEVELS[currentLevel];
  const { playMetronomeBeep } = useAudio();

  const {
    gameState,
    currentSet,
    currentBeat,
    isResting,
    score,
    totalTaps,
    results,
    lastFeedback,
    countdown,
    calibrationResult,
    calibrationOffset,
    startCalibration,
    startMetronomeOnly,
    startCountdown,
    stopAll,
    resetGame,
    handleTap,
  } = useGameLogic({
    level,
    playMetronomeBeep,
    beatIndicatorScale,
    beatIndicatorOpacity,
    tapButtonScale,
  });

  // Animation styles
  const beatIndicatorAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: beatIndicatorScale.value }],
    opacity: beatIndicatorOpacity.value,
  }));

  const tapButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: tapButtonScale.value }],
  }));

  // Event handlers
  const handleMainButtonPress = () => {
    if (gameState === 'playing' || gameState === 'calibration') {
      handleTap();
    } else if (gameState === 'idle') {
      startCountdown();
    } else {
      stopAll();
    }
  };

  const handleLevelChange = () => {
    setCurrentLevel((prev) => (prev + 1) % LEVELS.length);
  };

  const handleNextLevel = () => {
    if (currentLevel < LEVELS.length - 1) {
      setCurrentLevel(prev => prev + 1);
      resetGame();
    } else {
      setCurrentLevel(0);
      resetGame();
    }
  };

  const handleRetry = () => {
    resetGame();
  };

  // Calculate accuracy for modal
  const accuracy = totalTaps > 0 ? Math.round((score / (totalTaps * 100)) * 100) : 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* 上部セクション - 基本情報とビートインジケーター */}
      <View style={styles.topSection}>
        <GameHeader />
        <BeatIndicator
          gameState={gameState}
          onPress={startMetronomeOnly}
          animatedStyle={beatIndicatorAnimatedStyle}
        />
      </View>

      {/* 中央セクション - メインタップボタン */}
      <View style={styles.centerSection}>
        <FeedbackDisplay feedback={lastFeedback} />
        <TapButton
          gameState={gameState}
          isResting={isResting}
          countdown={countdown}
          levelColor={level.color}
          levelCountdownText={level.countdownText}
          onPress={handleMainButtonPress}
          animatedStyle={tapButtonAnimatedStyle}
        />
      </View>

      {/* 下部セクション - レベル情報、キャリブレーション、ゲーム状態、スコア、コントロール */}
      <View style={styles.bottomSection}>
        <LevelInfo level={level} />
        
        <CalibrationDisplay 
          calibrationResult={calibrationResult}
          calibrationOffset={calibrationOffset}
          onStartCalibration={startCalibration}
          gameState={gameState}
        />
        
        <GameStatus
          gameState={gameState}
          currentSet={currentSet}
          currentBeat={currentBeat}
          isResting={isResting}
          level={level}
        />

        <ScoreDisplay
          score={score}
          totalTaps={totalTaps}
          results={results}
        />

        <GameControls
          gameState={gameState}
          onReset={resetGame}
          onPlayPause={gameState === 'idle' ? startCountdown : stopAll}
          onLevelChange={handleLevelChange}
          onCalibrate={startCalibration}
        />
      </View>

      {/* ゲーム完了モーダル */}
      {gameState === 'complete' && (
        <GameCompleteModal
          score={score}
          accuracy={accuracy}
          currentLevel={currentLevel}
          maxLevels={LEVELS.length}
          results={results}
          level={level}
          onNextLevel={handleNextLevel}
          onRetry={handleRetry}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    paddingHorizontal: 20,
  },
  topSection: {
    // 上部セクションは必要最小限の高さ
    paddingBottom: 10,
  },
  centerSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
    paddingVertical: 20,
  },
  bottomSection: {
    paddingBottom: 20,
    gap: 15,
  },
});