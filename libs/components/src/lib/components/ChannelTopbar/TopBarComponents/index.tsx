import { useMenu } from '@mezon/core';
import { ChannelStatusEnum, IChannel, ThreadNameProps } from '@mezon/utils';
import { ChannelType } from 'mezon-js';
import { useEffect, useRef, useState } from 'react';
import * as Icons from '../../Icons';

export const ChannelLabel = ({ channel }: { channel: IChannel | null | undefined }) => {
	const isPrivate = channel?.channel_private;
	const type = Number(channel?.type);
	const name = channel?.channel_label;
	const { closeMenu, statusMenu, setStatusMenu } = useMenu();

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
						<div onClick={() => setStatusMenu(true)}>
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
				className={` text-white mt-[2px] max-w-[200px] overflow-x-hidden text-ellipsis one-line ${closeMenu && !statusMenu ? 'ml-[56px]' : 'ml-7 '}`}
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

export const SearchMessage: React.FC = () => {
	const [expanded, setExpanded] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const handleInputClick = () => {
		setExpanded(!expanded);
	};
	const handleOutsideClick = (event: MouseEvent) => {
		if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
			setExpanded(false);
		}
	};
	useEffect(() => {
		document.addEventListener('click', handleOutsideClick);
		return () => {
			document.removeEventListener('click', handleOutsideClick);
		};
	}, []);

	return (
		<div className="relative" ref={inputRef}>
			<div
				className={`transition-all duration-300 ${
					expanded ? 'w-80' : 'w-40'
				} h-8 pl-4 pr-2 py-3 bg-[#0B0B0B] rounded items-center inline-flex`}
			>
				<input
					type="text"
					placeholder="Search"
					className="text-[#AEAEAE] placeholder-[#AEAEAE] outline-none bg-transparent w-full"
					onClick={handleInputClick}
				/>
			</div>
			<div className="w-5 h-6 flex flex-row items-center pl-1 absolute right-1 bg-[#0B0B0B] top-1/2 transform -translate-y-1/2">
				<Icons.Search />
			</div>
		</div>
	);
};
