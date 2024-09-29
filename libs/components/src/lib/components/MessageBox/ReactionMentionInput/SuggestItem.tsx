import { selectAllChannels, selectAllHashtagDm, selectNumberMemberVoiceChannel } from '@mezon/store';
import { HighlightMatchBold } from '@mezon/ui';
import { SearchItemProps, getSrcEmoji } from '@mezon/utils';
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
	emojiId?: string;
	display?: string;
	isHightLight?: boolean;
	channel?: SearchItemProps;
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
	channel
}: SuggestItemProps) => {
	const allChannels = useSelector(selectAllChannels);
	const { directId } = useParams();
	const commonChannels = useSelector(selectAllHashtagDm);
	const [specificChannel, setSpecificChannel] = useState<any>(null);
	const numberMembersVoice = useSelector(selectNumberMemberVoiceChannel(channelId as string));
	const checkVoiceStatus = useMemo(() => {
		if (channelId !== undefined && numberMembersVoice && specificChannel?.type === ChannelType.CHANNEL_TYPE_VOICE) {
			return numberMembersVoice >= 2;
		}
		return false;
	}, [channelId, numberMembersVoice, specificChannel?.type]);

	useEffect(() => {
		if (channel) {
			setSpecificChannel(channel);
		} else if (directId && !isOpenSearchModal) {
			commonChannels.map((channel) => {
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
				{emojiId && (
					<img src={getSrcEmoji(emojiId)} alt={getSrcEmoji(emojiId)} style={{ width: '32px', height: '32px', objectFit: 'cover' }} />
				)}
				{(!specificChannel?.channel_private || specificChannel?.channel_private === 0) &&
					specificChannel?.type === ChannelType.CHANNEL_TYPE_TEXT &&
					specificChannel?.parrent_id === '0' && <Icons.Hashtag defaultSize="w-5 h-5" />}
				{specificChannel?.channel_private === 1 &&
					specificChannel?.type === ChannelType.CHANNEL_TYPE_TEXT &&
					specificChannel?.parrent_id === '0' && <Icons.HashtagLocked defaultSize="w-5 h-5 " />}

				{(!specificChannel?.channel_private || specificChannel?.channel_private === 0) &&
					specificChannel?.type === ChannelType.CHANNEL_TYPE_TEXT &&
					specificChannel?.parrent_id !== '0' && <Icons.ThreadIcon defaultSize="w-5 h-5 dark:text-[#AEAEAE] text-colorTextLightMode" />}

				{specificChannel?.channel_private === 1 &&
					specificChannel?.type === ChannelType.CHANNEL_TYPE_TEXT &&
					specificChannel?.parrent_id !== '0' && <Icons.ThreadIconLocker className="w-5 h-5 dark:text-[#AEAEAE] text-colorTextLightMode" />}

				{(!specificChannel?.channel_private || specificChannel?.channel_private === 0) &&
					specificChannel?.type === ChannelType.CHANNEL_TYPE_VOICE && <Icons.Speaker defaultSize="w-5 5-5" />}
				{specificChannel?.channel_private === 1 && specificChannel?.type === ChannelType.CHANNEL_TYPE_VOICE && (
					<Icons.SpeakerLocked defaultSize="w-5 h-5" />
				)}
				{(!specificChannel?.channel_private || specificChannel?.channel_private === 0) &&
					specificChannel?.type === ChannelType.CHANNEL_TYPE_STREAMING && <Icons.Stream defaultSize="w-5 5-5" />}

				{display && (
					<span className="text-[15px] font-thin dark:text-white text-textLightTheme one-line">
						{isHightLight ? HighlightMatchBold(display ?? '', valueHightLight ?? '') : display}
					</span>
				)}
				{checkVoiceStatus && <i className="text-[15px] font-thin dark:text-text-zinc-400 text-colorDanger ">(busy)</i>}
			</div>
			<span className={`text-[10px] font-semibold text-[#A1A1AA] one-line ${subTextStyle}`}>
				{HighlightMatchBold(subText ?? '', valueHightLight ?? '')}
			</span>
		</div>
	);
};

export default memo(SuggestItem);
