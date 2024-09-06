import { useMenu } from '@mezon/core';
import { referencesActions, selectCloseMenu, selectCurrentChannelId, threadsActions, useAppDispatch, useAppSelector } from '@mezon/store';
import { IChannel } from '@mezon/utils';
import { memo } from 'react';
import { useSelector } from 'react-redux';
import ThreadLink from './ThreadLink';

type ThreadListChannelProps = {
	threads: IChannel[];
};

const ThreadListChannel = ({ threads }: ThreadListChannelProps) => {
	const dispatch = useAppDispatch();
	const currentChannelId = useAppSelector(selectCurrentChannelId);

	const { setStatusMenu } = useMenu();
	const closeMenu = useSelector(selectCloseMenu);

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
};

export default memo(ThreadListChannel);
