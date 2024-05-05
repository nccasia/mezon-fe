import { useChatMessages } from '@mezon/core';
import { ChannelMessage } from './ChannelMessage';
import useKeepScrollPosition from './useKeepScrollPosition';
import useMessages from './useMessages';

type ChannelMessagesProps = {
	channelId: string;
	type: string;
	channelLabel?: string;
	avatarDM?: string;
	mode: number;
};

export default function ChannelMessages({ channelId, channelLabel, type, avatarDM, mode }: ChannelMessagesProps) {
	const { messages, unreadMessageId, lastMessageId, hasMoreMessage, loadMoreMessage } = useChatMessages({ channelId });
	const { setLastMessageRef } = useMessages();
	const { containerRef } = useKeepScrollPosition([messages]);
	const handleScroll = () => {
		if (containerRef.current) {
			const scrollTop = containerRef.current.scrollTop;
			console.log(scrollTop);
			setLastMessageRef(scrollTop === 0);
		}
	};

	return (
		<div style={{ overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
			<h1>Keep Scroll Positon On Chat Re-render</h1>
			<div style={{ overflow: 'auto', display: 'flex', flexDirection: 'column' }} ref={containerRef} onScroll={handleScroll}>
				{Array.isArray(messages) &&
					messages.map((m, i) => (
						<div key={m.id}>
							<div>
								<ChannelMessage
									mode={mode}
									key={m.id}
									// lastSeen={message.id === unreadMessageId && message.id !== lastMessageId}
									message={m}
									preMessage={messages.length > 0 ? messages[i - 1] : undefined}
									channelId={channelId}
									channelLabel={channelLabel || ''}
								/>
							</div>
						</div>
					))}
			</div>
		</div>
	);
}
