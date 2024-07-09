import { useAppParams, useAuth, useChatReaction, useEmojiSuggestion } from '@mezon/core';
import { selectCurrentChannel, selectDirectById } from '@mezon/store';
import { getSrcEmoji } from '@mezon/utils';
import { ChannelStreamMode } from 'mezon-js';
import { memo, useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

interface IReactionItem {
	emojiShortCode: string;
	activeMode: number | undefined;
	messageId: string;
}

const ReactionItem: React.FC<IReactionItem> = ({ emojiShortCode, activeMode, messageId }) => {
	const { directId } = useAppParams();
	const { emojiConverted } = useEmojiSuggestion();

	const { reactionMessageDispatch } = useChatReaction();
	const getUrl = getSrcEmoji(emojiShortCode, emojiConverted ?? []);
	const userId = useAuth();

	const [channelID, setChannelID] = useState('');
	const direct = useSelector(selectDirectById(directId || ''));
	const currentChannel = useSelector(selectCurrentChannel);

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
			channelID && channelID,
			messageId,
			emojiShortCode,
			1,
			userId.userId ?? '',
			false,
		);
	}, [emojiShortCode, activeMode, messageId, channelID]);

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
