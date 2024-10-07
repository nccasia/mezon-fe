import { messagesActions, selectAllAccount, selectAnonymousMode, selectChannelById, useAppDispatch } from '@mezon/store';
import { useMezon } from '@mezon/transport';
import { IMessageSendPayload } from '@mezon/utils';
import { ChannelStreamMode } from 'mezon-js';
import { ApiChannelDescription, ApiMessageAttachment, ApiMessageMention, ApiMessageRef } from 'mezon-js/api.gen';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

export type UseChatSendingOptions = {
	mode: number;
	channelOrDirect: ApiChannelDescription | undefined;
};

// TODO: separate this hook into 2 hooks for send and edit message
export function useChatSending({ mode, channelOrDirect }: UseChatSendingOptions) {
	const getClanId = useMemo(() => {
		return channelOrDirect?.clan_id;
	}, [channelOrDirect?.clan_id]);

	const isPublic = useMemo(() => {
		return !channelOrDirect?.channel_private;
	}, [channelOrDirect?.channel_private]);

	const channelIdOrDirectId = useMemo(() => {
		return channelOrDirect?.channel_id;
	}, [channelOrDirect?.channel_id]);

	const parentId = useMemo(() => {
		if (mode === ChannelStreamMode.STREAM_MODE_CHANNEL) {
			return channelOrDirect?.parrent_id;
		}
	}, [channelOrDirect?.parrent_id, mode]);
	const parent = useSelector(selectChannelById(parentId || ''));

	const isParentPublic = useMemo(() => {
		return parent ? !parent.channel_private : false;
	}, [parent?.channel_private]);

	const userProfile = useSelector(selectAllAccount);
	const currentUserId = userProfile?.user?.id || '';
	const anonymousMode = useSelector(selectAnonymousMode);
	const dispatch = useAppDispatch();
	const { clientRef, sessionRef, socketRef } = useMezon();
	const sendMessage = React.useCallback(
		async (
			content: IMessageSendPayload,
			mentions?: Array<ApiMessageMention>,
			attachments?: Array<ApiMessageAttachment>,
			references?: Array<ApiMessageRef>,
			anonymous?: boolean,
			mentionEveryone?: boolean,
			isMobile?: boolean
		) => {
			await dispatch(
				messagesActions.sendMessage({
					parentId: parentId ?? '',
					channelId: channelIdOrDirectId ?? '',
					clanId: getClanId || '',
					mode,
					isPublic: isPublic,
					isParentPublic: isParentPublic,
					content,
					mentions,
					attachments,
					references,
					anonymous,
					mentionEveryone,
					senderId: currentUserId,
					avatar: userProfile?.user?.avatar_url,
					isMobile
				})
			);
		},
		[dispatch, channelIdOrDirectId, getClanId, mode, isPublic, currentUserId]
	);

	const sendMessageTyping = React.useCallback(async () => {
		if (!anonymousMode) {
			dispatch(
				messagesActions.sendTypingUser({
					clanId: getClanId || '',
					parentId: parentId ?? '',
					channelId: channelIdOrDirectId ?? '',
					mode,
					isPublic: isPublic,
					isParentPublic: isParentPublic
				})
			);
		}
	}, [channelIdOrDirectId, getClanId, dispatch, isPublic, mode, anonymousMode]);

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
			if (!client || !session || !socket || !channelOrDirect) {
				throw new Error('Client is not initialized');
			}

			await socket.updateChatMessage(
				getClanId || '',
				parentId || '',
				channelIdOrDirectId ?? '',
				mode,
				isPublic,
				isParentPublic,
				messageId,
				content,
				mentions,
				attachments,
				hideEditted
			);
		},
		[sessionRef, clientRef, socketRef, channelOrDirect, getClanId, channelIdOrDirectId, mode, isPublic]
	);

	return useMemo(
		() => ({
			sendMessage,
			sendMessageTyping,
			editSendMessage
		}),
		[sendMessage, sendMessageTyping, editSendMessage]
	);
}
