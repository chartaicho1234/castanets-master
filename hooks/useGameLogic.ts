import { useState, useRef, useCallback, useEffect } from 'react';
import { runOnJS, withSequence, withSpring } from 'react-native-reanimated';
import { GameState, TapResult, GameLevel, CalibrationResult } from '@/types/game';
import { getAdjustedTolerances, CALIBRATION_TAPS } from '@/constants/gameConfig';

interface UseGameLogicProps {
  level: GameLevel;
  playMetronomeBeep: (isBeat?: boolean, isStrong?: boolean) => void;
  beatIndicatorScale: any;
  beatIndicatorOpacity: any;
  tapButtonScale: any;
}

export function useGameLogic({
  level,
  playMetronomeBeep,
  beatIndicatorScale,
  beatIndicatorOpacity,
  tapButtonScale,
}: UseGameLogicProps) {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [currentSet, setCurrentSet] = useState(0);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [score, setScore] = useState(0);
  const [totalTaps, setTotalTaps] = useState(0);
  const [results, setResults] = useState<TapResult[]>([]);
  const [lastFeedback, setLastFeedback] = useState<string>('');
  const [countdown, setCountdown] = useState(0);
  
  // 高精度タイミング管理
  const [gameStartTime, setGameStartTime] = useState(0);
  const [expectedBeatTimes, setExpectedBeatTimes] = useState<number[]>([]);
  const [currentBeatIndex, setCurrentBeatIndex] = useState(0);
  const [processedBeats, setProcessedBeats] = useState<Set<number>>(new Set());
  
  // キャリブレーション
  const [calibrationOffset, setCalibrationOffset] = useState(0);
  const [calibrationTaps, setCalibrationTaps] = useState<number[]>([]);
  const [calibrationResult, setCalibrationResult] = useState<CalibrationResult | null>(null);

  // Timers
  const metronomeTimer = useRef<NodeJS.Timeout | null>(null);
  const gameTimer = useRef<NodeJS.Timeout | null>(null);
  const countdownTimer = useRef<NodeJS.Timeout | null>(null);

  // 重複タップ防止用
  const lastTapTime = useRef<number>(0);
  const TAP_DEBOUNCE_MS = 30;
  
  // 音が鳴らなくなる問題対策
  const soundFailureCounter = useRef<number>(0);
  const MAX_SOUND_FAILURES = 100;

  // 高精度時刻取得
  const getHighPrecisionTime = useCallback(() => {
    return performance.now();
  }, []);

  // キャリブレーション開始
  const startCalibration = useCallback(() => {
    setGameState('calibration');
    setCalibrationTaps([]);
    setCountdown(CALIBRATION_TAPS);
    
    const calibrationStartTime = getHighPrecisionTime();
    let beatCount = 0;
    
    const calibrationTick = () => {
      if (beatCount >= CALIBRATION_TAPS) {
        setGameState('idle');
        return;
      }
      
      playMetronomeBeep(true, beatCount % 4 === 0);
      
      runOnJS(() => {
        beatIndicatorScale.value = withSequence(
          withSpring(1.4, { duration: 100 }),
          withSpring(1, { duration: 300 })
        );
        beatIndicatorOpacity.value = withSequence(
          withSpring(1, { duration: 100 }),
          withSpring(0.3, { duration: 300 })
        );
      })();
      
      setCountdown(CALIBRATION_TAPS - beatCount);
      beatCount++;
      
      metronomeTimer.current = setTimeout(calibrationTick, level.noteLength);
    };
    
    calibrationTick();
  }, [level.noteLength, playMetronomeBeep, beatIndicatorScale, beatIndicatorOpacity, getHighPrecisionTime]);

  // キャリブレーション用タップ処理
  const handleCalibrationTap = useCallback(() => {
    if (gameState !== 'calibration') return;
    
    const tapTime = getHighPrecisionTime();
    const newTaps = [...calibrationTaps, tapTime];
    setCalibrationTaps(newTaps);
    
    if (newTaps.length >= CALIBRATION_TAPS) {
      const gameStartTime = getHighPrecisionTime() - (CALIBRATION_TAPS - 1) * level.noteLength;
      const offsets = newTaps.map((tapTime, index) => {
        const expectedTime = gameStartTime + index * level.noteLength;
        return tapTime - expectedTime;
      });
      
      const averageOffset = offsets.reduce((sum, offset) => sum + offset, 0) / offsets.length;
      const variance = offsets.reduce((sum, offset) => sum + Math.pow(offset - averageOffset, 2), 0) / offsets.length;
      const standardDeviation = Math.sqrt(variance);
      
      const result: CalibrationResult = {
        averageOffset,
        standardDeviation,
        tapCount: CALIBRATION_TAPS,
      };
      
      setCalibrationOffset(averageOffset);
      setCalibrationResult(result);
      setGameState('idle');
      
      setLastFeedback(`キャリブレーション完了: ${Math.round(averageOffset)}ms`);
      setTimeout(() => setLastFeedback(''), 3000);
    }
  }, [gameState, calibrationTaps, level.noteLength, getHighPrecisionTime]);

  // メトロノーム開始（♪ボタン用）
  const startMetronomeOnly = useCallback(() => {
    if (gameState === 'metronome') {
      stopAll();
      return;
    }

    setGameState('metronome');
    
    const tick = () => {
      playMetronomeBeep(true, true);
      
      runOnJS(() => {
        beatIndicatorScale.value = withSequence(
          withSpring(1.4, { duration: 100 }),
          withSpring(1, { duration: 300 })
        );
        beatIndicatorOpacity.value = withSequence(
          withSpring(1, { duration: 100 }),
          withSpring(0.5, { duration: 300 })
        );
      })();

      metronomeTimer.current = setTimeout(tick, level.noteLength);
    };

    tick();
  }, [gameState, playMetronomeBeep, beatIndicatorScale, beatIndicatorOpacity, level.noteLength]);

  // カウントダウン開始（1小節無音 + 1小節カウントダウン + 1まで数え切る）
  const startCountdown = useCallback(() => {
    setGameState('countdown');
    
    // 1小節分の無音期間 + 1小節分のカウントダウン
    const silentBeats = level.countdownBeats;
    const countdownBeats = level.countdownBeats;
    let totalBeats = silentBeats + countdownBeats;
    let currentBeat = 0;
    
    console.log('カウントダウン開始:', {
      silentBeats,
      countdownBeats,
      totalBeats,
      noteLength: level.noteLength
    });
    
    const countdownTick = () => {
      currentBeat++;
      console.log('カウントダウンティック:', {
        currentBeat,
        totalBeats,
        phase: currentBeat <= silentBeats ? 'silent' : 'countdown'
      });
      
      if (currentBeat <= silentBeats) {
        // 無音期間（1小節目）
        const remainingTotal = totalBeats - currentBeat + 1;
        setCountdown(remainingTotal);
        console.log('無音期間:', { currentBeat, remainingTotal });
      } else if (currentBeat <= totalBeats) {
        // カウントダウン期間（2小節目）
        const countdownBeat = currentBeat - silentBeats;
        const remainingBeats = countdownBeats - countdownBeat + 1;
        
        console.log('カウントダウン期間:', { 
          countdownBeat, 
          remainingBeats,
          isFirstBeat: countdownBeat === 1 
        });
        
        playMetronomeBeep(true, countdownBeat === 1);
        setCountdown(remainingBeats);
        
        // タップボタンのお手本アニメーション
        runOnJS(() => {
          tapButtonScale.value = withSequence(
            withSpring(1.2, { duration: 150 }),
            withSpring(1, { duration: 250 })
          );
        })();
      }
      
      if (currentBeat < totalBeats) {
        countdownTimer.current = setTimeout(countdownTick, level.noteLength);
      } else {
        // カウントダウン完全終了、ゲーム開始
        console.log('カウントダウン完了、ゲーム開始');
        setTimeout(() => {
          startActualGame();
        }, level.noteLength); // 最後の1拍の後にゲーム開始
      }
    };

    // 最初のティックを即座に開始
    countdownTick();
  }, [playMetronomeBeep, tapButtonScale, level.noteLength, level.countdownBeats]);

  // 実際のゲーム開始
  const startActualGame = useCallback(() => {
    setGameState('playing');
    setCurrentSet(0);
    setCurrentBeat(0);
    setIsResting(false);
    setScore(0);
    setTotalTaps(0);
    setResults([]);
    setLastFeedback('');
    setCurrentBeatIndex(0);
    setProcessedBeats(new Set());
    lastTapTime.current = 0;
    soundFailureCounter.current = 0;

    const startTime = getHighPrecisionTime();
    setGameStartTime(startTime);

    // アクティブ拍のみの期待時刻を事前計算
    const expectedTimes: number[] = [];
    let timeOffset = 0;
    
    for (let segment = 0; segment < level.segmentsPerSet; segment++) {
      // アクティブな拍の期待時刻を計算
      for (let beat = 0; beat < level.activeBeatsPerSegment; beat++) {
        expectedTimes.push(startTime + timeOffset);
        timeOffset += level.noteLength;
      }
      // 休符の時間をスキップ
      timeOffset += level.restBeatsPerSegment * level.noteLength;
    }
    
    setExpectedBeatTimes(expectedTimes);

    let segmentCount = 0;
    let beatInSegment = 0;
    let restBeatCount = 0;
    let isInRest = false;
    let activeBeatIndex = 0;

    const nextBeat = () => {
      if (segmentCount >= level.segmentsPerSet) {
        setGameState('complete');
        return;
      }

      if (isInRest) {
        // 休符中
        restBeatCount++;
        setIsResting(true);
        setCurrentSet(segmentCount);
        setCurrentBeat(restBeatCount);
        playMetronomeBeep(false);
        
        soundFailureCounter.current++;
        if (soundFailureCounter.current > MAX_SOUND_FAILURES) {
          stopAll();
          setGameState('complete');
          setLastFeedback('音声エラーが発生しました。もう一度お試しください。');
          return;
        }
        
        if (restBeatCount >= level.restBeatsPerSegment) {
          restBeatCount = 0;
          isInRest = false;
          segmentCount++;
          beatInSegment = 0;
        }
      } else {
        // 演奏中
        setIsResting(false);
        setCurrentSet(segmentCount);
        setCurrentBeat(beatInSegment + 1);
        setCurrentBeatIndex(activeBeatIndex);

        const isStrongBeat = beatInSegment === 0;
        playMetronomeBeep(true, isStrongBeat);
        
        soundFailureCounter.current = 0;

        beatInSegment++;
        activeBeatIndex++;
        
        if (beatInSegment >= level.activeBeatsPerSegment) {
          isInRest = true;
          beatInSegment = 0;
        }
      }

      // ビートインジケーターアニメーション
      runOnJS(() => {
        beatIndicatorScale.value = withSequence(
          withSpring(1.3, { duration: 100 }),
          withSpring(1, { duration: 200 })
        );
        beatIndicatorOpacity.value = withSequence(
          withSpring(1, { duration: 100 }),
          withSpring(0.3, { duration: 200 })
        );
      })();

      gameTimer.current = setTimeout(nextBeat, level.noteLength);
    };

    nextBeat();
  }, [level, playMetronomeBeep, beatIndicatorScale, beatIndicatorOpacity, getHighPrecisionTime]);

  // 全停止
  const stopAll = useCallback(() => {
    setGameState('idle');
    if (metronomeTimer.current) {
      clearTimeout(metronomeTimer.current);
      metronomeTimer.current = null;
    }
    if (gameTimer.current) {
      clearTimeout(gameTimer.current);
      gameTimer.current = null;
    }
    if (countdownTimer.current) {
      clearTimeout(countdownTimer.current);
      countdownTimer.current = null;
    }
  }, []);

  // ゲームリセット
  const resetGame = useCallback(() => {
    stopAll();
    setScore(0);
    setTotalTaps(0);
    setResults([]);
    setLastFeedback('');
    setCountdown(0);
    setCurrentBeatIndex(0);
    setExpectedBeatTimes([]);
    setProcessedBeats(new Set());
    lastTapTime.current = 0;
    soundFailureCounter.current = 0;
  }, [stopAll]);

  // 改善されたタップ処理（onPressInで正確なタイミングを捉える）
  const handleTap = useCallback(() => {
    if (gameState === 'calibration') {
      handleCalibrationTap();
      return;
    }
    
    if (gameState !== 'playing') return;

    const tapTime = getHighPrecisionTime();
    
    // デバウンス処理
    if (tapTime - lastTapTime.current < TAP_DEBOUNCE_MS) {
      return;
    }
    lastTapTime.current = tapTime;
    
    // 休符中のタップ検出
    if (isResting) {
      setLastFeedback('休符中です！');
      setTimeout(() => setLastFeedback(''), 1000);
      
      const newResult: TapResult = { 
        timing: 'missed', 
        deviation: 0,
        timestamp: tapTime,
        targetTime: 0,
        isRestTap: true
      };
      
      setResults(prev => [...prev, newResult]);
      return;
    }

    if (expectedBeatTimes.length === 0) {
      return;
    }
    
    // レベルに応じた動的な判定基準を取得
    const { perfectTolerance, goodTolerance } = getAdjustedTolerances(level.noteLength);
    
    // より精密なタップ判定ロジック
    const searchWindow = Math.max(level.noteLength * 0.8, goodTolerance * 1.5);
    
    let bestMatch = {
      index: -1,
      distance: Infinity,
      targetTime: 0
    };
    
    // 現在時刻周辺の期待時刻を検索（未処理の拍のみ）
    for (let i = 0; i < expectedBeatTimes.length; i++) {
      if (processedBeats.has(i)) {
        continue;
      }
      
      const targetTime = expectedBeatTimes[i];
      const distance = Math.abs(tapTime - targetTime);
      
      if (distance <= searchWindow && distance < bestMatch.distance) {
        bestMatch = {
          index: i,
          distance,
          targetTime
        };
      }
    }
    
    if (bestMatch.index === -1) {
      setLastFeedback('タップ範囲外です');
      setTimeout(() => setLastFeedback(''), 1000);
      return;
    }
    
    // この拍を処理済みとしてマーク
    setProcessedBeats(prev => new Set([...prev, bestMatch.index]));
    
    const targetTime = bestMatch.targetTime;
    const deviation = tapTime - targetTime - calibrationOffset;
    const absDeviation = Math.abs(deviation);

    let timing: TapResult['timing'] = 'missed';
    let points = 0;
    let feedback = '';

    if (absDeviation <= perfectTolerance) {
      timing = 'perfect';
      points = 100;
      feedback = 'パーフェクト！';
    } else if (absDeviation <= goodTolerance) {
      timing = 'good';
      points = 50;
      feedback = 'グッド！';
    } else if (deviation < 0) {
      timing = 'early';
      points = 0;
      feedback = `早すぎ (-${Math.round(absDeviation)}ms)`;
    } else {
      timing = 'late';
      points = 0;
      feedback = `遅すぎ (+${Math.round(absDeviation)}ms)`;
    }

    const newResult: TapResult = { 
      timing, 
      deviation, 
      timestamp: tapTime,
      targetTime,
      isRestTap: false
    };
    
    setResults(prev => [...prev, newResult]);
    setScore(prev => prev + points);
    setTotalTaps(prev => prev + 1);
    setLastFeedback(feedback);

    setTimeout(() => setLastFeedback(''), 1500);

    // タップボタンアニメーション
    tapButtonScale.value = withSequence(
      withSpring(0.85, { duration: 100 }),
      withSpring(1, { duration: 200 })
    );
  }, [gameState, isResting, expectedBeatTimes, calibrationOffset, tapButtonScale, getHighPrecisionTime, handleCalibrationTap, level, processedBeats]);

  return {
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
  };
}