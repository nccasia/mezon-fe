import { Icons } from '@mezon/components';
import { useAuth, useChatReaction, useEmojiSuggestion } from '@mezon/core';
import { selectCurrentChannel, selectDirectById } from '@mezon/store';
import { AvatarComponent, NameComponent } from '@mezon/ui';
import { EmojiDataOptionals, IMessageWithUser, SenderInfoOptionals, calculateTotalCount, getSrcEmoji } from '@mezon/utils';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

type UserReactionPanelProps = {
	emojiShowPanel: EmojiDataOptionals;
	mode: any;
	message: IMessageWithUser;
};

const UserReactionPanel = ({ emojiShowPanel, mode, message }: UserReactionPanelProps) => {
	const { emojiListPNG } = useEmojiSuggestion();
	const userId = useAuth();
	const [channelLabel, setChannelLabel] = useState("");
	const currentChannel = useSelector(selectCurrentChannel);
	const direct = useSelector(selectDirectById(message.channel_id));
	useEffect(()=>{
		if (direct != undefined) {
			setChannelLabel("")
		} else {
			setChannelLabel(currentChannel?.channel_label || "")
		}
	},[message])
	const { reactionMessageDispatch, arrowPosition } = useChatReaction();
	const removeEmojiSender = async (id: string, messageId: string, emoji: string, message_sender_id: string, countRemoved: number) => {
		await reactionMessageDispatch(id, mode, 
			message.channel_id ?? '', 
			channelLabel ?? '', 
			messageId, emoji, countRemoved, message_sender_id, true);
	};

	const hideSenderOnPanel = (emojiData: EmojiDataOptionals, senderId: string) => {
		if (emojiData.senders) {
			emojiData.senders = emojiData.senders.filter((sender) => sender.sender_id !== senderId);
		}
		return emojiData;
	};

	const count = calculateTotalCount(emojiShowPanel.senders);

	return (
		<>
			<div
				onClick={(e) => e.stopPropagation()}
				className={`z-50   w-[18rem]
				dark:bg-[#28272b] bg-white border-[#28272b] rounded-md min-h-5 max-h-[25rem] ${window.innerWidth < 640 ? 'absolute  bottom-7' : 'p-1 bottom-0'}`}
			>
				<div>
					<div className="flex flex-row items-center m-2 dark:text-white text-black">
						<img src={getSrcEmoji(emojiShowPanel.emoji ?? '', emojiListPNG)} className="w-5 h-5"></img>{' '}
						<p className="text-sm ml-2">{count}</p>
					</div>
					<hr className="h-[0.1rem] dark:bg-blue-900 bg-[#E1E1E1] border-none"></hr>
				</div>
				{emojiShowPanel.senders.map((sender: SenderInfoOptionals, index: number) => {
					if (sender.count && sender.count > 0) {
						return (
							<div key={`${index}_${sender.sender_id}`}>
								<div className="m-2 flex flex-row justify-start mb-2 items-center gap-2 relative">
									<AvatarComponent id={sender.sender_id ?? ''} />
									<NameComponent id={sender.sender_id ?? ''} />
									<p className="text-xs absolute right-8 dark:text-textDarkTheme text-textLightTheme">{sender.count}</p>
									{sender.sender_id === userId.userId && sender.count > 0 && (
										<div
											onClick={(e: any) => {
												e.stopPropagation();
												removeEmojiSender(
													emojiShowPanel.id ?? '',
													message.id,
													emojiShowPanel.emoji ?? '',
													sender.sender_id ?? '',
													sender.count ?? 0,
												);
												hideSenderOnPanel(emojiShowPanel, sender.sender_id ?? '');
											}}
											className="right-1 absolute"
										>
											<Icons.Close defaultSize="w-3 h-3" />
										</div>
									)}
								</div>
							</div>
						);
					}

					return null;
				})}

				<div className="w-full h-3 absolute bottom-[-0.5rem]"></div>
			</div>
			<div className={`dark:text-[#28272b] text-white mt-[-0.4rem] ${arrowPosition ? 'flex justify-end' : 'flex justify-center'} `}>
				<Icons.ArrowDownFill />
			</div>
		</>
	);
};

export default UserReactionPanel;
