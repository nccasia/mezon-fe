import { useDeleteMessage } from '@mezon/core';
import { useCallback, useState } from 'react';

export const useDeleteMessageHook = (channelId: string, channelLabel: string, mode: number) => {
	const { deleteSendMessage } = useDeleteMessage({ channelId: channelId || '', mode });
	const [deleteMessage, setDeleteMessage] = useState(false);

	const handleDeleteMessage = useCallback(() => {
		setDeleteMessage(true);
	}, []);

	return {
		deleteMessage,
		setDeleteMessage,
		handleDeleteMessage,
		deleteSendMessage
	};
};
