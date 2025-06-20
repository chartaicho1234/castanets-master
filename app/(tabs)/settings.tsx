import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Settings() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>設定・使い方</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 高精度リズムトレーニング</Text>
          <Text style={styles.infoText}>
            このアプリは、BPM 180の正確なリズムに合わせてタップする能力を鍛えます。
            特に16分音符の高速リズムをマスターすることを目標としています。
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ キャリブレーション機能</Text>
          <Text style={styles.infoText}>
            デバイスやオーディオの遅延を補正するため、ゲーム前にキャリブレーションを実行してください：
          </Text>
          <Text style={styles.stepText}>
            1. 「タイミング補正」セクションの「キャリブレート」ボタンをタップ{'\n'}
            2. メトロノーム音に合わせて8回正確にタップ{'\n'}
            3. 自動的に遅延が計算され、補正値が適用されます
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎵 難易度レベル</Text>
          
          <View style={styles.levelCard}>
            <Text style={[styles.levelName, { color: '#00ff88' }]}>4分音符</Text>
            <Text style={styles.levelDescription}>
              基本的な4分音符（333.33ms間隔）{'\n'}
              リズム感の基礎を身につける
            </Text>
          </View>
          
          <View style={styles.levelCard}>
            <Text style={[styles.levelName, { color: '#ff8800' }]}>8分音符</Text>
            <Text style={styles.levelDescription}>
              8分音符（166.67ms間隔）{'\n'}
              より細かいリズムパターンを習得
            </Text>
          </View>
          
          <View style={styles.levelCard}>
            <Text style={[styles.levelName, { color: '#ff0088' }]}>16分音符</Text>
            <Text style={styles.levelDescription}>
              16分音符（83.33ms間隔）{'\n'}
              超高速リズムの究極チャレンジ
            </Text>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 判定システム</Text>
          <Text style={styles.infoText}>
            • パーフェクト (±25ms以内): 100ポイント{'\n'}
            • グッド (±50ms以内): 50ポイント{'\n'}
            • 早すぎ/遅すぎ: 0ポイント + 偏差表示
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎮 操作方法</Text>
          <Text style={styles.infoText}>
            • ♪ボタン: メトロノーム練習モード{'\n'}
            • 再生ボタン: ゲーム開始（8拍お手本→本番）{'\n'}
            • リセットボタン: ゲームリセット{'\n'}
            • レベルボタン: 難易度変更{'\n'}
            • キャリブレートボタン: タイミング補正
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 分析機能</Text>
          <Text style={styles.infoText}>
            ゲーム完了後、詳細なタイミング分析が表示されます：{'\n'}
            • 時系列でのタップ精度グラフ{'\n'}
            • 2小節ごとのパフォーマンス比較{'\n'}
            • 平均偏差、標準偏差などの統計情報{'\n'}
            • 改善点の可視化
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💡 上達のコツ</Text>
          <Text style={styles.infoText}>
            • まずキャリブレーションを必ず実行{'\n'}
            • 4分音符から始めて段階的にレベルアップ{'\n'}
            • メトロノーム練習で基本リズムを体に覚えさせる{'\n'}
            • 分析結果を見て弱点を把握{'\n'}
            • 一定のリズムを保つことを最優先{'\n'}
            • 疲れたら休憩を取る
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔧 トラブルシューティング</Text>
          <Text style={styles.infoText}>
            • 「遅すぎ」判定が多い場合: キャリブレーションを再実行{'\n'}
            • 音が聞こえない場合: デバイスの音量を確認{'\n'}
            • 動作が重い場合: 他のアプリを終了{'\n'}
            • 判定がおかしい場合: アプリを再起動
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00ff88',
    marginBottom: 15,
  },
  infoText: {
    fontSize: 16,
    color: '#ccc',
    lineHeight: 24,
  },
  stepText: {
    fontSize: 14,
    color: '#aaa',
    lineHeight: 22,
    marginTop: 10,
    paddingLeft: 10,
    borderLeftWidth: 2,
    borderLeftColor: '#333',
  },
  levelCard: {
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#333',
  },
  levelName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  levelDescription: {
    fontSize: 14,
    color: '#888',
    lineHeight: 20,
  },
});