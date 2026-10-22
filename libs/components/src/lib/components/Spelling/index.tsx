import { selectComposeInputByChannelId, useAppSelector } from '@mezon/store';
import * as ort from 'onnxruntime-web';
import { useEffect, useRef, useState } from 'react';
import { MezonGrammarClient } from './mezon_grammar.js';

ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.18.0/dist/';
ort.env.wasm.numThreads = 1;
ort.env.wasm.proxy = false;

type GrammarClient = MezonGrammarClient;

const MODEL_URL = process.env.NX_MODEL_ONNX;
const ACCENT_MODEL_URL = process.env.NX_MODEL_ACCENT_ONNX;
const DEBOUNCE_DELAY = 120; //120ms

const Spelling = ({ channelId }: { channelId: string }) => {
	const draftRequest = useAppSelector((state) => selectComposeInputByChannelId(state, channelId));

	const clientRef = useRef<GrammarClient | null>(null);
	const initPromiseRef = useRef<Promise<GrammarClient> | null>(null);
	const requestIdRef = useRef(0);

	const [corrected, setCorrected] = useState('');
	const [pendingCorrection, setPendingCorrection] = useState('');

	// Khởi tạo grammar client và tải model.
	useEffect(() => {
		let cancelled = false;

		const initialize = async (): Promise<GrammarClient> => {
			if (!MODEL_URL || !ACCENT_MODEL_URL) {
				throw new Error('NOT FOUND CDN MODEL URL');
			}

			const client = new MezonGrammarClient() as GrammarClient;

			const results = await Promise.allSettled([client.loadModel(MODEL_URL, ort as any), client.loadAccentModel(ACCENT_MODEL_URL, ort as any)]);

			results.forEach((result, index) => {
				if (result.status === 'rejected') {
					console.error(index === 0 ? '[Spelling] Intent model load failed:' : '[Spelling] Accent model load failed:', result.reason);
				}
			});

			if (!client.isModelLoaded() && !client.isAccentModelLoaded()) {
				throw new Error('Không thể tải cả intent model và accent model');
			}

			if (!cancelled) {
				clientRef.current = client;
			}

			return client;
		};

		const promise = initialize();
		initPromiseRef.current = promise;

		void promise.catch((error: unknown) => {
			console.error('[Spelling] Initialization failed:', error);

			if (initPromiseRef.current === promise) {
				initPromiseRef.current = null;
			}
		});

		return () => {
			cancelled = true;
		};
	}, []);

	// Chỉ cập nhật corrected khi pendingCorrection không đổi trong 500ms.
	useEffect(() => {
		const timeoutId = setTimeout(() => {
			setCorrected(pendingCorrection);
		}, DEBOUNCE_DELAY);

		return () => {
			clearTimeout(timeoutId);
		};
	}, [pendingCorrection]);

	// Debounce nội dung đầu vào trước khi chạy model.
	useEffect(() => {
		const requestId = ++requestIdRef.current;
		const text = draftRequest?.content;
		const valueTextInput = draftRequest?.valueTextInput ?? '';

		if (typeof text !== 'string' || !text.trim()) {
			setPendingCorrection('');
			return;
		}

		const timeoutId = setTimeout(() => {
			const process = async () => {
				try {
					const initPromise = initPromiseRef.current;

					if (!clientRef.current && !initPromise) {
						return;
					}

					const client = clientRef.current ?? (await initPromise!);

					if (requestId !== requestIdRef.current) {
						return;
					}

					if (client.isModelLoaded() || client.isAccentModelLoaded()) {
						const result = await client.onKeystrokeAsync(text, 6, null);

						if (requestId !== requestIdRef.current) {
							return;
						}

						const correction = result.correction.corrected;

						setPendingCorrection(correction.trim() !== valueTextInput.trim() ? correction : '');
					}
				} catch (error) {
					if (requestId === requestIdRef.current) {
						console.error('[Spelling] Processing failed:', error);
					}
				}
			};

			void process();
		}, DEBOUNCE_DELAY);

		return () => {
			clearTimeout(timeoutId);
		};
	}, [draftRequest?.content, draftRequest?.valueTextInput]);

	if (!corrected) {
		return null;
	}

	return <div className="w-full h-8 px-4 pt-2 text-theme-primary bg-theme-setting-nav text-sm pb-1">{corrected}</div>;
};

export default Spelling;
