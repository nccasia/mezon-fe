import { useAppNavigation, useMenu } from '@mezon/core';
import { selectChannelById, selectCloseMenu, selectCurrentChannel, selectStatusMenu } from '@mezon/store';
import { ChannelStatusEnum, IChannel, ThreadNameProps } from '@mezon/utils';
import { ChannelType } from 'mezon-js';
import { useSelector } from 'react-redux';
import * as Icons from '../../Icons';

export const ChannelLabel = ({ channel }: { channel: IChannel | null | undefined }) => {
	const type = Number(channel?.type);
	const { setStatusMenu } = useMenu();
	const { navigate, toChannelPage } = useAppNavigation();
	const closeMenu = useSelector(selectCloseMenu);
	const statusMenu = useSelector(selectStatusMenu);
	const currentChannel = useSelector(selectCurrentChannel);
	const channelParent = useSelector(selectChannelById(channel?.parrent_id ? (channel.parrent_id as string) : ''));
	const isPrivate = channelParent ? channelParent?.channel_private : channel?.channel_private;
	const isActive = currentChannel?.channel_id === channel?.channel_id && !channelParent;

	const handleRedirect = () => {
		if (channelParent) {
			navigate(toChannelPage(channelParent.id, channelParent?.clan_id ?? ''));
		}
	};

	return (
		<div className={`flex flex-row items-center relative ${closeMenu && !statusMenu ? 'ml-[25px]' : ''}`}>
			<div className="absolute flex text-zinc-400 text-lg pb-0">
				{closeMenu ? (
					statusMenu ? (
						<>
							{isPrivate === ChannelStatusEnum.isPrivate && type === ChannelType.CHANNEL_TYPE_VOICE && (
								<Icons.SpeakerLocked defaultSize="w-6 h-6" />
							)}
							{isPrivate === ChannelStatusEnum.isPrivate && type === ChannelType.CHANNEL_TYPE_TEXT && (
								<Icons.HashtagLocked defaultSize="w-6 h-6 " />
							)}
							{isPrivate === undefined && type === ChannelType.CHANNEL_TYPE_VOICE && <Icons.Speaker defaultSize="w-6 h-6" />}
							{isPrivate === undefined && type === ChannelType.CHANNEL_TYPE_TEXT && <Icons.Hashtag defaultSize="w-6 h-6" />}
						</>
					) : (
						<div onClick={() => setStatusMenu(true)} role="button">
							<Icons.OpenMenu />
						</div>
					)
				) : (
					<>
						{isPrivate === ChannelStatusEnum.isPrivate && type === ChannelType.CHANNEL_TYPE_VOICE && (
							<Icons.SpeakerLocked defaultSize="w-6 h-6" />
						)}
						{isPrivate === ChannelStatusEnum.isPrivate && type === ChannelType.CHANNEL_TYPE_TEXT && (
							<Icons.HashtagLocked defaultSize="w-6 h-6 " />
						)}
						{isPrivate === undefined && type === ChannelType.CHANNEL_TYPE_VOICE && <Icons.Speaker defaultSize="w-6 h-6" />}
						{isPrivate === undefined && type === ChannelType.CHANNEL_TYPE_TEXT && <Icons.Hashtag defaultSize="w-6 h-6" />}
					</>
				)}
			</div>

			<p
				className={`mr-2 text-base font-semibold mt-[2px] max-w-[200px] overflow-x-hidden text-ellipsis one-line ${closeMenu && !statusMenu ? 'ml-[56px]' : 'ml-7 '} ${isActive ? 'dark:text-white text-colorTextLightMode cursor-default' : 'dark:text-textSecondary text-colorTextLightMode cursor-pointer'}`}
				onClick={handleRedirect}
			>
				{channelParent ? channelParent?.channel_label : channel?.channel_label}
			</p>
			{channelParent && channel && (
				<div className="flex flex-row items-center gap-2">
					<Icons.ArrowRight />
					{channelParent && channel.channel_private === ChannelStatusEnum.isPrivate ? (
						<Icons.ThreadIconLocker className="dark:text-[#B5BAC1] text-colorTextLightMode" />
					) : (
						<Icons.ThreadIcon defaultSize="w-6 h-6" />
					)}
					<p
						className={`mt-[2px] text-base font-semibold cursor-default ${currentChannel?.channel_id === channel?.channel_id ? 'dark:text-white text-colorTextLightMode' : 'dark:colorTextLightMode text-colorTextLightMode'}`}
					>
						{channel.channel_label}
					</p>
				</div>
			)}
		</div>
	);
};

export const ThreadLable: React.FC<ThreadNameProps> = ({ name }) => {
	return (
		<div className="items-center flex flex-row gap-1">
			<Icons.ArrowToThread />
			<Icons.ThreadNotClick />
			<p className="text-white mb-0.5 font-thin"> {name}</p>
		</div>
	);
};
