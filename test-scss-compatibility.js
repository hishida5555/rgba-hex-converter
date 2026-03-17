// SCSS環境でのカラーコード変換テスト

// main.jsから関数をコピー
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

function rgbaToHex(rgbaStr) {
    const rgbaPattern = /rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)/i;
    const match = rgbaStr.match(rgbaPattern);
    
    if (!match) {
        return null;
    }
    
    const r = parseInt(match[1]);
    const g = parseInt(match[2]); 
    const b = parseInt(match[3]);
    const a = match[4] ? parseFloat(match[4]) : 1;
    
    if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255 || a < 0 || a > 1) {
        return null;
    }
    
    const toHex = (n) => {
        const hex = n.toString(16).padStart(2, '0');
        return hex;
    };
    
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
    
    if (!match) {
        return null;
    }
    
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

// SCSS環境でのテストケース
const scssTestCases = [
    // 基本的なSCSS変数
    { input: "$primary-color: #ff0000;", expected: null, description: "SCSS変数宣言（セミコロン付き）" },
    { input: "#ff0000", expected: "rgb(255, 0, 0)", description: "純粋なHEX値" },
    
    // SCSSのカラー関数
    { input: "rgba(#ff0000, 0.5)", expected: null, description: "SCSS rgba関数" },
    { input: "rgba(255, 0, 0, 0.5)", expected: "#ff000080", description: "標準RGBA" },
    
    // SCSSのミックスイン内
    { input: "color: #ff0000;", expected: "rgb(255, 0, 0)", description: "CSSプロパティ" },
    { input: "background: #ff0000-50%;", expected: "rgba(255, 0, 0, 0.50)", description: "HEX+パーセント" },
    
    // SCSSのネストされた構文
    { input: "  color: #00ff00;", expected: "rgb(0, 255, 0)", description: "インデント付き" },
    { input: "\tbackground: #0000ff-25%;", expected: "rgba(0, 0, 255, 0.25)", description: "タブ付き" },
    
    // SCSSの補間（Interpolation）
    { input: "color: #{$color};", expected: null, description: "SCSS補間" },
    { input: "#{$color}-50%", expected: null, description: "補間付きHEX+パーセント" },
    
    // SCSSの演算
    { input: "color: #ff0000 + #00ff00;", expected: null, description: "SCSSカラー演算" },
    { input: "color: lighten(#ff0000, 20%);", expected: null, description: "SCSSカラー関数" },
    
    // SCSSの条件分岐内
    { input: "@if $condition { color: #ff0000; }", expected: "rgb(255, 0, 0)", description: "@ifブロック内" },
    
    // 実際の使用シナリオ
    { input: "$button-bg: #007bff-80%;", expected: "rgba(0, 123, 255, 0.80)", description: "ボタン背景" },
    { input: "$text-color: #333333;", expected: "rgb(51, 51, 51)", description: "テキストカラー" },
    { input: "$border: 1px solid #ff0000-25%;", expected: "rgba(255, 0, 0, 0.25)", description: "ボーダー" },
    
    // コメント付き
    { input: "color: #ff0000; // コメント", expected: "rgb(255, 0, 0)", description: "コメント付き" },
    { input: "/* コメント */ color: #00ff00-50%;", expected: "rgba(0, 255, 0, 0.50)", description: "ブロックコメント付き" },
    
    // 複数行
    { input: "color: #ff0000,\n      background: #00ff00-75%;", expected: "rgb(255, 0, 0)", description: "複数行（最初の要素）" }
];

console.log("=== SCSS環境でのカラーコード変換テスト ===\n");

let passed = 0;
let failed = 0;
let scssCompatible = 0;
let scssIncompatible = 0;

scssTestCases.forEach((testCase, index) => {
    const result = autoConvertColor(testCase.input);
    const success = result === testCase.expected;
    
    // SCSS構文が含まれているかチェック
    const hasScssSyntax = /[@$#\{\}]|rgba\([^)]*\)|lighten|darken|mix/.test(testCase.input);
    
    if (hasScssSyntax) {
        if (success && result !== null) {
            scssCompatible++;
        } else if (result === null && testCase.expected === null) {
            scssCompatible++; // SCSS構文を正しく無視
        } else {
            scssIncompatible++;
        }
    }
    
    console.log(`${index + 1}. ${testCase.description}`);
    console.log(`   入力: ${testCase.input.replace(/\n/g, '\\n')}`);
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
console.log(`SCSS互換: ${scssCompatible}`);
console.log(`SCSS非互換: ${scssIncompatible}`);

if (failed === 0) {
    console.log("\n🎉 すべてのテストがパスしました！");
    console.log("✅ SCSS環境での使用に問題ありません");
} else {
    console.log(`\n⚠️  ${failed}件のテストが失敗しました。`);
}

if (scssIncompatible === 0) {
    console.log("✅ SCSS構文を適切に処理できます");
} else {
    console.log(`⚠️  ${scssIncompatible}件のSCSS構文で問題があります`);
}
