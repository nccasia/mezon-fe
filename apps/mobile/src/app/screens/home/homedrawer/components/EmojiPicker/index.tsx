import { Colors, Fonts } from '@mezon/mobile-ui';
import React from 'react';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import GifSelector from './GifSelector';
import { useEffect } from 'react';
import { useAppParams } from '@mezon/core';
import { ChannelStreamMode, ChannelType } from 'mezon-js';
import { useSelector } from 'react-redux';
import { selectCurrentChannel } from '@mezon/store-mobile';

export type IProps = {};

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

function EmojiPicker({ }: IProps) {
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
					/>
				) : (
					<Text>Sticker</Text>
				)}
			</View>
		</View>
	);
}

export default EmojiPicker;


export const styles = StyleSheet.create({
	container: {
		backgroundColor: "yellow",
		padding: 10,
		height: "100%"
	},
	tabContainer: {
		display: "flex",
		justifyContent: "center",
		flexDirection: "row",
		gap: 10,
		padding: 6,
		width: "100%",
		backgroundColor: Colors.primary,
		borderRadius: 50
	},
	selected: {
		flex: 1,
		borderRadius: 50,
		paddingHorizontal: 20,
		paddingVertical: 5,
	}
});