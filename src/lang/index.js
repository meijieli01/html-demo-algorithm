import { createI18n } from 'vue-i18n';

const zh_CN = {}
const en = {}
const modules = import.meta.glob('./langs/*.js', { eager: true })
for (const path in modules) {
    modules[path]().then((mod)=>{
        console.log(path, mod);
        if (mod.cn) Object.assign(zh_CN, mod.cn)
        if (mod.en) Object.assign(en, mod.en)
    })
}

export const i18n = createI18n({
    locale: 'en',
    fallbackLocale: 'en',
    messages: {
        zh_CN,
        en,
    },
})

export const t = i18n.global.t;
