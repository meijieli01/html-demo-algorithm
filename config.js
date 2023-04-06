export function getBaseRoot() {
    return ['development'].includes(process.env.NODE_ENV) ? '/' : '/web/';
} 

export function getFavicon() {
    return ['development'].includes(process.env.NODE_ENV) ? '/beta.png' : '/web/beta.png';
} 