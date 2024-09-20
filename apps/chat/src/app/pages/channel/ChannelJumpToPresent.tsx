import { messagesActions, useAppDispatch } from '@mezon/store';
import { Icons } from '@mezon/ui';
import classNames from 'classnames';
import { useCallback } from 'react';

type ChannelTypingProps = {
	channelId: string;
	className?: string;
};

export function ChannelJumpToPresent({ channelId, className }: ChannelTypingProps) {
	const dispatch = useAppDispatch();

	const handleJumpToPresent = useCallback(() => {
		// Jump to present
		dispatch(messagesActions.fetchMessages({ channelId, isFetchingLatestMessages: true, noCache: true }));
		dispatch(messagesActions.setIdMessageToJump(null));
	}, [channelId, dispatch]);

	return (
		<div
			className={classNames('w-full h-full opacity-95 cursor-pointer dark:text-white text-black flex items-center justify-between', className)}
			onClick={handleJumpToPresent}
		>
			<div>You're viewing older messages</div>
			<div className="flex items-center gap-1">
				Jump to present<Icons.ArrowDown></Icons.ArrowDown>
			</div>
		</div>
	);
}
