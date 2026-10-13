export type RealtimeServerChoice = 'auto' | 'vn1' | 'vn2' | 'us';
export type PinnedRealtimeServer = Exclude<RealtimeServerChoice, 'auto'>;

export const REALTIME_SERVER_CHOICES: RealtimeServerChoice[] = ['auto', 'vn1', 'vn2', 'us'];

const REALTIME_SERVER_STORAGE_KEY = 'mezon_realtime_server';
export const REALTIME_SERVER_CHANGED_EVENT = 'mezon:realtime-server-changed';
const PROD_GATEWAY_HOST = 'gw.mezon.ai';

const PINNED_HOSTS: Record<PinnedRealtimeServer, string> = {
	vn1: 'sock.mezon.ai',
	vn2: 'sock3.mezon.ai',
	us: 'sock2.mezon.ai'
};

const REGION_NAMES: Record<PinnedRealtimeServer, string> = {
	vn1: 'VN1',
	vn2: 'VN2',
	us: 'US'
};

const listeners = new Set<(choice: RealtimeServerChoice) => void>();
let cachedChoice: RealtimeServerChoice | undefined;

const isChoice = (value: string | null): value is RealtimeServerChoice => !!value && (REALTIME_SERVER_CHOICES as string[]).includes(value);

// Only the production gateway hands out several realtime nodes, so pinning one is meaningless
// (and misleading) on builds that talk to anything else.
export const isRealtimeServerOffered = (): boolean => (process.env.NX_CHAT_APP_API_GW_HOST || '').trim().toLowerCase() === PROD_GATEWAY_HOST;

export function getRealtimeServerChoice(): RealtimeServerChoice {
	if (!isRealtimeServerOffered()) {
		return 'auto';
	}
	if (cachedChoice) {
		return cachedChoice;
	}
	try {
		const stored = localStorage.getItem(REALTIME_SERVER_STORAGE_KEY);
		cachedChoice = isChoice(stored) ? stored : 'auto';
	} catch {
		cachedChoice = 'auto';
	}
	return cachedChoice;
}

export function setRealtimeServerChoice(choice: RealtimeServerChoice): void {
	if (!isRealtimeServerOffered() || getRealtimeServerChoice() === choice) {
		return;
	}
	cachedChoice = choice;
	try {
		localStorage.setItem(REALTIME_SERVER_STORAGE_KEY, choice);
	} catch (error) {
		console.error('Failed to save the realtime server choice:', error);
	}
	listeners.forEach((listener) => listener(choice));
}

// Another tab of the same browser shares the choice, so follow it there too.
if (typeof window !== 'undefined') {
	window.addEventListener('storage', (event) => {
		if (event.key !== REALTIME_SERVER_STORAGE_KEY || !isRealtimeServerOffered()) {
			return;
		}
		const next = isChoice(event.newValue) ? event.newValue : 'auto';
		if (next === cachedChoice) {
			return;
		}
		cachedChoice = next;
		listeners.forEach((listener) => listener(next));
		window.dispatchEvent(new CustomEvent(REALTIME_SERVER_CHANGED_EVENT));
	});
}

export function subscribeRealtimeServerChoice(listener: (choice: RealtimeServerChoice) => void): () => void {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
}

export function realtimeServerHost(choice: RealtimeServerChoice): string | undefined {
	return choice === 'auto' ? undefined : PINNED_HOSTS[choice];
}

export function pinnedRealtimeServerHost(): string | undefined {
	return realtimeServerHost(getRealtimeServerChoice());
}

export const isRealtimeServerPinned = (): boolean => getRealtimeServerChoice() !== 'auto';

export function realtimeServerRegion(choice: RealtimeServerChoice): string | undefined {
	return choice === 'auto' ? undefined : REGION_NAMES[choice];
}

export function realtimeServerRegionOfHost(host?: string): string | undefined {
	const lower = host?.trim().toLowerCase();
	if (!lower) {
		return undefined;
	}
	const pinned = (Object.keys(PINNED_HOSTS) as PinnedRealtimeServer[]).find((choice) => PINNED_HOSTS[choice] === lower);
	return pinned ? REGION_NAMES[pinned] : undefined;
}
