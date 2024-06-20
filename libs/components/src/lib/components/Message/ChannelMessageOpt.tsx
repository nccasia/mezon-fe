import { Icons } from '@mezon/components';
import { useAuth, useChatReaction, useGifsStickersEmoji, useReference, useThreads } from '@mezon/core';
import { messagesActions, reactionActions, referencesActions, selectCurrentChannel, useAppDispatch } from '@mezon/store';
import { IMessageWithUser, SubPanelName } from '@mezon/utils';
import { Ref, forwardRef, useCallback, useState } from 'react';
import { useSelector } from 'react-redux';

type ChannelMessageOptProps = {
	message: IMessageWithUser;
};

const ChannelMessageOpt = forwardRef(({ message }: ChannelMessageOptProps, ref: Ref<HTMLDivElement>) => {
	const dispatch = useAppDispatch();
	
	const { userId } = useAuth();

	const { setOpenThreadMessageState } = useReference();
	const { setIsShowCreateThread, setValueThread } = useThreads();
	const [thread, setThread] = useState(false);
	const currentChannel = useSelector(selectCurrentChannel);
	const { setSubPanelActive, subPanelActive } = useGifsStickersEmoji();

	const handleClickReply = (event: React.MouseEvent<HTMLButtonElement>) => {
		dispatch(referencesActions.setIdReferenceMessageReply(message.id));
		dispatch(referencesActions.setIdMessageToJump(''));
		event.stopPropagation();
	};

	const handleClickEdit = (event: React.MouseEvent<HTMLButtonElement>) => {
		dispatch(referencesActions.setOpenReplyMessageState(false));
		dispatch(reactionActions.setReactionRightState(false));
		dispatch(referencesActions.setOpenEditMessageState(true));
		dispatch(referencesActions.setIdReferenceMessageEdit(message.id));
		dispatch(referencesActions.setIdMessageToJump(''));
		event.stopPropagation();
	};

	const handleClickOption = (e: any) => {
		e.stopPropagation();
		dispatch(referencesActions.setOpenReplyMessageState(false));
		dispatch(reactionActions.setReactionRightState(false));
		dispatch(messagesActions.setOpenOptionMessageState(true));
		dispatch(referencesActions.setIdReferenceMessageOption(message.id));
	};

	const handleOnEnterSmileIcon = () => {
		dispatch(referencesActions.setIdReferenceMessageReaction(message.id));
	};
	const handleOnEnterReplyIcon = () => {
		dispatch(referencesActions.setOpenReplyMessageState(true));
	};

	const handleClickReact = useCallback(
		(event: React.MouseEvent<HTMLDivElement>) => {
			setSubPanelActive(SubPanelName.EMOJI_REACTION_RIGHT);
			event.stopPropagation();
			const rect = (event.target as HTMLElement).getBoundingClientRect();
			const distanceToBottom = window.innerHeight - rect.bottom;
			if (distanceToBottom > 550) {
				dispatch(reactionActions.setReactionTopState(true));
			} else {
				dispatch(reactionActions.setReactionTopState(false));
			}
		},
		[setSubPanelActive],
	);

	const handleThread = () => {
		setThread(!thread);
		setIsShowCreateThread(true);
		setOpenThreadMessageState(true);
		setValueThread(message);
	};

	return (
		<div ref={ref} className="flex justify-between dark:bg-bgPrimary bg-bgLightMode border border-bgSecondary rounded">
			<div onClick={handleClickReact} className="h-full p-1 cursor-pointer" onMouseEnter={handleOnEnterSmileIcon}>
				<Icons.Smile defaultSize="w-5 h-5" />
			</div>

			{userId === message.sender_id ? (
				<button onClick={handleClickEdit} className="h-full p-1 cursor-pointer">
					<Icons.PenEdit />
				</button>
			) : (
				<button onClick={handleClickReply} className="h-full px-1 pb-[2px] rotate-180" onMouseEnter={handleOnEnterReplyIcon}>
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
