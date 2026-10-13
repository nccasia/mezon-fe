import { socketState } from './socketState';

export type HealthyEndpointPayload = {
	api_url?: string;
	ws_url?: string;
	tcp_url?: string;
	session_id?: string;
	user_id?: string;
};

/**
 * What asking the gateway for a healthy node ended up doing.
 * `rejected` is the only answer that proves the session itself is gone — the gateway refused the
 * credential. `unreachable` means we never got an answer at all, which is what "no internet" looks
 * like. Everything else means the session is fine and only the node is in trouble.
 */
export type HealthyEndpointResult = 'changed' | 'same' | 'skipped' | 'failed' | 'rejected' | 'unreachable';

// Every answer mints a new session id on the gateway (10 slots per user), so asking too often
// can evict this user's other devices. Ask at most this often, and back off after a failure.
// A socket that cannot connect is often the user's own network (a slow link, a laptop waking up),
// not a bad node, and the gateway mints a session id for every answer. So the gap between asks
// doubles while an outage lasts instead of staying at a flat rate.
const MIN_INTERVAL_MS = 15000;
const MAX_INTERVAL_MS = 60000;
const FAILURE_BACKOFF_MS = 60000;
const REQUEST_TIMEOUT_MS = 8000;
// The paths that ignore the throttle (we are about to log the user out) repeat for as long as the
// outage lasts, so they get a budget instead: enough to find a live node, not enough to churn
// through the user's ten gateway session slots. Reset once a socket is up again.
const MAX_FORCED_ASKS_PER_OUTAGE = 3;
// Even the paths that ignore the throttle keep a floor between asks: bootstrap, the streak handler
// and the wave can all decide to ask within the same second, and each answer costs a session slot.
const MIN_GAP_BETWEEN_ASKS_MS = 5000;

// mezon-js watches how long its own requests take and fires this when the fast rate drops below
// 95% over a 60-request window. Desktop reacts to the same kind of signal, with two guards so a
// user's own bad link is not mistaken for a bad node: only once we have been on the node long
// enough to judge it, and at most once every couple of minutes.
export const CHECK_HEALTHY_EVENT = 'CHECK_HEALTHY';
const SETTLED_ON_NODE_MS = 120000;
const SLOW_REPORT_COOLDOWN_MS = 120000;

let nextAllowedAt = 0;
let lastAskAt = 0;
let nextInterval = MIN_INTERVAL_MS;
let forcedAsks = 0;
let asking = false;
let connectedSince = 0;
let slowReportsDisabled = false;
let slowSuppressedUntil = 0;

export function noteSocketConnected(now: number = Date.now()): void {
	connectedSince = now;
	slowReportsDisabled = false;
	slowSuppressedUntil = 0;
}

export function noteSocketDisconnected(): void {
	connectedSince = 0;
}

/** True at most once per cooldown, and only once this node has had time to prove itself. */
export function shouldReportSlowNode(now: number = Date.now()): boolean {
	if (slowReportsDisabled || !connectedSince) {
		return false;
	}
	if (now - connectedSince < SETTLED_ON_NODE_MS || now < slowSuppressedUntil) {
		return false;
	}
	slowSuppressedUntil = now + SLOW_REPORT_COOLDOWN_MS;
	return true;
}

/** The gateway will not move us off this node, so stop asking it about how slow the node is. */
export function disableSlowReports(): void {
	slowReportsDisabled = true;
}

export function canAskHealthyEndpoint(force = false, now: number = Date.now()): boolean {
	if (asking || now - lastAskAt < MIN_GAP_BETWEEN_ASKS_MS) {
		return false;
	}
	return force ? forcedAsks < MAX_FORCED_ASKS_PER_OUTAGE : now >= nextAllowedAt;
}

export function beginHealthyEndpointAsk(force: boolean, now: number = Date.now()): void {
	asking = true;
	lastAskAt = now;
	if (force) {
		forcedAsks += 1;
	}
}

export function noteHealthyEndpointAsked(failed: boolean, now: number = Date.now()): void {
	asking = false;
	if (failed) {
		nextAllowedAt = now + FAILURE_BACKOFF_MS;
		nextInterval = MAX_INTERVAL_MS;
		return;
	}
	nextAllowedAt = now + nextInterval;
	nextInterval = Math.min(nextInterval * 2, MAX_INTERVAL_MS);
}

/** A socket that came up ends the outage: ask freely again the next time one goes down. */
export function resetHealthyEndpointThrottle(): void {
	nextAllowedAt = 0;
	lastAskAt = 0;
	nextInterval = MIN_INTERVAL_MS;
	forcedAsks = 0;
	asking = false;
}

// Keep the "how long have we been on this node" clock honest without every connect path having to
// remember to say so.
socketState.subscribe((status) => {
	if (status === 'connected') {
		noteSocketConnected();
	} else {
		noteSocketDisconnected();
	}
});

export type HealthyEndpointResponse = { status: number; payload: HealthyEndpointPayload | null };

export async function fetchHealthyEndpoint(basePath: string, credential: string): Promise<HealthyEndpointResponse> {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
	try {
		const response = await fetch(`${basePath}/v2/healthy/endpoint`, {
			method: 'GET',
			headers: { Authorization: `Bearer ${credential}` },
			signal: controller.signal
		});
		if (!response.ok) {
			console.error('[healthyEndpoint] gateway answered', response.status);
			return { status: response.status, payload: null };
		}
		try {
			return { status: response.status, payload: (await response.json()) as HealthyEndpointPayload };
		} catch (error) {
			// The gateway (or something standing in for it) answered, it just was not JSON. That is
			// not the network being down.
			console.error('[healthyEndpoint] could not read the answer', error);
			return { status: response.status, payload: null };
		}
	} catch (error) {
		console.error('[healthyEndpoint] request failed', error);
		return { status: 0, payload: null };
	} finally {
		clearTimeout(timeout);
	}
}
