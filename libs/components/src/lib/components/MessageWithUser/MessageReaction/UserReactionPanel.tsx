import { Icons } from '@mezon/components';
import { useAuth, useChatReaction, useEmojiSuggestion } from '@mezon/core';
import { AvatarComponent, NameComponent } from '@mezon/ui';
import { EmojiDataOptionals, IMessageWithUser, SenderInfoOptionals, calculateTotalCount, getSrcEmoji } from '@mezon/utils';
import { Fragment } from 'react';

type UserReactionPanelProps = {
	emojiShowPanel: EmojiDataOptionals;
	mode: any;
	message: IMessageWithUser;
	moveToRight?: boolean;
};

const UserReactionPanel = ({ emojiShowPanel, mode, message, moveToRight }: UserReactionPanelProps) => {
	const { emojis, categoriesEmoji, emojiListPNG } = useEmojiSuggestion();
	const userId = useAuth();
	const { reactionMessageDispatch } = useChatReaction();
	const removeEmojiSender = async (id: string, messageId: string, emoji: string, message_sender_id: string, countRemoved: number) => {
		await reactionMessageDispatch(id, mode, messageId, emoji, countRemoved, message_sender_id, true);
	};

	const hideSenderOnPanel = (emojiData: EmojiDataOptionals, senderId: string) => {
		if (emojiData.senders) {
			emojiData.senders = emojiData.senders.filter((sender) => sender.sender_id !== senderId);
		}
		return emojiData;
	};

	return (
		<>
			{calculateTotalCount(emojiShowPanel.senders) > 0 && (
				<div
					onClick={(e) => e.stopPropagation()}
					className={`absolute z-50  bottom-7 w-[18rem]
				dark:bg-[#28272b] bg-white border-[#28272b] rounded-md min-h-5 max-h-[25rem] ${moveToRight ? 'right-0' : 'left-0'} `}
				>
					<div>
						<div className="flex flex-row items-center m-2  dark:text-white text-black">
							<img src={getSrcEmoji(emojiShowPanel.emoji ?? '', emojiListPNG)} className="w-5 h-5"></img>{' '}
							<p className="text-sm ml-2">{calculateTotalCount(emojiShowPanel.senders)}</p>
						</div>
						<hr className="h-[0.1rem] dark:bg-blue-900 bg-[#E1E1E1] border-none"></hr>
					</div>

					{emojiShowPanel.senders.map((sender: SenderInfoOptionals, index: number) => {
						return (
							<Fragment key={`${index}_${sender.sender_id}`}>
								{sender.count && sender.count > 0 && (
									<div key={sender.sender_id} className="m-2 flex flex-row justify-start mb-2 items-center gap-2 relative ">
										<AvatarComponent id={sender.sender_id ?? ''} />
										<NameComponent id={sender.sender_id ?? ''} />
										<p className="text-xs absolute right-8">{sender.count}</p>
										{sender.sender_id === userId.userId && (
											<div
												onClick={(e: any) => {
													return (
														e.stopPropagation(),
														removeEmojiSender(
															emojiShowPanel.id ?? '',
															message.id,
															emojiShowPanel.emoji ?? '',
															sender.sender_id ?? '',
															sender.count ?? 0,
														),
														hideSenderOnPanel(emojiShowPanel, sender.sender_id ?? '')
													);
												}}
												className="right-1 absolute"
											>
												<Icons.Close defaultSize="w-3 h-3" />
											</div>
										)}
									</div>
								)}
							</Fragment>
						);
					})}
					<div className="w-full h-3 absolute bottom-[-0.5rem]"></div>
				</div>
			)}
		</>
	);
};

export default UserReactionPanel;
