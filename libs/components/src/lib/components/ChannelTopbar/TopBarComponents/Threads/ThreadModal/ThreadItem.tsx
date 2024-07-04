import { useAppNavigation, useChatMessages, useClans } from '@mezon/core';
import { ChannelsEntity, selectMemberByUserId } from '@mezon/store';
import { convertTimeMessage } from '@mezon/utils';
import { Avatar } from 'flowbite-react';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useMessageSender } from '../../../../MessageWithUser/useMessageSender';
import ThreadModalContent from './ThreadModalContent';

type ThreadItemProps = {
	thread: ChannelsEntity;
	setIsShowThread: React.Dispatch<React.SetStateAction<boolean>>;
};

const ThreadItem = ({ thread, setIsShowThread }: ThreadItemProps) => {
	const navigate = useNavigate();
	const { toChannelPage } = useAppNavigation();
	const user = useSelector(selectMemberByUserId(thread?.last_sent_message?.sender_id as string));

	const { avatarImg, username } = useMessageSender(user);
	const { avatarClans, remainingMember } = useClans();
	const { messages } = useChatMessages({ channelId: thread.channel_id as string });

	const timeMessage = useMemo(() => {
		if (thread && thread.last_sent_message && thread.last_sent_message.timestamp) {
			const lastTime = convertTimeMessage(thread.last_sent_message.timestamp);
			return lastTime;
		}
	}, [thread]);

	const handleLinkThread = (channelId: string, clanId: string) => {
		navigate(toChannelPage(channelId, clanId));
		setIsShowThread(false);
	};

	return (
		<div
			onClick={() => handleLinkThread(thread.channel_id as string, thread.clan_id || '')}
			className="p-4 mb-2 cursor-pointer rounded-lg h-[72px] dark:bg-bgPrimary bg-bgLightMode border border-bgPrimary dark:hover:border-bgModifierHover hover:bg-bgLightModeButton"
			role="button"
		>
			<div className="flex flex-row justify-between items-center">
				<div className="flex flex-col gap-1">
					<p className="text-base font-semibold leading-5 dark:text-white text-black">{thread?.channel_label}</p>
					{thread?.last_sent_message ? (
						<div className="flex flex-row items-center h-6">
							<Avatar img={avatarImg} rounded size={'xs'} theme={{ root: { size: { xs: 'w-4 h-4' } } }} className="mr-2" />
							<span className="text-[#17AC86] text-sm font-semibold leading-4">{username}:&nbsp;</span>
							<div className="overflow-hidden max-w-[140px]">
								<ThreadModalContent messages={messages} thread={thread} />
							</div>
							<div className="overflow-x-hidden">
								<p className="text-xs font-medium leading-4 ml-2">
									<span className="truncate dark:text-white text-colorTextLightMode">•&nbsp;{timeMessage}</span>
								</p>
							</div>
						</div>
					) : (
						<div className="flex flex-row items-center">
							<span className="text-sm font-medium leading-4 mr-2">No recent messages</span>
						</div>
					)}
				</div>
				<div className="w-[120px]">
					<Avatar.Group className="flex gap-3 justify-end">
						{avatarClans?.map((avatar) => <Avatar key={avatar} img={avatar} rounded size="xs" />)}
						{remainingMember && remainingMember.length > 0 && <Avatar.Counter total={remainingMember?.length} className="h-6 w-6" />}
					</Avatar.Group>
				</div>
			</div>
		</div>
	);
};

export default ThreadItem;
