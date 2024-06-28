import { Icons } from '@mezon/components';
import { useAuth, useGifsStickersEmoji, useReference, useThreads } from '@mezon/core';
import { gifsStickerEmojiActions, reactionActions, referencesActions, selectCurrentChannel, threadsActions, useAppDispatch } from '@mezon/store';
import { IMessageWithUser, SubPanelName } from '@mezon/utils';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

type ChannelMessageOptProps = {
	message: IMessageWithUser;
	handleContextMenu: (event: React.MouseEvent<HTMLElement>) => void;
};

const ChannelMessageOpt = ({ message, handleContextMenu }: ChannelMessageOptProps) => {
	const dispatch = useAppDispatch();
	const { userId } = useAuth();
	const { setOpenThreadMessageState } = useReference();
	const { setIsShowCreateThread, setValueThread } = useThreads();
	const [thread, setThread] = useState(false);
	const currentChannel = useSelector(selectCurrentChannel);
	const { setSubPanelActive } = useGifsStickersEmoji();
	const refOpt = useRef<HTMLDivElement>(null);
	const handleClickReply = (event: React.MouseEvent<HTMLButtonElement>) => {
		dispatch(referencesActions.setIdReferenceMessageReply(message.id));
		dispatch(referencesActions.setIdMessageToJump(''));
		dispatch(gifsStickerEmojiActions.setSubPanelActive(SubPanelName.NONE));

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
		dispatch(threadsActions.setOpenThreadMessageState(true));

		setValueThread(message);
	};

	const handleClickOption = (event: React.MouseEvent<HTMLButtonElement>) => {
		handleContextMenu(event);
	};

	const [position, setPosition] = useState({ top: 0, left: 0 });

	useEffect(() => {
		const timerId = setTimeout(() => {
			if (refOpt.current) {
				const rect = refOpt.current.getBoundingClientRect();
				setPosition({
					top: rect.top + window.scrollY,
					left: rect.left + window.scrollX - 200,
				});
			}
		}, 100);

		return () => clearTimeout(timerId);
	}, [refOpt]);

	return (
		<div
			className={`chooseForText z-[1] absolute h-8 p-0.5 rounded block -top-4 right-6 ${Number(currentChannel?.parrent_id) === 0 ? 'w-32' : 'w-24'}
	`}
		>
			{' '}
			<div className="flex justify-between dark:bg-bgPrimary bg-bgLightMode border border-bgSecondary rounded">
				<div className="w-full h-full flex justify-between" ref={refOpt}>
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
			</div>
		</div>
	);
};

export default memo(ChannelMessageOpt);
