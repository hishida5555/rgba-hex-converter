// クリップボード機能の実装例（将来的な拡張用）

// クリップボードからテキストを取得
async function getClipboardText() {
    try {
        const clipboardText = await nova.clipboard.readText();
        return clipboardText;
    } catch (error) {
        console.error("クリップボードの読み取りに失敗しました:", error);
        return null;
    }
}

// クリップボードにテキストを設定
async function setClipboardText(text) {
    try {
        await nova.clipboard.writeText(text);
        return true;
    } catch (error) {
        console.error("クリップボードの書き込みに失敗しました:", error);
        return false;
    }
}

// クリップボード内のカラーコードを変換する関数
async function convertClipboardColor(conversionType) {
    const clipboardText = await getClipboardText();
    
    if (!clipboardText) {
        nova.workspace.showErrorMessage("クリップボードが空です");
        return;
    }
    
    let convertedText;
    const trimmedText = clipboardText.trim();
    
    switch (conversionType) {
        case 'rgba-to-hex':
            convertedText = rgbaToHex(trimmedText);
            break;
        case 'hex-to-rgba':
            convertedText = hexToRgba(trimmedText);
            break;
        case 'auto':
            convertedText = autoConvertColor(trimmedText);
            break;
        default:
            nova.workspace.showErrorMessage("無効な変換タイプです");
            return;
    }
    
    if (convertedText) {
        const success = await setClipboardText(convertedText);
        if (success) {
            nova.workspace.showInformativeMessage(
                `クリップボードを変換しました:\n${trimmedText} → ${convertedText}`
            );
        }
    } else {
        nova.workspace.showWarningMessage(
            `"${trimmedText}" は有効なカラーコードではありません`
        );
    }
}

// クリップボード変換コマンドの登録例
nova.commands.register("convertClipboardRgbaToHex", async () => {
    await convertClipboardColor('rgba-to-hex');
});

nova.commands.register("convertClipboardHexToRgba", async () => {
    await convertClipboardColor('hex-to-rgba');
});

nova.commands.register("convertClipboardAuto", async () => {
    await convertClipboardColor('auto');
});
