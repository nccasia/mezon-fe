import { messagesActions, selectChannelById, selectCurrentClanId, selectCurrentUserId, selectDirectById, useAppDispatch } from '@mezon/store';
import { useMezon } from '@mezon/transport';
import { IMessageSendPayload } from '@mezon/utils';
import { ApiMessageAttachment, ApiMessageMention, ApiMessageRef } from 'mezon-js/api.gen';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useAppParams } from '../../app/hooks/useAppParams';

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

	const dispatch = useAppDispatch();
	// TODO: if direct is the same as channel use one slice
	// If not, using 2 hooks for direct and channel
	const direct = useSelector(selectDirectById(directMessageId || directId || ''));
	const { clientRef, sessionRef, socketRef } = useMezon();
	const channel = useSelector(selectChannelById(channelId));
	let channelID = channelId;
	let clanID = currentClanId;
	if (direct) {
		channelID = direct.id;
		clanID = '0';
	}
	const sendMessage = React.useCallback(
		async (
			content: IMessageSendPayload,
			mentions?: Array<ApiMessageMention>,
			attachments?: Array<ApiMessageAttachment>,
			references?: Array<ApiMessageRef>,
			anonymous?: boolean,
			mentionEveryone?: boolean,
		) => {
			return dispatch(
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

	// TODO: why "Edit" not "edit"?
	// Move this function to to a new action of messages slice
	const editSendMessage = React.useCallback(
		async (content: IMessageSendPayload, messageId: string) => {
			const session = sessionRef.current;
			const client = clientRef.current;
			const socket = socketRef.current;

			if (!client || !session || !socket || (!channel && !direct)) {
				throw new Error('Client is not initialized');
			}

			await socket.updateChatMessage(clanID || '', channelId, mode, messageId, content);
		},
		[sessionRef, clientRef, socketRef, channel, direct, clanID, channelId, mode],
	);

	return useMemo(
		() => ({
			sendMessage,
			sendMessageTyping,
			editSendMessage,
		}),
		[sendMessage, sendMessageTyping, editSendMessage],
	);
}
