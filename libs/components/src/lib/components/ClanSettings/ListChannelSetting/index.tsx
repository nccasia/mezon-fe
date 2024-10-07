import { useCategory } from '@mezon/core';
import { fetchChannelByUserId, selectAllChannelSuggestion, selectChannelMemberByUserIds, selectCurrentClanId, useAppDispatch } from '@mezon/store';
import { Icons } from '@mezon/ui';
import { ChannelThreads, ICategoryChannel } from '@mezon/utils';
import { useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';

const ListChannelSetting = () => {
	const { categorizedChannels } = useCategory();
	const dispatch = useAppDispatch();
	const selectClanId = useSelector(selectCurrentClanId);
	const clanId = selectClanId == null || selectClanId === undefined ? '' : selectClanId;
	const channelList = useSelector(selectAllChannelSuggestion);
	useEffect(() => {
		async function fetchChannelSetting() {
			await dispatch(
				fetchChannelByUserId({
					clanId: clanId
				})
			);
		}
		fetchChannelSetting();
	}, []);
	const memoizedCategorizedChannels = useMemo(() => {
		return categorizedChannels.map((category: ICategoryChannel) => {
			if (category.channels.length === 0) {
				return null;
			}
			return (
				<div className="flex flex-col w-full">
					<div className="rounded-t w-fit px-2 py-2 dark:bg-bgSecondaryHover bg-bgLightModeThird text-channelActiveColor text-base shadow border-b-[1px] dark:border-bgTertiary uppercase font-semibold">
						{category.category_name}
					</div>
					<ListChannelByCate key={category.id} category={category} channels={category.channels} />
				</div>
			);
		});
	}, [categorizedChannels]);
	return <div className="w-full flex flex-col gap-1">{memoizedCategorizedChannels}</div>;
};

interface ListChannelByCateProps {
	category: ICategoryChannel;
	channels: ChannelThreads[];
}

const ListChannelByCate = ({ channels, category }: ListChannelByCateProps) => {
	return (
		<div className={`flex rounded-sm gap-2 dark:bg-bgSecondaryHover bg-bgLightModeThird`}>
			<div className="space-y-0.5 text-contentTertiary flex-1">
				{channels.map((channel: ChannelThreads) => {
					return <ListThreadByChannel key={channel.id} channel={channel as ChannelThreads} />;
				})}
			</div>
		</div>
	);
};

interface ListThreadByChannelProps {
	channel: ChannelThreads;
}

const ListThreadByChannel = ({ channel }: ListThreadByChannelProps) => {
	return (
		<div className="flex overflow-hidden gap-1 flex-col dark:bg-bgSecondaryHover bg-bgLightModeThird rounded-lg dark:text-textDarkTheme text-textLightTheme">
			<ItemInfor
				creatorId={channel.creator_id as string}
				label={channel.channel_label || ''}
				privateChannel={channel.channel_private as number}
			/>

			{channel.threads?.length && channel.threads.length > 0 ? (
				<div className="flex flex-col gap-1 pl-10">
					{channel.threads.map((thread) => (
						<ItemInfor
							isThread={true}
							creatorId={thread.category_id as string}
							label={thread.channel_label || ''}
							privateChannel={thread.channel_private as number}
						/>
					))}
				</div>
			) : null}
		</div>
	);
};

const ItemInfor = ({
	isThread,
	label,
	creatorId,
	privateChannel
}: {
	isThread?: boolean;
	label: string;
	creatorId: string;
	privateChannel: number;
}) => {
	const creatorChannel = useSelector((state) => selectChannelMemberByUserIds(state, creatorId as string));

	return (
		<div className='overflow-hidden flex object-cover items-center py-3 px-3 gap-3 w-full relative before:content-[" "] before:w-full before:h-[0.08px] before:bg-borderDivider before:absolute before:top-0 before:left-0'>
			<div className="h-6 w-6">{isThread ? <Icons.ThreadIcon /> : privateChannel ? <Icons.HashtagLocked /> : <Icons.Hashtag />}</div>
			<div className="flex-1">{label}</div>
			<div className="h-10 w-10 rounded-full overflow-hidden flex object-cover">
				<img
					src={
						creatorChannel[0]?.clan_avatar ||
						creatorChannel[0]?.user?.avatar_url ||
						'https://img.freepik.com/free-photo/digital-art-moon-tree-wallpaper_23-2150918811.jpg'
					}
				/>
			</div>
		</div>
	);
};
export default ListChannelSetting;
