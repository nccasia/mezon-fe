import {
	messagesActions,
	selectChannelById,
	selectCurrentClanId,
	selectCurrentUserId,
	selectDirectById,
	selectNewMesssageUpdateImage,
	useAppDispatch
} from '@mezon/store';
import { useMezon } from '@mezon/transport';
import { IMessageSendPayload, IMessageWithUser } from '@mezon/utils';
import { ChannelStreamMode } from 'mezon-js';
import { ApiMessageAttachment, ApiMessageMention, ApiMessageRef } from 'mezon-js/api.gen';
import React, { useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useAppParams } from '../../app/hooks/useAppParams';
import { useProcessLink } from './useProcessLink';

export type UseChatSendingOptions = {
	channelId: string;
	mode: number;
	directMessageId?: string;
};

// TODO: separate this hook into 2 hooks for send and edit message
export function useChatSending({ channelId, mode, directMessageId }: UseChatSendingOptions) {
	const { directId } = useAppParams();
	const currentClanId = useSelector(selectCurrentClanId);
	const currentUserId = useSelector(selectCurrentUserId);

	const newMessageUpdateImage = useSelector(selectNewMesssageUpdateImage);

	const currentDmOrChannelId = useMemo(
		() => (mode === ChannelStreamMode.STREAM_MODE_CHANNEL ? channelId : directMessageId),
		[channelId, directMessageId, mode]
	);

	const dispatch = useAppDispatch();
	const direct = useSelector(selectDirectById(directMessageId || directId || ''));
	const { clientRef, sessionRef, socketRef } = useMezon();
	//TODO: fix channel dispatch too much
	const channel = useSelector(selectChannelById(channelId));
	let channelID = channelId;
	let clanID = currentClanId;
	let isPublic = false;
	if (direct) {
		channelID = direct.id;
		clanID = '0';
	}
	if (channel) {
		isPublic = !channel.channel_private;
	}

	const sendMessage = React.useCallback(
		async (
			content: IMessageSendPayload,
			mentions?: Array<ApiMessageMention>,
			attachments?: Array<ApiMessageAttachment>,
			references?: Array<ApiMessageRef>,
			anonymous?: boolean,
			mentionEveryone?: boolean
		) => {
			await dispatch(
				messagesActions.sendMessage({
					channelId: channelID,
					clanId: clanID || '',
					mode,
					isPublic: isPublic,
					content,
					mentions,
					attachments,
					references,
					anonymous,
					mentionEveryone,
					senderId: currentUserId
				})
			);
		},
		[dispatch, channelID, clanID, mode, isPublic, currentUserId]
	);

	const sendMessageTyping = React.useCallback(async () => {
		dispatch(
			messagesActions.sendTypingUser({
				clanId: clanID || '',
				channelId,
				mode,
				isPublic: isPublic
			})
		);
	}, [channelId, clanID, dispatch, isPublic, mode]);

	// Move this function to to a new action of messages slice
	const editSendMessage = React.useCallback(
		async (
			content: IMessageSendPayload,
			messageId: string,
			mentions: ApiMessageMention[],
			attachments?: ApiMessageAttachment[],
			hideEditted?: boolean
		) => {
			const session = sessionRef.current;
			const client = clientRef.current;
			const socket = socketRef.current;
			if (!client || !session || !socket || (!channel && !direct)) {
				throw new Error('Client is not initialized');
			}

			await socket.updateChatMessage(clanID || '', channelId, mode, isPublic, messageId, content, mentions, attachments, hideEditted);
		},
		[sessionRef, clientRef, socketRef, channel, direct, clanID, channelId, mode, isPublic]
	);

	const updateImageLinkMessage = React.useCallback(
		async (
			clanId?: string,
			channelId?: string,
			mode?: ChannelStreamMode,
			content?: IMessageSendPayload,
			messageId?: string,
			mentions?: ApiMessageMention[],
			attachments?: ApiMessageAttachment[],
			messageEdit?: IMessageWithUser,
			hideEditted?: boolean
		) => {
			const session = sessionRef.current;
			const client = clientRef.current;
			const socket = socketRef.current;

			if (!client || !session || !socket || (!channel && !direct)) {
				throw new Error('Client is not initialized');
			}

			await socket.updateChatMessage(
				clanId ?? '',
				channelId ?? '',
				mode ?? 0,
				isPublic,
				messageId ?? '',
				content,
				mentions,
				attachments,
				hideEditted
			);
		},
		[sessionRef, clientRef, socketRef, channel, direct, isPublic]
	);

	const { processLink } = useProcessLink({ updateImageLinkMessage });

	useEffect(() => {
		if (newMessageUpdateImage.mode === ChannelStreamMode.STREAM_MODE_CHANNEL && newMessageUpdateImage.isMe) {
			processLink(
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				newMessageUpdateImage.clan_id!,
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				newMessageUpdateImage.channel_id!,
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				newMessageUpdateImage.mode!,
				newMessageUpdateImage.content,
				newMessageUpdateImage.mentions,
				newMessageUpdateImage.attachments,
				newMessageUpdateImage.message_id
			);
		}
	}, [newMessageUpdateImage.message_id]);

	return useMemo(
		() => ({
			updateImageLinkMessage,
			sendMessage,
			sendMessageTyping,
			editSendMessage
		}),
		[updateImageLinkMessage, sendMessage, sendMessageTyping, editSendMessage]
	);
}
