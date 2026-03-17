// テスト用の簡単な検証スクリプト
// Node.js環境で実行して変換ロジックをテスト

// main.jsから関数をコピー（実際の拡張機能ではmain.jsに含まれる）
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

// テストケース
const testCases = [
    // RGBA → HEX
    { input: "rgb(255, 0, 0)", expected: "#ff0000", type: "rgba_to_hex" },
    { input: "rgba(255, 0, 0, 0.5)", expected: "#ff000080", type: "rgba_to_hex" },
    { input: "rgba( 128 , 64 , 192 , 0.75 )", expected: "#8040c0bf", type: "rgba_to_hex" },
    
    // HEX → RGBA
    { input: "#ff0000", expected: "rgb(255, 0, 0)", type: "hex_to_rgba" },
    { input: "#f00", expected: "rgb(255, 0, 0)", type: "hex_to_rgba" },
    { input: "#ff000080", expected: "rgba(255, 0, 0, 0.50)", type: "hex_to_rgba" },
    { input: "#f08", expected: "rgb(255, 0, 136)", type: "hex_to_rgba" }
];

console.log("=== RGBA/HEX変換テスト ===\n");

let passed = 0;
let failed = 0;

testCases.forEach((testCase, index) => {
    let result;
    let testName;
    
    if (testCase.type === "rgba_to_hex") {
        result = rgbaToHex(testCase.input);
        testName = `RGBA→HEX: ${testCase.input}`;
    } else {
        result = hexToRgba(testCase.input);
        testName = `HEX→RGBA: ${testCase.input}`;
    }
    
    const success = result === testCase.expected;
    
    console.log(`${index + 1}. ${testName}`);
    console.log(`   入力: ${testCase.input}`);
    console.log(`   期待値: ${testCase.expected}`);
    console.log(`   結果: ${result}`);
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

if (failed === 0) {
    console.log("\n🎉 すべてのテストがパスしました！");
} else {
    console.log(`\n⚠️  ${failed}件のテストが失敗しました。`);
}
