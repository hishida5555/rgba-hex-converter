// 混在フォーマットの変換方向テスト
// HEXとRGBAが混在する場合の動作検証

// main.jsから関数をコピー
function extractColorCodes(text) {
    const foundColors = [];
    const processed = new Set();
    
    // 1. HEX+パーセント形式を最初に検索
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
    
    // 3. 単独のHEX形式を検索
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

// 混在フォーマットのテストケース
const mixedFormatTestCases = [
    // HEXとRGBAの混在
    {
        input: "color: #ff0000; background: rgba(0, 255, 0, 0.5); border: #0000ff;",
        rgbaToHex: "color: #ff0000; background: #00ff0080; border: #0000ff;",
        hexToRgba: "color: rgb(255, 0, 0); background: rgba(0, 255, 0, 0.5); border: rgb(0, 0, 255);",
        autoConvert: "color: rgb(255, 0, 0); background: #00ff0080; border: rgb(0, 0, 255);",
        description: "HEXとRGBA混在"
    },
    
    // HEX+パーセントとRGBAの混在
    {
        input: "$primary: #ff0000-50%; $secondary: rgba(0, 255, 0, 0.8); $tertiary: #0000ff-25%;",
        rgbaToHex: "$primary: #ff0000-50%; $secondary: #00ff00cc; $tertiary: #0000ff-25%;",
        hexToRgba: "$primary: rgba(255, 0, 0, 0.50); $secondary: rgba(0, 255, 0, 0.8); $tertiary: rgba(0, 0, 255, 0.25);",
        autoConvert: "$primary: rgba(255, 0, 0, 0.50); $secondary: #00ff00cc; $tertiary: rgba(0, 0, 255, 0.25);",
        description: "HEX+パーセントとRGBA混在"
    },
    
    // すべての形式が混在
    {
        input: ".header { color: #ff0000; background: rgba(0, 255, 0, 0.5); }\n.nav { border: #0000ff-25%; outline: #f00-50%; }",
        rgbaToHex: ".header { color: #ff0000; background: #00ff0080; }\n.nav { border: #0000ff-25%; outline: #f00-50%; }",
        hexToRgba: ".header { color: rgb(255, 0, 0); background: rgba(0, 255, 0, 0.5); }\n.nav { border: rgba(0, 0, 255, 0.25); outline: rgba(255, 0, 0, 0.50); }",
        autoConvert: ".header { color: rgb(255, 0, 0); background: #00ff0080; }\n.nav { border: rgba(0, 0, 255, 0.25); outline: rgba(255, 0, 0, 0.50); }",
        description: "すべての形式混在（複数行）"
    },
    
    // 短いHEXと通常RGBAの混在
    {
        input: "color: #f00; background: rgba(0, 255, 0, 0.5); border: #00f;",
        rgbaToHex: "color: #f00; background: #00ff0080; border: #00f;",
        hexToRgba: "color: rgb(255, 0, 0); background: rgba(0, 255, 0, 0.5); border: rgb(0, 0, 255);",
        autoConvert: "color: rgb(255, 0, 0); background: #00ff0080; border: rgb(0, 0, 255);",
        description: "短いHEXとRGBA混在"
    }
];

console.log("=== 混在フォーマットの変換方向テスト ===\n");

let passed = 0;
let failed = 0;

mixedFormatTestCases.forEach((testCase, index) => {
    console.log(`${index + 1}. ${testCase.description}`);
    console.log(`   入力: ${testCase.input.replace(/\n/g, '\\n')}`);
    
    // 各コマンドの結果をテスト
    const tests = [
        { name: "RGBA→HEX", result: convertAndReplaceColors(testCase.input, rgbaToHex), expected: testCase.rgbaToHex },
        { name: "HEX→RGBA", result: convertAndReplaceColors(testCase.input, hexToRgba), expected: testCase.hexToRgba },
        { name: "自動変換", result: convertAndReplaceColors(testCase.input, autoConvertColor), expected: testCase.autoConvert }
    ];
    
    let allPassed = true;
    
    tests.forEach(test => {
        const success = test.result === test.expected;
        if (!success) {
            allPassed = false;
            console.log(`   ❌ ${test.name}: 失敗`);
            console.log(`      期待: ${test.expected.replace(/\n/g, '\\n')}`);
            console.log(`      結果: ${test.result ? test.result.replace(/\n/g, '\\n') : 'null'}`);
        } else {
            console.log(`   ✅ ${test.name}: 成功`);
        }
    });
    
    if (allPassed) {
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

console.log("\n=== 変換方向のルール ===");
console.log("• RGBA→HEX: RGBA形式のみをHEXに変換");
console.log("• HEX→RGBA: HEX形式とHEX+パーセントをRGBAに変換");
console.log("• 自動変換: HEX→RGBA、RGBA→HEXを自動判定して変換");

if (failed === 0) {
    console.log("\n🎉 すべてのテストがパスしました！");
} else {
    console.log(`\n⚠️  ${failed}件のテストが失敗しました。`);
}
