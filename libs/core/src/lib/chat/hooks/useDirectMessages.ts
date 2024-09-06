import { directActions, messagesActions, selectDirectById, selectNewMesssageUpdateImage, useAppDispatch } from '@mezon/store';
import { handleUploadFile, useMezon } from '@mezon/transport';
import { IMessageSendPayload, fetchAndCreateFiles } from '@mezon/utils';
import { ChannelStreamMode } from 'mezon-js';
import { ApiMessageAttachment, ApiMessageMention, ApiMessageRef } from 'mezon-js/api.gen';
import React, { useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useChatMessages } from './useChatMessages';
import { useChatSending } from './useChatSending';
import { useProcessLink } from './useProcessLink';

export type UseDirectMessagesOptions = {
	channelId: string;
	mode: number;
};

export function useDirectMessages({ channelId, mode }: UseDirectMessagesOptions) {
	const { clientRef, sessionRef, socketRef } = useMezon();
	const newMessageUpdateImage = useSelector(selectNewMesssageUpdateImage);

	const client = clientRef.current;
	const dispatch = useAppDispatch();
	const { lastMessage } = useChatMessages({ channelId });
	const channel = useSelector(selectDirectById(channelId));

	const sendDirectMessage = React.useCallback(
		async (
			content: IMessageSendPayload,
			mentions?: Array<ApiMessageMention>,
			attachments?: Array<ApiMessageAttachment>,
			references?: Array<ApiMessageRef>
		) => {
			const session = sessionRef.current;
			const client = clientRef.current;
			const socket = socketRef.current;

			if (!client || !session || !socket || !channel) {
				throw new Error('Client is not initialized');
			}

			let uploadedFiles: ApiMessageAttachment[] = [];
			if (attachments && attachments.length > 0) {
				const createdFiles = await fetchAndCreateFiles(attachments);

				const uploadPromises = createdFiles.map((file, index) => {
					return handleUploadFile(client, session, '0', channel.id, file.name, file, index);
				});

				uploadedFiles = await Promise.all(uploadPromises);
			}

			await socket.writeChatMessage(
				'0',
				channel.id,
				mode,
				!channel.channel_private,
				content,
				mentions,
				uploadedFiles,
				references,
				false,
				false
			);
			const timestamp = Date.now() / 1000;
			dispatch(directActions.setDirectLastSeenTimestamp({ channelId: channel.id, timestamp }));
			if (lastMessage) {
				dispatch(directActions.updateLastSeenTime(lastMessage));
			}
		},
		[sessionRef, clientRef, socketRef, channel, mode, dispatch, lastMessage]
	);

	const loadMoreMessage = React.useCallback(async () => {
		dispatch(messagesActions.loadMoreMessage({ channelId }));
	}, [dispatch, channelId]);

	const sendMessageTyping = React.useCallback(async () => {
		dispatch(messagesActions.sendTypingUser({ clanId: '0', channelId: channelId, mode: mode, isPublic: false }));
	}, [channelId, dispatch, mode]);

	const { updateImageLinkMessage } = useChatSending({ channelId, mode });

	const { processLink } = useProcessLink({ updateImageLinkMessage });
	useEffect(() => {
		if (newMessageUpdateImage.mode !== ChannelStreamMode.STREAM_MODE_CHANNEL && newMessageUpdateImage.isMe) {
			processLink(
				newMessageUpdateImage.clan_id!,
				newMessageUpdateImage.channel_id!,
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
			client,
			sendDirectMessage,
			loadMoreMessage,
			sendMessageTyping
		}),
		[client, sendMessageTyping, sendDirectMessage, loadMoreMessage]
	);
}
