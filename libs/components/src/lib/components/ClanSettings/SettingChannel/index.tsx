import { selectChannelSuggestionEntities, selectMemberClanByGoogleId, selectMemberClanByUserId } from '@mezon/store';
import { Icons } from '@mezon/ui';
import { getAvatarForPrioritize } from '@mezon/utils';
import { formatDistance } from 'date-fns';
import { Avatar, AvatarSizes, Tooltip } from 'flowbite-react';
import { ChannelType } from 'mezon-js';
import { ApiChannelMessageHeader, ApiChannelSettingItem } from 'mezon-js/api.gen';
import { useRef, useState } from 'react';
import { useModal } from 'react-modal-hook';
import { useSelector } from 'react-redux';
import ChannelSettingInforItem from './InforChannelSetting';

type ListChannelSettingProp = {
	listChannel: Record<string, ApiChannelSettingItem[]>;
};

const ListChannelSetting = ({ listChannel }: ListChannelSettingProp) => {
	const [channelSettingId, setChannelSettingId] = useState('');
	const parentRef = useRef(null);
	const listChannelEntities = useSelector(selectChannelSuggestionEntities);

	const [openModalChannelSetting, closeModalChannelSetting] = useModal(() => {
		return <ChannelSettingInforItem onClose={closeModalChannelSetting} channelId={channelSettingId} />;
	}, [channelSettingId]);

	const handleChooseChannelSetting = (id: string) => {
		setChannelSettingId(id);
		openModalChannelSetting();
	};

	return (
		<div className="h-full w-full flex flex-col gap-1 flex-1">
			<div className="w-full flex pl-12 pr-12 justify-between items-center h-[48px] shadow border-b-[1px] dark:border-bgTertiary text-xs dark:text-textDarkTheme text-textLightTheme font-bold uppercase">
				<span className="flex-1">Name</span>
				<span className="flex-1">Members</span>
				<span className="flex-1">Messages count</span>
				<span className="flex-1">Last Sent</span>
				<span className="pr-1">Creator</span>
			</div>
			<div className="h-full overflow-y-auto  hide-scrollbar scroll-smooth pb-10" ref={parentRef}>
				{Object.entries(listChannel).map(([key, value]) => (
					<RenderChannelAndThread channelParrent={listChannelEntities[key]} listChannelGroup={value} key={`group_${key}`} />
				))}
			</div>
		</div>
	);
};

const RenderChannelAndThread = ({
	listChannelGroup,
	channelParrent
}: {
	listChannelGroup: ApiChannelSettingItem[];
	channelParrent: ApiChannelSettingItem;
}) => {
	return (
		<div className="flex flex-col">
			<ItemInfor
				creatorId={channelParrent.creator_id as string}
				label={channelParrent?.channel_label as string}
				privateChannel={channelParrent.channel_private as number}
				isThread={channelParrent?.parent_id !== '0'}
				key={channelParrent.id}
				userIds={channelParrent?.user_ids || []}
				channelId={channelParrent.id as string}
				isVoice={channelParrent.channel_type === ChannelType.CHANNEL_TYPE_VOICE}
				messageCount={channelParrent.message_count || 0}
				lastMessage={channelParrent.last_sent_message}
			/>
			<div className="flex flex-col pl-8">
				{listChannelGroup.map((thread) => (
					<ItemInfor
						creatorId={thread.creator_id as string}
						label={thread?.channel_label as string}
						privateChannel={thread.channel_private as number}
						isThread={thread?.parent_id !== '0'}
						key={`${thread.id}_thread`}
						userIds={thread?.user_ids || []}
						channelId={thread.id as string}
						messageCount={thread.message_count || 0}
						lastMessage={channelParrent.last_sent_message}
					/>
				))}
			</div>
		</div>
	);
};

const ItemInfor = ({
	isThread,
	label,
	creatorId,
	privateChannel,
	userIds,
	onClick,
	channelId,
	isVoice,
	messageCount,
	lastMessage
}: {
	isThread?: boolean;
	label: string;
	creatorId: string;
	privateChannel: number;
	userIds: string[];
	onClick?: (id: string) => void;
	channelId: string;
	isVoice?: boolean;
	messageCount?: number | string;
	lastMessage?: ApiChannelMessageHeader;
}) => {
	const creatorChannel = useSelector(selectMemberClanByUserId(creatorId));

	const handleCopyChannelId = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		e.stopPropagation();
		e.preventDefault();
		navigator.clipboard.writeText(channelId);
	};
	const mumberformatter = Intl.NumberFormat('en-US', {
		notation: 'compact',
		compactDisplay: 'short'
	});
	const date = lastMessage?.timestamp_seconds
		? formatDistance((lastMessage?.timestamp_seconds as number) * 1000, new Date(), { addSuffix: true })
		: null;

	const handleShowAllMemberList = () => {
		if (userIds.length > 0) {
			openModalAllMember();
		}
	};

	const [openModalAllMember, closeModalAllMember] = useModal(() => {
		return (
			<div
				className="fixed top-0 left-0 w-screen h-screen flex items-center justify-center bg-black bg-opacity-75 z-30"
				onClick={closeModalAllMember}
			>
				<div
					className="w-450 max-h-[80vh] min-h-250 bg-bgTertiary rounded-lg flex flex-col gap-2 p-4 overflow-y-auto hide-scrollbar"
					onClick={(e) => e.stopPropagation()}
				>
					<div className="font-semibold pb-3 text-channelActiveLightColor dark:text-channelTextareaLight">List Member</div>
					{userIds.map((member) => (
						<div className="flex gap-3">
							<AvatarUserShort id={member} key={member} hiddenTooltip={true} size={'md'} showName={true} />
						</div>
					))}
				</div>
			</div>
		);
	}, [channelId]);

	return (
		<div
			className={`w-full py-1 relative before:content-[" "] before:w-full before:h-[0.08px] before:bg-borderDivider before:absolute before:top-0 before:left-0 group text-textPrimaryLight dark:text-textPrimary`}
			onContextMenu={handleCopyChannelId}
		>
			<div className="cursor-pointer px-3 py-2 pr-12 flex gap-3 items-center w-full hover:bg-bgHover">
				<div className="h-6 w-6">
					{!isVoice && (
						<>
							{isThread ? (
								privateChannel ? (
									<Icons.ThreadIconLocker className="w-5 h-5 fill-textPrimary" />
								) : (
									<Icons.ThreadIcon />
								)
							) : privateChannel ? (
								<Icons.HashtagLocked />
							) : (
								<Icons.Hashtag />
							)}
						</>
					)}

					{isVoice && <Icons.Speaker />}
				</div>
				<div className={`flex-1 box-border flex overflow-hidden`}>
					<span className="truncate pr-8">{label}</span>
				</div>
				<div className="flex-1 flex " onClick={handleShowAllMemberList}>
					{privateChannel ? (
						<Avatar.Group className={`flex flex-1 items-center gap-3 ${isThread ? '-ml-8' : ''}`}>
							{userIds.slice(0, 2).map((member) => (
								<AvatarUserShort id={member} key={member} hiddenTooltip={true} />
							))}
							{userIds.length > 3 && (
								<Avatar.Counter
									total={userIds.length - 1}
									className="h-4 w-6 dark:text-textPrimary text-textPrimaryLight ring-transparent dark:bg-bgTertiary bg-bgLightTertiary dark:hover:bg-bgTertiary hover:bg-bgLightTertiary"
								/>
							)}
						</Avatar.Group>
					) : (
						<p className={`italic text-xs ${isThread ? '-ml-8' : ''}`}>(All Members)</p>
					)}
				</div>
				<div className={`flex-1 font-semibold ${isThread ? '-ml-8' : ''}`}>{mumberformatter.format(Number(messageCount || 0))}</div>
				<div className={`flex-1 flex gap-1 items-center`}>
					{lastMessage?.sender_id ? (
						<>
							<AvatarUserShort id={lastMessage?.sender_id as string} />
							<div>{date}</div>
						</>
					) : null}
				</div>

				<div className="overflow-hidden flex w-12 items-center justify-center">
					{(creatorChannel?.clan_avatar || creatorChannel?.user?.avatar_url) && (
						<Tooltip
							content={creatorChannel?.clan_nick || creatorChannel?.user?.display_name || creatorChannel?.user?.username}
							placement="left"
						>
							<img
								src={creatorChannel?.clan_avatar || creatorChannel?.user?.avatar_url}
								className="w-8 h-8 object-cover rounded-full "
							/>
						</Tooltip>
					)}
				</div>
			</div>
		</div>
	);
};
export default ListChannelSetting;
export const AvatarUserShort = ({
	id,
	hiddenTooltip = false,
	size = 'xs',
	showName = false
}: {
	id: string;
	hiddenTooltip?: boolean;
	size?: keyof AvatarSizes;
	showName?: boolean;
}) => {
	const member = useSelector(selectMemberClanByUserId(id));
	const voiceClan = useSelector(selectMemberClanByGoogleId(id ?? ''));
	const clanAvatar = voiceClan?.clan_avatar || member?.clan_avatar;
	const userAvatar = voiceClan?.user?.avatar_url || member?.user?.avatar_url;
	const avatarUrl = getAvatarForPrioritize(clanAvatar, userAvatar);

	return (
		<div className="flex items-center gap-3">
			{hiddenTooltip ? (
				<Avatar img={avatarUrl} rounded size={size} />
			) : (
				<Tooltip content={member?.clan_nick || member?.user?.display_name || member?.user?.username} hidden={hiddenTooltip} trigger="hover">
					<Avatar img={avatarUrl} rounded size={size} />
				</Tooltip>
			)}
			{showName ? (
				<div className="text-channelActiveColor dark:text-channelTextareaLight">
					{member?.clan_nick || member?.user?.display_name || member?.user?.username}
				</div>
			) : null}
		</div>
	);
};
