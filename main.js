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

// カラー形式を自動検出して変換する関数
function autoConvertColor(colorStr) {
    const trimmed = colorStr.trim();
    
    // HEX+パーセント形式かチェック（#ff0000-50%, #ff0000 50%, #ff0000,50%）
    if (/^#?[a-f\d]{3,6}\s*[-,\s]\s*\d+%$/i.test(trimmed)) {
        return hexPercentToRgba(trimmed);
    }
    
    // RGBA形式かチェック
    if (/rgba?\s*\(/i.test(trimmed)) {
        return rgbaToHex(trimmed);
    }
    
    // HEX形式かチェック
    if (/^#?[a-f\d]{3,8}$/i.test(trimmed)) {
        return hexToRgba(trimmed);
    }
    
    return null; // どちらの形式でもない場合
}

// 選択テキストを変換するヘルパー関数
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
            const convertedText = converter(selectedText);
            
            if (convertedText) {
                edit.replace(range, convertedText);
            } else {
                nova.workspace.showWarningMessage(`"${selectedText}" は有効なカラーコードではありません`);
            }
        }
    });
}

// コマンド登録
nova.commands.register("convertRgbaToHex", (editor) => {
    convertSelection(editor, rgbaToHex);
});

nova.commands.register("convertHexToRgba", (editor) => {
    convertSelection(editor, hexToRgba);
});

nova.commands.register("autoConvertColor", (editor) => {
    convertSelection(editor, autoConvertColor);
});

// 拡張機能が有効になったときの処理
console.log("RGBA/HEX Color Converter拡張機能が読み込まれました");
