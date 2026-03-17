// CSS/SCSS自動一括変換テスト（main.jsの最新ロジックを使用）

// main.jsから最新のロジックをコピー
const HEX_PERCENT_PATTERN = /^#?([a-f\d]{3}|[a-f\d]{6})\s*[-,\s]\s*(\d+)%$/i;
const HEX_PERCENT_PATTERN_GLOBAL = /(#?[a-f\d]{3}|[a-f\d]{6})\s*[-,\s]\s*(\d+)%/gi;

function hexPercentToRgba(hexPercentStr) {
    const hexPercentPattern = HEX_PERCENT_PATTERN;
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

function extractColorCodes(text) {
    const foundColors = [];
    const processed = new Set();
    
    const hexPercentPattern = HEX_PERCENT_PATTERN_GLOBAL;
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
    
    const hexPattern = /#[a-f\d]{3}(?:[a-f\d]{3})?(?:[a-f\d]{2})?(?![a-f\d])/gi;
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

function convertAndReplaceColors(text, converter) {
    const colorCodes = extractColorCodes(text);
    
    if (colorCodes.length === 0) return null;
    
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

function analyzeColorUsage(colorCodes) {
    let hexCount = 0;
    let rgbCount = 0;
    let rgbaCount = 0;
    let hexPercentCount = 0;
    
    colorCodes.forEach(color => {
        if (HEX_PERCENT_PATTERN.test(color.text)) {
            hexPercentCount++;
        } else if (/rgba\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)/i.test(color.text)) {
            rgbaCount++;
        } else if (/rgb\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/i.test(color.text)) {
            rgbCount++;
        } else if (/^#[a-f\d]{3}(?:[a-f\d]{3})?(?:[a-f\d]{2})?$/i.test(color.text)) {
            hexCount++;
        }
    });
    
    const totalHex = hexCount + hexPercentCount + rgbCount;
    const totalRgba = rgbaCount;
    
    console.log(`カラー形式分析: HEX=${hexCount}, RGB=${rgbCount}, RGBA=${rgbaCount}, HEX+パーセント=${hexPercentCount}, 合計HEX=${totalHex}`);
    
    if (totalHex > totalRgba) {
        return 'to-hex';
    } else if (totalRgba > totalHex) {
        return 'to-rgba';
    } else {
        return 'to-hex';
    }
}

function smartAutoConvertColors(text) {
    const colorCodes = extractColorCodes(text);
    
    if (colorCodes.length === 0) return null;
    
    const conversionDirection = analyzeColorUsage(colorCodes);
    
    let converter;
    if (conversionDirection === 'to-rgba') {
        converter = (colorStr) => {
            if (HEX_PERCENT_PATTERN.test(colorStr)) {
                return hexPercentToRgba(colorStr);
            } else if (/^#?[a-f\d]{3,8}$/i.test(colorStr)) {
                return hexToRgba(colorStr);
            }
            return null;
        };
    } else {
        converter = (colorStr) => {
            if (HEX_PERCENT_PATTERN.test(colorStr)) {
                const rgbaResult = hexPercentToRgba(colorStr);
                if (rgbaResult) {
                    return rgbaToHex(rgbaResult);
                }
            } else if (/rgba?\s*\(/i.test(colorStr)) {
                return rgbaToHex(colorStr);
            }
            return null;
        };
    }
    
    return convertAndReplaceColors(text, converter);
}

// テストケース
const cssTestCases = [
    {
        input: `.header { color: #ff0000; background: rgba(0, 255, 0, 0.5); border: #0000ff; }`,
        description: "HEXが多い → HEXに統一",
        expectedDirection: "to-hex"
    },
    {
        input: `.nav { color: rgba(255, 0, 0, 0.8); background: rgba(0, 255, 0, 0.6); border: #ffffff; }`,
        description: "RGBAが多い → RGBAに統一",
        expectedDirection: "to-rgba"
    },
    {
        input: `.sidebar { color: #ff0000 50%; background: rgba(0, 255, 0, 0.8); border: #0000ff-25%; }`,
        description: "HEX+パーセント混在 → HEXに統一",
        expectedDirection: "to-hex"
    },
    {
        input: `.footer { color: #ff0000; background: #00ff00; border: #0000ff; }`,
        description: "純粋なHEXのみ → 変換なし",
        expectedDirection: "to-hex"
    },
    {
        input: `.content { color: rgb(255, 0, 0); background: rgb(0, 255, 0); border: rgb(0, 0, 255); }`,
        description: "RGBのみ → HEXに統一",
        expectedDirection: "to-hex"
    },
    {
        input: `$primary: #ff0000; $secondary: rgba(0, 255, 0, 0.5); $tertiary: #0000ff;`,
        description: "SCSS変数 HEXが多い → HEXに統一",
        expectedDirection: "to-hex"
    },
    {
        input: `:root { --color-1: rgba(255, 0, 0, 0.8); --color-2: rgba(0, 255, 0, 0.6); --color-3: #ffffff; }`,
        description: "CSS変数 RGBAが多い → RGBAに統一",
        expectedDirection: "to-rgba"
    }
];

console.log("=== CSS/SCSS 自動一括変換テスト（最新ロジック）===\n");

let passed = 0;
let failed = 0;

cssTestCases.forEach((testCase, index) => {
    console.log(`${index + 1}. ${testCase.description}`);
    console.log(`   入力: ${testCase.input}`);
    
    const colorCodes = extractColorCodes(testCase.input);
    const direction = analyzeColorUsage(colorCodes);
    
    console.log(`   期待方向: ${testCase.expectedDirection}`);
    console.log(`   実際方向: ${direction}`);
    
    const result = smartAutoConvertColors(testCase.input);
    console.log(`   変換結果: ${result || '変換なし'}`);
    
    const directionCorrect = direction === testCase.expectedDirection;
    const hasResult = result !== null;
    
    // 純粋なHEXのみの場合は変換なしが正常
    const testPassed = directionCorrect && (hasResult || testCase.description.includes("変換なし"));
    
    console.log(`   状態: ${testPassed ? "✅ パス" : "❌ 失敗"}`);
    
    if (testPassed) {
        passed++;
    } else {
        failed++;
    }
    console.log("");
});

console.log(`=== テスト結果 ===`);
console.log(`パス: ${passed}`);
console.log(`失敗: ${failed}`);
console.log(`合計: ${passed + failed}`);

if (failed === 0) {
    console.log("\n🎉 すべてのCSS/SCSSテストがパスしました！");
} else {
    console.log(`\n⚠️  ${failed}件のテストが失敗しました。`);
}
