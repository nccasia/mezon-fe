import { useChatTypings } from '@mezon/core';
import { useMemo } from 'react';

type ChannelTypingProps = {
	channelId: string;
};

export function ChannelTyping({ channelId }: ChannelTypingProps) {
	const { typingUsers } = useChatTypings({ channelId });

	const typingLabel = useMemo(() => {
		if (typingUsers.length === 1) {
			return `${typingUsers[0].user?.username} is typing...`;
		}
		if (typingUsers.length > 1) {
			return 'Several people are typing...';
		}
		return '';
	}, [typingUsers]);

	return <div className="pl-[66px] text-xs text-gray-400">{typingLabel}</div>;
}
