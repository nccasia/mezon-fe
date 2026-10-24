import { Client } from 'mezon-js';
import { DongClient, IndexerClient, MmnClient, ZkClient } from 'mmn-client-js';

export interface SfuBreakoutParticipant {
	channel_id: string;
	user_ids: string[];
}

export interface SfuBreakoutRoomRequest {
	parent_channel_id: string;
	room_count: number;
	break_rule_type: number;
	list_participants: SfuBreakoutParticipant[];
}

export interface SfuBreakoutRoomResponse {
	breakout_id: string;
	room_count: number;
	break_rule_type: number;
	list_child_rooms: string[];
}

export interface SfuBreakoutMergeRequest {
	target_id: string;
}

export interface SfuBreakoutRoomEventPayload {
	channel_id?: string;
	token?: string;
	self_select_ids?: string[];
}

const API_INDEX_SFU_BREAKOUT_ROOM = 215;
const API_INDEX_SFU_BREAKOUT_MERGE = 216;
const DEFAULT_BREAKOUT_TIMEOUT_MS = 30000;
const ENVELOPE_FIELD_SFU_BREAKOUT_ROOM_EVENT = 105;
const MASK_64 = (1n << 64n) - 1n;

function writeVarint64(out: number[], value: bigint): void {
	let v = value & MASK_64;
	while (v >= 0x80n) {
		out.push(Number((v & 0x7fn) | 0x80n));
		v >>= 7n;
	}
	out.push(Number(v));
}

function writeVarint32(out: number[], value: number): void {
	writeVarint64(out, BigInt(value >>> 0));
}

function writeTag(out: number[], fieldNumber: number, wireType: number): void {
	writeVarint32(out, (fieldNumber << 3) | wireType);
}

function writeInt64StringField(out: number[], fieldNumber: number, raw: string | undefined): void {
	if (!raw || raw === '0') {
		return;
	}
	try {
		const val = BigInt(raw);
		if (val === 0n) {
			return;
		}
		writeTag(out, fieldNumber, 0);
		writeVarint64(out, val);
	} catch {
		// ignore invalid int64 string
	}
}

function writeInt32Field(out: number[], fieldNumber: number, val: number | undefined): void {
	if (!val) {
		return;
	}
	writeTag(out, fieldNumber, 0);
	writeVarint64(out, BigInt(Math.trunc(val)));
}

function writeBytesField(out: number[], fieldNumber: number, payload: Uint8Array | number[]): void {
	writeTag(out, fieldNumber, 2);
	writeVarint32(out, payload.length);
	for (let i = 0; i < payload.length; i += 1) {
		out.push(payload[i]);
	}
}

function encodeSfuBreakoutParticipant(p: SfuBreakoutParticipant): number[] {
	const out: number[] = [];
	writeInt64StringField(out, 1, p.channel_id);
	if (Array.isArray(p.user_ids) && p.user_ids.length > 0) {
		const packed: number[] = [];
		for (const uid of p.user_ids) {
			try {
				writeVarint64(packed, BigInt(uid));
			} catch {
				// ignore invalid id
			}
		}
		if (packed.length > 0) {
			writeBytesField(out, 2, packed);
		}
	}
	return out;
}

export function encodeSfuBreakoutRoomRequest(req: SfuBreakoutRoomRequest): Uint8Array {
	const out: number[] = [];
	writeInt64StringField(out, 1, req.parent_channel_id);
	writeInt32Field(out, 2, req.room_count);
	writeInt32Field(out, 3, req.break_rule_type);
	if (Array.isArray(req.list_participants)) {
		for (const item of req.list_participants) {
			const encodedItem = encodeSfuBreakoutParticipant(item);
			writeBytesField(out, 4, encodedItem);
		}
	}
	return new Uint8Array(out);
}

export function encodeSfuBreakoutMergeRequest(req: SfuBreakoutMergeRequest): Uint8Array {
	const out: number[] = [];
	writeInt64StringField(out, 1, req.target_id);
	return new Uint8Array(out);
}

function readVarint64(buf: Uint8Array, pos: number, end: number): [bigint, number] {
	let result = 0n;
	let shift = 0n;
	let cur = pos;
	while (cur < end) {
		const b = buf[cur];
		cur += 1;
		result |= BigInt(b & 0x7f) << shift;
		if ((b & 0x80) === 0) {
			return [BigInt.asIntN(64, result), cur];
		}
		shift += 7n;
		if (shift > 63n) {
			throw new Error('Malformed varint64');
		}
	}
	throw new Error('Unexpected EOF reading varint64');
}

function skipWireField(buf: Uint8Array, pos: number, end: number, wireType: number): number {
	switch (wireType) {
		case 0: {
			const [, next] = readVarint64(buf, pos, end);
			return next;
		}
		case 1:
			return Math.min(end, pos + 8);
		case 2: {
			const [len, next] = readVarint64(buf, pos, end);
			return Math.min(end, next + Number(len));
		}
		case 5:
			return Math.min(end, pos + 4);
		default:
			return end;
	}
}

export function decodeSfuBreakoutRoomResponse(buf: Uint8Array): SfuBreakoutRoomResponse {
	const res: SfuBreakoutRoomResponse = {
		breakout_id: '0',
		room_count: 0,
		break_rule_type: 0,
		list_child_rooms: []
	};
	let pos = 0;
	const end = buf.length;
	while (pos < end) {
		const [tagVal, afterTag] = readVarint64(buf, pos, end);
		pos = afterTag;
		const tag = Number(tagVal);
		const fieldNumber = tag >>> 3;
		const wireType = tag & 7;
		if (fieldNumber === 1 && wireType === 0) {
			const [val, next] = readVarint64(buf, pos, end);
			res.breakout_id = val.toString();
			pos = next;
		} else if (fieldNumber === 2 && wireType === 0) {
			const [val, next] = readVarint64(buf, pos, end);
			res.room_count = Number(val);
			pos = next;
		} else if (fieldNumber === 3 && wireType === 0) {
			const [val, next] = readVarint64(buf, pos, end);
			res.break_rule_type = Number(val);
			pos = next;
		} else if (fieldNumber === 4 && wireType === 0) {
			const [val, next] = readVarint64(buf, pos, end);
			res.list_child_rooms.push(val.toString());
			pos = next;
		} else if (fieldNumber === 4 && wireType === 2) {
			const [len, afterLen] = readVarint64(buf, pos, end);
			let packPos = afterLen;
			const packEnd = Math.min(end, packPos + Number(len));
			while (packPos < packEnd) {
				const [val, next] = readVarint64(buf, packPos, packEnd);
				res.list_child_rooms.push(val.toString());
				packPos = next;
			}
			pos = packEnd;
		} else {
			pos = skipWireField(buf, pos, end, wireType);
		}
	}
	return res;
}

export function decodeSfuBreakoutRoomEvent(buf: Uint8Array, start = 0, end = buf.length): SfuBreakoutRoomEventPayload {
	const out: SfuBreakoutRoomEventPayload = {
		channel_id: '0',
		token: '',
		self_select_ids: []
	};
	let pos = start;
	const textDecoder = new TextDecoder();
	while (pos < end) {
		const [tagVal, afterTag] = readVarint64(buf, pos, end);
		pos = afterTag;
		const tag = Number(tagVal);
		const fieldNumber = tag >>> 3;
		const wireType = tag & 7;
		if (fieldNumber === 1 && wireType === 0) {
			const [val, next] = readVarint64(buf, pos, end);
			out.channel_id = val.toString();
			pos = next;
		} else if (fieldNumber === 2 && wireType === 2) {
			const [len, afterLen] = readVarint64(buf, pos, end);
			const strEnd = Math.min(end, afterLen + Number(len));
			out.token = textDecoder.decode(buf.subarray(afterLen, strEnd));
			pos = strEnd;
		} else if (fieldNumber === 3 && wireType === 0) {
			const [val, next] = readVarint64(buf, pos, end);
			out.self_select_ids?.push(val.toString());
			pos = next;
		} else if (fieldNumber === 3 && wireType === 2) {
			const [len, afterLen] = readVarint64(buf, pos, end);
			let packPos = afterLen;
			const packEnd = Math.min(end, packPos + Number(len));
			while (packPos < packEnd) {
				const [val, next] = readVarint64(buf, packPos, packEnd);
				out.self_select_ids?.push(val.toString());
				packPos = next;
			}
			pos = packEnd;
		} else {
			pos = skipWireField(buf, pos, end, wireType);
		}
	}
	return out;
}

export function decodeEnvelopeBreakoutEvent(buf: Uint8Array): SfuBreakoutRoomEventPayload | null {
	if (buf.length < 2 || buf[0] === 255) {
		return null;
	}
	try {
		let pos = 0;
		const end = buf.length;
		let hasCid = false;
		let eventPayload: SfuBreakoutRoomEventPayload | null = null;
		while (pos < end) {
			const [tagVal, afterTag] = readVarint64(buf, pos, end);
			pos = afterTag;
			const tag = Number(tagVal);
			const fieldNumber = tag >>> 3;
			const wireType = tag & 7;
			if (fieldNumber === 1 && wireType === 0) {
				const [cidVal, next] = readVarint64(buf, pos, end);
				if (cidVal !== 0n) {
					hasCid = true;
				}
				pos = next;
			} else if (fieldNumber === 1 && wireType === 2) {
				const [len, afterLen] = readVarint64(buf, pos, end);
				if (len > 0n) {
					hasCid = true;
				}
				pos = Math.min(end, afterLen + Number(len));
			} else if (fieldNumber === ENVELOPE_FIELD_SFU_BREAKOUT_ROOM_EVENT && wireType === 2) {
				const [len, afterLen] = readVarint64(buf, pos, end);
				const msgEnd = Math.min(end, afterLen + Number(len));
				eventPayload = decodeSfuBreakoutRoomEvent(buf, afterLen, msgEnd);
				pos = msgEnd;
			} else {
				pos = skipWireField(buf, pos, end, wireType);
			}
		}
		return !hasCid ? eventPayload : null;
	} catch {
		return null;
	}
}

type PatchedAdapter = {
	_socket?: WebSocket;
};

type PatchedTransport = {
	adapter?: PatchedAdapter;
	getApiFromPath?: (apiName: string) => number | undefined;
	connect?: (
		url: string,
		sessionId: string,
		createStatus: boolean,
		verbose: boolean,
		handlers: {
			onOpen: () => void;
			onError: (evt: Event) => void;
			onClose: (evt: Event) => void;
			onMessage: (
				cid: number,
				code: number,
				envelope: { cid?: string; sfu_breakout_room_event?: SfuBreakoutRoomEventPayload }
			) => Promise<void>;
		},
		connectTimeoutMs?: number
	) => void;
	send?: (
		request: {
			urlPath: string;
			fetchOptions: {
				method: string;
				headers: Record<string, string>;
				body: Uint8Array;
			};
		},
		timeoutMs?: number
	) => Promise<{ code: number; message: Uint8Array }>;
	timeoutMs?: number;
};

export type PatchedMezonClient = Client & {
	onsfubreakoutroomevent?: (event: SfuBreakoutRoomEventPayload) => void;
};

const hookedSockets = new WeakSet<WebSocket>();

function patchClientBreakoutSupport(client: Client): PatchedMezonClient {
	const patched = client as PatchedMezonClient;
	const transport = (client as unknown as { transport?: PatchedTransport }).transport;
	if (!transport) {
		return patched;
	}

	if (typeof transport.getApiFromPath === 'function') {
		const origGetApiFromPath = transport.getApiFromPath.bind(transport);
		transport.getApiFromPath = (apiName: string) => {
			if (apiName === 'SfuBreakoutRoom') {
				return API_INDEX_SFU_BREAKOUT_ROOM;
			}
			if (apiName === 'SfuBreakoutMerge') {
				return API_INDEX_SFU_BREAKOUT_MERGE;
			}
			return origGetApiFromPath(apiName);
		};
	}

	if (typeof transport.connect === 'function') {
		const origConnect = transport.connect.bind(transport);
		transport.connect = (url, sessionId, createStatus, verbose, handlers, connectTimeoutMs) => {
			let handledByProtobufEnvelope = false;
			const origOnMessage = handlers.onMessage;
			const wrappedHandlers = {
				...handlers,
				onMessage: async (cid: number, code: number, envelope: { cid?: string; sfu_breakout_room_event?: SfuBreakoutRoomEventPayload }) => {
					if (!envelope?.cid && envelope?.sfu_breakout_room_event) {
						handledByProtobufEnvelope = true;
						patched.onsfubreakoutroomevent?.(envelope.sfu_breakout_room_event);
						return;
					}
					await origOnMessage(cid, code, envelope);
				}
			};
			origConnect(url, sessionId, createStatus, verbose, wrappedHandlers, connectTimeoutMs);

			const ws = transport.adapter?._socket;
			if (ws && !hookedSockets.has(ws)) {
				hookedSockets.add(ws);
				ws.addEventListener('message', (evt: MessageEvent) => {
					if (handledByProtobufEnvelope) {
						handledByProtobufEnvelope = false;
						return;
					}
					if (!(evt.data instanceof ArrayBuffer) && !ArrayBuffer.isView(evt.data)) {
						return;
					}
					const bytes =
						evt.data instanceof ArrayBuffer
							? new Uint8Array(evt.data)
							: new Uint8Array(evt.data.buffer, evt.data.byteOffset, evt.data.byteLength);
					const breakoutEvt = decodeEnvelopeBreakoutEvent(bytes);
					if (breakoutEvt) {
						patched.onsfubreakoutroomevent?.(breakoutEvt);
					}
				});
			}
		};
	}

	return patched;
}

export async function callSfuBreakoutRoom(client: Client, body: SfuBreakoutRoomRequest): Promise<SfuBreakoutRoomResponse> {
	const transport = (client as unknown as { transport?: PatchedTransport }).transport;
	if (!transport?.send) {
		throw new Error('Mezon transport is not initialized.');
	}
	const encoded = encodeSfuBreakoutRoomRequest(body);
	const timeoutMs = transport.timeoutMs ?? DEFAULT_BREAKOUT_TIMEOUT_MS;
	const res = await Promise.race([
		transport.send({
			urlPath: '/mezon.api.Mezon/SfuBreakoutRoom',
			fetchOptions: {
				method: 'POST',
				headers: { Accept: 'application/proto', 'Content-Type': 'application/proto' },
				body: encoded
			}
		}),
		new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Request timed out.')), timeoutMs))
	]);
	if (res.code !== 0) {
		throw res;
	}
	return decodeSfuBreakoutRoomResponse(new Uint8Array(res.message));
}

export async function callSfuBreakoutMerge(client: Client, body: SfuBreakoutMergeRequest): Promise<void> {
	const transport = (client as unknown as { transport?: PatchedTransport }).transport;
	if (!transport?.send) {
		throw new Error('Mezon transport is not initialized.');
	}
	const encoded = encodeSfuBreakoutMergeRequest(body);
	const timeoutMs = transport.timeoutMs ?? DEFAULT_BREAKOUT_TIMEOUT_MS;
	const res = await Promise.race([
		transport.send({
			urlPath: '/mezon.api.Mezon/SfuBreakoutMerge',
			fetchOptions: {
				method: 'POST',
				headers: { Accept: 'application/proto', 'Content-Type': 'application/proto' },
				body: encoded
			}
		}),
		new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Request timed out.')), timeoutMs))
	]);
	if (res.code !== 0) {
		throw res;
	}
}

export type CreateMezonClientOptions = {
	ssl: boolean;
	host: string;
	port: string;
	key: string;
};

export type CreateZkClientOptions = {
	endpoint: string;
	timeout?: number;
	headers?: Record<string, string>;
};

export type CreateDongClientOptions = {
	endpoint: string;
	timeout?: number;
	headers?: Record<string, string>;
};

export type CreateMmnClientOptions = {
	baseUrl: string;
	timeout?: number;
	headers?: Record<string, string>;
};

export type CreateIndexerClientOptions = {
	endpoint: string;
	chainId: string;
	timeout?: number;
};

export type CreateVoiceClientOptions = {
	appID: string;
	roomName: string;
	token: string;
};

export type VoiceConnectionCBFunction = () => void;

let clientInstance: Client;
let zkClientInstance: ZkClient;
let dongClientInstance: DongClient;
let mmnClientInstance: MmnClient;
let indexerClientInstance: IndexerClient;

export function getClient() {
	return clientInstance;
}

export function getZkClient() {
	return zkClientInstance;
}

export function getDongClient() {
	return dongClientInstance;
}

export function getMmnClient() {
	return mmnClientInstance;
}

export function getIndexerClient() {
	return indexerClientInstance;
}

export function createClient(options: CreateMezonClientOptions) {
	const { ssl, host, port, key } = options;
	const client = patchClientBreakoutSupport(new Client(key, host, port, ssl));
	clientInstance = client;
	return client;
}

export function createZkClient(options: CreateZkClientOptions) {
	const { endpoint, timeout = 30000, headers = { 'Content-Type': 'application/json' } } = options;
	const zkClient = new ZkClient({
		endpoint,
		timeout,
		headers
	});

	zkClientInstance = zkClient;

	return zkClient;
}

export function createDongClient(options: CreateDongClientOptions) {
	const { endpoint, timeout = 30000, headers = { 'Content-Type': 'application/json' } } = options;
	const dongClient = new DongClient({
		endpoint,
		timeout,
		headers
	});

	dongClientInstance = dongClient;

	return dongClient;
}

export function createMmnClient(options: CreateMmnClientOptions) {
	const { baseUrl, timeout = 30000, headers = { 'Content-Type': 'application/json' } } = options;
	const mmnClient = new MmnClient({
		baseUrl,
		timeout,
		headers
	});

	mmnClientInstance = mmnClient;

	return mmnClient;
}

export function createIndexerClient(options: CreateIndexerClientOptions) {
	const { endpoint, chainId, timeout = 10000 } = options;
	const indexerClient = new IndexerClient({
		endpoint,
		chainId,
		timeout
	});

	indexerClientInstance = indexerClient;

	return indexerClient;
}
