import { TouchableOpacity, TouchableWithoutFeedback } from '@gorhom/bottom-sheet';
import { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { useChatSending, useGifsStickersEmoji } from '@mezon/core';
import { ArrowLeftIcon, SearchIcon } from '@mezon/mobile-components';
import { Block, Colors, Fonts, size } from '@mezon/mobile-ui';
import { selectCurrentChannel, selectDmGroupCurrent } from '@mezon/store-mobile';
import { IMessageSendPayload } from '@mezon/utils';
import { debounce } from 'lodash';
import { ChannelStreamMode } from 'mezon-js';
import { ApiMessageAttachment, ApiMessageMention, ApiMessageRef } from 'mezon-js/api.gen';
import React, { MutableRefObject, useCallback, useEffect, useRef, useState } from 'react';
import { Keyboard, Text, TextInput, View } from 'react-native';
import { useSelector } from 'react-redux';
import EmojiSelector from './EmojiSelector';
import GifSelector from './GifSelector';
import StickerSelector from './StickerSelector';
import styles from './styles';

export type IProps = {
	onDone: () => void;
	bottomSheetRef: MutableRefObject<BottomSheetMethods>;
	directMessageId?: string;
};

interface TextTabProps {
	selected?: boolean;
	title: string;
	onPress: () => void;
}
function TextTab({ selected, title, onPress }: TextTabProps) {
	return (
		<View style={{ flex: 1 }}>
			<TouchableOpacity onPress={onPress} style={{ backgroundColor: selected ? Colors.bgViolet : 'transparent', ...styles.selected }}>
				<Text style={{ color: selected ? Colors.white : Colors.gray72, fontSize: Fonts.size.small, textAlign: 'center' }}>{title}</Text>
			</TouchableOpacity>
		</View>
	);
}

type ExpressionType = 'emoji' | 'gif' | 'sticker';

function EmojiPicker({ onDone, bottomSheetRef, directMessageId = '' }: IProps) {
	const currentChannel = useSelector(selectCurrentChannel);
	const currentDirectMessage = useSelector(selectDmGroupCurrent(directMessageId)); //Note: prioritize DM first
	const { valueInputToCheckHandleSearch, setValueInputSearch } = useGifsStickersEmoji();
	const [mode, setMode] = useState<ExpressionType>('emoji');
	const [channelMode, setChannelMode] = useState(0);
	const [searchText, setSearchText] = useState<string>('');

	const dmMode = currentDirectMessage
		? Number(currentDirectMessage?.user_id?.length === 1 ? ChannelStreamMode.STREAM_MODE_DM : ChannelStreamMode.STREAM_MODE_GROUP)
		: '';

	useEffect(() => {
		setChannelMode(ChannelStreamMode.STREAM_MODE_CHANNEL);
	}, []);

	const { sendMessage } = useChatSending({
		channelId: currentDirectMessage?.channel_id || currentChannel?.id || '',
		channelLabel: currentDirectMessage?.channel_label || currentChannel?.channel_label || '',
		mode: dmMode || channelMode,
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

		onDone && type !== 'emoji' && onDone();
	}

	function handleInputSearchFocus() {
		bottomSheetRef && bottomSheetRef.current && bottomSheetRef.current.expand();
	}

	function handleInputSearchBlur() {
		Keyboard.dismiss();
	}

	const debouncedSetSearchText = useCallback(
		debounce((text) => setSearchText(text), 300),
		[],
	);

	const handleBottomSheetExpand = () => {
		bottomSheetRef && bottomSheetRef?.current && bottomSheetRef.current.expand();
	};

	const handleBottomSheetCollapse = () => {
		bottomSheetRef && bottomSheetRef?.current && bottomSheetRef.current.collapse();
	};

	const onScroll = (e: { nativeEvent: { contentOffset: { y: number } } }) => {
		if (e.nativeEvent.contentOffset.y < -100) {
			handleBottomSheetCollapse();
		}

		if (e.nativeEvent.contentOffset.y > 200) {
			handleBottomSheetExpand();
		}
	};

	return (
		<TouchableWithoutFeedback onPressIn={handleInputSearchBlur}>
			<View style={styles.container}>
				<View style={styles.tabContainer}>
					<TextTab title="Emoji" selected={mode === 'emoji'} onPress={() => setMode('emoji')} />
					<TextTab title="GIFs" selected={mode === 'gif'} onPress={() => setMode('gif')} />
					<TextTab title="Stickers" selected={mode === 'sticker'} onPress={() => setMode('sticker')} />
				</View>

				{mode !== 'emoji' && (
					<Block flexDirection={'row'} gap={size.s_10} width={'100%'} alignItems={'center'}>
						{mode === 'gif' && !!valueInputToCheckHandleSearch && (
							<TouchableOpacity
								style={{ paddingVertical: size.s_10 }}
								onPress={() => {
									setSearchText('');
									setValueInputSearch('');
								}}
							>
								<ArrowLeftIcon />
							</TouchableOpacity>
						)}

						<View style={styles.textInputWrapper}>
							<SearchIcon height={18} width={18} />
							<TextInput style={styles.textInput} onFocus={handleInputSearchFocus} onChangeText={debouncedSetSearchText} />
						</View>
					</Block>
				)}

				{mode === 'emoji' ? (
					<EmojiSelector
						onScroll={onScroll}
						handleBottomSheetExpand={handleBottomSheetExpand}
						handleBottomSheetCollapse={handleBottomSheetCollapse}
						onSelected={(url) => handleSelected('emoji', url)}
						searchText={searchText}
					/>
				) : mode === 'gif' ? (
					<GifSelector onScroll={onScroll} onSelected={(url) => handleSelected('gif', url)} searchText={searchText} />
				) : (
					<StickerSelector onScroll={onScroll} onSelected={(url) => handleSelected('sticker', url)} searchText={searchText} />
				)}
			</View>
		</TouchableWithoutFeedback>
	);
}

export default EmojiPicker;
