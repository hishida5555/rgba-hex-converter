// HEX+パーセント形式のHEX変換テスト
// #ff0000 50% → #ff000080 のような変換をテスト

// main.jsから関数をコピー
function extractColorCodes(text) {
    const foundColors = [];
    const processed = new Set();
    
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
    
    const totalHex = hexCount + hexPercentCount;
    const totalRgba = rgbaCount;
    
    if (totalHex > totalRgba) {
        return 'to-rgba';
    } else if (totalRgba > totalHex) {
        return 'to-hex';
    } else {
        return 'to-rgba';
    }
}

function convertAndReplaceColors(text, converter) {
    const colorCodes = extractColorCodes(text);
    
    if (colorCodes.length === 0) {
        return null;
    }
    
    let result = text;
    let offset = 0;
    
    for (let i = 0; i < colorCodes.length; i++) {
        const color = colorCodes[i];
        const actualIndex = color.index + offset;
        const actualText = result.substring(actualIndex, actualIndex + color.length);
        
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

function smartAutoConvertColors(text) {
    const colorCodes = extractColorCodes(text);
    
    if (colorCodes.length === 0) {
        return null;
    }
    
    const conversionDirection = analyzeColorUsage(colorCodes);
    
    let converter;
    if (conversionDirection === 'to-rgba') {
        converter = (colorStr) => {
            if (/^#?[a-f\d]{3,6}\s*[-,\s]\s*\d+%$/i.test(colorStr)) {
                return hexPercentToRgba(colorStr);
            } else if (/^#?[a-f\d]{3,8}$/i.test(colorStr)) {
                return hexToRgba(colorStr);
            }
            return null;
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

// HEX+パーセント形式のHEX変換テストケース
const hexPercentToHexTestCases = [
    // HEX+パーセントが多い場合
    {
        input: "color: #ff0000 50%; background: #00ff00-75%; border: rgba(0, 0, 255, 0.8); outline: #ffffff;",
        expected: "color: #ff000080; background: #00ff00bf; border: #0000ffcc; outline: #ffffff;",
        description: "HEX+パーセントが多い → すべてHEXに変換"
    },
    
    // 混合形式
    {
        input: "$primary: #ff0000-50%; $secondary: rgba(0, 255, 0, 0.7); $tertiary: #00ff00 25%; $quaternary: #0000ff;",
        expected: "$primary: #ff000080; $secondary: #00ff00b3; $tertiary: #00ff0040; $quaternary: #0000ff;",
        description: "HEX+パーセントとRGBA混在 → 透明度付きをHEXに変換"
    },
    
    // すべてHEX+パーセント
    {
        input: "color: #ff0000-50%; background: #00ff00 75%; border: #0000ff-25%;",
        expected: "color: #ff000080; background: #00ff00bf; border: #0000ff40;",
        description: "すべてHEX+パーセント → すべてHEXに変換"
    },
    
    // 純粋なHEXは保持
    {
        input: "color: #ff0000; background: #00ff00; border: #0000ff;",
        expected: "color: #ff0000; background: #00ff00; border: #0000ff;",
        description: "純粋なHEXのみ → 変換なし"
    },
    
    // RGBは保持
    {
        input: "color: rgb(255, 0, 0); background: rgb(0, 255, 0); border: rgb(0, 0, 255);",
        expected: "color: rgb(255, 0, 0); background: rgb(0, 255, 0); border: rgb(0, 0, 255);",
        description: "RGBのみ → 変換なし"
    },
    
    // 複雑な混在
    {
        input: ".header { color: #ff0000 50%; background: #343a40; }\n.nav { border: rgba(0, 255, 0, 0.8); outline: #00ff00-25%; }",
        expected: ".header { color: #ff000080; background: #343a40; }\n.nav { border: #00ff00cc; outline: #00ff0040; }",
        description: "複雑な混在 → 透明度付きをHEXに変換"
    },
    
    // 100%と0%
    {
        input: "color: #ff0000-100%; background: #00ff00 0%; border: #0000ff-50%;",
        expected: "color: #ff0000; background: #00000000; border: #0000ff80;",
        description: "100%はHEXに、0%は透明度付きHEXに変換"
    }
];

console.log("=== HEX+パーセント形式のHEX変換テスト ===\n");

let passed = 0;
let failed = 0;

hexPercentToHexTestCases.forEach((testCase, index) => {
    const result = smartAutoConvertColors(testCase.input);
    const success = result === testCase.expected;
    
    // カラー分析を表示
    const colorCodes = extractColorCodes(testCase.input);
    const direction = analyzeColorUsage(colorCodes);
    
    console.log(`${index + 1}. ${testCase.description}`);
    console.log(`   入力: ${testCase.input.replace(/\n/g, '\\n')}`);
    console.log(`   期待値: ${testCase.expected.replace(/\n/g, '\\n')}`);
    console.log(`   結果: ${result ? result.replace(/\n/g, '\\n') : 'null'}`);
    console.log(`   分析: HEX=${colorCodes.filter(c => /^#?[a-f\d]{3,8}$/.test(c.text)).length}, RGBA=${colorCodes.filter(c => /rgba?\s*\(/i.test(c.text)).length}, HEX+パーセント=${colorCodes.filter(c => /%/.test(c.text)).length}`);
    console.log(`   方向: ${direction}`);
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

console.log("\n=== HEX+パーセント変換ルール ===");
console.log("• HEX+パーセント形式もHEXに変換");
console.log("• #ff0000 50% → rgba(255,0,0,0.50) → #ff000080");
console.log("• 純粋なHEXは保護");
console.log("• RGB（透明度なし）は保護");

if (failed === 0) {
    console.log("\n🎉 すべてのテストがパスしました！");
    console.log("✅ HEX+パーセント形式のHEX変換が正常に動作します");
} else {
    console.log(`\n⚠️  ${failed}件のテストが失敗しました。`);
}
