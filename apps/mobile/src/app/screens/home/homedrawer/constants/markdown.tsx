import { Colors, size } from '@mezon/mobile-ui';
import { ChannelsEntity } from '@mezon/store-mobile';
import { IEmojiImage, getSrcEmoji } from '@mezon/utils';
import { TFunction } from 'i18next';
import React from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import Markdown from 'react-native-markdown-display';
import {
	channelIdRegex,
	codeBlockRegex,
	codeBlockRegexGlobal,
	emojiRegex,
	markdownDefaultUrlRegex,
	mentionRegex,
	splitBlockCodeRegex,
	urlRegex,
} from '../../../../../app/utils/helpers';

export default function openUrl(url, customCallback) {
	if (customCallback) {
		const result = customCallback(url);
		if (url && result && typeof result === 'boolean') {
			Linking.openURL(url);
		}
	} else if (url) {
		Linking.openURL(url);
	}
}

/**
 * Todo: move to helper
 */
export const EDITED_FLAG = 'edited-flag';
/**
 * custom style for markdown
 * react-native-markdown-display/src/lib/styles.js to see more
 */
export const markdownStyles = {
	body: {
		color: Colors.tertiary,
		fontSize: size.medium,
	},
	paragraph: {
		marginTop: 0,
		marginBottom: 0,
		paddingTop: 0,
		paddingBottom: 0,
	},
	code_block: {
		color: Colors.textGray,
		backgroundColor: Colors.bgCharcoal,
		paddingVertical: 1,
		borderColor: Colors.black,
		borderRadius: 5,
		lineHeight: size.s_20,
	},
	code_inline: {
		color: Colors.textGray,
		backgroundColor: Colors.bgCharcoal,
		fontSize: size.small,
		lineHeight: size.s_20,
	},
	fence: {
		color: Colors.textGray,
		backgroundColor: Colors.bgCharcoal,
		paddingVertical: 5,
		borderColor: Colors.black,
		borderRadius: 5,
		fontSize: size.small,
		lineHeight: size.s_20,
	},
	link: {
		color: Colors.textLink,
		textDecorationLine: 'none',
		lineHeight: size.s_20,
	},
	iconEmojiInMessage: {
		width: size.s_20,
		height: size.s_20,
	},
	editedText: {
		fontSize: size.small,
		color: Colors.gray72,
	},
	mention: {
		fontSize: size.medium,
		color: Colors.textGray,
		backgroundColor: Colors.bgMention,
		lineHeight: size.s_20,
	},
	blockquote: {
		backgroundColor: Colors.tertiaryWeight,
		borderColor: Colors.textGray,
	},
	tr: {
		borderColor: Colors.textGray,
	},
	hr: {
		backgroundColor: Colors.white,
		height: 2,
	},
};

export type IMarkdownProps = {
	lines: string;
	isEdited?: boolean;
	t?: TFunction;
	channelsEntities?: Record<string, ChannelsEntity>;
	emojiListPNG?: IEmojiImage[];
	onMention?: (url: string) => void;
	onChannelMention?: (channel: ChannelsEntity) => void;
	isNumberOfLine?: boolean;
};

/**
 * custom render if you need
 * react-native-markdown-display/src/lib/renderRules.js to see more
 */
export const renderRulesCustom = {
	heading1: (node, children, parent, styles) => {
		return (
			<View key={node.key} style={styles._VIEW_SAFE_heading1}>
				{children}
			</View>
		);
	},
	code_inline: (node, children, parent, styles, inheritedStyles = {}) => (
		<Text key={node.key} style={[inheritedStyles, styles.code_inline, { bottom: -5 }]}>
			{node.content}
		</Text>
	),
	link: (node, children, parent, styles, onLinkPress) => {
		const payload = node?.attributes?.href;
		const content = node?.children[0]?.content;
		if (payload === EDITED_FLAG) {
			return (
				<Text key={node.key} style={[styles.editedText]}>
					{content}
				</Text>
			);
		}

		if (payload.startsWith('@') || payload.startsWith('#')) {
			return (
				<Text key={node.key} style={[styles.mention]} onPress={() => openUrl(node.attributes.href, onLinkPress)}>
					{content}
				</Text>
			);
		}

		return (
			<Text key={node.key} style={[styles.link]} onPress={() => openUrl(node.attributes.href, onLinkPress)}>
				{children}
			</Text>
		);
	},
	image: (node, children, parent, styles, allowedImageHandlers, defaultImageHandler) => {
		const { src } = node.attributes;
		return (
			<View key={node.key} style={{ padding: 1 }}>
				<FastImage source={{ uri: src }} style={styles.iconEmojiInMessage} resizeMode={'contain'} />
			</View>
		);
	},
	fence: (node, children, parent, styles, inheritedStyles = {}) => {
		// we trim new lines off the end of code blocks because the parser sends an extra one.
		let { content } = node;
		const sourceInfo = node?.sourceInfo;
		if (typeof node.content === 'string' && node.content.charAt(node.content.length - 1) === '\n') {
			content = node.content.substring(0, node.content.length - 1);
		}

		//Note: Handle lost text when ```
		if (sourceInfo) {
			const textContent = sourceInfo.split(' ');
			if (textContent[textContent.length - 1].includes(EDITED_FLAG)) {
				textContent.pop();
			}
			content = '```' + textContent.join(' ');
			return (
				<Text key={node.key} style={{ color: Colors.tertiary }}>
					{content}
				</Text>
			);
		}

		return (
			<Text key={node.key} style={[inheritedStyles, styles.fence]}>
				{content}
			</Text>
		);
	},
};

/**
 * helper for markdown
 */
export const formatUrls = (text: string) => {
	const modifiedString = text.replace(splitBlockCodeRegex, (match) => `\0${match}\0`);
	const parts = modifiedString.split('\0').filter(Boolean);

	return parts
		?.map((part) => {
			if (codeBlockRegex.test(part)) {
				return part;
			} else {
				if (urlRegex.test(part)) {
					if (markdownDefaultUrlRegex.test(part)) {
						return part;
					} else {
						return `[${part}](${part})`;
					}
				}
				return part;
			}
		})
		.join('');
};

export const formatEmoji = (text: string, emojiImages: IEmojiImage[] = []) => {
	const modifiedString = text.replace(splitBlockCodeRegex, (match) => `\0${match}\0`);
	const parts = modifiedString.split('\0').filter(Boolean);
	return parts
		?.map((part) => {
			if (codeBlockRegex.test(part)) {
				return part;
			} else {
				if (part.match(emojiRegex)) {
					const srcEmoji = getSrcEmoji(part, emojiImages);
					return srcEmoji ? `![${part}](${srcEmoji})` : part;
				}
				return part;
			}
		})
		.join('');
};

export const formatBlockCode = (text: string) => {
	const addNewlinesToCodeBlock = (block) => {
		if (!block.startsWith('```\n')) {
			block = block.replace(/^```/, '```\n');
		}
		if (!block.endsWith('\n```')) {
			block = block.replace(/```$/, '\n```');
		}
		return '\n' + block + '\n';
	};
	return text.replace(codeBlockRegexGlobal, addNewlinesToCodeBlock);
};

export const removeBlockCode = (text: string) => {
	const regex = /(`{1,3})(.*?)\1/g;
	return text?.replace?.(regex, '$2');
};

const RenderTextContent = React.memo(
	({ lines, isEdited, t, channelsEntities, emojiListPNG, onMention, onChannelMention, isNumberOfLine }: IMarkdownProps) => {
		if (!lines) return null;

		const matchesMentions = lines.match(mentionRegex); //note: ["@yLeVan", "@Nguyen.dev"]
		const matchesUrls = lines.match(urlRegex); //Note: ["https://www.npmjs.com", "https://github.com/orgs"]
		const isExistEmoji = emojiRegex.test(lines);
		const isExistBlockCode = codeBlockRegex.test(lines);

		let content: string = lines?.trim();

		if (matchesMentions) {
			content = formatMention(content, matchesMentions, channelsEntities);
		}

		if (matchesUrls) {
			content = formatUrls(content);
		}

		if (isExistEmoji) {
			content = formatEmoji(content, emojiListPNG);
		}

		if (isExistBlockCode) {
			content = formatBlockCode(content);
		}

		if (isEdited) {
			content = content + ` [${t('edited')}](${EDITED_FLAG})`;
		}

		return isNumberOfLine ? (
			<View
				style={{
					flex: 1,
					maxHeight: size.s_20 * 10 - size.s_10,
					overflow: 'hidden',
				}}
			>
				<Markdown
					style={markdownStyles as StyleSheet.NamedStyles<any>}
					rules={renderRulesCustom}
					onLinkPress={(url) => {
						if (url.startsWith('@')) {
							onMention && onMention(url);
							return false;
						}

						if (url.startsWith('#')) {
							const channelId = url.slice(1);
							const channel = getChannelById(channelId, channelsEntities) as ChannelsEntity;
							onChannelMention && onChannelMention(channel);
							return false;
						}
						//Note: return false to prevent default
						return true;
					}}
				>
					{content}
				</Markdown>
			</View>
		) : (
			<Markdown
				style={markdownStyles as StyleSheet.NamedStyles<any>}
				rules={renderRulesCustom}
				onLinkPress={(url) => {
					if (url.startsWith('@')) {
						onMention && onMention(url);
						return false;
					}

					if (url.startsWith('#')) {
						const channelId = url.slice(1);
						const channel = getChannelById(channelId, channelsEntities) as ChannelsEntity;
						onChannelMention && onChannelMention(channel);
						return false;
					}
					//Note: return false to prevent default
					return true;
				}}
			>
				{content}
			</Markdown>
		);
	},
);

const formatMention = (text: string, matchesMention: RegExpMatchArray, channelsEntities: Record<string, ChannelsEntity>) => {
	const parts = text.split(splitBlockCodeRegex);

	return parts
		?.map((part) => {
			if (codeBlockRegex.test(part)) {
				return part;
			} else {
				if (matchesMention.includes(part)) {
					if (part.startsWith('@')) {
						return `[${part}](${part})`;
					}
					if (part.startsWith('<#')) {
						const channelId = part.match(channelIdRegex)[1];
						const channel = getChannelById(channelId, channelsEntities);
						return `[#${channel.channel_label}](#${channelId})`;
					}
				}
			}
			return part;
		})
		.join('');
};

const getChannelById = (channelHashtagId: string, channelsEntities: Record<string, ChannelsEntity>) => {
	const channel = channelsEntities?.[channelHashtagId];
	if (channel) {
		return channel;
	} else {
		return {
			channel_label: channelHashtagId,
		};
	}
};

export const renderTextContent = (
	lines: string,
	isEdited?: boolean,
	t?: TFunction,
	channelsEntities?: Record<string, ChannelsEntity>,
	emojiListPNG?: IEmojiImage[],
	onMention?: (url: string) => void,
	onChannelMention?: (channel: ChannelsEntity) => void,
	isNumberOfLine?: boolean,
) => {
	return (
		<RenderTextContent
			lines={lines}
			isEdited={isEdited}
			t={t}
			channelsEntities={channelsEntities}
			emojiListPNG={emojiListPNG}
			onMention={onMention}
			onChannelMention={onChannelMention}
			isNumberOfLine={isNumberOfLine}
		/>
	);
};
