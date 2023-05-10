export function getBaseRoot() {
    return ['development'].includes(process.env.NODE_ENV) ? '/' : '/web/';
} 

export function getFavicon() {
    return ['development'].includes(process.env.NODE_ENV) ? '/beta.png' : '/web/beta.svg';
}

export const vInfo = {
    'IMPLANT': {
        version: '0.3.0',
        changelog: [
            '2023-5-10',
            '1. Adding the ability to predict the position of multiple single tooth implants.',
            '2. Adding the ability to segment the mandibular nerve.',
            '2023-5-5',
            '1. Adding the ability to predict the position of multiple single tooth implants',
        ],
    },
    'CROWN': {
        version: '0.2.0',
        changelog: [
            '2023-4-23',
            '1. Now supports crown generation for tooth 14 and 15 (in FDI)',
            '2. Fix bugs',
        ],
    },
    'AI_NightGuard': {
        version: '1.5.0',
        changelog: [
            '2023-4-23',
            '1. Updated with loose teeth problem Improvement.',
        ],
    },
    'AI_BracketRemove': {
        version: '0.3.0',
        changelog: [
            '2023-4-23',
            '1. New orientor and segmentor (trained from 10000 teeth) are deployed now.',
        ],
    },
    'pmp_retainer': {
        version: '',
        changelog: [
        ],
    },
}

export const drcPathPrefix = `${getBaseRoot()}js/libs/draco/`;