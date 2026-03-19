# RGBA/HEX Color Converter

A Nova extension for converting between RGBA and HEX color codes.

## Features

- **RGBA → HEX**: `rgba(255, 0, 0, 0.5)` → `#ff000080`
- **HEX → RGBA**: `#ff0000` → `rgb(255, 0, 0)`
- **HEX + %**: `#ff0000 50%` → `rgba(255, 0, 0, 0.50)`
- **Smart auto-convert**: Analyzes color formats in the selection and unifies them to the majority format.

## Usage

Select one or more color codes in the editor, then run a command via shortcut or menu. Multiple selections are supported.

| Shortcut | Command |
|---|---|
| `⌃ ⌘ H` | Convert RGBA to HEX |
| `⌃ ⌘ R` | Convert HEX to RGBA |
| `⌃ ⌘ C` | Auto-detect and convert |

Commands are also available from the **Editor** menu or the Command Palette (`⇧ ⌘ P`).

### Clipboard Conversion (Experimental)

Converts color codes stored in the clipboard directly. This feature is **disabled by default** for security reasons, and must be enabled in the extension settings.


| Shortcut | Command |
|---|---|
| `⌃ ⇧ ⌘ H` | Clipboard RGBA → HEX |
| `⌃ ⇧ ⌘ R` | Clipboard HEX → RGBA |
| `⌃ ⇧ ⌘ C` | Clipboard auto-convert |

## Supported Formats

| Format | Examples |
|---|---|
| RGB / RGBA | `rgb(255, 0, 0)`, `rgba(255, 0, 0, 0.5)` |
| HEX (6-digit) | `#ff0000` |
| HEX (3-digit) | `#f00` |
| HEX (8-digit, with alpha) | `#ff000080` |
| HEX (4-digit, with alpha) | `#f08a` |
| HEX + % | `#ff0000 50%`, `#ff0000-75%`, `#f00,25%` |

---

## 日本語

Nova用のRGBA/HEXカラーコード相互変換拡張機能です。

### 機能

- **RGBA → HEX変換**: `rgba(255, 0, 0, 0.5)` → `#ff000080`
- **HEX → RGBA変換**: `#ff0000` → `rgb(255, 0, 0)`
- **HEX+パーセント対応**: `#ff0000 50%` → `rgba(255, 0, 0, 0.50)`
- **スマート自動変換**: 選択範囲内のカラー形式を分析し、多数派の形式に統一します。

### 使い方

エディタ上でカラーコードを選択し、ショートカットまたはメニューからコマンドを実行します。複数選択に対応しています。

| ショートカット | コマンド |
|---|---|
| `⌃ ⌘ H` | RGBAをHEXに変換 |
| `⌃ ⌘ R` | HEXをRGBAに変換 |
| `⌃ ⌘ C` | 自動検出して変換 |

**Editor** メニューまたはコマンドパレット（`⇧ ⌘ P`）からも実行できます。

#### クリップボード変換（テスト機能）

クリップボード内のカラーコードを直接変換します。この機能はセキュリティ上の配慮から**デフォルトで無効**になっています。使用するには拡張機能の設定から有効にしてください。

| ショートカット | コマンド |
|---|---|
| `⌃ ⇧ ⌘ H` | クリップボードのRGBAをHEXに変換 |
| `⌃ ⇧ ⌘ R` | クリップボードのHEXをRGBAに変換 |
| `⌃ ⇧ ⌘ C` | クリップボードのカラーを自動変換 |

---

## License

MIT License © p53*design
