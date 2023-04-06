export function getBaseRoot() {
    return ['development'].includes(process.env.NODE_ENV) ? '/' : '/web/';
} 