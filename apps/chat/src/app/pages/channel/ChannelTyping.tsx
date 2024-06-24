import { useChatTypings } from '@mezon/core';
import { useMemo } from 'react';

type ChannelTypingProps = {
	channelId: string;
	mode: number;
};

export function ChannelTyping({ channelId, mode }: ChannelTypingProps) {
	const { typingUsers } = useChatTypings({ channelId, mode });

	const typingLabel = useMemo(() => {
		if (typingUsers.length === 1) {
			return `${typingUsers[0].user?.username} is typing...`;
		}
		if (typingUsers.length > 1) {
			return 'Several people are typing...';
		}
		return '';
	}, [typingUsers]);

	return <div className="text-xs text-gray-400 absolute bottom-0 left-4 pl-4 cursor-default">{typingLabel}</div>;
}
