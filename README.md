# RGBA/HEX Color Converter for Panic Nova

Panic NovaエディタでRGBAとHEXカラーコードを相互変換する機能拡張です。

## 機能

- **RGBA → HEX変換**: `rgba(255, 0, 0, 0.5)` → `#ff000080`
- **HEX → RGBA変換**: `#ff0000` → `rgb(255, 0, 0)`
- **自動検出変換**: カラー形式を自動で判定して変換

## 使い方

1. エディタでカラーコードを選択
2. 以下の方法で変換を実行：

### メニューから
Editorメニューから変換コマンドを選択：
- **RGBAをHEXに変換**
- **HEXをRGBAに変換**  
- **カラー形式を自動検出して変換**

### ショートカットキー
- **⌃⌘H**: RGBAをHEXに変換
- **⌃⌘R**: HEXをRGBAに変換
- **⌃⌘C**: カラー形式を自動検出して変換

### コマンドパレット
- **⇧⌘P** でコマンドパレットを開き、上記のコマンド名を検索

## 対応フォーマット

### RGBA形式
- `rgb(255, 0, 0)`
- `rgba(255, 0, 0, 0.5)`
- `rgba( 255 , 0 , 0 , 0.5 )` （スペースに対応）

### HEX形式
- `#ff0000`
- `#f00` （短い形式）
- `#ff000080` （アルファ値付き）
- `#f08` （短いアルファ値付き）

## インストール方法

### 開発モードでのテスト
1. Novaを起動
2. `File > Open` でこのフォルダを開く
3. `Extensions > Activate Project as Extension` を選択
4. 拡張機能が有効化される

### Nova CLIを使用（推奨）
```bash
nova install /path/to/rgba-hex-NovaExtension
```

### 本番インストール
1. 拡張機能を `.novaextension` バンドルとしてエクスポート
2. Extension Libraryからインストール

## 開発

- `extension.json`: 拡張機能のマニフェストファイル
- `main.js`: メインの変換ロジック

## ライセンス

MIT License
