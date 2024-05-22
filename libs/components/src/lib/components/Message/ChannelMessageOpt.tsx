import { Icons } from '@mezon/components';
import { useChatReaction, useGifsStickersEmoji, useReference, useThreads } from '@mezon/core';
import { messagesActions, referencesActions, selectCurrentChannel, useAppDispatch } from '@mezon/store';
import { EmojiPlaces, IMessageWithUser, SubPanelName } from '@mezon/utils';
import { Ref, forwardRef, useCallback, useState } from 'react';
import { useSelector } from 'react-redux';

type ChannelMessageOptProps = {
	message: IMessageWithUser;
};

const ChannelMessageOpt = forwardRef(({ message }: ChannelMessageOptProps, ref: Ref<HTMLDivElement>) => {
	const dispatch = useAppDispatch();
	const { reactionActions, userId } = useChatReaction();
	const { openOptionMessageState, setOpenThreadMessageState } = useReference();
	const { setIsShowCreateThread, setValueThread } = useThreads();
	const [thread, setThread] = useState(false);
	const currentChannel = useSelector(selectCurrentChannel);
	const { setSubPanelActive, subPanelActive } = useGifsStickersEmoji();

	const handleClickReply = (event: React.MouseEvent<HTMLButtonElement>) => {
		dispatch(referencesActions.setOpenReplyMessageState(true));
		dispatch(referencesActions.setOpenEditMessageState(false));
		dispatch(reactionActions.setReactionRightState(false));
		dispatch(referencesActions.setReferenceMessage(message));
		event.stopPropagation();
	};

	const handleClickEdit = (event: React.MouseEvent<HTMLButtonElement>) => {
		dispatch(referencesActions.setOpenReplyMessageState(false));
		dispatch(reactionActions.setReactionRightState(false));
		dispatch(referencesActions.setOpenEditMessageState(true));
		dispatch(referencesActions.setReferenceMessage(message));
		event.stopPropagation();
	};

	const handleClickOption = (e: any) => {
		e.stopPropagation();
		dispatch(referencesActions.setOpenReplyMessageState(false));
		dispatch(reactionActions.setReactionRightState(false));
		dispatch(messagesActions.setOpenOptionMessageState(!openOptionMessageState));
		dispatch(referencesActions.setReferenceMessage(message));
	};

	const handleClickReact1 = (event: any) => {
		event.stopPropagation();
		dispatch(reactionActions.setReactionRightState(true));
		// dispatch(referencesActions.setReferenceMessage(message));
		// dispatch(reactionActions.setReactionPlaceActive(EmojiPlaces.EMOJI_REACTION));
		// dispatch(referencesActions.setOpenReplyMessageState(false));
		// dispatch(reactionActions.setReactionBottomState(false));
		// setSubPanelActive(SubPanelName.NONE);
		// const rect = (event.target as HTMLElement).getBoundingClientRect();
		// const distanceToBottom = window.innerHeight - rect.bottom;
		// if (distanceToBottom > 550) {
		// 	dispatch(reactionActions.setReactionTopState(true));
		// } else {
		// 	dispatch(reactionActions.setReactionTopState(false));
		// }
	};

	const handleClickReact = useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
			e.stopPropagation();
			setSubPanelActive(SubPanelName.EMOJI)		},
		[reactionActions.setReactionRightState],
	);

	const handleThread = () => {
		setThread(!thread);
		setIsShowCreateThread(true);
		setOpenThreadMessageState(true);
		setValueThread(message);
	};

	return (
		<div ref={ref} className="flex justify-between dark:bg-bgPrimary bg-bgLightMode border border-bgSecondary rounded">
			<div onClick={handleClickReact} className="h-full p-1 cursor-pointer">
				<Icons.Smile defaultSize="w-5 h-5" />
			</div>

			{userId === message.sender_id ? (
				<button onClick={handleClickEdit} className="h-full p-1 cursor-pointer">
					<Icons.PenEdit />
				</button>
			) : (
				<button onClick={handleClickReply} className="h-full px-1 pb-[2px] rotate-180">
					<Icons.Reply />
				</button>
			)}
			{Number(currentChannel?.parrent_id) === 0 && (
				<button className="h-full p-1 cursor-pointer" onClick={handleThread}>
					<Icons.ThreadIcon isWhite={thread} />
				</button>
			)}
			<button onClick={handleClickOption} className="h-full p-1 cursor-pointer">
				<Icons.ThreeDot />
			</button>
		</div>
	);
});

export default ChannelMessageOpt;
