export interface TapResult {
  timing: 'perfect' | 'good' | 'missed' | 'early' | 'late';
  deviation: number;
  timestamp: number; // タップした時刻
  targetTime: number; // 目標時刻（休符中のタップの場合は0）
  isRestTap?: boolean; // 休符中のタップかどうか
}

export interface GameLevel {
  name: string;
  description: string;
  activeBeatsPerSegment: number; // 2小節中のタップ拍数
  restBeatsPerSegment: number; // 2小節中の休符拍数
  segmentsPerSet: number; // セット数（2小節のまとまり）
  countdownBeats: number; // カウントダウン拍数
  countdownText: string; // カウントダウン時の表示テキスト
  noteLength: number;
  color: string;
}

export type GameState = 'idle' | 'metronome' | 'countdown' | 'playing' | 'paused' | 'complete' | 'calibration';

export interface CalibrationResult {
  averageOffset: number;
  standardDeviation: number;
  tapCount: number;
}

// 休符情報
export interface RestPeriod {
  startTime: number;
  endTime: number;
  segmentIndex: number;
}

// 拍の種類
export type BeatType = 'active' | 'rest';

// 小節情報
export interface MeasureInfo {
  measureNumber: number;
  startBeatIndex: number;
  endBeatIndex: number;
  beatPattern: BeatType[];
}