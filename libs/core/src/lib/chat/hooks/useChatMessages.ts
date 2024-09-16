import { selectLastMessageByChannelId, useAppSelector } from '@mezon/store';
import { useMezon } from '@mezon/transport';
import { useMemo } from 'react';

export type useMessagesOptions = {
	channelId: string;
};

export function useChatMessages({ channelId }: useMessagesOptions) {
	const { clientRef } = useMezon();
	const client = clientRef.current;
	const lastMessage = useAppSelector((state) => selectLastMessageByChannelId(state, channelId));
	return useMemo(
		() => ({
			client,
			lastMessage
		}),
		[client, lastMessage]
	);
}
