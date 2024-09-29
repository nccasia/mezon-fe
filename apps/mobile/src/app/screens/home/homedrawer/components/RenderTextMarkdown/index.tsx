import { codeBlockRegex, codeBlockRegexGlobal, markdownDefaultUrlRegex, splitBlockCodeRegex, urlRegex } from '@mezon/mobile-components';
import { Attributes, Colors, baseColor, size, useTheme } from '@mezon/mobile-ui';
import { selectCurrentChannelId, useAppSelector } from '@mezon/store';
import { ChannelsEntity, selectAllChannelMembers, selectAllUserClans, selectChannelsEntities, selectHashtagDmEntities } from '@mezon/store-mobile';
import { ETokenMessage, IExtendedMessage } from '@mezon/utils';
import { TFunction } from 'i18next';
import React, { useMemo } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import Markdown from 'react-native-markdown-display';
import FontAwesome from 'react-native-vector-icons/Feather';
import { useSelector } from 'react-redux';
import { ChannelHashtag } from '../MarkdownFormatText/ChannelHashtag';
import { EmojiMarkup } from '../MarkdownFormatText/EmojiMarkup';
import { MentionUser } from '../MarkdownFormatText/MentionUser';

interface ElementToken {
	s?: number;
	e?: number;
	kindOf: ETokenMessage;
	user_id?: string;
	role_id?: string;
	channelid?: string;
	emojiid?: string;
}

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
	userRoleMention: '@role'
};
/**
 * custom style for markdown
 * react-native-markdown-display/src/lib/styles.js to see more
 */
export const markdownStyles = (colors: Attributes, isUnReadChannel?: boolean, isLastMessage?: boolean) =>
	StyleSheet.create({
		heading1: {
			fontWeight: 'bold'
		},
		heading2: {
			fontWeight: 'bold'
		},
		heading3: {
			fontWeight: 'bold'
		},
		heading4: {
			fontWeight: 'bold'
		},
		heading5: {
			fontWeight: 'bold'
		},
		heading6: {
			fontWeight: 'bold'
		},
		body: {
			color: isUnReadChannel ? colors.white : colors.text,
			fontSize: isLastMessage ? size.small : size.medium
		},
		paragraph: {
			marginTop: 0,
			marginBottom: 0,
			paddingTop: 0,
			paddingBottom: 0
		},
		code_block: {
			color: colors.text,
			backgroundColor: colors.primary,
			paddingVertical: 1,
			borderColor: colors.text,
			borderRadius: 5,
			lineHeight: size.s_20
		},
		code_inline: {
			color: colors.text,
			backgroundColor: colors.primary,
			fontSize: size.small,
			lineHeight: size.s_17
		},
		fence: {
			color: colors.text,
			backgroundColor: colors.primary,
			paddingVertical: 5,
			borderColor: colors.borderHighlight,
			borderRadius: 5,
			fontSize: size.small,
			lineHeight: size.s_20
		},
		link: {
			color: colors.textLink,
			textDecorationLine: 'none',
			lineHeight: size.s_17
		},
		iconEmojiInMessage: {
			width: size.s_20,
			height: size.s_20
		},
		onlyIconEmojiInMessage: {
			width: size.s_40,
			height: size.s_40
		},
		emojiInMessageContain: {
			height: size.s_16,
			width: size.s_20
		},
		editedText: {
			fontSize: size.small,
			color: colors.textDisabled
		},
		mention: {
			fontSize: size.medium,
			color: colors.textLink,
			backgroundColor: colors.midnightBlue,
			lineHeight: size.s_20
		},
		blockquote: {
			backgroundColor: Colors.tertiaryWeight,
			borderColor: Colors.textGray
		},
		tr: {
			borderColor: colors.border
		},
		hr: {
			backgroundColor: colors.borderRadio,
			height: 2
		},
		voiceChannel: {
			backgroundColor: colors.midnightBlue,
			flexDirection: 'row',
			gap: size.s_2,
			alignItems: 'center',
			justifyContent: 'center'
		},
		textVoiceChannel: {
			fontSize: size.medium,
			color: colors.textLink,
			lineHeight: size.s_20
		},
		unknownChannel: { fontStyle: 'italic' },
		roleMention: {
			color: colors.textRoleLink,
			backgroundColor: colors.darkMossGreen
		}
	});

const styleMessageReply = (colors: Attributes) =>
	StyleSheet.create({
		body: {
			color: colors.text,
			fontSize: size.small
		},
		textVoiceChannel: {
			fontSize: size.small,
			color: colors.textDisabled,
			lineHeight: size.s_20
		},
		mention: {
			fontSize: size.small,
			color: colors.textLink,
			backgroundColor: colors.midnightBlue,
			lineHeight: size.s_20
		}
	});

export type IMarkdownProps = {
	content: IExtendedMessage;
	isEdited?: boolean;
	translate?: TFunction;
	onMention?: (url: string) => void;
	onChannelMention?: (channel: ChannelsEntity) => void;
	isNumberOfLine?: boolean;
	isMessageReply?: boolean;
	mode?: number;
	isHiddenHashtag?: boolean;
	directMessageId?: string;
	isOpenLink?: boolean;
	isOnlyContainEmoji?: boolean;
	isUnReadChannel?: boolean;
	isLastMessage?: boolean;
};

/**
 * custom render if you need
 * react-native-markdown-display/src/lib/renderRules.js to see more
 */
export const renderRulesCustom = (isOnlyContainEmoji) => ({
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

		if (content?.startsWith(':')) {
			return (
				<View style={!isOnlyContainEmoji && styles.emojiInMessageContain}>
					<FastImage
						source={{ uri: payload }}
						style={isOnlyContainEmoji ? styles.onlyIconEmojiInMessage : [styles.iconEmojiInMessage]}
						resizeMode={'contain'}
					/>
				</View>
			);
		}
		if (payload.startsWith(TYPE_MENTION.userMention) || payload.startsWith(TYPE_MENTION.hashtag)) {
			if (payload.includes(TYPE_MENTION.voiceChannel)) {
				return (
					<Text key={node.key} style={styles.voiceChannel} onPress={() => openUrl(node.attributes.href, onLinkPress)}>
						<Text>
							<FontAwesome name="volume-2" size={14} color={baseColor.gray} />{' '}
						</Text>
						<Text style={styles.textVoiceChannel}>{`${content}`}</Text>
					</Text>
				);
			}
			return (
				<Text
					key={node.key}
					style={[
						styles.mention,
						content?.includes?.('# unknown') && styles.unknownChannel,
						payload?.startsWith(TYPE_MENTION.userRoleMention) && styles.roleMention
					]}
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
	}
});

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

export const formatBlockCode = (text: string, isMessageReply: boolean) => {
	const matchesUrls = text?.match?.(urlRegex); //Note: ["https://www.npmjs.com", "https://github.com/orgs"]

	if (matchesUrls) {
		return formatUrls(text);
	}

	const addNewlinesToCodeBlock = (block) => {
		if (isMessageReply) {
			block = block.replace(/```|\n/g, '').trim();
			block = '`' + block + '`';
		} else {
			if (!block.startsWith('```\n')) {
				block = block.replace(/^```/, '```\n');
			}
			if (!block.endsWith('\n```')) {
				block = block.replace(/```$/, '\n```');
			}
		}
		return '\n' + block + '\n';
	};
	return text?.replace?.(codeBlockRegexGlobal, addNewlinesToCodeBlock);
};

export const RenderTextMarkdownContent = React.memo(
	({
		content,
		isEdited,
		translate,
		onMention,
		onChannelMention,
		isNumberOfLine,
		isMessageReply,
		mode,
		isHiddenHashtag,
		directMessageId,
		isOpenLink = true,
		isOnlyContainEmoji,
		isUnReadChannel = false,
		isLastMessage = false
	}: IMarkdownProps) => {
		let customStyle = {};
		const { themeValue } = useTheme();
		const usersClan = useAppSelector(selectAllUserClans);
		const currentChannelId = useSelector(selectCurrentChannelId);
		const usersInChannel = useAppSelector((state) => selectAllChannelMembers(state, currentChannelId as string));
		const channelsEntities = useAppSelector(selectChannelsEntities);
		const hashtagDmEntities = useAppSelector(selectHashtagDmEntities);

		if (isMessageReply) {
			customStyle = { ...styleMessageReply(themeValue) };
		}
		const { t, mentions = [], hg = [], ej = [], mk = [], lk = [], vk = [] } = content || {};
		const hgm = Array.isArray(hg) ? hg.map((item) => ({ ...item, kindOf: ETokenMessage.HASHTAGS })) : [];
		const ejm = Array.isArray(ej) ? ej.map((item) => ({ ...item, kindOf: ETokenMessage.EMOJIS })) : [];
		const mkm = Array.isArray(mk) ? mk.map((item) => ({ ...item, kindOf: ETokenMessage.MARKDOWNS })) : [];
		const lkm = Array.isArray(lk) ? lk.map((item) => ({ ...item, kindOf: ETokenMessage.LINKS })) : [];
		const vkm = Array.isArray(vk) ? vk.map((item) => ({ ...item, kindOf: ETokenMessage.VOICE_LINKS })) : [];
		const elements: ElementToken[] = [
			...mentions.map((item) => ({ ...item, kindOf: ETokenMessage.MENTIONS })),
			...hgm,
			...ejm,
			...mkm,
			...lkm,
			...vkm
		].sort((a, b) => (a.s ?? 0) - (b.s ?? 0));

		let lastIndex = 0;

		const contentRender = useMemo(() => {
			let formattedContent = '';

			elements.forEach((element) => {
				const s = element.s ?? 0;
				const e = element.e ?? 0;

				const contentInElement = t?.substring?.(s, e);

				if (lastIndex < s) {
					formattedContent += t?.slice?.(lastIndex, s)?.toString() ?? '';
				}
				if (element.kindOf === ETokenMessage.HASHTAGS) {
					if (isHiddenHashtag) {
						formattedContent = contentInElement;
					} else {
						formattedContent += ChannelHashtag({
							channelHashtagId: element.channelid,
							mode,
							directMessageId,
							channelsEntities,
							hashtagDmEntities
						});
					}
				}
				if (element.kindOf === ETokenMessage.MENTIONS) {
					formattedContent += MentionUser({
						tagName: contentInElement,
						roleId: element.role_id || '',
						tagUserId: element.user_id,
						mode,
						usersClan,
						usersInChannel
					});
				}
				if (element.kindOf === ETokenMessage.EMOJIS) {
					formattedContent += EmojiMarkup({ shortname: contentInElement, emojiid: element.emojiid, isMessageReply: isMessageReply });
				}

				if (element.kindOf === ETokenMessage.MARKDOWNS || element.kindOf === ETokenMessage.LINKS) {
					formattedContent += formatBlockCode(contentInElement, isMessageReply);
				}

				if (element.kindOf === ETokenMessage.VOICE_LINKS) {
					const meetingCode = contentInElement?.split('/').pop();
					const allChannelVoice = Object.values(channelsEntities).flat();
					const voiceChannelFound = allChannelVoice?.find((channel) => channel.meeting_code === meetingCode) || null;

					if (!voiceChannelFound) {
						formattedContent += formatBlockCode(contentInElement, isMessageReply);
					} else {
						formattedContent += ChannelHashtag({ channelHashtagId: voiceChannelFound?.channel_id, channelsEntities, hashtagDmEntities });
					}
				}
				// eslint-disable-next-line react-hooks/exhaustive-deps
				lastIndex = e;
			});

			if (lastIndex < t?.length) {
				formattedContent += t?.slice?.(lastIndex)?.toString();
			}

			if (isEdited) {
				formattedContent += ` [${translate('edited')}](${EDITED_FLAG})`;
			}
			return formattedContent;
		}, [elements, t, mode]);

		const renderMarkdown = () => (
			<Markdown
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				style={{ ...(themeValue ? (markdownStyles(themeValue, isUnReadChannel, isLastMessage) as StyleSheet.NamedStyles<any>) : {}), ...customStyle }}
				rules={renderRulesCustom(isOnlyContainEmoji)}
				onLinkPress={(url) => {
					if (isOpenLink) {
						if (url.startsWith(TYPE_MENTION.userRoleMention)) {
							onMention && onMention(url.replace('@role', '@'));
							return false;
						}
						if (url.startsWith(TYPE_MENTION.userMention)) {
							onMention && onMention(url);
							return false;
						}
						if (url.startsWith(TYPE_MENTION.hashtag)) {
							const urlFormat = url.replace(/##voice%22|#%22|%22/g, '');
							const dataChannel = urlFormat.split('_');
							const payloadChannel = {
								type: Number(dataChannel?.[0] || 1),
								id: dataChannel?.[1],
								channel_id: dataChannel?.[1],
								clan_id: dataChannel?.[2],
								status: Number(dataChannel?.[3] || 1),
								meeting_code: dataChannel?.[4] || '',
								category_id: dataChannel?.[5]
							};
							onChannelMention && onChannelMention(payloadChannel);
							return false;
						}
						// Note: return false to prevent default
						return true;
					}
				}}
			>
				{formatBlockCode(contentRender?.trim(), isMessageReply)}
			</Markdown>
		);

		return isNumberOfLine ? (
			<View
				style={{
					flex: 1,
					maxHeight: isMessageReply ? size.s_17 : size.s_20 * 10 - size.s_10,
					overflow: 'hidden'
				}}
			>
				{isMessageReply && (
					<View
						style={{
							position: 'absolute',
							top: 0,
							left: 0,
							right: 0,
							bottom: 0,
							zIndex: 1
						}}
					/>
				)}
				{renderMarkdown()}
			</View>
		) : (
			renderMarkdown()
		);
	}
);
