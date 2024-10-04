import { useAppNavigation } from '@mezon/core';
import {
	ChannelsEntity,
	selectAllChannelMembers,
	selectLastMessageIdByChannelId,
	selectMemberClanByUserId,
	selectMessageEntityById,
	useAppSelector
} from '@mezon/store';
import { ChannelMembersEntity, IChannelMember, convertTimeMessage } from '@mezon/utils';
import { Avatar } from 'flowbite-react';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useMessageSender } from '../../../../MessageWithUser/useMessageSender';
import ThreadModalContent from './ThreadModalContent';

type ThreadItemProps = {
	thread: ChannelsEntity;
	setIsShowThread: () => void;
};

const ThreadItem = ({ thread, setIsShowThread }: ThreadItemProps) => {
	const navigate = useNavigate();
	const { toChannelPage } = useAppNavigation();

	const threadMembers = useSelector((state) => selectAllChannelMembers(state, thread.channel_id));

	const messageId = useAppSelector((state) => selectLastMessageIdByChannelId(state, thread.channel_id as string));
	const message = useAppSelector((state) =>
		selectMessageEntityById(state, thread.channel_id as string, messageId || thread?.last_sent_message?.id)
	);
	const user = useSelector(selectMemberClanByUserId((message?.user?.id || thread?.last_sent_message?.sender_id) as string)) as IChannelMember;
	const { avatarImg, username } = useMessageSender(user);

	const getRandomElements = (array: ChannelMembersEntity[], count: number) => {
		const result = [];
		const usedIndices = new Set();

		while (result.length < count && usedIndices.size < array.length) {
			const randomIndex = Math.floor(Math.random() * array.length);
			if (!usedIndices.has(randomIndex)) {
				usedIndices.add(randomIndex);
				result.push(array[randomIndex]);
			}
		}

		return result;
	};

	const previewAvatarList = useMemo(() => {
		if (threadMembers && threadMembers.length > 0) {
			return getRandomElements(threadMembers, 5);
		}
		return [];
	}, [threadMembers]);

	const timeMessage = useMemo(() => {
		if (message && message.create_time_seconds) {
			const lastTime = convertTimeMessage(message.create_time_seconds);
			return lastTime;
		} else {
			if (thread && thread.last_sent_message && thread.last_sent_message.timestamp_seconds) {
				const lastTime = convertTimeMessage(thread.last_sent_message.timestamp_seconds);
				return lastTime;
			}
		}
	}, [message, thread]);

	const handleLinkThread = (channelId: string, clanId: string) => {
		navigate(toChannelPage(channelId, clanId));
		setIsShowThread();
	};

	return (
		<div
			onClick={() => handleLinkThread(thread.channel_id as string, thread.clan_id || '')}
			className="p-4 mb-2 cursor-pointer rounded-lg h-[72px] dark:bg-bgPrimary bg-bgLightPrimary border border-transparent dark:hover:border-bgModifierHover hover:border-bgModifierHover hover:bg-bgLightModeButton"
			role="button"
		>
			<div className="flex flex-row justify-between items-center">
				<div className="flex flex-col gap-1">
					<p className="text-base font-semibold leading-5 dark:text-white text-black one-line">{thread?.channel_label}</p>
					<div className="flex flex-row items-center h-6">
						<Avatar img={avatarImg} rounded size={'xs'} theme={{ root: { size: { xs: 'w-4 h-4' } } }} className="mr-2" />
						<span className="max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap text-[#17AC86] text-sm font-semibold leading-4">
							{user?.user?.display_name ?? username}:&nbsp;
						</span>
						<div className="overflow-hidden max-w-[140px]">
							<ThreadModalContent message={message} thread={thread} />
						</div>
						<div className="overflow-x-hidden">
							<p className="text-xs font-medium leading-4 ml-2">
								<span className="truncate dark:text-white text-colorTextLightMode">•&nbsp;{timeMessage}</span>
							</p>
						</div>
					</div>
				</div>
				<div className="w-[120px]">
					{threadMembers && (
						<Avatar.Group className="flex gap-3 justify-end items-center">
							{previewAvatarList?.map((avatar, index) => (
								<Avatar key={index} img={avatar.clan_avatar || avatar.user?.avatar_url} rounded size="xs" />
							))}
							{threadMembers && threadMembers.length > 5 && (
								<Avatar.Counter
									total={threadMembers?.length - 5 > 50 ? 50 : threadMembers?.length - 5}
									className="h-4 w-6 dark:text-bgLightPrimary text-bgPrimary ring-transparent dark:bg-bgTertiary bg-bgLightTertiary dark:hover:bg-bgTertiary hover:bg-bgLightTertiary"
								/>
							)}
						</Avatar.Group>
					)}
				</div>
			</div>
		</div>
	);
};

export default ThreadItem;
