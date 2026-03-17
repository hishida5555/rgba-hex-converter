// 簡単なテストで問題を特定
function hexPercentToRgba(hexPercentStr) {
    console.log(`入力: "${hexPercentStr}"`);
    const hexPercentPattern = /^#?([a-f\d]{3}|[a-f\d]{6})\s*[-,\s]\s*(\d+)%$/i;
    const match = hexPercentStr.match(hexPercentPattern);
    console.log(`マッチ結果:`, match);
    
    if (!match) return null;
    
    let hexPart = match[1];
    console.log(`HEX部分: "${hexPart}"`);
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

// テスト
console.log(hexPercentToRgba("#ff0000 50%"));
