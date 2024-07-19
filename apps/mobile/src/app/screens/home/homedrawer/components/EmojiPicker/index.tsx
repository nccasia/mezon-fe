import { TouchableOpacity, TouchableWithoutFeedback } from '@gorhom/bottom-sheet';
import { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { useChatSending, useGifsStickersEmoji } from '@mezon/core';
import { Icons } from '@mezon/mobile-components';
import { Block, Colors, Fonts, size, useTheme } from '@mezon/mobile-ui';
import { selectCurrentChannel, selectDmGroupCurrent } from '@mezon/store-mobile';
import { IMessageSendPayload } from '@mezon/utils';
import { debounce } from 'lodash';
import { ChannelStreamMode } from 'mezon-js';
import { ApiMessageAttachment, ApiMessageMention, ApiMessageRef } from 'mezon-js/api.gen';
import React, { MutableRefObject, useCallback, useEffect, useState } from 'react';
import { Keyboard, Text, TextInput, View } from 'react-native';
import { useSelector } from 'react-redux';
import EmojiSelector from './EmojiSelector';
import GifSelector from './GifSelector';
import StickerSelector from './StickerSelector';
import { style } from './styles';

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
	const { themeValue } = useTheme();
	const styles = style(themeValue);
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
	const { themeValue, themeBasic } = useTheme();
	const styles = style(themeValue);
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
								<Icons.ArrowLargeLeftIcon height={20} width={20} color={themeValue.text} />
							</TouchableOpacity>
						)}

						<View style={styles.textInputWrapper}>
							<Icons.MagnifyingIcon height={18} width={18} color={themeValue.text} />
							<TextInput placeholder='search' placeholderTextColor={themeValue.text} style={styles.textInput} onFocus={handleInputSearchFocus} onChangeText={debouncedSetSearchText} keyboardAppearance={themeBasic === "dark" ? "dark" : "light"} />
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
