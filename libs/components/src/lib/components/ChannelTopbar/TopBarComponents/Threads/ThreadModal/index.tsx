import { useAppNavigation, useReference, useThreads } from '@mezon/core';
import { selectCurrentChannel, threadsActions, useAppDispatch } from '@mezon/store';
import { Button } from 'flowbite-react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import * as Icons from '../../../../Icons';
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

	const handleCreateThread = () => {
		setOpenThreadMessageState(false);
		if (currentChannel && currentChannel?.parrent_id !== '0') {
			navigate(toChannelPage(currentChannel.parrent_id as string, currentChannel.clan_id as string));
		}
		setIsShowThread(false);
		setIsShowCreateThread(true, currentChannel?.parrent_id !== '0' ? currentChannel?.parrent_id : currentChannel.channel_id);
		dispatch(threadsActions.setNameThreadError(''));
		dispatch(threadsActions.setMessageThreadError(''));
	};

	return (
		<div className="absolute top-8 right-0 shadow z-[99999999]">
			<div className="flex flex-col rounded-md min-h-[400px] md:w-[480px] max-h-[80vh] lg:w-[540px]  shadow-sm overflow-hidden">
				<div className="dark:bg-bgTertiary bg-white flex flex-row items-center justify-between p-[16px] h-12">
					<div className="flex flex-row items-center border-r-[1px] dark:border-r-[#6A6A6A] border-r-[#E1E1E1] pr-[16px] gap-4">
						<Icons.ThreadIcon />
						<span className="cursor-default dark:text-white text-black">Threads</span>
					</div>
					<SearchThread />
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
				</div>
				<div className="flex flex-col dark:bg-bgSecondary bg-gray-100 px-[16px] min-h-full flex-1 overflow-y-auto thread-scroll">
					{threadChannelOnline.length > 0 && (
						<GroupThreads title={`${threadChannelOnline.length} joined threads`}>
							{threadChannelOnline.map((thread) => (
								<ThreadItem thread={thread} key={thread.id} setIsShowThread={setIsShowThread} />
							))}
						</GroupThreads>
					)}
					{threadChannelOld.length > 0 && (
						<GroupThreads title="order threads">
							{threadChannelOld.map((thread) => (
								<ThreadItem thread={thread} key={thread.id} setIsShowThread={setIsShowThread} />
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
