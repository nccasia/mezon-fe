import { Colors, Fonts } from '@mezon/mobile-ui';
import React from 'react';
import { useState } from 'react';
import { Text, View } from 'react-native';
import GifSelector from './GifSelector';
import { useEffect } from 'react';
import { ChannelStreamMode } from 'mezon-js';
import { useSelector } from 'react-redux';
import { selectCurrentChannel } from '@mezon/store-mobile';
import styles from './styles';
import { useChatSending } from '@mezon/core';
import { useCallback } from 'react';
import { IMessageSendPayload } from '@mezon/utils';
import { ApiMessageAttachment, ApiMessageMention, ApiMessageRef } from 'mezon-js/api.gen';
import StickerSelector from './StickerSelector';

export type IProps = {
	onDone: () => void
};

interface TextTabProps {
	selected?: boolean;
	title: string;
}
function TextTab({ selected, title }: TextTabProps) {
	return (
		<View style={{ backgroundColor: selected ? Colors.green : "transparent", ...styles.selected }}>
			<Text style={{ color: selected ? Colors.white : Colors.gray72, fontSize: Fonts.size.small, textAlign: "center" }}>{title}</Text>
		</View>
	)
}

type ExpressionType = "emoji" | "gif" | "sticker";

function EmojiPicker({ onDone }: IProps) {
	const currentChannel = useSelector(selectCurrentChannel);
	const [mode, setMode] = useState<ExpressionType>("gif");
	const [channelMode, setChannelMode] = useState(0);

	useEffect(() => {
		setChannelMode(ChannelStreamMode.STREAM_MODE_CHANNEL);
	}, [])

	const { sendMessage } = useChatSending({
		channelId: currentChannel?.id || '',
		channelLabel: currentChannel?.channel_label || '',
		mode: channelMode
	});

	const handleSend = useCallback((
		content: IMessageSendPayload,
		mentions?: Array<ApiMessageMention>,
		attachments?: Array<ApiMessageAttachment>,
		references?: Array<ApiMessageRef>
	) => {
		sendMessage(content, mentions, attachments, references);
	}, [sendMessage]);


	function handleSelected(type: ExpressionType, data: any) {
		if (type === "gif") {
			handleSend({ t: '' }, [], [{ url: data }], []);
		} else if (type === "sticker") {
			handleSend({ t: '' }, [], [{ url: data, height: 40, width: 40, filetype: 'image/gif' }], []);
		} else {

		}

		onDone && onDone();
	}

	return (
		<View style={styles.container}>
			<View style={styles.tabContainer}>
				<TextTab selected title='Emoji' />
				<TextTab title='GIFs' />
				<TextTab title='Stickers' />
			</View>

			<View>
				{mode === "emoji" ? (
					<Text>Emoji</Text>
				) : mode === "gif"
					? <GifSelector onSelected={(url) => handleSelected("gif", url)} />
					: <StickerSelector onSelected={(url) => handleSelected("sticker", url)} />
				}
			</View>
		</View>
	);
}

export default EmojiPicker;


