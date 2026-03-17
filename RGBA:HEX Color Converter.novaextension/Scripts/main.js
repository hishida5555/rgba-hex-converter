// RGBA/HEX カラーコード変換拡張機能
// Panic Nova用

// HEX+パーセント形式をRGBAに変換する関数（#ff0000-50% → rgba(255, 0, 0, 0.5)）
// 対応形式: #ff0000-50%, #ff0000 50%, #ff0000,50%, #ff0000 - 50%, #ff0000 , 50%
function hexPercentToRgba(hexPercentStr) {
    // HEX+パーセント形式の正規表現パターン（-、スペース、カンマ区切りに対応）
    const hexPercentPattern = /^#?([a-f\d]{3}|[a-f\d]{6})\s*[-,\s]\s*(\d+)%$/i;
    const match = hexPercentStr.match(hexPercentPattern);
    
    if (!match) {
        return null;
    }
    
    let hexPart = match[1];
    const percent = parseInt(match[2]) / 100; // パーセントを小数に変換
    
    // パーセント値の範囲チェック
    if (percent < 0 || percent > 1) {
        return null;
    }
    
    // 短い形式を長い形式に展開
    if (hexPart.length === 3) {
        hexPart = hexPart.split('').map(c => c + c).join('');
    }
    
    const r = parseInt(hexPart.substr(0, 2), 16);
    const g = parseInt(hexPart.substr(2, 2), 16);
    const b = parseInt(hexPart.substr(4, 2), 16);
    
    if (percent === 1) {
        return `rgb(${r}, ${g}, ${b})`;
    } else {
        return `rgba(${r}, ${g}, ${b}, ${percent.toFixed(2)})`;
    }
}

// CSS/SCSSプロパティからカラーコードを抽出する関数
function extractColorCodes(text) {
    const foundColors = [];
    const processed = new Set(); // 処理済み位置を記録
    
    // 1. HEX+パーセント形式を最初に検索（最も具体的）
    const hexPercentPattern = /(#?[a-f\d]{3}|[a-f\d]{6})\s*[-,\s]\s*(\d+)%/gi;
    let match;
    while ((match = hexPercentPattern.exec(text)) !== null) {
        const startPos = match.index;
        const endPos = startPos + match[0].length;
        const key = `${startPos}-${endPos}`;
        
        if (!processed.has(key)) {
            processed.add(key);
            foundColors.push({
                text: match[0],
                index: startPos,
                length: match[0].length
            });
        }
    }
    
    // 2. RGBA/RGB形式を検索
    const rgbaPattern = /rgba?\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+(?:\s*,\s*[\d.]+)?\s*\)/gi;
    while ((match = rgbaPattern.exec(text)) !== null) {
        const startPos = match.index;
        const endPos = startPos + match[0].length;
        const key = `${startPos}-${endPos}`;
        
        // 既に処理済みでないかチェック
        let alreadyProcessed = false;
        for (let pos = startPos; pos <= endPos; pos++) {
            for (const processedKey of processed) {
                const [procStart, procEnd] = processedKey.split('-').map(Number);
                if (pos >= procStart && pos <= procEnd) {
                    alreadyProcessed = true;
                    break;
                }
            }
            if (alreadyProcessed) break;
        }
        
        if (!alreadyProcessed) {
            processed.add(key);
            foundColors.push({
                text: match[0],
                index: startPos,
                length: match[0].length
            });
        }
    }
    
    // 3. 単独のHEX形式を検索（最後）
    const hexPattern = /#?[a-f\d]{3}(?:[a-f\d]{3})?(?:[a-f\d]{2})?/gi;
    while ((match = hexPattern.exec(text)) !== null) {
        const startPos = match.index;
        const endPos = startPos + match[0].length;
        const key = `${startPos}-${endPos}`;
        
        // 既に処理済みでないかチェック
        let alreadyProcessed = false;
        for (let pos = startPos; pos <= endPos; pos++) {
            for (const processedKey of processed) {
                const [procStart, procEnd] = processedKey.split('-').map(Number);
                if (pos >= procStart && pos <= procEnd) {
                    alreadyProcessed = true;
                    break;
                }
            }
            if (alreadyProcessed) break;
        }
        
        if (!alreadyProcessed) {
            processed.add(key);
            foundColors.push({
                text: match[0],
                index: startPos,
                length: match[0].length
            });
        }
    }
    
    // インデックス順にソート
    return foundColors.sort((a, b) => a.index - b.index);
}

// RGBAをHEXに変換する関数
function rgbaToHex(rgbaStr) {
    // RGBA形式の正規表現パターン
    const rgbaPattern = /rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)/i;
    const match = rgbaStr.match(rgbaPattern);
    
    if (!match) {
        return null; // RGBA形式でない場合
    }
    
    const r = parseInt(match[1]);
    const g = parseInt(match[2]); 
    const b = parseInt(match[3]);
    const a = match[4] ? parseFloat(match[4]) : 1;
    
    // 値の範囲チェック
    if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255 || a < 0 || a > 1) {
        return null;
    }
    
    // HEX形式に変換
    const toHex = (n) => {
        const hex = n.toString(16).padStart(2, '0');
        return hex;
    };
    
    let hexStr = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    
    // アルファ値が1でない場合は含める
    if (a !== 1) {
        const alphaHex = Math.round(a * 255).toString(16).padStart(2, '0');
        hexStr += alphaHex;
    }
    
    return hexStr;
}

// HEXをRGBAに変換する関数
function hexToRgba(hexStr) {
    // HEX形式の正規表現パターン
    const hexPattern = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i;
    const shortHexPattern = /^#?([a-f\d])([a-f\d])([a-f\d])([a-f\d])?$/i;
    
    let match = hexStr.match(hexPattern);
    let isShortFormat = false;
    
    if (!match) {
        match = hexStr.match(shortHexPattern);
        isShortFormat = true;
    }
    
    if (!match) {
        return null; // HEX形式でない場合
    }
    
    let r, g, b, a;
    
    if (isShortFormat) {
        // 短い形式 (#RGB) を展開
        r = parseInt(match[1] + match[1], 16);
        g = parseInt(match[2] + match[2], 16);
        b = parseInt(match[3] + match[3], 16);
        a = match[4] ? parseInt(match[4] + match[4], 16) / 255 : 1;
    } else {
        // 通常形式 (#RRGGBB)
        r = parseInt(match[1], 16);
        g = parseInt(match[2], 16);
        b = parseInt(match[3], 16);
        a = match[4] ? parseInt(match[4], 16) / 255 : 1;
    }
    
    // RGBA形式で返す
    if (a === 1) {
        return `rgb(${r}, ${g}, ${b})`;
    } else {
        return `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})`;
    }
}

// カラー形式を自動検出して変換する関数（使用量が多い形式に統一）
function autoConvertColor(colorStr) {
    const trimmed = colorStr.trim();
    
    if (/^#?[a-f\d]{3,6}\s*[-,\s]\s*\d+%$/i.test(trimmed)) {
        return hexPercentToRgba(trimmed);
    }
    
    if (/rgba?\s*\(/i.test(trimmed)) {
        return rgbaToHex(trimmed);
    }
    
    if (/^#?[a-f\d]{3,8}$/i.test(trimmed)) {
        return hexToRgba(trimmed);
    }
    
    return null; // どちらの形式でもない場合
}

// 複数カラーコードの使用量を分析して、最適な変換方向を決定
function analyzeColorUsage(colorCodes) {
    let hexCount = 0;
    let rgbaCount = 0;
    let hexPercentCount = 0;
    
    colorCodes.forEach(color => {
        if (/^#?[a-f\d]{3,6}\s*[-,\s]\s*\d+%$/i.test(color.text)) {
            hexPercentCount++;
        } else if (/rgba?\s*\(/i.test(color.text)) {
            rgbaCount++;
        } else if (/^#?[a-f\d]{3,8}$/i.test(color.text)) {
            hexCount++;
        }
    });
    
    // HEX+パーセント形式はHEXとしてカウント
    const totalHex = hexCount + hexPercentCount;
    const totalRgba = rgbaCount;
    
    // Novaコンソールに分析結果を表示（デバッグ用）
    console.log(`カラー形式分析: HEX=${totalHex}, RGBA=${totalRgba}, HEX+パーセント=${hexPercentCount}`);
    
    // 使用量が多い形式を返す
    if (totalHex > totalRgba) {
        return 'to-rgba'; // HEXが多い → RGBAに統一
    } else if (totalRgba > totalHex) {
        return 'to-hex';   // RGBAが多い → HEXに統一
    } else {
        return 'to-rgba'; // 同数の場合はRGBAに統一（一般的に使いやすい）
    }
}

// カラーコードを変換して置換する関数（複数対応、使用量ベースの自動判定）
function convertAndReplaceColors(text, converter) {
    const colorCodes = extractColorCodes(text);
    
    if (colorCodes.length === 0) {
        return null;
    }
    
    let result = text;
    
    // 前から処理し、位置を再計算
    let offset = 0;
    for (let i = 0; i < colorCodes.length; i++) {
        const color = colorCodes[i];
        const actualIndex = color.index + offset;
        const actualText = result.substring(actualIndex, actualIndex + color.length);
        
        // 実際のテキストがまだ変換されていないことを確認
        if (actualText === color.text) {
            const convertedColor = converter(color.text);
            
            if (convertedColor && convertedColor !== color.text) {
                const before = result.substring(0, actualIndex);
                const after = result.substring(actualIndex + color.length);
                result = before + convertedColor + after;
                offset += convertedColor.length - color.length;
            }
        }
    }
    
    return result === text ? null : result;
}

// スマート自動変換関数（使用量が多い形式に統一）
function smartAutoConvertColors(text) {
    const colorCodes = extractColorCodes(text);
    
    if (colorCodes.length === 0) {
        return null;
    }
    
    // 使用量を分析して変換方向を決定
    const conversionDirection = analyzeColorUsage(colorCodes);
    
    let converter;
    if (conversionDirection === 'to-rgba') {
        converter = (colorStr) => {
            if (/^#?[a-f\d]{3,6}\s*[-,\s]\s*\d+%$/i.test(colorStr)) {
                return hexPercentToRgba(colorStr);
            } else if (/^#?[a-f\d]{3,8}$/i.test(colorStr)) {
                return hexToRgba(colorStr);
            }
            return null; // RGBAは変換しない
        };
    } else {
        // HEXへの一括置換の場合：透明度付きRGBAとHEX+パーセントを変換
        converter = (colorStr) => {
            if (/rgba?\s*\(/i.test(colorStr)) {
                // RGB（透明度なし）は変換しない
                if (/rgb\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/i.test(colorStr)) {
                    return null;
                }
                // RGBA（透明度あり）のみを変換
                return rgbaToHex(colorStr);
            } else if (/^#?[a-f\d]{3,6}\s*[-,\s]\s*\d+%$/i.test(colorStr)) {
                // HEX+パーセント形式もRGBAに変換してからHEXに変換
                const rgbaResult = hexPercentToRgba(colorStr);
                if (rgbaResult) {
                    return rgbaToHex(rgbaResult);
                }
            }
            return null; // 純粋なHEXは変換しない
        };
    }
    
    return convertAndReplaceColors(text, converter);
}

// 選択テキストを変換するヘルパー関数（複数カラーコード対応）
function convertSelection(editor, converter) {
    const selectedRanges = editor.selectedRanges;
    if (selectedRanges.length === 0) {
        nova.workspace.showErrorMessage("テキストが選択されていません");
        return;
    }
    
    editor.edit((edit) => {
        // 選択範囲を逆順に処理して位置がずれないようにする
        for (const range of selectedRanges.reverse()) {
            const selectedText = editor.getTextInRange(range);
            
            // 自動変換コマンドの場合はスマート変換を使用
            let convertedText;
            if (converter === autoConvertColor) {
                convertedText = smartAutoConvertColors(selectedText);
            } else {
                // スマート抽出機能を使用してカラーコードを変換
                convertedText = convertAndReplaceColors(selectedText, converter);
            }
            
            if (convertedText) {
                edit.replace(range, convertedText);
            } else {
                // 従来の方法でフォールバック
                const fallbackConverted = converter(selectedText);
                if (fallbackConverted) {
                    edit.replace(range, fallbackConverted);
                } else {
                    nova.workspace.showWarningMessage(`選択範囲内に有効なカラーコードが見つかりませんでした`);
                }
            }
        }
    });
}

// クリップボードからテキストを取得
async function getClipboardText() {
    try {
        const clipboardText = await nova.clipboard.readText();
        return clipboardText;
    } catch (error) {
        console.error("クリップボードの読み取りに失敗しました:", error);
        return null;
    }
}

// クリップボードにテキストを設定
async function setClipboardText(text) {
    try {
        await nova.clipboard.writeText(text);
        return true;
    } catch (error) {
        console.error("クリップボードの書き込みに失敗しました:", error);
        return false;
    }
}

// クリップボード内のカラーコードを変換する関数
async function convertClipboardColor(conversionType) {
    const clipboardText = await getClipboardText();
    
    if (!clipboardText) {
        nova.workspace.showErrorMessage("クリップボードが空です");
        return;
    }
    
    let convertedText;
    const trimmedText = clipboardText.trim();
    
    switch (conversionType) {
        case 'rgba-to-hex':
            convertedText = rgbaToHex(trimmedText);
            break;
        case 'hex-to-rgba':
            convertedText = hexToRgba(trimmedText);
            break;
        case 'auto':
            convertedText = smartAutoConvertColors(trimmedText);
            break;
        default:
            nova.workspace.showErrorMessage("無効な変換タイプです");
            return;
    }
    
    if (convertedText) {
        const success = await setClipboardText(convertedText);
        if (success) {
            nova.workspace.showInformativeMessage(
                `クリップボードを変換しました:\n${trimmedText} → ${convertedText}`
            );
        }
    } else {
        nova.workspace.showWarningMessage(
            `"${trimmedText}" は有効なカラーコードではありません`
        );
    }
}

// 拡張機能の有効化
exports.activate = function() {
    // エディタ用コマンド登録
    nova.commands.register("convertRgbaToHex", (editor) => {
        convertSelection(editor, rgbaToHex);
    });

    nova.commands.register("convertHexToRgba", (editor) => {
        convertSelection(editor, hexToRgba);
    });

    nova.commands.register("autoConvertColor", (editor) => {
        convertSelection(editor, autoConvertColor);
    });

    // クリップボード用コマンド登録
    nova.commands.register("convertClipboardRgbaToHex", async () => {
        await convertClipboardColor('rgba-to-hex');
    });

    nova.commands.register("convertClipboardHexToRgba", async () => {
        await convertClipboardColor('hex-to-rgba');
    });

    nova.commands.register("convertClipboardAuto", async () => {
        await convertClipboardColor('auto');
    });
};

// 拡張機能の無効化
exports.deactivate = function() {
    // クリーンアップ処理が必要な場合はここに記述
};
