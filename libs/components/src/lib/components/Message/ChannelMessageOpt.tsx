import { Icons } from '@mezon/components';
import { useChatReaction, useReference } from '@mezon/core';
import { referencesActions, useAppDispatch } from '@mezon/store';
import { EmojiPlaces, IMessageWithUser } from '@mezon/utils';
import { Ref, forwardRef } from 'react';

type ChannelMessageOptProps = {
	message: IMessageWithUser;
};

const ChannelMessageOpt = forwardRef(({ message }: ChannelMessageOptProps, ref: Ref<HTMLDivElement>) => {
	const dispatch = useAppDispatch();
	const { reactionActions, userId, reactionRightState, reactionBottomState } = useChatReaction();
	const { openEditMessageState, openOptionMessageState } = useReference();

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
		dispatch(referencesActions.setOpenOptionMessageState(!openOptionMessageState));
		dispatch(referencesActions.setReferenceMessage(message));
	};

	const handleClickReact = (event: React.MouseEvent<HTMLDivElement>) => {
		dispatch(reactionActions.setReactionRightState(true));
		dispatch(referencesActions.setReferenceMessage(message));
		dispatch(reactionActions.setReactionPlaceActive(EmojiPlaces.EMOJI_REACTION));
		dispatch(referencesActions.setOpenReplyMessageState(false));
		dispatch(reactionActions.setReactionBottomState(false));
		event.stopPropagation();
	};

	return (
		<div ref={ref} className="iconHover flex justify-between  bg-[#232323] rounded">
			<div onClick={handleClickReact} className="h-full p-1 cursor-pointer">
				<Icons.Smile />
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
			<button onClick={handleClickOption} className="h-full p-1 cursor-pointer">
				<Icons.ThreeDot />
			</button>
		</div>
	);
});

export default ChannelMessageOpt;
