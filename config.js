export function getBaseRoot() {
    return ['development'].includes(process.env.NODE_ENV) ? '/' : '/web/';
} 

export function getFavicon() {
    return ['development'].includes(process.env.NODE_ENV) ? '/beta.png' : '/web/beta.svg';
}

export const vInfo = {
    'CT': {
        version: '0.1.0',
        changelog: [

        ],
    },
    'CROWN': {
        version: '0.2.0',
        changelog: [
            'Now supports crown generation for tooth 14 and 15 (in FDI)',
            'Fix bugs',
        ],
    },
    'AI_NightGuard': {
        version: '1.5.0',
        changelog: [
            'Updated with loose teeth problem Improvement.',
        ],
    },
    'AI_BracketRemove': {
        version: '0.3.0',
        changelog: [
            'New orientor and segmentor (trained from 10000 teeth) are deployed now.',
        ],
    },
    'pmp_retainer': {
        version: '',
        changelog: [
        ],
    },
}