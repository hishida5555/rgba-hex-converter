// 個別コマンドでのHEX+パーセント変換テスト

const HEX_PERCENT_PATTERN = /^#?([a-f\d]{3}|[a-f\d]{6})\s*[-,\s]\s*(\d+)%$/i;
const HEX_PERCENT_PATTERN_GLOBAL = /#([a-f\d]{3}|[a-f\d]{6})\s*[-,\s]\s*(\d+)%/gi;

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

// 個別コマンドのシミュレーション
function simulateConvertRgbaToHex(text) {
    const enhancedConverter = (colorStr) => {
        // HEX+パーセント形式の場合
        if (HEX_PERCENT_PATTERN.test(colorStr)) {
            // HEX+パーセント → RGBA → HEX
            const rgbaResult = hexPercentToRgba(colorStr);
            if (rgbaResult) {
                return rgbaToHex(rgbaResult);
            }
        }
        // 通常の変換
        return rgbaToHex(colorStr);
    };
    
    return convertAndReplaceColors(text, enhancedConverter);
}

function simulateConvertHexToRgba(text) {
    const enhancedConverter = (colorStr) => {
        // HEX+パーセント形式の場合
        if (HEX_PERCENT_PATTERN.test(colorStr)) {
            // HEX+パーセント → RGBA
            return hexPercentToRgba(colorStr);
        }
        // 通常の変換
        return hexToRgba(colorStr);
    };
    
    return convertAndReplaceColors(text, enhancedConverter);
}

// テストケース
const testCases = [
    {
        input: "color: #ff0000 50%;",
        description: "HEX+パーセント → HEX変換（⌃⌘H）",
        command: "convertRgbaToHex"
    },
    {
        input: "color: #ff0000 50%;",
        description: "HEX+パーセント → RGBA変換（⌃⌘R）",
        command: "convertHexToRgba"
    },
    {
        input: "color: #ff0000 50%; background: rgba(0, 255, 0, 0.5);",
        description: "HEX+パーセント + RGBA → HEX変換（⌃⌘H）",
        command: "convertRgbaToHex"
    },
    {
        input: "color: #ff0000 50%; background: #00ff00;",
        description: "HEX+パーセント + HEX → RGBA変換（⌃⌘R）",
        command: "convertHexToRgba"
    }
];

console.log("=== 個別コマンドでのHEX+パーセント変換テスト ===\n");

let passed = 0;
let failed = 0;

testCases.forEach((testCase, index) => {
    console.log(`${index + 1}. ${testCase.description}`);
    console.log(`   入力: ${testCase.input}`);
    
    let result;
    if (testCase.command === "convertRgbaToHex") {
        result = simulateConvertRgbaToHex(testCase.input);
    } else if (testCase.command === "convertHexToRgba") {
        result = simulateConvertHexToRgba(testCase.input);
    }
    
    console.log(`   出力: ${result || 'カラーコードが見つかりません'}`);
    
    if (result) {
        console.log(`   状態: ✅ パス`);
        passed++;
    } else {
        console.log(`   状態: ❌ 失敗（カラーコードが見つかりませんでした）`);
        failed++;
    }
    console.log("");
});

console.log(`=== テスト結果 ===`);
console.log(`パス: ${passed}`);
console.log(`失敗: ${failed}`);
console.log(`合計: ${passed + failed}`);

if (failed === 0) {
    console.log("\n🎉 個別コマンドでもHEX+パーセント形式が正しく変換されます！");
} else {
    console.log(`\n⚠️  ${failed}件のテストが失敗しました。`);
}
