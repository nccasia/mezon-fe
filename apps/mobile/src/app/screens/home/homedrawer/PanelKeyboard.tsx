import BottomSheet from '@gorhom/bottom-sheet';
import { ActionEmitEvent } from '@mezon/mobile-components';
import { useTheme } from '@mezon/mobile-ui';
import React, { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { DeviceEventEmitter, Keyboard, Platform, View } from 'react-native';
import { IModeKeyboardPicker } from './components';
import AttachmentPicker from './components/AttachmentPicker';
import BottomKeyboardPicker from './components/BottomKeyboardPicker';
import EmojiPicker from './components/EmojiPicker';

interface IProps {
	directMessageId?: string;
	currentChannelId: string;
	currentClanId: string;
}
const PanelKeyboard = React.forwardRef((props: IProps, ref) => {
	const { themeValue, theme } = useTheme();
	const [heightKeyboardShow, setHeightKeyboardShow] = useState<number>(0);
	const [typeKeyboardBottomSheet, setTypeKeyboardBottomSheet] = useState<IModeKeyboardPicker>('text');
	const bottomPickerRef = useRef<BottomSheet>(null);
	const timer = useRef<NodeJS.Timeout | null>(null);
	const onShowKeyboardBottomSheet = useCallback((isShow: boolean, height: number, type?: IModeKeyboardPicker) => {
		setHeightKeyboardShow(height);
		if (isShow) {
			if (type === 'attachment') {
				Keyboard.dismiss();
			}
			timer.current = setTimeout(() => {
				setTypeKeyboardBottomSheet(type);
				bottomPickerRef.current?.expand();
			}, 100);
		} else {
			setTypeKeyboardBottomSheet('text');
			bottomPickerRef.current?.forceClose();
		}
	}, []);

	useImperativeHandle(ref, () => ({
		onShowKeyboardBottomSheet
	}));

	useEffect(() => {
		return () => {
			timer?.current && clearTimeout(timer.current);
		};
	}, []);

	return (
		<>
			<View
				style={{
					height: Platform.OS === 'ios' || typeKeyboardBottomSheet !== 'text' ? heightKeyboardShow : 0,
					backgroundColor: theme === 'light' ? themeValue.tertiary : themeValue.secondary
				}}
			/>
			{heightKeyboardShow !== 0 && typeKeyboardBottomSheet !== 'text' && (
				<BottomKeyboardPicker height={heightKeyboardShow} ref={bottomPickerRef} isStickyHeader={typeKeyboardBottomSheet === 'emoji'}>
					{typeKeyboardBottomSheet === 'emoji' ? (
						<EmojiPicker
							onDone={() => {
								onShowKeyboardBottomSheet(false, heightKeyboardShow, 'text');
								DeviceEventEmitter.emit(ActionEmitEvent.SHOW_KEYBOARD, {});
							}}
							bottomSheetRef={bottomPickerRef}
							directMessageId={props?.directMessageId || ''}
						/>
					) : typeKeyboardBottomSheet === 'attachment' ? (
						<AttachmentPicker currentChannelId={props?.currentChannelId} currentClanId={props?.currentClanId} />
					) : (
						<View />
					)}
				</BottomKeyboardPicker>
			)}
		</>
	);
});
export default PanelKeyboard;
