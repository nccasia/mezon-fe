import { useChatSending } from '@mezon/core';
import {
	messagesActions,
	referencesActions,
	selectChannelDraftMessage,
	selectIdMessageRefEdit,
	selectOpenEditMessageState,
	useAppSelector,
} from '@mezon/store';
import { IMessageSendPayload, IMessageWithUser } from '@mezon/utils';
import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export const useEditMessage = (channelId: string, channelLabel: string, mode: number, message: IMessageWithUser) => {
	const dispatch = useDispatch();
	const { editSendMessage } = useChatSending({ channelId: channelId || '', mode });

	const openEditMessageState = useSelector(selectOpenEditMessageState);
	const idMessageRefEdit = useSelector(selectIdMessageRefEdit);
	const channelDraftMessage = useAppSelector((state) => selectChannelDraftMessage(state, channelId));

	const [content, setContent] = useState(channelDraftMessage.draftContent);

	const handleCancelEdit = useCallback(() => {
		dispatch(referencesActions.setIdReferenceMessageEdit(''));
		dispatch(messagesActions.deleteChannelDraftMessage({ channelId }));
	}, [dispatch]);

	const setChannelDraftMessage = useCallback(
		(channelId: string, message_id: string, draftContent: string) => {
			dispatch(
				messagesActions.setChannelDraftMessage({
					channelId: channelId as string,
					channelDraftMessage: {
						message_id,
						draftContent,
					},
				}),
			);
		},
		[dispatch],
	);

	const handleSend = useCallback(
		(editMessage: IMessageSendPayload, messageId: string) => {
			editSendMessage(editMessage, messageId);
			setChannelDraftMessage(channelId, messageId, editMessage.t);
		},
		[editSendMessage],
	);

	return {
		openEditMessageState,
		idMessageRefEdit,
		content,
		setContent,
		handleCancelEdit,
		handleSend,
		setChannelDraftMessage,
	};
};
