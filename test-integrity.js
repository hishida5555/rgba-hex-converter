// main.js整合性テスト

const HEX_PERCENT_PATTERN = /^#?([a-f\d]{3}|[a-f\d]{6})\s*[-,\s]\s*(\d+)%$/i;
const HEX_PERCENT_PATTERN_GLOBAL = /#([a-f\d]{3}|[a-f\d]{6})\s*[-,\s]\s*(\d+)%/gi;

function hexPercentToRgba(hexPercentStr) {
    const match = hexPercentStr.match(HEX_PERCENT_PATTERN);
    if (!match) return null;
    let hexPart = match[1];
    const percent = parseInt(match[2]) / 100;
    if (percent < 0 || percent > 1) return null;
    if (hexPart.length === 3) hexPart = hexPart.split('').map(c => c + c).join('');
    const r = parseInt(hexPart.substr(0, 2), 16);
    const g = parseInt(hexPart.substr(2, 2), 16);
    const b = parseInt(hexPart.substr(4, 2), 16);
    if (percent === 1) return `rgb(${r}, ${g}, ${b})`;
    return `rgba(${r}, ${g}, ${b}, ${percent.toFixed(2)})`;
}

function rgbaToHex(rgbaStr) {
    const match = rgbaStr.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)/i);
    if (!match) return null;
    const r = parseInt(match[1]), g = parseInt(match[2]), b = parseInt(match[3]);
    const a = match[4] ? parseFloat(match[4]) : 1;
    if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255 || a < 0 || a > 1) return null;
    const toHex = (n) => n.toString(16).padStart(2, '0');
    let hexStr = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    if (a !== 1) hexStr += Math.round(a * 255).toString(16).padStart(2, '0');
    return hexStr;
}

function hexToRgba(hexStr) {
    let match = hexStr.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i);
    let isShort = false;
    if (!match) { match = hexStr.match(/^#?([a-f\d])([a-f\d])([a-f\d])([a-f\d])?$/i); isShort = true; }
    if (!match) return null;
    let r, g, b, a;
    if (isShort) {
        r = parseInt(match[1]+match[1], 16); g = parseInt(match[2]+match[2], 16);
        b = parseInt(match[3]+match[3], 16); a = match[4] ? parseInt(match[4]+match[4], 16)/255 : 1;
    } else {
        r = parseInt(match[1], 16); g = parseInt(match[2], 16);
        b = parseInt(match[3], 16); a = match[4] ? parseInt(match[4], 16)/255 : 1;
    }
    if (a === 1) return `rgb(${r}, ${g}, ${b})`;
    return `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})`;
}

function autoConvertColor(colorStr) {
    const trimmed = colorStr.trim();
    if (HEX_PERCENT_PATTERN.test(trimmed)) return hexPercentToRgba(trimmed);
    if (/rgba?\s*\(/i.test(trimmed)) return rgbaToHex(trimmed);
    if (/^#[a-f\d]{3}(?:[a-f\d]{3})?(?:[a-f\d]{2})?$/i.test(trimmed)) return hexToRgba(trimmed);
    return null;
}

function extractColorCodes(text) {
    const foundColors = [];
    const processed = new Set();
    const hexPercentPattern = HEX_PERCENT_PATTERN_GLOBAL;
    let match;
    while ((match = hexPercentPattern.exec(text)) !== null) {
        const s = match.index, e = s + match[0].length;
        const key = `${s}-${e}`;
        if (!processed.has(key)) { processed.add(key); foundColors.push({ text: match[0], index: s, length: match[0].length }); }
    }
    const rgbaPattern = /rgba?\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+(?:\s*,\s*[\d.]+)?\s*\)/gi;
    while ((match = rgbaPattern.exec(text)) !== null) {
        const s = match.index, e = s + match[0].length;
        let skip = false;
        for (let pos = s; pos <= e && !skip; pos++) {
            for (const pk of processed) { const [ps, pe] = pk.split('-').map(Number); if (pos >= ps && pos <= pe) { skip = true; break; } }
        }
        if (!skip) { processed.add(`${s}-${e}`); foundColors.push({ text: match[0], index: s, length: match[0].length }); }
    }
    const hexPattern = /#[a-f\d]{3}(?:[a-f\d]{3})?(?:[a-f\d]{2})?(?![a-f\d])/gi;
    while ((match = hexPattern.exec(text)) !== null) {
        const s = match.index, e = s + match[0].length;
        let skip = false;
        for (let pos = s; pos <= e && !skip; pos++) {
            for (const pk of processed) { const [ps, pe] = pk.split('-').map(Number); if (pos >= ps && pos <= pe) { skip = true; break; } }
        }
        if (!skip) { processed.add(`${s}-${e}`); foundColors.push({ text: match[0], index: s, length: match[0].length }); }
    }
    return foundColors.sort((a, b) => a.index - b.index);
}

function convertAndReplaceColors(text, converter) {
    const colorCodes = extractColorCodes(text);
    if (colorCodes.length === 0) return null;
    let result = text, offset = 0;
    for (const color of colorCodes) {
        const ai = color.index + offset;
        if (result.substring(ai, ai + color.length) === color.text) {
            const conv = converter(color.text);
            if (conv && conv !== color.text) {
                result = result.substring(0, ai) + conv + result.substring(ai + color.length);
                offset += conv.length - color.length;
            }
        }
    }
    return result === text ? null : result;
}

function analyzeColorUsage(colorCodes) {
    let hexCount = 0, rgbCount = 0, rgbaCount = 0, hexPercentCount = 0;
    colorCodes.forEach(color => {
        if (HEX_PERCENT_PATTERN.test(color.text)) hexPercentCount++;
        else if (/rgba\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)/i.test(color.text)) rgbaCount++;
        else if (/rgb\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/i.test(color.text)) rgbCount++;
        else if (/^#[a-f\d]{3}(?:[a-f\d]{3})?(?:[a-f\d]{2})?$/i.test(color.text)) hexCount++;
    });
    const totalHex = hexCount + hexPercentCount + rgbCount;
    if (totalHex > rgbaCount) return 'to-hex';
    if (rgbaCount > totalHex) return 'to-rgba';
    return 'to-hex';
}

function smartAutoConvertColors(text) {
    const colorCodes = extractColorCodes(text);
    if (colorCodes.length === 0) return null;
    const dir = analyzeColorUsage(colorCodes);
    let converter;
    if (dir === 'to-rgba') {
        converter = (s) => {
            if (HEX_PERCENT_PATTERN.test(s)) return hexPercentToRgba(s);
            if (/^#[a-f\d]{3}(?:[a-f\d]{3})?(?:[a-f\d]{2})?$/i.test(s)) return hexToRgba(s);
            return null;
        };
    } else {
        converter = (s) => {
            if (HEX_PERCENT_PATTERN.test(s)) { const r = hexPercentToRgba(s); return r ? rgbaToHex(r) : null; }
            if (/rgba?\s*\(/i.test(s)) return rgbaToHex(s);
            return null;
        };
    }
    let result = text, offset = 0;
    for (const color of colorCodes) {
        const ai = color.index + offset;
        if (result.substring(ai, ai + color.length) === color.text) {
            const conv = converter(color.text);
            if (conv && conv !== color.text) {
                result = result.substring(0, ai) + conv + result.substring(ai + color.length);
                offset += conv.length - color.length;
            }
        }
    }
    return result === text ? null : result;
}

// === テスト ===
let passed = 0, failed = 0;
function test(name, actual, expected) {
    if (actual === expected) { console.log(`  ✅ ${name}`); passed++; }
    else { console.log(`  ❌ ${name}`); console.log(`     期待: ${expected}`); console.log(`     実際: ${actual}`); failed++; }
}

console.log("=== 1. 基本変換テスト ===");
test("rgbaToHex: rgba(255,0,0,0.5)", rgbaToHex("rgba(255, 0, 0, 0.5)"), "#ff000080");
test("rgbaToHex: rgb(255,0,0)", rgbaToHex("rgb(255, 0, 0)"), "#ff0000");
test("hexToRgba: #ff0000", hexToRgba("#ff0000"), "rgb(255, 0, 0)");
test("hexToRgba: #ff000080", hexToRgba("#ff000080"), "rgba(255, 0, 0, 0.50)");
test("hexToRgba: #f00", hexToRgba("#f00"), "rgb(255, 0, 0)");
test("hexPercentToRgba: #ff0000 50%", hexPercentToRgba("#ff0000 50%"), "rgba(255, 0, 0, 0.50)");
test("hexPercentToRgba: #ff0000-75%", hexPercentToRgba("#ff0000-75%"), "rgba(255, 0, 0, 0.75)");
test("hexPercentToRgba: #ff0000,25%", hexPercentToRgba("#ff0000,25%"), "rgba(255, 0, 0, 0.25)");
test("hexPercentToRgba: #ff0000 100%", hexPercentToRgba("#ff0000 100%"), "rgb(255, 0, 0)");
test("hexPercentToRgba: #f00 50%", hexPercentToRgba("#f00 50%"), "rgba(255, 0, 0, 0.50)");

console.log("\n=== 2. autoConvertColor テスト ===");
test("auto: #ff0000 → rgb", autoConvertColor("#ff0000"), "rgb(255, 0, 0)");
test("auto: rgba(255,0,0,0.5) → hex", autoConvertColor("rgba(255, 0, 0, 0.5)"), "#ff000080");
test("auto: #ff0000 50% → rgba", autoConvertColor("#ff0000 50%"), "rgba(255, 0, 0, 0.50)");
test("auto: 無効な値", autoConvertColor("hello"), null);

console.log("\n=== 3. extractColorCodes テスト ===");
{
    const codes = extractColorCodes("color: #ff0000; background: rgba(0, 255, 0, 0.5);");
    test("抽出数: 2つ", codes.length, 2);
    test("1番目: #ff0000", codes[0]?.text, "#ff0000");
    test("2番目: rgba(0, 255, 0, 0.5)", codes[1]?.text, "rgba(0, 255, 0, 0.5)");
}
{
    const codes = extractColorCodes("color: #ff0000 50%; background: #00ff00;");
    test("HEX+%含む抽出数: 2つ", codes.length, 2);
    test("1番目: #ff0000 50%", codes[0]?.text, "#ff0000 50%");
    test("2番目: #00ff00", codes[1]?.text, "#00ff00");
}

console.log("\n=== 4. 二重#問題テスト ===");
{
    const converter = (s) => {
        if (HEX_PERCENT_PATTERN.test(s)) { const r = hexPercentToRgba(s); return r ? rgbaToHex(r) : null; }
        return null;
    };
    const r1 = convertAndReplaceColors("color: #ff0000 50%;", converter);
    test("二重#なし: #ff0000 50%", r1, "color: #ff000080;");
    const r2 = convertAndReplaceColors("a: #ff0000 50%; b: #00ff00-75%;", converter);
    test("二重#なし: 複数", r2, "a: #ff000080; b: #00ff00bf;");
}

console.log("\n=== 5. smartAutoConvertColors テスト ===");
test("HEX多数→HEX統一",
    smartAutoConvertColors(".t { color: #ff0000; background: rgba(0, 255, 0, 0.5); border: #0000ff; }"),
    ".t { color: #ff0000; background: #00ff0080; border: #0000ff; }");
test("RGBA多数→RGBA統一",
    smartAutoConvertColors(":root { --a: rgba(255, 0, 0, 0.8); --b: rgba(0, 255, 0, 0.6); --c: #ffffff; }"),
    ":root { --a: rgba(255, 0, 0, 0.8); --b: rgba(0, 255, 0, 0.6); --c: rgb(255, 255, 255); }");
test("RGBのみ→HEX統一",
    smartAutoConvertColors(".t { color: rgb(255, 0, 0); background: rgb(0, 255, 0); border: rgb(0, 0, 255); }"),
    ".t { color: #ff0000; background: #00ff00; border: #0000ff; }");
test("純粋HEXのみ→変換なし",
    smartAutoConvertColors(".t { color: #ff0000; background: #00ff00; }"),
    null);
test("HEX+%混在→HEX統一",
    smartAutoConvertColors(".t { color: #ff0000 50%; background: rgba(0, 255, 0, 0.8); border: #0000ff; }"),
    ".t { color: #ff000080; background: #00ff00cc; border: #0000ff; }");

console.log("\n=== 6. 個別コマンドでのHEX+%テスト ===");
{
    // convertRgbaToHex相当
    const enhancedToHex = (s) => {
        if (HEX_PERCENT_PATTERN.test(s)) { const r = hexPercentToRgba(s); return r ? rgbaToHex(r) : null; }
        return rgbaToHex(s);
    };
    test("⌃⌘H: #ff0000 50%", convertAndReplaceColors("color: #ff0000 50%;", enhancedToHex), "color: #ff000080;");
    
    // convertHexToRgba相当
    const enhancedToRgba = (s) => {
        if (HEX_PERCENT_PATTERN.test(s)) return hexPercentToRgba(s);
        return hexToRgba(s);
    };
    test("⌃⌘R: #ff0000 50%", convertAndReplaceColors("color: #ff0000 50%;", enhancedToRgba), "color: rgba(255, 0, 0, 0.50);");
}

console.log("\n=== 7. 範囲外の値テスト ===");
test("rgbaToHex: rgb(300,0,0) → null", rgbaToHex("rgb(300, 0, 0)"), null);
test("rgbaToHex: rgba(0,0,0,1.5) → null", rgbaToHex("rgba(0, 0, 0, 1.5)"), null);
test("hexPercentToRgba: #ff0000 150% → null", hexPercentToRgba("#ff0000 150%"), null);
test("hexToRgba: 無効HEX → null", hexToRgba("hello"), null);
test("autoConvertColor: background → null", autoConvertColor("background"), null);

console.log(`\n=== 結果: ${passed}/${passed + failed} パス ===`);
if (failed === 0) console.log("🎉 すべてのテストがパスしました！");
else console.log(`⚠️  ${failed}件のテストが失敗しました。`);
