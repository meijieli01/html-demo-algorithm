/**
 * https://developer.mozilla.org/en-US/docs/Web/API/Window/queryLocalFonts
 * @returns 
 */
export async function returnChineseFonts() {
    if (!window.queryLocalFonts) return [];
    const availableFonts = await window.queryLocalFonts({
        // postscriptNames: ["Verdana", "Verdana-Bold", "Verdana-Italic"],
        postscriptNames: ["MicrosoftYaHei", "SimSun"],
    });
  
    return availableFonts;
}
  
export async function logFontData() {
    try {
        const availableFonts = await window.queryLocalFonts();
        for (const fontData of availableFonts) {
            console.log(fontData.postscriptName);
            console.log(fontData.fullName);
            console.log(fontData.family);
            console.log(fontData.style);
        }
    } catch (err) {
        console.error(err.name, err.message);
    }
}
  