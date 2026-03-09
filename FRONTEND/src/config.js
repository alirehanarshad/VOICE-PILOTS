const isProd = import.meta.env.PROD;

export const API_BASE_URL = isProd
    ? 'https://your-production-url.com'
    : 'http://127.0.0.1:8000';

export const WS_BASE_URL = isProd
    ? 'wss://your-production-url.com'
    : 'ws://127.0.0.1:8000';

export const CONFIG = {
    API_URL: API_BASE_URL,
    WS_URL: WS_BASE_URL,
    ENDPOINTS: {
        CHAT: `${API_BASE_URL}/api/chat`,
        VOICE: `${API_BASE_URL}/api/voice`,
        MEMORY: `${API_BASE_URL}/api/memory`,
        WS_STREAM: `${WS_BASE_URL}/api/ws/stream`,
    }
};

export default CONFIG;
