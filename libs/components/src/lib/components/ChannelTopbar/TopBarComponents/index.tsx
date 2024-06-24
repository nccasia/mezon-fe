import { useMenu } from '@mezon/core';
import { ChannelStatusEnum, IChannel, ThreadNameProps } from '@mezon/utils';
import { ChannelType } from 'mezon-js';
import * as Icons from '../../Icons';
import { useSelector } from 'react-redux';
import { selectCloseMenu, selectStatusMenu } from '@mezon/store';

export const ChannelLabel = ({ channel }: { channel: IChannel | null | undefined }) => {
	const isPrivate = channel?.channel_private;
	const type = Number(channel?.type);
	const name = channel?.channel_label;
	const { setStatusMenu } = useMenu();
	const closeMenu = useSelector(selectCloseMenu);
	const statusMenu = useSelector(selectStatusMenu);

	return (
		<div className={`flex flex-row items-center gap-x-5 relative ${closeMenu && !statusMenu ? 'ml-[25px]' : ''}`}>
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
				className={` text-base font-semibold dark:text-white text-colorTextLightMode mt-[2px] max-w-[200px] overflow-x-hidden text-ellipsis one-line ${closeMenu && !statusMenu ? 'ml-[56px]' : 'ml-7 '}`}
			>
				{name}
			</p>
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
