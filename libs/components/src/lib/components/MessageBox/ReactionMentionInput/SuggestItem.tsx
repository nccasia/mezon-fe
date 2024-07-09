import { useEmojiSuggestion } from '@mezon/core';
import { ChannelsEntity, selectAllChannels } from '@mezon/store';
import { getSrcEmoji } from '@mezon/utils';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { AvatarImage } from '../../AvatarImage/AvatarImage';
import { Icons } from '../../../components';
import { ChannelType } from 'mezon-js';

type SuggestItemProps = {
	avatarUrl?: string;
	symbol?: string;
	name: string;
	displayName?: string;
	subText?: string;
	valueHightLight?: string;
	subTextStyle?: string;
	showAvatar?: boolean;
	channelId?: string | number;
};

const SuggestItem = ({ avatarUrl, symbol, name, displayName, channelId, subText, subTextStyle, valueHightLight, showAvatar }: SuggestItemProps) => {
	const { emojis } = useEmojiSuggestion();
	const urlEmoji = getSrcEmoji(name, emojis);
	const allChannels = useSelector(selectAllChannels);
	const [specificChannel, setSpecificChannel] = useState<ChannelsEntity | null>(null);

	useEffect(()=>{
		allChannels.map((channel) => {
			if (channel.channel_id === channelId) {
				setSpecificChannel(channel);
			}
		});
	}, [])

	const highlightMatch = (name: string, getUserName: string) => {
		const index = name.toLowerCase().indexOf(getUserName.toLowerCase());
		if (index === -1) {
			return name;
		}
		const beforeMatch = name.slice(0, index);
		const match = name.slice(index, index + getUserName.length);
		const afterMatch = name.slice(index + getUserName.length);
		return (
			<>
				{beforeMatch}
				<span className="font-bold">{match}</span>
				{afterMatch}
			</>
		);
	};

	return (
		<div className="flex flex-row items-center justify-between h-[24px]">
			<div className="flex flex-row items-center gap-2 py-[3px]">
				{showAvatar && <AvatarImage alt="user avatar" userName={name} src={avatarUrl} className="size-4" />}
				{urlEmoji && <img src={urlEmoji} alt={urlEmoji} style={{ width: '32px', height: '32px', objectFit: 'cover' }} />}
				{ !specificChannel?.channel_private && specificChannel?.type === ChannelType.CHANNEL_TYPE_TEXT && (<Icons.Hashtag defaultSize="w-5 h-5" />)}
				{ specificChannel?.channel_private && specificChannel?.type === ChannelType.CHANNEL_TYPE_TEXT && (<Icons.HashtagLocked defaultSize="w-5 h-5 " />)}
				{ !specificChannel?.channel_private && specificChannel?.type === ChannelType.CHANNEL_TYPE_VOICE && (<Icons.Speaker defaultSize="w-5 5-5" />)}
				{ specificChannel?.channel_private && specificChannel?.type === ChannelType.CHANNEL_TYPE_VOICE && (<Icons.SpeakerLocked defaultSize="w-5 h-5" />)}
				{displayName && <span className="text-[15px] font-thin dark:text-white text-textLightTheme">{displayName}</span>}
				<span className={`text-[15px] font-thin ${displayName ? 'dark:text-zinc-400 text-colorTextLightMode' : 'dark:text-white text-textLightTheme'}`}>{highlightMatch(name, valueHightLight ?? '')}</span>
			</div>
			<span className={`text-[10px] font-semibold text-[#A1A1AA] ${subTextStyle}`}>{subText}</span>
		</div>
	);
};

export default SuggestItem;
