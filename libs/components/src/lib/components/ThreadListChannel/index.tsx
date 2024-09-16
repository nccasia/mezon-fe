import { useMenu } from '@mezon/core';
import { referencesActions, selectCloseMenu, selectCurrentChannelId, threadsActions, useAppDispatch, useAppSelector } from '@mezon/store';
import { IChannel } from '@mezon/utils';
import React, { memo, useImperativeHandle, useRef } from 'react';
import { useSelector } from 'react-redux';
import ThreadLink, { ThreadLinkRef } from './ThreadLink';

type ThreadListChannelProps = {
	threads: IChannel[];
};

export type ListThreadChannelRef = {
	scrollIntoThread: (threadId: string, options?: ScrollIntoViewOptions) => void;
};

const ThreadListChannel = React.forwardRef<ListThreadChannelRef, ThreadListChannelProps>(({ threads }: ThreadListChannelProps, ref) => {
	const dispatch = useAppDispatch();
	const currentChannelId = useAppSelector(selectCurrentChannelId);

	const { setStatusMenu } = useMenu();
	const closeMenu = useSelector(selectCloseMenu);

	const threadLinkRefs = useRef<Record<string, ThreadLinkRef | null>>({});

	useImperativeHandle(ref, () => ({
		scrollIntoThread: (threadId: string, options?: ScrollIntoViewOptions) => {
			const threadLinkElement = threadLinkRefs.current[threadId];
			if (threadLinkElement) {
				threadLinkElement.scrollToIntoView(options);
			}
		}
	}));

	const handleClickLink = (thread: IChannel) => {
		dispatch(referencesActions.setOpenEditMessageState(false));
		if (currentChannelId === thread.parrent_id) {
			dispatch(threadsActions.setIsShowCreateThread({ channelId: thread.parrent_id as string, isShowCreateThread: false }));
		}
		if (closeMenu) {
			setStatusMenu(false);
		}
		dispatch(threadsActions.setOpenThreadMessageState(false));
		dispatch(threadsActions.setValueThread(null));
	};

	return (
		<div className="flex flex-col ml-6">
			{threads.map((thread) => {
				const isFirstThread = threads.indexOf(thread) === 0;
				return (
					<ThreadLink
						ref={(node) => (threadLinkRefs.current[thread.id] = node)}
						isActive={currentChannelId === thread.id}
						key={thread.id}
						thread={thread}
						isFirstThread={isFirstThread}
						handleClick={handleClickLink}
					/>
				);
			})}
		</div>
	);
});

export default memo(ThreadListChannel);
