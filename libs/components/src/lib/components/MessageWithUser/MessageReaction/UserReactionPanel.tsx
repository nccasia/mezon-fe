import { AvatarImage, Icons } from '@mezon/components';
import { useAuth, useChatReaction, useEmojiSuggestion } from '@mezon/core';
import { reactionActions, selectCurrentChannel, selectDirectById, selectMemberByUserId } from '@mezon/store';
import { NameComponent } from '@mezon/ui';
import { EmojiDataOptionals, IMessageWithUser, SenderInfoOptionals, calculateTotalCount, getSrcEmoji } from '@mezon/utils';
import { Fragment, useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

type UserReactionPanelProps = {
	emojiShowPanel: EmojiDataOptionals;
	mode: number;
	message: IMessageWithUser;
};

const UserReactionPanel = ({ emojiShowPanel, mode, message }: UserReactionPanelProps) => {
	const dispatch = useDispatch();
	const { reactionMessageDispatch } = useChatReaction();
	const { emojis } = useEmojiSuggestion();
	const userId = useAuth();
	const [channelLabel, setChannelLabel] = useState('');
	const currentChannel = useSelector(selectCurrentChannel);
	const direct = useSelector(selectDirectById(message.channel_id));
	useEffect(() => {
		if (direct != undefined) {
			setChannelLabel('');
		} else {
			setChannelLabel(currentChannel?.channel_label || '');
		}
	}, [message]);
	const removeEmojiSender = async (id: string, messageId: string, emoji: string, message_sender_id: string, countRemoved: number) => {
		await reactionMessageDispatch(id, mode, message.channel_id ?? '', messageId, emoji, countRemoved, message_sender_id, true);
	};

	const [senderList, setSenderList] = useState<SenderInfoOptionals[]>(emojiShowPanel.senders);
	const hideSenderOnPanel = useCallback((emojiData: EmojiDataOptionals, senderId: string) => {
		const newEmojiData = { ...emojiData };
		if (newEmojiData.senders) {
			newEmojiData.senders = newEmojiData.senders.filter((sender) => sender.sender_id !== senderId);
		}
		setSenderList(newEmojiData.senders);
		return newEmojiData;
	}, []);

	const count = calculateTotalCount(senderList);
	const onLeavePanel = () => {
		dispatch(reactionActions.setEmojiHover(null));
		dispatch(reactionActions.setUserReactionPanelState(false));
	};

	return (
		<>
			{count > 0 && (
				<div className="flex flex-col justify-center ">
					<div
						onMouseLeave={onLeavePanel}
						onClick={(e) => e.stopPropagation()}
						className={`z-50   w-[18rem]
						dark:bg-[#28272b] bg-white border-[#28272b] rounded-sm min-h-5 max-h-[25rem] shadow-md
				 		${window.innerWidth < 640 ? 'flex flex-col justify-center' : 'p-1 bottom-0'}`}
					>
						<PanelHeader emoji={emojiShowPanel.emoji} emojiListPNG={emojis} count={count} />
						{senderList.map((sender: SenderInfoOptionals, index: number) => {
							if (sender.count && sender.count > 0) {
								return (
									<Fragment key={`${index}_${sender.sender_id}`}>
										<SenderItem
											sender={sender}
											emojiShowPanel={emojiShowPanel}
											userId={userId}
											removeEmojiSender={removeEmojiSender}
											hideSenderOnPanel={hideSenderOnPanel}
										/>
									</Fragment>
								);
							}
							return null;
						})}
					</div>
				</div>
			)}
		</>
	);
};

export default UserReactionPanel;

type PanelHeaderProps = {
	emoji: string | undefined;
	emojiListPNG: any;
	count: number;
};

const PanelHeader: React.FC<PanelHeaderProps> = ({ emoji, emojiListPNG, count }) => {
	return (
		<div>
			<div className="flex flex-row items-center m-2 dark:text-white text-black">
				<img src={getSrcEmoji(emoji ?? '', emojiListPNG)} className="w-5 h-5 min-h-5 min-w-5" />
				<p className="text-sm ml-2">{count}</p>
			</div>
			<hr className="h-[0.1rem] dark:bg-blue-900 bg-[#E1E1E1] border-none" />
		</div>
	);
};

type SenderItemProps = {
	sender: any;
	emojiShowPanel: any;
	userId: any;
	removeEmojiSender: (id: string, messageId: string, emoji: string, message_sender_id: string, countRemoved: number) => Promise<void>;
	hideSenderOnPanel: (emojiData: any, senderId: string) => void;
};

const SenderItem: React.FC<SenderItemProps> = ({ sender, emojiShowPanel, userId, removeEmojiSender, hideSenderOnPanel }) => {
	const handleRemoveEmojiSender = async (e: React.MouseEvent<HTMLDivElement>) => {
		e.stopPropagation();
		await removeEmojiSender(
			emojiShowPanel.id ?? '',
			emojiShowPanel.message_id ?? '',
			emojiShowPanel.emoji ?? '',
			sender.sender_id ?? '',
			sender.count ?? 0,
		);
		hideSenderOnPanel(emojiShowPanel, sender.sender_id ?? '');
	};
	const user = useSelector(selectMemberByUserId(sender.sender_id));

	return (
		<div className="m-2 flex flex-row justify-start mb-2 items-center gap-2 relative">
			<div className="w-8 h-8">
				<AvatarImage className="w-8 h-8" alt="user avatar" userName={user?.user?.username} src={user?.user?.avatar_url} />
			</div>

			<NameComponent id={sender.sender_id ?? ''} />
			<p className="text-xs absolute right-8 dark:text-textDarkTheme text-textLightTheme">{sender.count}</p>
			{sender.sender_id === userId.userId && sender.count && sender.count > 0 && (
				<div onClick={handleRemoveEmojiSender} className="right-1 absolute cursor-pointer">
					<Icons.Close defaultSize="w-3 h-3" />
				</div>
			)}
		</div>
	);
};
