import { useEffect, useRef, useCallback } from 'react';
import { Platform } from 'react-native';
import { Audio } from 'expo-av';

export function useAudio() {
  const metronomeSound = useRef<Audio.Sound | null>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const audioFailureCount = useRef<number>(0);
  const MAX_AUDIO_FAILURES = 10;

  // オーディオ初期化
  useEffect(() => {
    const initAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: false,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
        
        // Web用のAudioContextを事前初期化
        if (Platform.OS === 'web') {
          audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
      } catch (error) {
        console.log('オーディオ初期化エラー:', error);
      }
    };

    initAudio();

    return () => {
      if (metronomeSound.current) {
        metronomeSound.current.unloadAsync();
      }
      
      if (Platform.OS === 'web' && audioContext.current) {
        try {
          audioContext.current.close();
        } catch (e) {
          console.log('AudioContext close error:', e);
        }
      }
    };
  }, []);

  // メトロノーム音再生
  const playMetronomeBeep = useCallback((isBeat: boolean = true, isStrong: boolean = false) => {
    if (Platform.OS === 'web') {
      try {
        // 既存のAudioContextを再利用
        if (!audioContext.current || audioContext.current.state === 'closed') {
          audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        
        // AudioContextが一時停止状態なら再開
        if (audioContext.current.state === 'suspended') {
          audioContext.current.resume();
        }
        
        const ctx = audioContext.current;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        // 強拍、弱拍、休符で音程を変える
        let frequency = 600;
        if (isStrong) frequency = 1000; // 強拍
        else if (isBeat) frequency = 800; // 弱拍
        else frequency = 400; // 休符

        oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.1);
        
        // 音声再生成功をカウント
        audioFailureCount.current = 0;
      } catch (error) {
        console.log('Web オーディオエラー:', error);
        audioFailureCount.current++;
        
        // 連続エラーが多すぎる場合、AudioContextをリセット
        if (audioFailureCount.current > MAX_AUDIO_FAILURES) {
          try {
            if (audioContext.current) {
              audioContext.current.close();
              audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }
            audioFailureCount.current = 0;
          } catch (e) {
            console.log('AudioContext reset error:', e);
          }
        }
      }
    }
  }, []);

  return { playMetronomeBeep };
}