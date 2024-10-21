import { useAppNavigation, useCategory } from '@mezon/core';
import { selectAllChannelsFavorite, selectChannelById, selectCurrentClan, selectIsShowEmptyCategory, selectTheme } from '@mezon/store';
import { Icons } from '@mezon/ui';
import { ChannelStatusEnum, ICategoryChannel } from '@mezon/utils';
import { ChannelType } from 'mezon-js';
import { memo, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { CreateNewChannelModal } from '../CreateChannelModal';
import CategorizedChannels from './CategorizedChannels';
import { Events } from './ChannelListComponents';
export type ChannelListProps = { className?: string };
export type CategoriesState = Record<string, boolean>;

function ChannelList() {
	const { categorizedChannels } = useCategory();
	const appearanceTheme = useSelector(selectTheme);
	const currentClan = useSelector(selectCurrentClan);
	const isShowEmptyCategory = useSelector(selectIsShowEmptyCategory);
	const channelFavorites = useSelector(selectAllChannelsFavorite);
	const [isExpandFavorite, setIsExpandFavorite] = useState<boolean>(true);
	const memoizedCategorizedChannels = useMemo(() => {
		return categorizedChannels.map((category: ICategoryChannel) => {
			if (!isShowEmptyCategory && category.channels.length === 0) {
				return null;
			}
			return <CategorizedChannels key={category.id} category={category} />;
		});
	}, [categorizedChannels, isShowEmptyCategory]);
	const handleExpandFavoriteChannel = () => {
		setIsExpandFavorite(!isExpandFavorite);
	};

	return (
		<div
			onContextMenu={(event) => event.preventDefault()}
			className={`overflow-y-scroll overflow-x-hidden w-[100%] h-[100%] pb-[10px] ${appearanceTheme === 'light' ? 'customSmallScrollLightMode' : 'thread-scroll'}`}
			id="channelList"
			role="button"
		>
			{<CreateNewChannelModal />}
			{currentClan?.banner && (
				<div className="h-[136px]">
					{currentClan?.banner && <img src={currentClan?.banner} alt="imageCover" className="h-full w-full object-cover" />}
				</div>
			)}
			<div className="self-stretch h-fit flex-col justify-start items-start gap-1 p-2 flex">
				<Events />
			</div>
			<hr className="h-[0.08px] w-full dark:border-borderDivider border-white mx-2" />
			<div className={`overflow-y-scroll flex-1 pt-3 space-y-[21px]  text-gray-300 scrollbar-hide`}>
				<div>
					<div
						className="dark:text-channelTextLabel text-colorTextLightMode flex items-center px-0.5 w-full font-title tracking-wide dark:hover:text-gray-100 hover:text-black uppercase text-sm font-semibold px-2"
						onClick={handleExpandFavoriteChannel}
					>
						{isExpandFavorite ? <Icons.ArrowDown /> : <Icons.ArrowRight />}
						<span className="one-line">Favorite channel</span>
					</div>
					{isExpandFavorite ? (
						<div className="px-4">
							{channelFavorites ? channelFavorites.map((item, index) => <FavoriteChannel key={index} channelId={item} />) : ''}
						</div>
					) : null}
				</div>
				{memoizedCategorizedChannels}
			</div>
		</div>
	);
}

type FavoriteChannelProps = {
	channelId: string;
};

const FavoriteChannel = ({ channelId }: FavoriteChannelProps) => {
	const channel = useSelector(selectChannelById(channelId));
	const theme = useSelector(selectTheme);
	const { navigate, toChannelPage } = useAppNavigation();
	const handleJumpChannel = (id: string, clanId: string) => {
		const elementChannel = document.getElementById(id);
		elementChannel?.scrollIntoView({
			behavior: 'auto',
			block: 'center'
		});
		navigate(toChannelPage(id, clanId));
	};

	return (
		<div>
			{channel ? (
				<div
					onClick={() => handleJumpChannel(channel.channel_id || '', channel.clan_id || '')}
					className="flex gap-2 items-center mt-2 hover:dark:bg-bgModifierHover hover:bg-bgModifierHoverLight"
				>
					<div className={`relative  ${channel.type !== ChannelType.CHANNEL_TYPE_STREAMING ? 'mt-[-5px]' : ''}`}>
						{channel.channel_private === ChannelStatusEnum.isPrivate && channel.type === ChannelType.CHANNEL_TYPE_VOICE && (
							<Icons.SpeakerLocked defaultSize="w-5 h-5 dark:text-channelTextLabel" />
						)}
						{channel.channel_private === ChannelStatusEnum.isPrivate && channel.type === ChannelType.CHANNEL_TYPE_TEXT && (
							<Icons.HashtagLocked defaultSize="w-5 h-5 dark:text-channelTextLabel" />
						)}
						{channel.channel_private === undefined && channel.type === ChannelType.CHANNEL_TYPE_VOICE && (
							<Icons.Speaker defaultSize="w-5 h-5 dark:text-channelTextLabel" />
						)}
						{channel.channel_private !== 1 && channel.type === ChannelType.CHANNEL_TYPE_TEXT && (
							<Icons.Hashtag defaultSize="w-5 h-5 dark:text-channelTextLabel" />
						)}
						{channel.channel_private === undefined && channel.type === ChannelType.CHANNEL_TYPE_STREAMING && (
							<Icons.Stream defaultSize="w-5 h-5 dark:text-channelTextLabel" />
						)}
						{channel.type === ChannelType.CHANNEL_TYPE_APP && <Icons.AppChannelIcon className={'w-5 h-5'} fill={theme} />}
					</div>
					{channel.channel_label}
				</div>
			) : null}
		</div>
	);
};
export default memo(ChannelList);
