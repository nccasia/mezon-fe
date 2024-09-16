import { useAppParams, useAuth, useChatReaction } from '@mezon/core';
import { selectChannelById, selectCurrentChannel, selectDirectById, useAppSelector } from '@mezon/store';
import { getSrcEmoji } from '@mezon/utils';
import { ChannelStreamMode } from 'mezon-js';
import { memo, useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

interface IReactionItem {
	emojiShortCode: string;
	emojiId: string;
	activeMode: number | undefined;
	messageId: string;
}

const ReactionItem: React.FC<IReactionItem> = ({ emojiShortCode, emojiId, activeMode, messageId }) => {
	const { directId } = useAppParams();

	const { reactionMessageDispatch } = useChatReaction();
	const getUrl = getSrcEmoji(emojiId);
	const userId = useAuth();

	const [channelID, setChannelID] = useState('');
	const direct = useAppSelector((state) => selectDirectById(state, directId));
	const currentChannel = useSelector(selectCurrentChannel);
	const parent = useSelector(selectChannelById(currentChannel?.parrent_id || ''));

	useEffect(() => {
		if (direct !== undefined) {
			setChannelID(direct.id);
		} else {
			setChannelID(currentChannel?.id || '');
		}
	}, [currentChannel, direct, directId]);

	const handleClickEmoji = useCallback(async () => {
		await reactionMessageDispatch(
			'',
			activeMode ?? ChannelStreamMode.STREAM_MODE_CHANNEL,
			currentChannel?.parrent_id || '',
			currentChannel?.clan_id || '',
			channelID && channelID,
			messageId,
			emojiId,
			emojiShortCode,
			1,
			userId.userId ?? '',
			false,
			currentChannel ? !currentChannel.channel_private : false,
			parent ? !parent.channel_private : false
		);
	}, [emojiId, emojiShortCode, activeMode, messageId, channelID, currentChannel]);

	return (
		<div
			onClick={handleClickEmoji}
			className="w-10 h-10  rounded-full flex justify-center items-center
			dark:hover:bg-[#232428] dark:bg-[#1E1F22] 
			bg-[#E3E5E8] hover:bg-[#EBEDEF] cursor-pointer"
		>
			<img src={getUrl} className="w-5 h-5"></img>
		</div>
	);
};

export default memo(ReactionItem);
