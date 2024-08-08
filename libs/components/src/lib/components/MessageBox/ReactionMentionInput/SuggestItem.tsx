import { selectAllChannels, selectAllDirectChannelVoids, selectMembersVoiceChannel } from '@mezon/store';
import { getSrcEmoji, normalizeString } from '@mezon/utils';
import { ChannelType } from 'mezon-js';
import { memo, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Icons } from '../../../components';
import { AvatarImage } from '../../AvatarImage/AvatarImage';

type SuggestItemProps = {
	avatarUrl?: string;
	symbol?: string;
	subText?: string;
	valueHightLight?: string;
	subTextStyle?: string;
	showAvatar?: boolean;
	channelId?: string | number;
	isOpenSearchModal?: boolean;
	wrapSuggestItemStyle?: string;
	emojiId: string;
	display?: string;
	isHightLight?: boolean;
};

const SuggestItem = ({
	isOpenSearchModal,
	avatarUrl,
	channelId,
	subText,
	subTextStyle,
	valueHightLight,
	showAvatar,
	wrapSuggestItemStyle,
	emojiId,
	display,
	isHightLight = true,
}: SuggestItemProps) => {
	const urlEmoji = getSrcEmoji(emojiId);
	const allChannels = useSelector(selectAllChannels);
	const { directId } = useParams();
	const commonChannelVoids = useSelector(selectAllDirectChannelVoids);
	const [specificChannel, setSpecificChannel] = useState<any>(null);
	const membersVoice = useSelector(selectMembersVoiceChannel);
	const checkVoiceStatus = useMemo(() => {
		if (channelId !== undefined && membersVoice[channelId] && specificChannel?.type === ChannelType.CHANNEL_TYPE_VOICE) {
			return membersVoice[channelId].length >= 2;
		}
		return false;
	}, [channelId, membersVoice, specificChannel?.type]);

	useEffect(() => {
		if (directId && !isOpenSearchModal) {
			commonChannelVoids.map((channel) => {
				if (channel.channel_id === channelId) {
					setSpecificChannel(channel);
				}
			});
		} else {
			allChannels.map((channel) => {
				if (channel.channel_id === channelId) {
					setSpecificChannel(channel);
				}
			});
		}
	}, []);

	return (
		<div className={`flex flex-row items-center h-[24px] ${wrapSuggestItemStyle ?? 'justify-between'}`}>
			<div className="flex flex-row items-center gap-2 py-[3px]">
				{showAvatar && (
					<AvatarImage
						alt={subText || ''}
						userName={subText}
						src={avatarUrl}
						className="size-4"
						classNameText="text-[9px] min-w-5 min-h-5 pt-[3px]"
					/>
				)}
				{urlEmoji && <img src={urlEmoji} alt={urlEmoji} style={{ width: '32px', height: '32px', objectFit: 'cover' }} />}
				{!specificChannel?.channel_private && specificChannel?.type === ChannelType.CHANNEL_TYPE_TEXT && (
					<Icons.Hashtag defaultSize="w-5 h-5" />
				)}
				{specificChannel?.channel_private && specificChannel?.type === ChannelType.CHANNEL_TYPE_TEXT && (
					<Icons.HashtagLocked defaultSize="w-5 h-5 " />
				)}
				{!specificChannel?.channel_private && specificChannel?.type === ChannelType.CHANNEL_TYPE_VOICE && (
					<Icons.Speaker defaultSize="w-5 5-5" />
				)}
				{specificChannel?.channel_private && specificChannel?.type === ChannelType.CHANNEL_TYPE_VOICE && (
					<Icons.SpeakerLocked defaultSize="w-5 h-5" />
				)}

				{display && (
					<span className="text-[15px] font-thin dark:text-white text-textLightTheme one-line">
						{isHightLight ? HighlightMatch(display ?? '', valueHightLight ?? '') : display}
					</span>
				)}
				{checkVoiceStatus && <i className="text-[15px] font-thin dark:text-text-zinc-400 text-colorDanger ">(busy)</i>}
			</div>
			<span className={`text-[10px] font-semibold text-[#A1A1AA] one-line ${subTextStyle}`}>
				{HighlightMatch(subText ?? '', valueHightLight ?? '')}
			</span>
		</div>
	);
};

export default memo(SuggestItem);

const HighlightMatch = (name: string, getUserName: string) => {
	const normalizedSearchName = normalizeString(getUserName);
	const normalizedItemName = normalizeString(name);

	const index = normalizedItemName.indexOf(normalizedSearchName);
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
