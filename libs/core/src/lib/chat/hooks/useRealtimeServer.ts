import { socketState } from '@mezon/store';
import type { RealtimeServerChoice } from '@mezon/transport';
import {
	getRealtimeServerChoice,
	isRealtimeServerOffered,
	REALTIME_SERVER_CHANGED_EVENT,
	realtimeServerRegionOfHost,
	resolveConnectWsUrl,
	setRealtimeServerChoice,
	subscribeRealtimeServerChoice,
	useMezon
} from '@mezon/transport';
import { useCallback, useEffect, useState } from 'react';

export type RealtimeServerState = {
	choice: RealtimeServerChoice;
	/** Host the socket is pointed at — the pinned one, or the node the gateway handed out. */
	host?: string;
	/** `VN1` / `VN2` / `US` when the host is one of the known nodes. */
	region?: string;
	isConnected: boolean;
	isConnecting: boolean;
	isOffered: boolean;
	selectServer: (choice: RealtimeServerChoice) => void;
};

export function useRealtimeServer(): RealtimeServerState {
	const { clientRef, sessionRef } = useMezon();
	const [choice, setChoice] = useState<RealtimeServerChoice>(() => getRealtimeServerChoice());
	const [status, setStatus] = useState(() => socketState.status);

	useEffect(() => subscribeRealtimeServerChoice(setChoice), []);
	useEffect(() => socketState.subscribe(setStatus), []);

	const selectServer = useCallback(
		(next: RealtimeServerChoice) => {
			if (getRealtimeServerChoice() === next) {
				return;
			}
			const session = sessionRef.current;
			const previousHost = session ? resolveConnectWsUrl(session) : undefined;
			setRealtimeServerChoice(next);

			if (!session) {
				return;
			}
			if (resolveConnectWsUrl(session) === previousHost && clientRef.current?.isOpen?.()) {
				return;
			}
			window.dispatchEvent(new CustomEvent(REALTIME_SERVER_CHANGED_EVENT));
		},
		[clientRef, sessionRef]
	);

	const host = sessionRef.current ? resolveConnectWsUrl(sessionRef.current) : undefined;

	return {
		choice,
		host,
		region: realtimeServerRegionOfHost(host),
		isConnected: status === 'connected',
		isConnecting: status === 'connecting',
		isOffered: isRealtimeServerOffered(),
		selectServer
	};
}
