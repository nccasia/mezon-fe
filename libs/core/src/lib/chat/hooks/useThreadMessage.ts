import { channelsActions, messagesActions, selectCurrentChannel, useAppDispatch } from '@mezon/store';
import { useMezon } from '@mezon/transport';
import { IMessageSendPayload } from '@mezon/utils';
import React, { useMemo, useState } from 'react';
import { ApiMessageAttachment, ApiMessageMention, ApiMessageRef } from 'mezon-js/api.gen';
import { useClans } from './useClans';
import { useSelector } from 'react-redux';
import { ChannelStreamMode } from 'mezon-js';

export type UseThreadMessage = {
	channelId: string;
	channelLabel: string;
	mode: number;
};

export function useThreadMessage({ channelId, channelLabel, mode }: UseThreadMessage) {
	const { currentClanId } = useClans();
	const dispatch = useAppDispatch();

	const { clientRef, sessionRef, socketRef } = useMezon();

	// TODO: FIX current thread
	const thread = useSelector(selectCurrentChannel)

	const sendMessageThread = React.useCallback(
		async (
			content: IMessageSendPayload,
			mentions?: Array<ApiMessageMention>,
			attachments?: Array<ApiMessageAttachment>,
			references?: Array<ApiMessageRef>,
		) => {
			const session = sessionRef.current;
			const client = clientRef.current;
			const socket = socketRef.current;

			if (!client || !session || !socket || !thread || !currentClanId) {
				throw new Error('Client is not initialized');
			}

			await socket.writeChatMessage(currentClanId, thread.id, thread.channel_label ?? '', mode, {t: content.t}, mentions, attachments, references);
			if(content.contentThread){
				await socket.writeChatMessage(currentClanId, thread.id, thread.channel_label ?? '', mode, {t: content.contentThread}, [], [], undefined);
			}

			const timestamp = Date.now() / 1000;
			dispatch(channelsActions.setChannelLastSeenTimestamp({ channelId, timestamp }));
		},
		[sessionRef, clientRef, socketRef, thread, currentClanId, mode, dispatch, channelId],
	);

	const sendMessageTyping = React.useCallback(async () => {
		if (channelId && channelLabel) {
			dispatch(messagesActions.sendTypingUser({ channelId, channelLabel, mode }));
		}
	}, [channelId, channelLabel, dispatch, mode]);

	const EditSendMessage = React.useCallback(
		async (content: string, messageId: string) => {
			const editMessage: IMessageSendPayload = {
				t: content,
			};
			const session = sessionRef.current;
			const client = clientRef.current;
			const socket = socketRef.current;

			if (!client || !session || !socket || !thread || !currentClanId) {
				throw new Error('Client is not initialized');
			}
			await socket.updateChatMessage(channelId, channelLabel, mode, messageId, editMessage);
		},
		[sessionRef, clientRef, socketRef, thread, currentClanId, mode, channelId, channelLabel],
	);

	return useMemo(
		() => ({
			sendMessageThread,
			sendMessageTyping,
			EditSendMessage,
		}),
		[sendMessageThread, sendMessageTyping, EditSendMessage],
	);
}
