import { TouchableOpacity, TouchableWithoutFeedback } from '@gorhom/bottom-sheet';
import { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { useChatSending } from '@mezon/core';
import { SearchIcon } from '@mezon/mobile-components';
import { Colors, Fonts } from '@mezon/mobile-ui';
import { selectCurrentChannel } from '@mezon/store-mobile';
import { IMessageSendPayload } from '@mezon/utils';
import { ChannelStreamMode } from 'mezon-js';
import { ApiMessageAttachment, ApiMessageMention, ApiMessageRef } from 'mezon-js/api.gen';
import React, { MutableRefObject, useCallback, useEffect, useState } from 'react';
import { Keyboard, Text, TextInput, View } from 'react-native';
import { useSelector } from 'react-redux';
import EmojiSelector from './EmojiSelector';
import GifSelector from './GifSelector';
import StickerSelector from './StickerSelector';
import styles from './styles';

export type IProps = {
	onDone: () => void;
	bottomSheetRef: MutableRefObject<BottomSheetMethods>;
};

interface TextTabProps {
	selected?: boolean;
	title: string;
	onPress: () => void;
}
function TextTab({ selected, title, onPress }: TextTabProps) {
	return (
		<View style={{ flex: 1 }}>
			<TouchableOpacity onPress={onPress} style={{ backgroundColor: selected ? Colors.green : 'transparent', ...styles.selected }}>
				<Text style={{ color: selected ? Colors.white : Colors.gray72, fontSize: Fonts.size.small, textAlign: 'center' }}>{title}</Text>
			</TouchableOpacity>
		</View>
	);
}

type ExpressionType = 'emoji' | 'gif' | 'sticker';

function EmojiPicker({ onDone, bottomSheetRef }: IProps) {
	const currentChannel = useSelector(selectCurrentChannel);
	const [mode, setMode] = useState<ExpressionType>('emoji');
	const [channelMode, setChannelMode] = useState(0);
	const [searchText, setSearchText] = useState<string>('');

	useEffect(() => {
		setChannelMode(ChannelStreamMode.STREAM_MODE_CHANNEL);
	}, []);

	const { sendMessage } = useChatSending({
		channelId: currentChannel?.id || '',
		channelLabel: currentChannel?.channel_label || '',
		mode: channelMode,
	});

	const handleSend = useCallback(
		(
			content: IMessageSendPayload,
			mentions?: Array<ApiMessageMention>,
			attachments?: Array<ApiMessageAttachment>,
			references?: Array<ApiMessageRef>,
		) => {
			sendMessage(content, mentions, attachments, references);
		},
		[sendMessage],
	);

	function handleSelected(type: ExpressionType, data: any) {
		if (type === 'gif') {
			handleSend({ t: '' }, [], [{ url: data }], []);
		} else if (type === 'sticker') {
			handleSend({ t: '' }, [], [{ url: data, height: 40, width: 40, filetype: 'image/gif' }], []);
		} else {
			console.log('handleSelected data', data);
		}

		onDone && onDone();
	}

	function handleInputSearchFocus() {
		bottomSheetRef && bottomSheetRef.current && bottomSheetRef.current.expand();
	}

	function handleInputSearchBlur() {
		Keyboard.dismiss();
	}

	return (
		<TouchableWithoutFeedback onPressIn={handleInputSearchBlur}>
			<View style={styles.container}>
				<View style={styles.tabContainer}>
					<TextTab title="Emoji" selected={mode === 'emoji'} onPress={() => setMode('emoji')} />
					<TextTab title="GIFs" selected={mode === 'gif'} onPress={() => setMode('gif')} />
					<TextTab title="Stickers" selected={mode === 'sticker'} onPress={() => setMode('sticker')} />
				</View>

				{mode !== 'emoji' && (
					<View style={styles.textInputWrapper}>
						<SearchIcon height={18} width={18} />
						<TextInput style={styles.textInput} onFocus={handleInputSearchFocus} onChangeText={setSearchText} />
					</View>
				)}

				{mode === 'emoji' ? (
					<EmojiSelector onSelected={(url) => handleSelected('emoji', url)} searchText={searchText} />
				) : mode === 'gif' ? (
					<GifSelector onSelected={(url) => handleSelected('gif', url)} searchText={searchText} />
				) : (
					<StickerSelector onSelected={(url) => handleSelected('sticker', url)} searchText={searchText} />
				)}
			</View>
		</TouchableWithoutFeedback>
	);
}

export default EmojiPicker;
