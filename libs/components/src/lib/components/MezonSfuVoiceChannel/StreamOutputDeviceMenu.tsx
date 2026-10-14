import { Icons } from '@mezon/ui';
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { usePreferredOutputDevice } from './usePreferredOutputDevice';

const PANEL_WIDTH_PX = 260;

function deviceLabel(device: MediaDeviceInfo, systemDefaultLabel: string, unnamedLabel: string) {
	const label = device.label?.trim();
	if (label) return label;
	if (device.deviceId === 'default') return systemDefaultLabel;
	return unnamedLabel;
}

export function StreamOutputDeviceMenu() {
	const { t } = useTranslation('channelVoice');
	const { hasSetSinkId, outputDeviceId, outputDevices, changeOutputDevice } = usePreferredOutputDevice();
	const [open, setOpen] = useState(false);
	const buttonRef = useRef<HTMLButtonElement>(null);
	const panelRef = useRef<HTMLDivElement>(null);
	const [panelStyle, setPanelStyle] = useState<CSSProperties>();

	const systemDefaultLabel = t('device.systemDefault');
	const unnamedLabel = t('setting:voice.unnamedDevice', { defaultValue: 'Unnamed device' });

	const updatePanelPosition = useCallback(() => {
		const button = buttonRef.current;
		if (!button) return;
		const rect = button.getBoundingClientRect();
		const width = Math.min(PANEL_WIDTH_PX, window.innerWidth - 16);
		const left = Math.min(Math.max(8, rect.right - width), window.innerWidth - width - 8);
		setPanelStyle({
			position: 'fixed',
			left,
			width,
			bottom: window.innerHeight - rect.top + 8,
			zIndex: 10_000
		});
	}, []);

	useLayoutEffect(() => {
		if (!open) return;
		updatePanelPosition();
		window.addEventListener('resize', updatePanelPosition);
		window.addEventListener('scroll', updatePanelPosition, true);
		return () => {
			window.removeEventListener('resize', updatePanelPosition);
			window.removeEventListener('scroll', updatePanelPosition, true);
		};
	}, [open, updatePanelPosition]);

	useEffect(() => {
		if (!open) return;
		const handlePointerDown = (event: MouseEvent) => {
			const target = event.target as Node;
			if (buttonRef.current?.contains(target) || panelRef.current?.contains(target)) return;
			setOpen(false);
		};
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') setOpen(false);
		};
		document.addEventListener('mousedown', handlePointerDown);
		document.addEventListener('keydown', handleKeyDown);
		return () => {
			document.removeEventListener('mousedown', handlePointerDown);
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [open]);

	if (!hasSetSinkId || outputDevices.length === 0) return null;

	return (
		<>
			<button
				ref={buttonRef}
				type="button"
				className="p-1 rounded hover:bg-white/10 transition-colors"
				title={t('device.outputDevice')}
				aria-label={t('device.outputDevice')}
				aria-expanded={open}
				onClick={() => setOpen((prev) => !prev)}
			>
				<Icons.Speaker className="dark:text-[#AEAEAE] text-[#535353] dark:hover:text-white hover:text-black w-5 h-5" />
			</button>
			{open &&
				panelStyle &&
				createPortal(
					<div
						ref={panelRef}
						style={panelStyle}
						className="rounded-md border border-neutral-600 bg-neutral-800 shadow-lg text-white text-sm overflow-hidden"
						role="menu"
						aria-label={t('device.outputDevice')}
					>
						<div className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-neutral-400 border-b border-neutral-700">
							{t('device.outputDevice')}
						</div>
						<div className="max-h-[240px] overflow-y-auto">
							{outputDevices.map((device) => {
								const selected = device.deviceId === outputDeviceId;
								return (
									<button
										key={`${device.deviceId}-${device.groupId}`}
										type="button"
										role="menuitemradio"
										aria-checked={selected}
										className={`w-full px-3 py-2.5 text-left flex items-center gap-2 hover:bg-neutral-700 transition-colors ${
											selected ? 'bg-neutral-700/80 text-blue-300' : ''
										}`}
										onClick={() => {
											changeOutputDevice(device.deviceId);
											setOpen(false);
										}}
									>
										<span className="w-4 h-4 flex shrink-0 items-center justify-center">
											{selected ? <Icons.Check className="w-4 h-4" /> : null}
										</span>
										<span className="truncate">{deviceLabel(device, systemDefaultLabel, unnamedLabel)}</span>
									</button>
								);
							})}
						</div>
					</div>,
					document.body
				)}
		</>
	);
}
