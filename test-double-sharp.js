// 二重#問題のテスト

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

// テストケース
const testCases = [
    {
        input: "color: #ff0000 50%;",
        description: "HEX+パーセント（スペース区切り）"
    },
    {
        input: "background: #00ff00-75%;",
        description: "HEX+パーセント（ハイフン区切り）"
    },
    {
        input: "border: #0000ff,25%;",
        description: "HEX+パーセント（カンマ区切り）"
    },
    {
        input: "color: #ff0000 50%; background: #00ff00-75%; border: #0000ff,25%;",
        description: "複数のHEX+パーセント"
    }
];

console.log("=== 二重#問題のテスト ===\n");

let passed = 0;
let failed = 0;

testCases.forEach((testCase, index) => {
    console.log(`${index + 1}. ${testCase.description}`);
    console.log(`   入力: ${testCase.input}`);
    
    const converter = (colorStr) => {
        if (HEX_PERCENT_PATTERN.test(colorStr)) {
            const rgbaResult = hexPercentToRgba(colorStr);
            if (rgbaResult) {
                return rgbaToHex(rgbaResult);
            }
        }
        return null;
    };
    
    const result = convertAndReplaceColors(testCase.input, converter);
    console.log(`   出力: ${result}`);
    
    // 二重#がないかチェック
    const hasDoubleSharp = result && result.includes('##');
    
    if (hasDoubleSharp) {
        console.log(`   状態: ❌ 失敗（二重#が検出されました）`);
        failed++;
    } else if (result) {
        console.log(`   状態: ✅ パス`);
        passed++;
    } else {
        console.log(`   状態: ⚠️  変換されませんでした`);
        failed++;
    }
    console.log("");
});

console.log(`=== テスト結果 ===`);
console.log(`パス: ${passed}`);
console.log(`失敗: ${failed}`);
console.log(`合計: ${passed + failed}`);

if (failed === 0) {
    console.log("\n🎉 二重#問題が修正されました！");
} else {
    console.log(`\n⚠️  ${failed}件のテストが失敗しました。`);
}
