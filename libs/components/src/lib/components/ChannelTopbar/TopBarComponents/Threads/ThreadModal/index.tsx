import { useAppNavigation, usePermissionChecker, useReference, useThreads } from '@mezon/core';
import { searchMessagesActions, selectAllUserClans, selectCurrentChannel, selectTheme, threadsActions, useAppDispatch } from '@mezon/store';
import { Icons } from '@mezon/ui';
import { EOverriddenPermission } from '@mezon/utils';
import { Button } from 'flowbite-react';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import EmptyThread from './EmptyThread';
import GroupThreads from './GroupThreads';
import SearchThread from './SearchThread';
import ThreadItem from './ThreadItem';

type ThreadsProps = {
	setIsShowThread: React.Dispatch<React.SetStateAction<boolean>>;
};

const ThreadModal = ({ setIsShowThread }: ThreadsProps) => {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const { toChannelPage } = useAppNavigation();
	const { setIsShowCreateThread, threadChannel, threadChannelOld, threadChannelOnline } = useThreads();
	const { setOpenThreadMessageState } = useReference();
	const currentChannel = useSelector(selectCurrentChannel);
	const allUsesClan = useSelector(selectAllUserClans);
	const appearanceTheme = useSelector(selectTheme);
	const [canManageThread] = usePermissionChecker([EOverriddenPermission.manageThread], currentChannel?.id ?? '');

	const avatarMembers = useMemo(() => allUsesClan?.map((member) => member?.user?.avatar_url), [allUsesClan]);

	const handleCreateThread = () => {
		setOpenThreadMessageState(false);
		if (currentChannel && currentChannel?.parrent_id !== '0') {
			navigate(toChannelPage(currentChannel.parrent_id as string, currentChannel.clan_id as string));
		}
		setIsShowThread(false);
		setIsShowCreateThread(true, currentChannel?.parrent_id !== '0' ? currentChannel?.parrent_id : currentChannel.channel_id);
		dispatch(threadsActions.setNameThreadError(''));
		dispatch(threadsActions.setMessageThreadError(''));
		dispatch(searchMessagesActions.setIsSearchMessage({ channelId: currentChannel?.channel_id as string, isSearchMessage: false }));
	};

	return (
		<div className="absolute top-8 right-0 rounded-md dark:shadow-shadowBorder shadow-shadowInbox z-[99999999]">
			<div className="flex flex-col rounded-md min-h-[400px] md:w-[480px] max-h-[80vh] lg:w-[540px]  shadow-sm overflow-hidden">
				<div className="dark:bg-bgTertiary bg-bgLightTertiary flex flex-row items-center justify-between p-[16px] h-12">
					<div className="flex flex-row items-center border-r-[1px] dark:border-r-[#6A6A6A] border-r-[#E1E1E1] pr-[16px] gap-4">
						<Icons.ThreadIcon />
						<span className="text-base font-semibold cursor-default dark:text-white text-black">Threads</span>
					</div>
					<SearchThread />
					{canManageThread && (
						<div className="flex flex-row items-center gap-4">
							<Button
								onClick={handleCreateThread}
								size="sm"
								className="h-6 rounded focus:ring-transparent bg-bgSelectItem dark:bg-bgSelectItem hover:!bg-bgSelectItemHover items-center"
							>
								Create
							</Button>
							<button onClick={() => setIsShowThread(false)}>
								<Icons.Close defaultSize="w-4 h-4 dark:text-[#CBD5E0] text-colorTextLightMode" />
							</button>
						</div>
					)}
				</div>
				<div
					className={`flex flex-col dark:bg-bgSecondary bg-bgLightSecondary px-[16px] min-h-full flex-1 overflow-y-auto ${appearanceTheme === 'light' ? 'customSmallScrollLightMode' : 'thread-scroll'}`}
				>
					{threadChannelOnline.length > 0 && (
						<GroupThreads title={`${threadChannelOnline.length} joined threads`}>
							{threadChannelOnline.map((thread) => (
								<ThreadItem
									avatarMembers={thread.channel_private !== 1 ? avatarMembers : []}
									thread={thread}
									key={thread.id}
									setIsShowThread={setIsShowThread}
								/>
							))}
						</GroupThreads>
					)}
					{threadChannelOld.length > 0 && (
						<GroupThreads title="order threads">
							{threadChannelOld.map((thread) => (
								<ThreadItem
									avatarMembers={thread.channel_private !== 1 ? avatarMembers : []}
									thread={thread}
									key={thread.id}
									setIsShowThread={setIsShowThread}
								/>
							))}
						</GroupThreads>
					)}
					{threadChannel.length === 0 && <EmptyThread onClick={handleCreateThread} />}
				</div>
			</div>
		</div>
	);
};

export default ThreadModal;
