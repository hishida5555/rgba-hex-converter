# Nova拡張機能の作成手順

## 🚀 Nova GUIでの拡張機能作成

### 準備
1. **Novaの設定**
   - Novaを起動
   - `Nova > Settings` (または `⌘,`)
   - `General` タブを選択
   - `Show extension development items in the Extensions Menu` を有効化

2. **開発者アカウント**
   - [extensions.panic.com/users](https://extensions.panic.com/users/) で開発者アカウントを作成
   - Novaにサインイン

### 拡張機能の作成手順
1. **新規機能拡張を作成**
   - メニューから `Extensions > Create New Extension…` を選択
   - 拡張機能のタイプを選択：
     - **Action Extension**: 一般的なコマンドやメニューアイテム（今回のケース）
     - Editor Extension: テキスト編集機能
     - Language Definition: 新しい言語定義
     - その他のタイプ

2. **基本情報の入力**
   - **Name**: 拡張機能の名前
   - **Vendor**: 開発者名
   - **Identifier**: 一意の識別子（例: com.example.rgba-hex-converter）
   - **Description**: 拡張機能の説明
   - **Entitlements**: 必要なAPI権限

3. **テンプレートの生成**
   - Novaが自動的に `.novaextension` バンドルを作成
   - 基本的なファイル構造が生成される

## 🛠️ Nova CLIでの拡張機能作成

### CLIのインストール
```bash
# Nova CLIが利用可能か確認
nova --version

# ヘルプを表示
nova help
```

### 拡張機能コマンド一覧
```bash
# 拡張機能関連のヘルプ
nova help extension

# 利用可能なサブコマンド
nova extension --help
```

### 主なサブコマンド
```bash
# 拡張機能を有効化
nova extension activate /path/to/bundle.novaextension

# 拡張機能のコマンドをテスト実行
nova extension invoke <command-name>

# 開発者アカウントにログイン
nova extension login

# ログアウト
nova extension logout

# 拡張機能を公開
nova extension publish /path/to/bundle.novaextension

# 拡張機能を検証
nova extension validate /path/to/bundle.novaextension

# 現在のユーザー情報を表示
nova extension whoami
```

## 📁 手動での拡張機能作成（今回の方法）

### ファイル構造
```
rgba-hex-NovaExtension/
├── extension.json    # マニフェストファイル
├── main.js          # メインロジック
├── README.md        # ドキュメント
├── test.js          # テスト
└── .gitignore       # Git無視ファイル
```

### 作成手順
1. **フォルダを作成**
2. **extension.jsonを作成** - 拡張機能のメタデータを定義
3. **main.jsを作成** - JavaScriptで機能を実装
4. **テスト** - 開発モードで動作確認

## 🔄 開発サイクル

### 1. 開発モードでのテスト
```bash
# フォルダをNovaで開く
open /path/to/extension-folder

# Nova内で
Extensions > Activate Project as Extension
```

### 2. 変更の反映
- ファイルを保存するだけで自動的に反映される
- 拡張機能を無効化して再度有効化する必要がある場合も

### 3. デバッグ
- `Help > Show Extension Console` でコンソールを表示
- `console.log()` でデバッグ情報を出力

### 4. 検証
```bash
# CLIで検証
nova extension validate /path/to/extension

# Nova内で検証
Extensions > Validate Extension
```

## 📦 配布準備

### 1. メタデータの確認
- extension.jsonに必要な情報がすべて含まれているか
- アイコン、バグ報告リンクなど

### 2. バンドルの作成
```bash
# .novaextension バンドルを作成
# Nova内: Extensions > Create Bundle
```

### 3. 公開
```bash
# CLIで公開
nova extension publish /path/to/bundle.novaextension

# Nova内で公開
Extensions > Submit to Extension Library…
```

## 🎯 今回のRGBA/HEX変換拡張機能の場合

### 選択すべきタイプ
- **Action Extension** - 一般的なコマンドを追加するため

### GUIでの作成手順
1. `Extensions > Create New Extension…`
2. `Action Extension` を選択
3. 基本情報を入力：
   - Name: `RGBA/HEX Color Converter`
   - Identifier: `com.example.rgba-hex-converter`
   - Description: `エディタ内でRGBAとHEXカラーコードを相互変換する機能拡張`

### CLIでの作成手順
```bash
# 新規拡張機能を作成（テンプレートから）
# ※現時点ではCLIでの新規作成機能は限定的

# 既存フォルダを拡張機能として有効化
nova extension activate /path/to/rgba-hex-NovaExtension
```

## 💡 推奨されるワークフロー

1. **GUIでテンプレート作成**: Extensions > Create New Extension…
2. **手動でカスタマイズ**: 生成されたファイルを編集
3. **開発モードでテスト**: Activate Project as Extension
4. **CLIで検証・公開**: nova extension validate/publish

これにより、GUIの利便性とCLIの自動化を組み合わせた効率的な開発が可能です。
