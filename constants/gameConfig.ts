import { GameLevel } from '@/types/game';

// ゲーム設定 - BPM 180固定
export const BPM = 180;
export const QUARTER_NOTE_MS = (60 / BPM) * 1000; // 333.33ms
export const EIGHTH_NOTE_MS = QUARTER_NOTE_MS / 2; // 166.67ms
export const SIXTEENTH_NOTE_MS = QUARTER_NOTE_MS / 4; // 83.33ms

// タイミング許容範囲（ミリ秒）- 基本値
export const PERFECT_TOLERANCE = 25; // ±25ms
export const GOOD_TOLERANCE = 50;    // ±50ms

// キャリブレーション設定
export const CALIBRATION_TAPS = 8; // キャリブレーション用のタップ数

// 難易度レベル
export const LEVELS: GameLevel[] = [
  {
    name: '4分音符',
    description: '4拍カウント → 8小節（2小節×4セット）',
    activeBeatsPerSegment: 7, // 2小節中7拍タップ
    restBeatsPerSegment: 1,   // 2小節中1拍休符
    segmentsPerSet: 4,        // 4セット
    countdownBeats: 4,        // 4拍カウント
    countdownText: '4ビート！',
    noteLength: QUARTER_NOTE_MS,
    color: '#00ff88',
  },
  {
    name: '8分音符', 
    description: '8拍カウント → 8小節（2小節×4セット）',
    activeBeatsPerSegment: 13, // 2小節中13拍タップ
    restBeatsPerSegment: 3,    // 2小節中3拍休符
    segmentsPerSet: 4,         // 4セット
    countdownBeats: 8,         // 8拍カウント
    countdownText: '8ビート！',
    noteLength: EIGHTH_NOTE_MS,
    color: '#ff8800',
  },
  {
    name: '16分音符',
    description: '16拍カウント → 8小節（2小節×4セット）',
    activeBeatsPerSegment: 25, // 2小節中25拍タップ
    restBeatsPerSegment: 7,    // 2小節中7拍休符
    segmentsPerSet: 4,         // 4セット
    countdownBeats: 16,        // 16拍カウント
    countdownText: '16ビート！',
    noteLength: SIXTEENTH_NOTE_MS,
    color: '#ff0088',
  },
];

// レベルに応じた判定基準の動的調整
export const getAdjustedTolerances = (noteLength: number) => {
  // 16分音符の場合: 25ms÷4×1.2 = 7.5ms
  if (noteLength === SIXTEENTH_NOTE_MS) {
    return {
      perfectTolerance: (PERFECT_TOLERANCE / 4) * 1.2, // 7.5ms
      goodTolerance: (GOOD_TOLERANCE / 4) * 1.2,       // 15ms
    };
  }
  
  // 8分音符の場合: 25ms÷2×1.1 = 13.75ms
  if (noteLength === EIGHTH_NOTE_MS) {
    return {
      perfectTolerance: (PERFECT_TOLERANCE / 2) * 1.1, // 13.75ms
      goodTolerance: (GOOD_TOLERANCE / 2) * 1.1,       // 27.5ms
    };
  }
  
  // 4分音符はデフォルト: 25ms
  return {
    perfectTolerance: PERFECT_TOLERANCE, // 25ms
    goodTolerance: GOOD_TOLERANCE,       // 50ms
  };
};