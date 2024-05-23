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

function EmojiPicker({ onDone }: IProps) {
	const currentChannel = useSelector(selectCurrentChannel);
	const [mode, setMode] = useState<"emoji" | "gif" | "sticker">("gif");
	const [channelMode, setChannelMode] = useState(0);

	useEffect(() => {
		setChannelMode(ChannelStreamMode.STREAM_MODE_CHANNEL);
	}, [])

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
				) : mode === "gif" ? (
					<GifSelector
						channelId={currentChannel?.id || ''}
						channelLabel={currentChannel?.channel_label || ''}
						mode={channelMode}
						onDone={onDone}
					/>
				) : (
					<Text>Sticker</Text>
				)}
			</View>
		</View>
	);
}

export default EmojiPicker;


