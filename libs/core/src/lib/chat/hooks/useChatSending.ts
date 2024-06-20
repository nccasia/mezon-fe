import { channelsActions, messagesActions, selectCurrentChannel, selectDirectById, useAppDispatch } from '@mezon/store';
import { useMezon } from '@mezon/transport';
import { IMessageSendPayload } from '@mezon/utils';
import { ApiMessageAttachment, ApiMessageMention, ApiMessageRef } from 'mezon-js/api.gen';
import React, { useMemo, useState } from 'react';
import { useClans } from './useClans';
import { useSelector } from 'react-redux';
import { ChannelStreamMode } from 'mezon-js';

export type UseChatSendingOptions = {
	channelId: string;
	channelLabel: string;
	mode: number;
};

export function useChatSending({ channelId, channelLabel, mode }: UseChatSendingOptions) {
	const { currentClanId } = useClans();
	const dispatch = useAppDispatch();
	const direct = useSelector(selectDirectById(channelId));
	const { clientRef, sessionRef, socketRef } = useMezon();
	const channel = useSelector(selectCurrentChannel)

	const sendMessage = React.useCallback(
		async (
			content: IMessageSendPayload,
			mentions?: Array<ApiMessageMention>,
			attachments?: Array<ApiMessageAttachment>,
			references?: Array<ApiMessageRef>,
			anonymous?: boolean,
			mentionEveryone?: boolean,
		) => {
			const session = sessionRef.current;
			const client = clientRef.current;
			const socket = socketRef.current;

			if (!client || !session || !socket || !channel || !currentClanId) {
				throw new Error('Client is not initialized');
			}

			await socket.writeChatMessage(
				currentClanId,
				channel.id,
				channel.channel_label ?? '',
				mode,
				content,
				mentions,
				attachments,
				references,
				anonymous,
				mentionEveryone,
			);
			const timestamp = Date.now() / 1000;
			dispatch(channelsActions.setChannelLastSeenTimestamp({ channelId, timestamp }));
		},
		[sessionRef, clientRef, socketRef, channel, currentClanId, mode, dispatch, channelId],
	);

	const sendMessageTyping = React.useCallback(async () => {
		dispatch(messagesActions.sendTypingUser({ channelId, channelLabel, mode }));
	}, [channelId, channelLabel, dispatch, mode]);
	const EditSendMessage = React.useCallback(
		async (content: string, messageId: string) => {
			const editMessage: IMessageSendPayload = {
				t: content,
			};
			const session = sessionRef.current;
			const client = clientRef.current;
			const socket = socketRef.current;

			if (!client || !session || !socket || (!channel && !direct)) {
				throw new Error('Client is not initialized');
			}
			var channelLabelEdit = ""
			if (mode === ChannelStreamMode.STREAM_MODE_CHANNEL) {
				channelLabelEdit = channel?.channel_label || "";
			} 
			await socket.updateChatMessage(channelId, channelLabelEdit, mode, messageId, editMessage);
		},
		[sessionRef, clientRef, socketRef, channel, currentClanId, mode, channelId],
	);

	return useMemo(
		() => ({
			sendMessage,
			sendMessageTyping,
			EditSendMessage,
		}),
		[sendMessage, sendMessageTyping, EditSendMessage],
	);
}
