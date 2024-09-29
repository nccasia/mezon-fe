import { DeviceUUID } from 'device-uuid';
import { Client, DefaultSocket, Session, Socket } from 'mezon-js';
import { WebSocketAdapterPb } from 'mezon-js-protobuf';
import React, { useCallback } from 'react';
import { CreateMezonClientOptions, createClient as createMezonClient } from '../mezon';

const MAX_WEBSOCKET_FAILS = 8;
const MIN_WEBSOCKET_RETRY_TIME = 3000;
const MAX_WEBSOCKET_RETRY_TIME = 300000;
const JITTER_RANGE = 2000;

type MezonContextProviderProps = {
	children: React.ReactNode;
	mezon: CreateMezonClientOptions;
	connect?: boolean;
	isFromMobile?: boolean;
};

type Sessionlike = {
	token: string;
	refresh_token: string;
	created: boolean;
};

export type MezonContextValue = {
	clientRef: React.MutableRefObject<Client | null>;
	sessionRef: React.MutableRefObject<Session | null>;
	socketRef: React.MutableRefObject<Socket | null>;
	createClient: () => Promise<Client>;
	authenticateEmail: (email: string, password: string) => Promise<Session>;
	authenticateDevice: (username: string) => Promise<Session>;
	authenticateGoogle: (token: string) => Promise<Session>;
	authenticateApple: (token: string) => Promise<Session>;
	logOutMezon: () => Promise<void>;
	refreshSession: (session: Sessionlike) => Promise<Session>;
	reconnectWithTimeout: (clanId: string) => Promise<unknown>;
};

const MezonContext = React.createContext<MezonContextValue>({} as MezonContextValue);

const MezonContextProvider: React.FC<MezonContextProviderProps> = ({ children, mezon, connect, isFromMobile = false }) => {
	const clientRef = React.useRef<Client | null>(null);
	const sessionRef = React.useRef<Session | null>(null);
	const socketRef = React.useRef<Socket | null>(null);

	const createSocket = useCallback(async () => {
		if (!clientRef.current) {
			throw new Error('Mezon client not initialized');
		}
		const socket = clientRef.current.createSocket(clientRef.current.useSSL, false, new WebSocketAdapterPb());
		socketRef.current = socket;
		return socket;
	}, [clientRef, socketRef]);

	const createClient = useCallback(async () => {
		const client = await createMezonClient(mezon);
		clientRef.current = client;
		return client;
	}, [mezon]);

	const authenticateEmail = useCallback(
		async (email: string, password: string) => {
			if (!clientRef.current) {
				throw new Error('Mezon client not initialized');
			}
			const session = await clientRef.current.authenticateEmail(email, password);
			sessionRef.current = session;

			const socket = await createSocket(); // Create socket after authentication
			socketRef.current = socket;

			if (!socketRef.current) {
				return session;
			}

			const session2 = await socketRef.current.connect(session, true);
			sessionRef.current = session2;

			return session;
		},
		[createSocket]
	);

	const authenticateGoogle = useCallback(
		async (token: string) => {
			if (!clientRef.current) {
				throw new Error('Mezon client not initialized');
			}
			const session = await clientRef.current.authenticateGoogle(token);
			sessionRef.current = session;

			const socket = await createSocket(); // Create socket after authentication
			socketRef.current = socket;

			if (!socketRef.current) {
				return session;
			}

			const session2 = await socketRef.current.connect(session, true);
			sessionRef.current = session2;

			return session;
		},
		[createSocket]
	);

	const authenticateApple = useCallback(
		async (token: string) => {
			if (!clientRef.current) {
				throw new Error('Mezon client not initialized');
			}
			const session = await clientRef.current.authenticateApple(token);
			sessionRef.current = session;

			const socket = await createSocket(); // Create socket after authentication
			socketRef.current = socket;

			if (!socketRef.current) {
				return session;
			}

			const session2 = await socketRef.current.connect(session, true);
			sessionRef.current = session2;

			return session;
		},
		[createSocket]
	);

	const logOutMezon = useCallback(async () => {
		if (socketRef.current) {
			socketRef.current.ondisconnect = () => {
				console.log('loged out');
			};
			await socketRef.current.disconnect(false);
			socketRef.current = null;
		}

		if (clientRef.current && sessionRef.current) {
			await clientRef.current.sessionLogout(sessionRef.current, sessionRef.current?.token, sessionRef.current?.refresh_token);
		}

		sessionRef.current = null;
	}, [socketRef]);

	const authenticateDevice = useCallback(
		async (username: string) => {
			if (!clientRef.current) {
				throw new Error('Mezon client not initialized');
			}

			const deviceId = new DeviceUUID().get();

			const session = await clientRef.current.authenticateDevice(deviceId, true, username);
			sessionRef.current = session;

			return session;
		},
		[clientRef]
	);

	const refreshSession = useCallback(
		async (session: Sessionlike) => {
			if (!clientRef.current) {
				throw new Error('Mezon client not initialized');
			}
			const newSession = await clientRef.current.sessionRefresh(new Session(session.token, session.refresh_token, session.created));
			sessionRef.current = newSession;

			if (!socketRef.current) {
				return newSession;
			}

			const session2 = await socketRef.current.connect(newSession, true);
			sessionRef.current = session2;
			return newSession;
		},
		[clientRef, socketRef]
	);

	const abortControllerRef = React.useRef<AbortController | null>(null);
	const timeoutIdRef = React.useRef<NodeJS.Timeout | null>(null);

	const reconnect = React.useCallback(
		async (clanId: string) => {
			if (!clientRef.current) {
				return Promise.resolve(null);
			}

			const session = sessionRef.current;

			if (!session) {
				return Promise.resolve(null);
			}

			if (!socketRef.current) {
				return Promise.resolve(null);
			}

			if (abortControllerRef.current) {
				abortControllerRef.current.abort();
			}

			abortControllerRef.current = new AbortController();
			const signal = abortControllerRef.current.signal;

			// eslint-disable-next-line no-async-promise-executor
			return new Promise(async (resolve, reject) => {
				let failCount = 0;

				signal.addEventListener('abort', () => {
					if (timeoutIdRef.current) {
						clearTimeout(timeoutIdRef.current);
						return resolve('RECONNECTING');
					}
				});

				const retry = async () => {
					if (failCount >= MAX_WEBSOCKET_FAILS) {
						return reject('Cannot reconnect to the socket. Please restart the app.');
					}

					try {
						const socket = await createSocket();
						const newSession = await clientRef?.current?.sessionRefresh(
							new Session(session.token, session.refresh_token, session.created)
						);
						const recsession = await socket.connect(newSession || session, true, DefaultSocket.DefaultConnectTimeoutMs, signal);
						await socket.joinClanChat(clanId);
						socketRef.current = socket;
						sessionRef.current = recsession;
						return resolve(socket);
					} catch (error) {
						failCount++;
						const retryTime = isFromMobile
							? 0
							: Math.min(MIN_WEBSOCKET_RETRY_TIME * Math.pow(2, failCount), MAX_WEBSOCKET_RETRY_TIME) + Math.random() * JITTER_RANGE;
						await new Promise((res) => {
							timeoutIdRef.current = setTimeout(res, retryTime);
						});

						!socketRef.current?.isOpen() && (await retry());
					}
				};

				!socketRef.current?.isOpen() && (await retry());
			});
		},
		[createSocket, isFromMobile]
	);

	const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

	const reconnectWithTimeout = React.useCallback(
		(clanId: string) => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
			return new Promise((resolve, reject) => {
				timeoutRef.current = setTimeout(() => {
					reconnect(clanId).then(resolve).catch(reject);
				}, 500);
			});
		},
		[reconnect]
	);

	const value = React.useMemo<MezonContextValue>(
		() => ({
			clientRef,
			sessionRef,
			socketRef,
			createClient,
			authenticateDevice,
			authenticateEmail,
			authenticateGoogle,
			authenticateApple,
			refreshSession,
			createSocket,
			logOutMezon,
			reconnectWithTimeout
		}),
		[
			clientRef,
			sessionRef,
			socketRef,
			createClient,
			authenticateDevice,
			authenticateEmail,
			authenticateGoogle,
			authenticateApple,
			refreshSession,
			createSocket,
			logOutMezon,
			reconnectWithTimeout
		]
	);

	React.useEffect(() => {
		if (connect) {
			createClient().then(() => {
				return createSocket();
			});
		}
	}, [connect, createClient, createSocket]);

	return <MezonContext.Provider value={value}>{children}</MezonContext.Provider>;
};

const MezonContextConsumer = MezonContext.Consumer;

export type MezonSuspenseProps = {
	children: React.ReactNode;
};

const MezonSuspense: React.FC<MezonSuspenseProps> = ({ children }: MezonSuspenseProps) => {
	const { clientRef, sessionRef, socketRef } = React.useContext(MezonContext);
	if (!clientRef.current || !sessionRef.current || !socketRef.current) {
		return <>Loading...</>;
	}
	// eslint-disable-next-line react/jsx-no-useless-fragment
	return <>{children}</>;
};

export { MezonContext, MezonContextConsumer, MezonContextProvider, MezonSuspense };
