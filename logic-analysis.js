// ロジック矛盾点の調査レポート

/*
=== 発見された矛盾点 ===

1. **extractColorCodes()のHEXパターン問題**
   - 正規表現: /#?[a-f\d]{3}(?:[a-f\d]{3})?(?:[a-f\d]{2})?/gi
   - 問題: 3桁、6桁、8桁のHEXを検出するが、パターンが曖昧
   - 例: "background" という単語から "bac" を3桁HEXとして誤検出
   - 影響: CSS/SCSSテキストで余分なマッチが発生

2. **analyzeColorUsage()のカウント問題**
   - HEX+パーセントをHEXとしてカウント
   - しかし、extractColorCodes()では別々に検出される
   - 結果: カウント数が実際の検出数と一致しない可能性

3. **convertAndReplaceColors()の重複定義**
   - 126行目と290行目に同じ関数が2回定義されている
   - 290行目の定義が有効になる
   - 混乱の原因となる

4. **HEX+パーセントの正規表現の不一致**
   - hexPercentToRgba(): /^#?([a-f\d]{3}|[a-f\d]{6})\s*[-,\s]\s*(\d+)%$/i
   - extractColorCodes(): /(#?[a-f\d]{3}|[a-f\d]{6})\s*[-,\s]\s*(\d+)%/gi
   - analyzeColorUsage(): /^#?[a-f\d]{3,6}\s*[-,\s]\s*\d+%$/i
   - 問題: 微妙に異なるパターンを使用

5. **RGBとRGBAの区別問題**
   - extractColorCodes()はRGBとRGBAを区別しない
   - analyzeColorUsage()も区別しない
   - しかし、smartAutoConvertColors()のto-hex処理では区別が必要
   - 結果: RGBのみのケースで正しくカウントできない

6. **純粋なHEXの変換問題**
   - to-hex方向で純粋なHEXは変換しない（正しい）
   - しかし、変換対象がない場合にnullを返す
   - 結果: 純粋なHEXのみの場合、何も変換されない（期待通り）

7. **extractColorCodes()の位置重複チェックの非効率性**
   - O(n²)の複雑度で位置チェック
   - 大量のカラーコードがある場合にパフォーマンス問題

=== 修正が必要な項目 ===

【高優先度】
1. extractColorCodes()のHEXパターンを修正
   - 単語境界を考慮した正規表現に変更
   - #で始まるもののみを検出するように制限

2. convertAndReplaceColors()の重複定義を削除
   - 126行目の定義を削除

3. HEX+パーセントの正規表現を統一
   - すべての関数で同じパターンを使用

【中優先度】
4. RGBとRGBAの区別
   - analyzeColorUsage()でRGBとRGBAを別々にカウント
   - RGBはHEXとして扱う

5. 位置重複チェックの最適化
   - より効率的なアルゴリズムに変更

【低優先度】
6. エラーハンドリングの改善
   - 変換失敗時のメッセージを改善

=== 推奨される修正 ===

1. HEXパターンを修正:
   /#[a-f\d]{3}(?:[a-f\d]{3})?(?:[a-f\d]{2})?(?![a-f\d])/gi
   - #必須
   - 後続に16進数がないことを確認

2. 正規表現の統一:
   const HEX_PERCENT_PATTERN = /^#?([a-f\d]{3}|[a-f\d]{6})\s*[-,\s]\s*(\d+)%$/i;
   すべての関数で共通の定数を使用

3. RGB/RGBAの区別:
   - rgb(): 透明度なし → HEXとしてカウント
   - rgba(): 透明度あり → RGBAとしてカウント
*/

console.log("ロジック矛盾点の調査完了");
