import { Icons } from '@mezon/components';
import { useAuth, useChatReaction } from '@mezon/core';
import { AvatarComponent, NameComponent } from '@mezon/ui';
import { EmojiDataOptionals, IMessageWithUser, SenderInfoOptionals, calculateTotalCount } from '@mezon/utils';
import { Fragment } from 'react';

type UserReactionPanelProps = {
	emojiShowPanel: EmojiDataOptionals;
	mode: any;
	message: IMessageWithUser;
	pos: boolean;
};

const UserReactionPanel = ({ emojiShowPanel, mode, message, pos }: UserReactionPanelProps) => {
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
			<div
				onClick={(e) => e.stopPropagation()}
				className={`absolute z-50  bottom-7 w-[18rem]
				bg-[#313338] border-[#313338] rounded-md min-h-5 max-h-[25rem] ${pos ? 'right-0' : 'left-0'}`}
			>
				<div className="flex flex-row items-center m-2">
					<div className="">{emojiShowPanel.emoji}</div>
					<p className="text-sm ml-2">{calculateTotalCount(emojiShowPanel.senders)}</p>
				</div>

				<hr className="h-[0.1rem] bg-blue-900 border-none"></hr>
				{emojiShowPanel.senders.map((sender: SenderInfoOptionals, index: number) => {
					return (
						<Fragment key={sender.sender_id}>
							{sender.count && sender.count > 0 && (
								<div key={sender.sender_id} className="m-2 flex flex-row justify-start mb-2 items-center gap-2 relative ">
									<AvatarComponent id={sender.sender_id ?? ''} />
									<NameComponent id={sender.sender_id ?? ''} />
									<p className="text-xs absolute right-8">{sender.count}</p>
									{sender.sender_id === userId.userId && (
										<button
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
										</button>
									)}
								</div>
							)}
						</Fragment>
					);
				})}
				<div className="w-full h-3 absolute bottom-[-0.5rem]"></div>
			</div>
		</>
	);
};

export default UserReactionPanel;
