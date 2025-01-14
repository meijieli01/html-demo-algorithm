/**
 * ui交互的类型
 */
export const UIType = {
    none: '',
    keyPoint: 'keyPoint',
    incisal: 'incisal',
    arrow: 'arrow',
}

export const UiScreenType = {
    size16to9: 0x1,      // 1920 / 1080 = 1.777 大多数笔记本小于此值
    size21to9: 0x2,    // 2560 / 1080 = 2.37 Philips宽屏，设计使用
}
export const UiConfig = {
    screenWidth: 1920,
    screenHeight: 1080,
    w2h: 1920/1080,
    screenType: UiScreenType.size16to9,
    className: 'size16to9',
}

export function testUiAdapter(options = {}) {
    // 网页
    UiConfig.screenWidth = screen.width;
    UiConfig.screenHeight = screen.height;
    UiConfig.w2h = screen.width / screen.height;
    UiConfig.className = 'size16to9';
    if (UiConfig.w2h < 1.8) { // 16 / 9 = 1.777...
        UiConfig.screenType = UiScreenType.size16to9;
    } else if (UiConfig.w2h > 2.33) { // 21 / 9 = 2.3333
        UiConfig.screenType = UiScreenType.size21to9;
        UiConfig.className = 'size21to9';
    } else {
        UiConfig.screenType = UiScreenType.size16to9;
    }
}