// A function that can be called to unsubscribe a listener.
type Unsubscribe = () => void;

const BROADCAST_CHANNEL_NAME = 'ws-bookings';
// Use a separate key for localStorage signaling to avoid overwriting booking data.
const STORAGE_KEY_SIGNAL = 'websankul_studio_bookings_signal';

let bc: BroadcastChannel | null = null;
let listeners: Array<() => void> = [];

const handleMessage = (ev?: MessageEvent | StorageEvent) => {
    // Check for BroadcastChannel message
    if (ev && 'data' in ev && ev.data?.type === 'bookings-changed') {
        listeners.forEach((fn) => fn());
        return;
    }
    // Check for StorageEvent signal (from another tab)
    if (ev && 'key' in ev && ev.key === STORAGE_KEY_SIGNAL) {
        listeners.forEach((fn) => fn());
        return;
    }
};

// Optional: URL of your SSE/WebSocket endpoint that emits "bookings-changed"
// For SSE, the server should send: event: bookings-changed\n data: {}\n\n
const SSE_URL = (import.meta as any)?.env?.VITE_BOOKINGS_SSE_URL || '';

let closeSSE: (() => void) | undefined;

export function initRealtimeChannels() {
  // BroadcastChannel for same-origin tabs/windows
  try {
    if (!bc) {
      bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      bc.onmessage = handleMessage;
    }
  } catch {
    bc = null;
  }
  
  // Use storage event as a fallback if BroadcastChannel is not available.
  window.addEventListener('storage', handleMessage);

  // Optional: connect to SSE for multi-device push
  let es: EventSource | null = null;

  if (SSE_URL) {
    try {
      es = new EventSource(SSE_URL, { withCredentials: false });
      es.addEventListener('bookings-changed', () => {
        listeners.forEach((fn) => fn());
      });
      es.onmessage = () => {
        // generic message -> also trigger
        listeners.forEach((fn) => fn());
      };
      es.onerror = () => {
        // silently ignore disconnects; browser will try to reconnect
      };
      closeSSE = () => {
        try {
          es?.close();
        } catch {}
      };
    } catch {
      // ignore
    }
  }
}

export function teardownRealtimeChannels() {
  if (bc) {
    try {
      bc.close();
    } catch {}
  }
  bc = null;
  window.removeEventListener('storage', handleMessage);
  if (closeSSE) {
      closeSSE();
  }
}

export function onBookingsChangeSignal(cb: () => void): Unsubscribe {
  listeners.push(cb);
  return () => {
    listeners = listeners.filter((f) => f !== cb);
  };
}

export function notifyBookingsChanged() {
  // 1) BroadcastChannel to same-origin tabs
  try {
    bc?.postMessage({ type: 'bookings-changed', ts: Date.now() });
  } catch {
    // ignore
  }

  // 2) storage event fallback (fires in other tabs)
  try {
    // We use a different key to signal so we don't overwrite the actual bookings data.
    localStorage.setItem(STORAGE_KEY_SIGNAL, String(Date.now()));
  } catch {
    // ignore
  }
}