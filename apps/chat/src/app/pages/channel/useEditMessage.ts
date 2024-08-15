import { useChatSending } from '@mezon/core';
import { messagesActions, referencesActions, selectIdMessageRefEdit, selectOpenEditMessageState } from '@mezon/store';
import { IMessageSendPayload, IMessageWithUser } from '@mezon/utils';
import { ApiMessageMention } from 'mezon-js/api.gen';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export const useEditMessage = (channelId: string, channelLabel: string, mode: number, message: IMessageWithUser) => {
	const dispatch = useDispatch();
	const { editSendMessage } = useChatSending({ channelId: channelId || '', mode });

	const openEditMessageState = useSelector(selectOpenEditMessageState);
	const idMessageRefEdit = useSelector(selectIdMessageRefEdit);

	const handleCancelEdit = useCallback(() => {
		dispatch(referencesActions.setIdReferenceMessageEdit(''));
		dispatch(messagesActions.deleteChannelDraftMessage({ channelId }));
		dispatch(referencesActions.setOpenEditMessageState(false));
	}, [channelId, dispatch]);

	const setChannelDraftMessage = useCallback(
		(channelId: string, message_id: string, draftContent: IMessageSendPayload, draftMention: ApiMessageMention[]) => {
			dispatch(
				messagesActions.setChannelDraftMessage({
					channelId: channelId as string,
					channelDraftMessage: {
						message_id: message_id,
						draftContent: draftContent,
						draftMention: draftMention,
					},
				}),
			);
		},
		[dispatch],
	);

	const handleSend = useCallback(
		(editMessage: IMessageSendPayload, messageId: string, draftMention: ApiMessageMention[]) => {
			editSendMessage(editMessage, messageId, draftMention);
			setChannelDraftMessage(channelId, messageId, editMessage, draftMention);
			dispatch(referencesActions.setOpenEditMessageState(false));
		},
		[editSendMessage],
	);

	return {
		openEditMessageState,
		idMessageRefEdit,
		handleCancelEdit,
		handleSend,
		setChannelDraftMessage,
	};
};
