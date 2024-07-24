import { Colors } from '@mezon/mobile-ui';
import { ChannelsEntity } from '@mezon/store-mobile';
import { IEmoji } from '@mezon/utils';
import React from 'react';
import { Text } from 'react-native';
import { channelIdRegex, highlightEmojiRegex, mentionRegex, mentionRegexSplit } from '../../../../../utils/helpers';
import { styles } from './RenderTextContent.styles';

export const renderTextContent = (text: string, channelsEntities?: Record<string, ChannelsEntity>) => {
	const getChannelById = (channelHashtagId: string) => {
		const channel = channelsEntities?.[channelHashtagId];
		if (channel) {
			return channel;
		} else {
			return {
				channel_label: channelHashtagId,
			};
		}
	};

	const renderChannelMention = (id: string) => {
		const channelId = id?.match(channelIdRegex)[1];
		const channel = getChannelById(channelId);

		return (
			<Text>
				<Text style={styles.contentMessageMention}>
					{'#'}
					{channel?.channel_label || ''}
				</Text>
			</Text>
		);
	};

	const renderUserMention = (id: string) => {
		return (
			<Text>
				<Text style={styles.contentMessageMention}>{id}</Text>
			</Text>
		);
	};

	const renderMention = (id: string) => {
		return id.startsWith('@') ? <Text>{renderUserMention(id)}</Text> : id.startsWith('<#') ? renderChannelMention(id) : <Text />;
	};

	const renderTextWithMention = (text: string, matchesMention: RegExpMatchArray) => {
		const parts = text
			?.split(mentionRegexSplit)
			?.filter(Boolean)
			?.filter((i) => i !== '@' && i !== '#');
		return parts?.map?.((part, index) => (
			<Text key={`${index}-${part}-renderTextWithMention'}`}>
				{!part ? (
					<Text />
				) : matchesMention.includes(part) ? (
					renderMention(part)
				) : highlightEmojiRegex.test(part) ? (
					<Text style={styles.contentMessageBox}>{renderTextWithEmoji(part)}</Text>
				) : (
					<Text>{part}</Text>
				)}
			</Text>
		));
	};

	const renderTextWithEmoji = (text: string) => {
		const parts = text?.split?.(highlightEmojiRegex);
		return parts?.map?.((part, index) => {
			const isHighlighted = highlightEmojiRegex.test(part);
			return (
				<Text key={index} style={isHighlighted && { fontWeight: 'bold', color: Colors.bgViolet }}>
					{part}
				</Text>
			);
		});
	};

	const matchesMention = text?.match(mentionRegex);
	if (matchesMention?.length) {
		return <Text>{renderTextWithMention(text, matchesMention)}</Text>;
	} else {
		return <Text>{renderTextWithEmoji(text)}</Text>;
	}
};
