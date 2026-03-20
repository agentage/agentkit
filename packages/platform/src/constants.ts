/** Default heartbeat interval (ms) */
export const HEARTBEAT_INTERVAL = 30_000;

/** Machine is considered offline after this many missed heartbeats (ms) */
export const OFFLINE_THRESHOLD = 3 * HEARTBEAT_INTERVAL; // 90_000

/** WebSocket reconnect delay base (ms) — with exponential backoff */
export const WS_RECONNECT_BASE = 1_000;

/** WebSocket reconnect delay max (ms) */
export const WS_RECONNECT_MAX = 30_000;
