import React, { useCallback, useMemo } from 'react';
import { useAppNavigation } from '../../app/hooks/useAppNavigation';

export type useJumpToMessagesOptions = {
	channelId: string;
	messageID: string;
	clanId: string;
};

let messID: string | null = null;

export function useJumpToMessage({ channelId, messageID, clanId }: useJumpToMessagesOptions) {
	const { navigate, toMessageChannel } = useAppNavigation();

	const jumpToMessage = React.useCallback(async (messageId: string | null = null, positionToJump: ScrollLogicalPosition = 'center') => {
		if (messageId) {
			const messageElement = document.getElementById(messageId);
			if (messageElement) {
				messageElement.scrollIntoView({ behavior: 'smooth', block: positionToJump });
			}
			setJumpToMessageId(null);
		}
	}, []);

	const directToMessageById = useCallback(async () => {
		await navigate(toMessageChannel(channelId, clanId ?? '', messageID ?? ''));
	}, [navigate, toMessageChannel, channelId, clanId, messageID]);

	return useMemo(
		() => ({
			directToMessageById,
			jumpToMessage,
		}),
		[directToMessageById, jumpToMessage],
	);
}
export function getJumpToMessageId() {
	return messID;
}
export function setJumpToMessageId(messageID: string | null) {
	messID = messageID;
}
