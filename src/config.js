// In production, the API and WebSocket URLs will be relative to the current domain
const isProd = import.meta.env.PROD;

export const API_BASE_URL = isProd ? '' : 'http://localhost:3000';
export const WS_BASE_URL = isProd ? window.location.origin : 'ws://localhost:3000';