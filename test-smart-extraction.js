// スマート抽出機能のテスト
// CSS/SCSSプロパティ内の複数カラーコード変換テスト

// main.jsから関数をコピー
function extractColorCodes(text) {
    const foundColors = [];
    const processed = new Set();
    
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
    
    return foundColors.sort((a, b) => a.index - b.index);
}

function rgbaToHex(rgbaStr) {
    const rgbaPattern = /rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)/i;
    const match = rgbaStr.match(rgbaPattern);
    
    if (!match) return null;
    
    const r = parseInt(match[1]);
    const g = parseInt(match[2]); 
    const b = parseInt(match[3]);
    const a = match[4] ? parseFloat(match[4]) : 1;
    
    if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255 || a < 0 || a > 1) {
        return null;
    }
    
    const toHex = (n) => n.toString(16).padStart(2, '0');
    
    let hexStr = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    
    if (a !== 1) {
        const alphaHex = Math.round(a * 255).toString(16).padStart(2, '0');
        hexStr += alphaHex;
    }
    
    return hexStr;
}

function hexToRgba(hexStr) {
    const hexPattern = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i;
    const shortHexPattern = /^#?([a-f\d])([a-f\d])([a-f\d])([a-f\d])?$/i;
    
    let match = hexStr.match(hexPattern);
    let isShortFormat = false;
    
    if (!match) {
        match = hexStr.match(shortHexPattern);
        isShortFormat = true;
    }
    
    if (!match) return null;
    
    let r, g, b, a;
    
    if (isShortFormat) {
        r = parseInt(match[1] + match[1], 16);
        g = parseInt(match[2] + match[2], 16);
        b = parseInt(match[3] + match[3], 16);
        a = match[4] ? parseInt(match[4] + match[4], 16) / 255 : 1;
    } else {
        r = parseInt(match[1], 16);
        g = parseInt(match[2], 16);
        b = parseInt(match[3], 16);
        a = match[4] ? parseInt(match[4], 16) / 255 : 1;
    }
    
    if (a === 1) {
        return `rgb(${r}, ${g}, ${b})`;
    } else {
        return `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})`;
    }
}

function hexPercentToRgba(hexPercentStr) {
    const hexPercentPattern = /^#?([a-f\d]{3}|[a-f\d]{6})\s*[-,\s]\s*(\d+)%$/i;
    const match = hexPercentStr.match(hexPercentPattern);
    
    if (!match) return null;
    
    let hexPart = match[1];
    const percent = parseInt(match[2]) / 100;
    
    if (percent < 0 || percent > 1) return null;
    
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
    
    return null;
}

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

// スマート抽出機能のテストケース
const smartExtractionTestCases = [
    // シングルカラーコード
    { 
        input: "color: #ff0000;", 
        expected: "color: rgb(255, 0, 0);", 
        converter: hexToRgba,
        description: "CSSプロパティ内のHEX"
    },
    { 
        input: "$primary: #00ff00-50%;", 
        expected: "$primary: rgba(0, 255, 0, 0.50);", 
        converter: hexPercentToRgba,
        description: "SCSS変数内のHEX+パーセント"
    },
    { 
        input: "background: rgba(255, 0, 0, 0.5);", 
        expected: "background: #ff000080;", 
        converter: rgbaToHex,
        description: "CSSプロパティ内のRGBA"
    },
    
    // 複数カラーコード
    { 
        input: "color: #ff0000; background: #00ff00; border: #0000ff;", 
        expected: "color: rgb(255, 0, 0); background: rgb(0, 255, 0); border: rgb(0, 0, 255);", 
        converter: hexToRgba,
        description: "複数のHEXカラーコード"
    },
    { 
        input: "$primary: #ff0000-50%; $secondary: #00ff00-75%; $tertiary: #0000ff-25%;", 
        expected: "$primary: rgba(255, 0, 0, 0.50); $secondary: rgba(0, 255, 0, 0.75); $tertiary: rgba(0, 0, 255, 0.25);", 
        converter: hexPercentToRgba,
        description: "複数のHEX+パーセント"
    },
    { 
        input: ".box { color: rgba(255, 0, 0, 0.5); background: rgba(0, 255, 0, 0.8); border: rgba(0, 0, 255, 0.3); }", 
        expected: ".box { color: #ff000080; background: #00ff00cc; border: #0000ff4d; }", 
        converter: rgbaToHex,
        description: "複数のRGBA"
    },
    
    // 混合形式
    { 
        input: "color: #ff0000; background: rgba(0, 255, 0, 0.5); border: #0000ff-25%;", 
        expected: "color: rgb(255, 0, 0); background: #00ff0080; border: rgba(0, 0, 255, 0.25);", 
        converter: autoConvertColor,
        description: "混合カラーフォーマット"
    },
    
    // 実際のSCSS使用例
    { 
        input: "$button-primary: #007bff-80%;\n$button-secondary: #6c757d-60%;\n$button-success: #28a745-90%;", 
        expected: "$button-primary: rgba(0, 123, 255, 0.80);\n$button-secondary: rgba(108, 117, 125, 0.60);\n$button-success: rgba(40, 167, 69, 0.90);", 
        converter: hexPercentToRgba,
        description: "SCSS変数群（複数行）"
    },
    { 
        input: ".header { background: #343a40; color: #ffffff; }\n.nav { background: #007bff-75%; color: #ffffff; }", 
        expected: ".header { background: rgb(52, 58, 64); color: rgb(255, 255, 255); }\n.nav { background: rgba(0, 123, 255, 0.75); color: rgb(255, 255, 255); }", 
        converter: autoConvertColor,
        description: "CSSクラス群（複数行）"
    },
    
    // エッジケース
    { 
        input: "/* コメント: #ff0000 */ color: #00ff00; // コメント: #0000ff", 
        expected: "/* コメント: #ff0000 */ color: rgb(0, 255, 0); // コメント: #0000ff", 
        converter: hexToRgba,
        description: "コメント内のカラーコードは無視"
    },
    
    // 短いHEX形式
    { 
        input: "color: #f00; background: #0f0; border: #00f;", 
        expected: "color: rgb(255, 0, 0); background: rgb(0, 255, 0); border: rgb(0, 0, 255);", 
        converter: hexToRgba,
        description: "短いHEX形式の複数"
    }
];

console.log("=== スマート抽出機能テスト ===\n");

let passed = 0;
let failed = 0;
let totalColorsFound = 0;
let totalColorsConverted = 0;

smartExtractionTestCases.forEach((testCase, index) => {
    const result = convertAndReplaceColors(testCase.input, testCase.converter);
    const success = result === testCase.expected;
    
    // 見つかったカラーコード数をカウント
    const foundColors = extractColorCodes(testCase.input);
    totalColorsFound += foundColors.length;
    
    if (result && result !== testCase.input) {
        const convertedColors = extractColorCodes(result);
        totalColorsConverted += convertedColors.length;
    }
    
    console.log(`${index + 1}. ${testCase.description}`);
    console.log(`   入力: ${testCase.input.replace(/\n/g, '\\n')}`);
    console.log(`   期待値: ${testCase.expected.replace(/\n/g, '\\n')}`);
    console.log(`   結果: ${result ? result.replace(/\n/g, '\\n') : 'null'}`);
    console.log(`   見つかったカラーコード: ${foundColors.length}個`);
    console.log(`   状態: ${success ? "✅ パス" : "❌ 失敗"}`);
    console.log("");
    
    if (success) {
        passed++;
    } else {
        failed++;
    }
});

console.log(`=== テスト結果 ===`);
console.log(`パス: ${passed}`);
console.log(`失敗: ${failed}`);
console.log(`合計: ${passed + failed}`);
console.log(`検出したカラーコード総数: ${totalColorsFound}`);
console.log(`変換したカラーコード総数: ${totalColorsConverted}`);

if (failed === 0) {
    console.log("\n🎉 すべてのテストがパスしました！");
    console.log("✅ スマート抽出機能が正常に動作します");
    console.log("✅ 複数のカラーコードも一括変換できます");
} else {
    console.log(`\n⚠️  ${failed}件のテストが失敗しました。`);
}
