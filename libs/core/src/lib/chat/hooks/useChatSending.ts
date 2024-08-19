import {
	messagesActions,
	selectChannelById,
	selectCurrentClanId,
	selectCurrentUserId,
	selectDirectById,
	selectNewMesssageUpdateImage,
	useAppDispatch,
} from '@mezon/store';
import { useMezon } from '@mezon/transport';
import { IMessageSendPayload } from '@mezon/utils';
import { ChannelStreamMode } from 'mezon-js';
import { ApiMessageAttachment, ApiMessageMention, ApiMessageRef } from 'mezon-js/api.gen';
import React, { useEffect, useMemo, useState } from 'react';
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
	const newMessageIdUpdateImage = useSelector(selectNewMesssageUpdateImage);

	const dispatch = useAppDispatch();
	const direct = useSelector(selectDirectById(directMessageId || directId || ''));
	const { clientRef, sessionRef, socketRef } = useMezon();
	const channel = useSelector(selectChannelById(channelId));
	let channelID = channelId;
	let clanID = currentClanId;
	if (direct) {
		channelID = direct.id;
		clanID = '0';
	}

	const [contentPayload, setContentPayload] = useState<IMessageSendPayload>();
	const [mentionPayload, setMentionPayload] = useState<ApiMessageMention[]>();
	const [attachmentPayload, setAttachmentPayload] = useState<ApiMessageAttachment[]>();

	const sendMessage = React.useCallback(
		async (
			content: IMessageSendPayload,
			mentions?: Array<ApiMessageMention>,
			attachments?: Array<ApiMessageAttachment>,
			references?: Array<ApiMessageRef>,
			anonymous?: boolean,
			mentionEveryone?: boolean,
		) => {
			setContentPayload(content);
			setMentionPayload(mentions);
			setAttachmentPayload(attachments);

			await dispatch(
				messagesActions.sendMessage({
					channelId: channelID,
					clanId: clanID || '',
					mode,
					content,
					mentions,
					attachments,
					references,
					anonymous,
					mentionEveryone,
					senderId: currentUserId,
				}),
			);
		},
		[dispatch, channelID, clanID, mode, currentUserId],
	);

	const sendMessageTyping = React.useCallback(async () => {
		dispatch(messagesActions.sendTypingUser({ clanId: clanID || '', channelId, mode }));
	}, [channelId, clanID, dispatch, mode]);

	// Move this function to to a new action of messages slice
	const editSendMessage = React.useCallback(
		async (content: IMessageSendPayload, messageId: string, mentions: ApiMessageMention[], attachments?: ApiMessageAttachment[]) => {
			const session = sessionRef.current;
			const client = clientRef.current;
			const socket = socketRef.current;

			if (!client || !session || !socket || (!channel && !direct)) {
				throw new Error('Client is not initialized');
			}

			await socket.updateChatMessage(clanID || '', channelId, mode, messageId, content, mentions, attachments);
		},
		[sessionRef, clientRef, socketRef, channel, direct, clanID, channelId, mode],
	);

	const updateImageLinkMessage = React.useCallback(
		async (
			clanId: string,
			channelId: string,
			mode: ChannelStreamMode,
			content: IMessageSendPayload,
			messageId: string,
			mentions: ApiMessageMention[],
			attachments?: ApiMessageAttachment[],
		) => {
			const session = sessionRef.current;
			const client = clientRef.current;
			const socket = socketRef.current;

			if (!client || !session || !socket || (!channel && !direct)) {
				throw new Error('Client is not initialized');
			}

			await socket.updateChatMessage(clanId, channelId, mode, messageId, content, mentions, attachments);
		},
		[sessionRef, clientRef, socketRef, channel, direct, clanID, channelId, mode],
	);
	const { processLink } = useProcessLink({ updateImageLinkMessage });

	useEffect(() => {
		if (newMessageIdUpdateImage.clan_id !== '0') {
			processLink(
				newMessageIdUpdateImage.clan_id!,
				newMessageIdUpdateImage.channel_id!,
				newMessageIdUpdateImage.mode!,
				contentPayload,
				mentionPayload,
				attachmentPayload,
				newMessageIdUpdateImage.message_id,
			);
		}
		setContentPayload({});
		setMentionPayload([]);
		setAttachmentPayload([]);
	}, [newMessageIdUpdateImage.message_id]);

	return useMemo(
		() => ({
			updateImageLinkMessage,
			sendMessage,
			sendMessageTyping,
			editSendMessage,
		}),
		[updateImageLinkMessage, sendMessage, sendMessageTyping, editSendMessage],
	);
}
