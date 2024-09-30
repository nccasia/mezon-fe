/* eslint-disable @typescript-eslint/no-explicit-any */
import { useChatSending } from '@mezon/core';
import { ActionEmitEvent, ID_MENTION_HERE, IRoleMention, Icons } from '@mezon/mobile-components';
import { Block, baseColor, size, useTheme } from '@mezon/mobile-ui';
import { emojiSuggestionActions, selectAttachmentByChannelId, selectChannelById, selectDmGroupCurrent } from '@mezon/store';
import { referencesActions, selectAllRolesClan, useAppDispatch } from '@mezon/store-mobile';
import {
	IEmojiOnMessage,
	IHashtagOnMessage,
	ILinkOnMessage,
	ILinkVoiceRoomOnMessage,
	IMarkdownOnMessage,
	IMentionOnMessage,
	IMessageSendPayload,
	filterEmptyArrays
} from '@mezon/utils';
import { ChannelStreamMode } from 'mezon-js';
import { ApiMessageMention, ApiMessageRef } from 'mezon-js/api.gen';
import { MutableRefObject, memo, useCallback, useMemo } from 'react';
import { DeviceEventEmitter, InteractionManager, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { EMessageActionType } from '../../../enums';
import { IMessageActionNeedToResolve, IPayloadThreadSendMessage } from '../../../types';
import { style } from '../ChatBoxBottomBar/style';

interface IChatMessageSendingProps {
	isAvailableSending: boolean;
	valueInputRef: any;
	mode: ChannelStreamMode;
	channelId: string;
	messageActionNeedToResolve: IMessageActionNeedToResolve | null;
	messageAction: EMessageActionType;
	clearInputAfterSendMessage: () => void;
	mentionsOnMessage?: MutableRefObject<IMentionOnMessage[]>;
	hashtagsOnMessage?: MutableRefObject<IHashtagOnMessage[]>;
	emojisOnMessage?: MutableRefObject<IEmojiOnMessage[]>;
	linksOnMessage?: MutableRefObject<ILinkOnMessage[]>;
	markdownsOnMessage?: MutableRefObject<IMarkdownOnMessage[]>;
	voiceLinkRoomOnMessage?: MutableRefObject<ILinkVoiceRoomOnMessage[]>;
}

export const ChatMessageSending = memo(
	({
		isAvailableSending,
		valueInputRef,
		channelId,
		mode,
		messageActionNeedToResolve,
		messageAction,
		clearInputAfterSendMessage,
		mentionsOnMessage,
		hashtagsOnMessage,
		emojisOnMessage,
		linksOnMessage,
		markdownsOnMessage,
		voiceLinkRoomOnMessage
	}: IChatMessageSendingProps) => {
		const { themeValue } = useTheme();
		const dispatch = useAppDispatch();
		const styles = style(themeValue);
		const attachmentFilteredByChannelId = useSelector(selectAttachmentByChannelId(channelId ?? ''));
		const rolesInClan = useSelector(selectAllRolesClan);
		const currentChannel = useSelector(selectChannelById(channelId));
		const currentDmGroup = useSelector(selectDmGroupCurrent(channelId));

		const { editSendMessage, sendMessage } = useChatSending({
			mode,
			channelOrDirect: mode === ChannelStreamMode.STREAM_MODE_CHANNEL ? currentChannel : currentDmGroup
		});

		const attachmentDataRef = useMemo(() => {
			return attachmentFilteredByChannelId?.files || [];
		}, [attachmentFilteredByChannelId]);

		const roleList = useMemo(() => {
			return rolesInClan?.map((item) => ({
				roleId: item.id ?? '',
				roleName: item?.title ?? ''
			}));
		}, [rolesInClan]);

		const removeTags = (text: string) => {
			if (!text) return '';
			return text
				?.replace?.(/@\[(.*?)\]/g, '@$1')
				?.replace?.(/<#(.*?)>/g, '#$1')
				?.replace?.(/:(\w+):/g, '$1');
		};

		const onEditMessage = useCallback(
			async (editMessage: IMessageSendPayload, messageId: string, mentions: ApiMessageMention[]) => {
				if (editMessage?.t === messageActionNeedToResolve?.targetMessage?.content?.t) return;
				const { attachments } = messageActionNeedToResolve.targetMessage;
				await editSendMessage(editMessage, messageId, mentions, attachments, false);
			},
			[editSendMessage, messageActionNeedToResolve]
		);

		const doesIdRoleExist = (id: string, roles: IRoleMention[]): boolean => {
			return roles?.some((role) => role?.roleId === id);
		};

		const handleSendMessage = async () => {
			const simplifiedMentionList = !mentionsOnMessage?.current
				? []
				: mentionsOnMessage?.current?.map?.((mention) => {
						const isRole = doesIdRoleExist(mention?.user_id ?? '', roleList ?? []);
						if (isRole) {
							const role = roleList?.find((role) => role.roleId === mention.user_id);
							return {
								role_id: role?.roleId,
								s: mention.s,
								e: mention.e
							};
						} else {
							return {
								user_id: mention.user_id,
								s: mention.s,
								e: mention.e
							};
						}
					});
			const payloadSendMessage: IMessageSendPayload = {
				t: removeTags(valueInputRef?.current),
				hg: hashtagsOnMessage?.current || [],
				ej: emojisOnMessage?.current || [],
				lk: linksOnMessage?.current || [],
				mk: markdownsOnMessage?.current || [],
				vk: voiceLinkRoomOnMessage?.current || []
			};

			const payloadThreadSendMessage: IPayloadThreadSendMessage = {
				content: payloadSendMessage,
				mentions: simplifiedMentionList,
				attachments: [],
				references: []
			};
			const { targetMessage, type } = messageActionNeedToResolve || {};
			const reference = targetMessage
				? ([
						{
							message_id: '',
							message_ref_id: targetMessage.id,
							ref_type: 0,
							message_sender_id: targetMessage?.sender_id,
							message_sender_username: targetMessage?.username,
							mesages_sender_avatar: targetMessage.clan_avatar ? targetMessage.clan_avatar : targetMessage.avatar,
							message_sender_clan_nick: targetMessage?.clan_nick,
							message_sender_display_name: targetMessage?.display_name,
							content: JSON.stringify(targetMessage.content),
							has_attachment: Boolean(targetMessage?.attachments?.length),
							channel_id: targetMessage.channel_id ?? '',
							mode: targetMessage.mode ?? 0,
							channel_label: targetMessage.channel_label
						}
					] as Array<ApiMessageRef>)
				: undefined;
			dispatch(emojiSuggestionActions.setSuggestionEmojiPicked(''));
			dispatch(
				referencesActions.setAtachmentAfterUpload({
					channelId,
					files: []
				})
			);
			clearInputAfterSendMessage();
			const sendMessageAsync = async () => {
				if ([EMessageActionType.CreateThread].includes(messageAction)) {
					DeviceEventEmitter.emit(ActionEmitEvent.SEND_MESSAGE, payloadThreadSendMessage);
				} else {
					if (type === EMessageActionType.EditMessage) {
						await onEditMessage(
							filterEmptyArrays(payloadSendMessage),
							messageActionNeedToResolve?.targetMessage?.id,
							simplifiedMentionList || []
						);
					} else {
						const isMentionEveryOne = mentionsOnMessage?.current?.some?.((mention) => mention.user_id === ID_MENTION_HERE);
						await sendMessage(
							filterEmptyArrays(payloadSendMessage),
							simplifiedMentionList || [],
							attachmentDataRef || [],
							reference,
							false,
							isMentionEveryOne,
							true
						);
					}
				}
			};

			InteractionManager.runAfterInteractions(() => {
				setTimeout(() => {
					sendMessageAsync().catch((error) => {
						console.log('Error sending message:', error);
					});
				}, 0);
			});
		};

		return (
			<Block alignItems="center" justifyContent="center">
				{(isAvailableSending || !!attachmentDataRef?.length) && (
					<TouchableOpacity activeOpacity={0.8} onPress={handleSendMessage} style={[styles.btnIcon, styles.iconSend]}>
						<Icons.SendMessageIcon width={size.s_18} height={size.s_18} color={baseColor.white} />
					</TouchableOpacity>
				)}
				{/*{isAvailableSending || !!attachmentDataRef?.length ? (*/}
				{/*	<View onTouchEnd={handleSendMessage} style={[styles.btnIcon, styles.iconSend]}>*/}
				{/*		<Icons.SendMessageIcon width={18} height={18} color={baseColor.white} />*/}
				{/*	</View>*/}
				{/*) : (*/}
				{/*	<TouchableOpacity onPress={() => Toast.show({ type: 'info', text1: 'Updating...' })} style={styles.btnIcon}>*/}
				{/*		<Icons.MicrophoneIcon width={22} height={22} color={themeValue.textStrong} />*/}
				{/*	</TouchableOpacity>*/}
				{/*)}*/}
			</Block>
		);
	}
);
