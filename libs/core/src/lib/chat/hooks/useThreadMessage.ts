import { channelMetaActions, messagesActions, selectChannelById, selectCurrentChannel, selectCurrentClanId, useAppDispatch } from '@mezon/store';
import { useMezon } from '@mezon/transport';
import { IMessageSendPayload } from '@mezon/utils';
import { ApiChannelDescription, ApiMessageAttachment, ApiMessageMention, ApiMessageRef } from 'mezon-js/api.gen';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

export type UseThreadMessage = {
	channelId: string;
	mode: number;
};

export function useThreadMessage({ channelId, mode }: UseThreadMessage) {
	const currentClanId = useSelector(selectCurrentClanId);
	const parent = useSelector(selectCurrentChannel);
	const thread = useSelector(selectChannelById(channelId));
	const dispatch = useAppDispatch();

	const { clientRef, sessionRef, socketRef } = useMezon();

	const sendMessageThread = React.useCallback(
		async (
			content: IMessageSendPayload,
			mentions?: Array<ApiMessageMention>,
			attachments?: Array<ApiMessageAttachment>,
			references?: Array<ApiMessageRef>,
			thread?: ApiChannelDescription
		) => {
			const session = sessionRef.current;
			const client = clientRef.current;
			const socket = socketRef.current;

			if (!client || !session || !socket || !thread || !currentClanId) {
				throw new Error('Client is not initialized');
			}

			await socket.writeChatMessage(
				currentClanId,
				thread.parrent_id as string,
				thread.channel_id as string,
				mode,
				thread ? !thread.channel_private : false,
				parent ? !parent.channel_private : false,
				{ t: content.t },
				mentions,
				attachments,
				references
			);

			const timestamp = Date.now() / 1000;
			dispatch(channelMetaActions.setChannelLastSeenTimestamp({ channelId, timestamp }));
		},
		[sessionRef, clientRef, socketRef, currentClanId, mode, parent, dispatch, channelId]
	);

	const sendMessageTyping = React.useCallback(async () => {
		if (channelId) {
			dispatch(
				messagesActions.sendTypingUser({
					clanId: currentClanId || '',
					parentId: parent?.parrent_id || '',
					channelId,
					mode,
					isPublic: thread ? !thread.channel_private : false,
					isParentPublic: parent ? !parent.channel_private : false
				})
			);
		}
	}, [channelId, dispatch, currentClanId, parent, mode, thread]);

	const editSendMessage = React.useCallback(
		async (content: string, messageId: string) => {
			const editMessage: IMessageSendPayload = {
				t: content
			};
			const session = sessionRef.current;
			const client = clientRef.current;
			const socket = socketRef.current;

			if (!client || !session || !socket || !currentClanId) {
				throw new Error('Client is not initialized');
			}
			await socket.updateChatMessage(
				currentClanId,
				parent?.parrent_id || '',
				channelId,
				mode,
				thread ? !thread.channel_private : false,
				parent ? !parent.channel_private : false,
				messageId,
				editMessage
			);
		},
		[sessionRef, clientRef, socketRef, currentClanId, parent, channelId, mode, thread]
	);

	return useMemo(
		() => ({
			sendMessageThread,
			sendMessageTyping,
			editSendMessage
		}),
		[sendMessageThread, sendMessageTyping, editSendMessage]
	);
}
