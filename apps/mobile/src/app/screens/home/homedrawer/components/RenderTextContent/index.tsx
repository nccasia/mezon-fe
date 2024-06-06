import { Colors } from '@mezon/mobile-ui';
import { ChannelsEntity } from '@mezon/store-mobile';
import { IEmojiImage } from '@mezon/utils';
import React from 'react';
import { Text } from 'react-native';
import { highlightEmojiRegex, mentionRegex, mentionRegexSplit } from '../../../../../utils/helpers';
import { styles } from './RenderTextContent.styles';
import { getChannelById } from '@mezon/mobile-components';

export const renderTextContent = (text: string, emojiListPNG?: IEmojiImage[], channelsEntities?: Record<string, ChannelsEntity>) => {
	const getChannelById = (channelHashtagId: string) => {
		return channelsEntities[channelHashtagId];
	};

	const renderChannelMention = (id: string) => {
		const channel = getChannelById(id.slice(1));

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
		return id.startsWith('@') ? <Text>{renderUserMention(id)}</Text> : id.startsWith('#') ? renderChannelMention(id) : <Text />;
	};

	const renderTextWithMention = (text: string, matchesMention: RegExpMatchArray) => {
		const parts = text
			.split(mentionRegexSplit)
			.filter(Boolean)
			.filter((i) => i !== '@' && i !== '#');

		return parts.map((part, index) => (
			<Text key={`${index}-${part}-renderTextWithMention'}`}>
				{!part ? (
					<Text />
				) : matchesMention.includes(part) ? (
					renderMention(part)
				) : (
					<Text style={styles.contentMessageBox}>{renderTextWithEmoji(part)}</Text>
				)}
			</Text>
		));
	};

	const renderTextWithEmoji = (text: string, emojiListPNG?: IEmojiImage[]) => {
		const parts = text.split(highlightEmojiRegex);
		return parts.map((part, index) => {
			const isHighlighted = highlightEmojiRegex.test(part);
			return (
				<Text key={index} style={isHighlighted && { fontWeight: 'bold', color: Colors.bgViolet }}>
					{part}
				</Text>
			);
		});
	};

	const matchesMention = text.match(mentionRegex);
	if (matchesMention?.length) {
		return <Text>{renderTextWithMention(text, matchesMention)}</Text>;
	} else {
		return <Text>{renderTextWithEmoji(text)}</Text>;
	}
};
