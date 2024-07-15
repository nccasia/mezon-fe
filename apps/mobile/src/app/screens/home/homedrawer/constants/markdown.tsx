import { Colors, size } from '@mezon/mobile-ui';
import {
	ChannelMembersEntity,
	ChannelsEntity,
	ClansEntity,
	UserClanProfileEntity,
	UsersClanEntity,
	selectAllChannelMembers,
	selectAllUsesClan,
} from '@mezon/store-mobile';
import { IEmoji, getSrcEmoji } from '@mezon/utils';
import { TFunction } from 'i18next';
import { ChannelType } from 'mezon-js';
import React from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import Markdown from 'react-native-markdown-display';
import FontAwesome from 'react-native-vector-icons/Feather';
import { useSelector } from 'react-redux';
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
export const TYPE_MENTION = {
	userMention: '@',
	hashtag: '#',
	voiceChannel: '##voice',
};
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
		backgroundColor: Colors.midnightBlue,
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
	voiceChannel: {
		backgroundColor: Colors.midnightIndigoBg,
		flexDirection: 'row',
		gap: size.s_2,
		alignItems: 'center',
		justifyContent: 'center',
	},
	textVoiceChannel: {
		fontSize: size.medium,
		color: Colors.textGray,
		lineHeight: size.s_20,
	},
	unknownChannel: { fontStyle: 'italic' },
};

const styleMessageReply = {
	body: {
		color: Colors.tertiary,
		fontSize: size.small,
	},
	textVoiceChannel: {
		fontSize: size.small,
		color: Colors.textGray,
		lineHeight: size.s_20,
	},
	mention: {
		fontSize: size.small,
		color: Colors.textGray,
		backgroundColor: '#3b426e',
		lineHeight: size.s_20,
	},
};

export type IMarkdownProps = {
	lines: string;
	isEdited?: boolean;
	t?: TFunction;
	channelsEntities?: Record<string, ChannelsEntity>;
	emojiListPNG?: IEmoji[];
	onMention?: (url: string) => void;
	onChannelMention?: (channel: ChannelsEntity) => void;
	isNumberOfLine?: boolean;
	clansProfile?: UserClanProfileEntity[];
	currentClan?: ClansEntity;
	isMessageReply?: boolean;
	mode?: number;
};

type TRenderTextContentProps = {
	lines: string;
	isEdited?: boolean;
	translate?: TFunction;
	channelsEntities?: Record<string, ChannelsEntity>;
	emojiListPNG?: IEmoji[];
	onMention?: (url: string) => void;
	onChannelMention?: (channel: ChannelsEntity) => void;
	isNumberOfLine?: boolean;
	clansProfile?: UserClanProfileEntity[];
	currentClan?: ClansEntity;
	isMessageReply?: boolean;
	mode?: number;
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

		if (content?.startsWith('::')) {
			return <FastImage source={{ uri: payload }} style={styles.iconEmojiInMessage} resizeMode={'contain'} />;
		}

		if (payload.startsWith(TYPE_MENTION.userMention) || payload.startsWith(TYPE_MENTION.hashtag)) {
			if (payload.includes(TYPE_MENTION.voiceChannel)) {
				return (
					<Text key={node.key} style={styles.voiceChannel} onPress={() => openUrl(node.attributes.href, onLinkPress)}>
						<Text>
							<FontAwesome name="volume-2" size={14} color={Colors?.white} />{' '}
						</Text>
						<Text style={styles.textVoiceChannel}>{`${content}`}</Text>
					</Text>
				);
			}
			return (
				<Text
					key={node.key}
					style={[styles.mention, content.includes('# unknown') && styles.unknownChannel]}
					onPress={() => openUrl(node.attributes.href, onLinkPress)}
				>
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
			const textContent = sourceInfo?.split?.(' ');
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
	const parts = modifiedString?.split?.('\0')?.filter?.(Boolean);

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

export const formatEmoji = (text: string, emojiImages: IEmoji[] = [], isMessageReply: boolean) => {
	const modifiedString = text.replace(splitBlockCodeRegex, (match) => `\0${match}\0`);
	const parts = modifiedString?.split?.('\0')?.filter?.(Boolean);
	return parts
		?.map((part) => {
			if (codeBlockRegex.test(part)) {
				return part;
			} else {
				if (part.match(emojiRegex)) {
					const srcEmoji = getSrcEmoji(part, emojiImages);
					return isMessageReply ? `![${part}](${srcEmoji})` : `[:${part}](${srcEmoji})`;
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
	({
		lines,
		isEdited,
		t,
		channelsEntities,
		emojiListPNG,
		onMention,
		onChannelMention,
		isNumberOfLine,
		clansProfile,
		currentClan,
		isMessageReply,
		mode,
	}: IMarkdownProps) => {
		const usersClan = useSelector(selectAllUsesClan);
		const usersInChannel = useSelector(selectAllChannelMembers);
		if (!lines) return null;

		const matchesMentions = lines.match(mentionRegex); //note: ["@yLeVan", "@Nguyen.dev"]
		const matchesUrls = lines.match(urlRegex); //Note: ["https://www.npmjs.com", "https://github.com/orgs"]
		const isExistEmoji = emojiRegex.test(lines);
		const isExistBlockCode = codeBlockRegex.test(lines);

		let customStyle = {};
		let content: string = lines?.trim();

		if (matchesMentions) {
			content = formatMention(content, matchesMentions, channelsEntities, clansProfile, currentClan, usersInChannel, usersClan, mode);
		}

		if (matchesUrls) {
			content = formatUrls(content);
		}

		if (isExistEmoji) {
			content = formatEmoji(content, emojiListPNG, isMessageReply);
		}

		if (isExistBlockCode && !isMessageReply) {
			content = formatBlockCode(content);
		}

		if (isEdited) {
			content = content + ` [${t('edited')}](${EDITED_FLAG})`;
		}

		if (isMessageReply) {
			customStyle = { ...styleMessageReply };
		}

		return isNumberOfLine ? (
			<View
				style={{
					flex: 1,
					maxHeight: isMessageReply ? size.s_18 : size.s_20 * 10 - size.s_10,
					overflow: 'hidden',
				}}
			>
				{isMessageReply ? (
					<View
						style={{
							position: 'absolute',
							top: 0,
							left: 0,
							right: 0,
							bottom: 0,
							zIndex: 1,
						}}
					/>
				) : null}
				<Markdown
					style={{ ...(markdownStyles as StyleSheet.NamedStyles<any>), ...customStyle }}
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
					if (url.startsWith(TYPE_MENTION.userMention)) {
						onMention && onMention(url);
						return false;
					}
					if (url.startsWith(TYPE_MENTION.hashtag)) {
						let channelId = url.slice(1);
						if (url.includes(TYPE_MENTION.voiceChannel)) {
							channelId = url.replace(`${TYPE_MENTION.voiceChannel}`, '');
						}
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

const formatMention = (
	text: string,
	matchesMention: RegExpMatchArray,
	channelsEntities: Record<string, ChannelsEntity>,
	clansProfile: UserClanProfileEntity[],
	currentClan?: ClansEntity,
	usersInChannel?: ChannelMembersEntity[],
	usersClan?: UsersClanEntity[],
	mode?: number,
) => {
	const parts = text?.split?.(splitBlockCodeRegex);
	return parts
		?.map((part) => {
			if (codeBlockRegex.test(part)) {
				return part;
			} else {
				if (matchesMention.includes(part)) {
					if (part.startsWith('@')) {
						return renderMention(part, mode, usersInChannel, usersClan, clansProfile, currentClan);
					}
					if (part.startsWith('<#')) {
						const channelId = part.match(channelIdRegex)[1];
						const channel = getChannelById(channelId, channelsEntities) as ChannelsEntity;
						if (channel.type === ChannelType.CHANNEL_TYPE_VOICE) {
							return `[${channel.channel_label}](##voice${channelId})`;
						}
						return channel['channel_id'] ? `[#${channel.channel_label}](#${channelId})` : `[\\# ${channel.channel_label}](#${channelId})`;
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
			channel_label: 'unknown',
		};
	}
};

export const renderTextContent = ({
	lines,
	isEdited = false,
	translate,
	channelsEntities,
	emojiListPNG,
	onMention,
	onChannelMention,
	isNumberOfLine = false,
	clansProfile,
	currentClan,
	isMessageReply = false,
	mode,
}: TRenderTextContentProps) => {
	return (
		<RenderTextContent
			lines={lines}
			isEdited={isEdited}
			t={translate}
			channelsEntities={channelsEntities}
			emojiListPNG={emojiListPNG}
			onMention={onMention}
			onChannelMention={onChannelMention}
			isNumberOfLine={isNumberOfLine}
			clansProfile={clansProfile}
			currentClan={currentClan}
			isMessageReply={isMessageReply}
			mode={mode}
		/>
	);
};

const getUserMention = (nameMention: string, mode: number, usersInChannel: ChannelMembersEntity[], usersClan: UsersClanEntity[]) => {
  if (mode === 4 || mode === 3) {
    return usersInChannel?.find(channelUser => channelUser?.user?.username === nameMention);
  } else {
    return usersClan?.find(userClan => userClan?.user?.username === nameMention);
  }
};

const renderMention = (part: string, mode: number, usersInChannel: ChannelMembersEntity[], usersClan: UsersClanEntity[], clansProfile: UserClanProfileEntity[], currentClan: ClansEntity) => {
  const nameMention = part?.slice(1);

  if (nameMention === "here") {
    return `[@here](@here)`;
  }

  const userMention = getUserMention(nameMention, mode, usersInChannel, usersClan);
  const { user } = userMention || {};

  const clanProfileByIdUser = clansProfile?.find(
    clanProfile => clanProfile?.clan_id === currentClan?.clan_id && clanProfile?.user_id === user?.id,
  );

  if (clanProfileByIdUser) {
    return `[@${clanProfileByIdUser?.nick_name}](@${user?.username})`;
  }

  if (userMention) {
    return user?.display_name
      ? `[@${user?.display_name}](@${user?.username})`
      : `@[${user?.username}](@${user?.username})`;
  }
};
