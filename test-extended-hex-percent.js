// 拡張HEX+パーセント形式のテスト
// スペースとカンマ区切りに対応

function hexPercentToRgba(hexPercentStr) {
    const hexPercentPattern = /^#?([a-f\d]{3}|[a-f\d]{6})\s*[-,\s]\s*(\d+)%$/i;
    const match = hexPercentStr.match(hexPercentPattern);
    
    if (!match) {
        return null;
    }
    
    let hexPart = match[1];
    const percent = parseInt(match[2]) / 100;
    
    if (percent < 0 || percent > 1) {
        return null;
    }
    
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

// 拡張テストケース
const extendedTestCases = [
    // 基本形式（ハイフン）
    { input: "#ff0000-50%", expected: "rgba(255, 0, 0, 0.50)" },
    { input: "#f00-25%", expected: "rgba(255, 0, 0, 0.25)" },
    
    // スペース区切り
    { input: "#ff0000 50%", expected: "rgba(255, 0, 0, 0.50)" },
    { input: "#f00 25%", expected: "rgba(255, 0, 0, 0.25)" },
    { input: "#00ff00 75%", expected: "rgba(0, 255, 0, 0.75)" },
    { input: "#abc 33%", expected: "rgba(170, 187, 204, 0.33)" },
    
    // カンマ区切り
    { input: "#ff0000,50%", expected: "rgba(255, 0, 0, 0.50)" },
    { input: "#f00,25%", expected: "rgba(255, 0, 0, 0.25)" },
    { input: "#0000ff,100%", expected: "rgb(0, 0, 255)" },
    { input: "#123456,0%", expected: "rgba(18, 52, 86, 0.00)" },
    
    // スペース + 区切り文字 + スペース
    { input: "#ff0000 - 50%", expected: "rgba(255, 0, 0, 0.50)" },
    { input: "#f00 , 25%", expected: "rgba(255, 0, 0, 0.25)" },
    { input: "#00ff00 - 75%", expected: "rgba(0, 255, 0, 0.75)" },
    { input: "#abc , 33%", expected: "rgba(170, 187, 204, 0.33)" },
    
    // #なしの形式
    { input: "ff0000-50%", expected: "rgba(255, 0, 0, 0.50)" },
    { input: "f00 25%", expected: "rgba(255, 0, 0, 0.25)" },
    { input: "00ff00,75%", expected: "rgba(0, 255, 0, 0.75)" },
    
    // エッジケース
    { input: "#fff-10%", expected: "rgba(255, 255, 255, 0.10)" },
    { input: "#000-90%", expected: "rgba(0, 0, 0, 0.90)" },
    { input: "#fff 100%", expected: "rgb(255, 255, 255)" },
    { input: "#000 0%", expected: "rgba(0, 0, 0, 0.00)" },
    
    // エラーケース
    { input: "#ff0000-150%", expected: null },
    { input: "#ff0000-50", expected: null },
    { input: "ff0000-50", expected: null },
    { input: "#ff0000@50%", expected: null },
    { input: "#gggggg-50%", expected: null }
];

console.log("=== 拡張HEX+パーセント形式変換テスト ===\n");

let passed = 0;
let failed = 0;

extendedTestCases.forEach((testCase, index) => {
    const result = hexPercentToRgba(testCase.input);
    const success = result === testCase.expected;
    
    console.log(`${index + 1}. ${testCase.input}`);
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
