import { ChannelMessageOpt, EmojiPickerComp, MessageWithUser, UnreadMessageBreak } from '@mezon/components';
import { useChatMessage, useChatReaction, useChatSending, useDeleteMessage, useDirect, useEscapeKey, useReference } from '@mezon/core';
import { directActions, referencesActions, selectMemberByUserId, useAppDispatch } from '@mezon/store';
import { EmojiPlaces, IMessageWithUser } from '@mezon/utils';
import { setSelectedMessage, toggleIsShowPopupForwardTrue } from 'libs/store/src/lib/forwardMessage/forwardMessage.slice';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useSelector } from 'react-redux';

type MessageProps = {
	message: IMessageWithUser;
	preMessage?: IMessageWithUser;
	lastSeen?: boolean;
	mode: number;
	channelId: string;
	channelLabel: string;
};

export function ChannelMessage(props: Readonly<MessageProps>) {
	const { message, lastSeen, preMessage, mode, channelId, channelLabel } = props;
	const { markMessageAsSeen } = useChatMessage(message.id);
	const user = useSelector(selectMemberByUserId(message.sender_id));
	const { EditSendMessage } = useChatSending({ channelId: channelId || '', channelLabel: channelLabel || '', mode });
	const { DeleteSendMessage } = useDeleteMessage({ channelId: channelId || '', channelLabel: channelLabel || '', mode });
	const dispatch = useAppDispatch();
	const { reactionRightState, reactionBottomState } = useChatReaction();
	const { referenceMessage, openEditMessageState, openOptionMessageState } = useReference();

	useEffect(() => {
		markMessageAsSeen(message);
	}, [markMessageAsSeen, message]);

	const mess = useMemo(() => {
		if (typeof message.content === 'object' && typeof (message.content as any).id === 'string') {
			return message.content;
		}
		return message;
	}, [message]);

	const [editMessage, setEditMessage] = useState(mess.content.t);
	const [newMessage, setNewMessage] = useState('');

	const messPre = useMemo(() => {
		if (preMessage && typeof preMessage.content === 'object' && typeof (preMessage.content as any).id === 'string') {
			return preMessage.content;
		}
		return preMessage;
	}, [preMessage]);

	const handleCancelEdit = () => {
		dispatch(referencesActions.setOpenEditMessageState(false));
	};

	const onSend = (e: React.KeyboardEvent<Element>) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			e.stopPropagation();
			if (editMessage) {
				handleSend(editMessage, message.id);
				setNewMessage(editMessage);
				handleCancelEdit();
			}
		}
		if (e.key === 'Escape') {
			e.preventDefault();
			e.stopPropagation();
			handleCancelEdit();
		}
	};
	const handelSave = () => {
		if (editMessage) {
			handleSend(editMessage, message.id);
			setNewMessage(editMessage);
			handleCancelEdit();
		}
	};

	const handleSend = useCallback(
		(editMessage: string, messageId: string) => {
			EditSendMessage(editMessage, messageId);
		},
		[EditSendMessage],
	);
	const onchange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setEditMessage(e.target.value);
		updateTextareaHeight(e.target);
	};
	const updateTextareaHeight = (textarea: HTMLTextAreaElement) => {
		textarea.style.height = 'auto';
		textarea.style.height = textarea.scrollHeight + 'px';
	};
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	useEffect(() => {
		if (openEditMessageState && mess.id === referenceMessage?.id) {
			textareaRef.current?.focus();
		}
	}, [openEditMessageState, mess, referenceMessage]);
	const handleFocus = () => {
		if (textareaRef.current) {
			const length = textareaRef.current.value.length;
			textareaRef.current.setSelectionRange(length, length);
		}
	};

	useEscapeKey(handleCancelEdit);

	return (
		<div className="fullBoxText relative group">
			<MessageWithUser
				message={mess}
				preMessage={messPre}
				user={user}
				mode={mode}
				newMessage={newMessage}
				child={
					<PopupMessage
						reactionRightState={reactionRightState}
						mess={mess}
						referenceMessage={referenceMessage}
						reactionBottomState={reactionBottomState}
						openEditMessageState={openEditMessageState}
						openOptionMessageState={openOptionMessageState}
						mode={mode}
						deleteSendMessage={DeleteSendMessage}
					/>
				}
			/>

			{lastSeen && <UnreadMessageBreak />}

			{openEditMessageState && mess.id === referenceMessage?.id && (
				<div className="inputEdit relative left-[66px] top-[-21px]">
					<textarea
						onFocus={handleFocus}
						ref={textareaRef}
						defaultValue={mess.content.t}
						className="w-[83%] bg-black rounded p-[10px]"
						onKeyDown={onSend}
						onChange={(e) => {
							onchange(e);
						}}
						rows={editMessage?.split('\n').length}
					></textarea>
					<div className="text-xs flex">
						<p className="pr-[3px]">escape to</p>
						<p className="pr-[3px] text-[#3297ff]" style={{ cursor: 'pointer' }} onClick={handleCancelEdit}>
							cancel
						</p>
						<p className="pr-[3px]">• enter to</p>
						<p className="text-[#3297ff]" style={{ cursor: 'pointer' }} onClick={handelSave}>
							save
						</p>
					</div>
				</div>
			)}
		</div>
	);
}

ChannelMessage.Skeleton = () => {
	return (
		<div>
			<MessageWithUser.Skeleton />
		</div>
	);
};

type PopupMessageProps = {
	reactionRightState: boolean;
	mess: IMessageWithUser;
	referenceMessage: IMessageWithUser | null;
	reactionBottomState: boolean;
	openEditMessageState: boolean;
	openOptionMessageState: boolean;
	mode: number;
	isCombine?: boolean;
	deleteSendMessage: (messageId: string) => Promise<void>;
};

type PopupOptionProps = {
	message: IMessageWithUser;
	deleteSendMessage: (messageId: string) => Promise<void>;
};

function PopupMessage({
	reactionRightState,
	mess,
	referenceMessage,
	reactionBottomState,
	openEditMessageState,
	openOptionMessageState,
	mode,
	isCombine,
	deleteSendMessage,
}: PopupMessageProps) {
	const { reactionPlaceActive } = useChatReaction();
	const channelMessageOptRef = useRef<HTMLDivElement>(null);
	const [pickerPosition, setPickerPosition] = useState({ top: 0, left: 0 });
	const getDivHeightToTop = () => {
		const channelMessageDiv = channelMessageOptRef.current;
		if (channelMessageDiv) {
			const rect = channelMessageDiv.getBoundingClientRect();
			if (rect.bottom < 500 && rect.top > 0) {
				setPickerPosition({ top: rect.top - 50, left: rect.left });
			} else {
				setPickerPosition({ top: rect.top - 340, left: rect.left });
			}
		}
		return 0;
	};

	useEffect(() => {
		if (reactionRightState && referenceMessage?.id === mess.id) {
			getDivHeightToTop();
		}
	}, [reactionRightState]);

	return (
		<>
			{reactionPlaceActive !== EmojiPlaces.EMOJI_REACTION_BOTTOM && (
				<div
					className={`chooseForText z-[1] absolute h-8 p-0.5 rounded right-4 w-24 block bg-bgSecondary top-0 right-5 
				${
					(reactionRightState && mess.id === referenceMessage?.id) ||
					(reactionBottomState && mess.id === referenceMessage?.id) ||
					(openEditMessageState && mess.id === referenceMessage?.id) ||
					(openOptionMessageState && mess.id === referenceMessage?.id)
						? ''
						: 'hidden group-hover:block'
				} `}
				>
					<ChannelMessageOpt message={mess} ref={channelMessageOptRef} />
					{mess.id === referenceMessage?.id && reactionRightState && (
						<div
							id="emojiPicker"
							className="fixed h-[0px]"
							style={{ top: pickerPosition.top - 20, left: pickerPosition.left - 310, bottom: pickerPosition.top < 350 ? 0 : '' }}
						>
							<div className="scale-75 transform mb-0 z-10">
								<EmojiPickerComp messageEmoji={referenceMessage} mode={mode} emojiAction={EmojiPlaces.EMOJI_REACTION} />
							</div>
						</div>
					)}

					{openOptionMessageState && mess.id === referenceMessage?.id && (
						<PopupOption message={mess} deleteSendMessage={deleteSendMessage} />
					)}
				</div>
			)}
		</>
	);
}

function PopupOption({ message, deleteSendMessage }: PopupOptionProps) {
	const dispatch = useAppDispatch();
	const { userId } = useChatReaction();

	const handleClickEdit = (event: React.MouseEvent<HTMLLIElement>) => {
		dispatch(referencesActions.setOpenReplyMessageState(false));
		dispatch(referencesActions.setOpenEditMessageState(true));
		dispatch(referencesActions.setOpenOptionMessageState(false));
		dispatch(referencesActions.setReferenceMessage(message));
		event.stopPropagation();
	};

	const handleClickReply = (event: React.MouseEvent<HTMLLIElement>) => {
		dispatch(referencesActions.setOpenReplyMessageState(true));
		dispatch(referencesActions.setOpenEditMessageState(false));
		dispatch(referencesActions.setOpenOptionMessageState(false));
		dispatch(referencesActions.setReferenceMessage(message));
		event.stopPropagation();
	};

	const handleClickCopy = () => {
		dispatch(referencesActions.setOpenEditMessageState(false));
		dispatch(referencesActions.setOpenOptionMessageState(false));
		dispatch(referencesActions.setReferenceMessage(null));
		dispatch(referencesActions.setDataReferences(null));
	};

	const handleClickDelete = () => {
		deleteSendMessage(message.id);
	};
	const { listDM: dmGroupChatList } = useDirect();

	const handleClickForward = () => {
		if (dmGroupChatList.length === 0) {
			dispatch(directActions.fetchDirectMessage({}));
		}
		dispatch(toggleIsShowPopupForwardTrue());
		dispatch(setSelectedMessage(message));
	};
	const checkUser = userId === message.sender_id;
	return (
		<div className={`bg-[#151515] rounded-[10px] p-2 absolute right-8 w-[180px] z-10 ${checkUser ? '-top-[150px]' : 'top-[-66px]'}`}>
			<ul className="flex flex-col gap-1">
				{checkUser && (
					<li className="p-2 hover:bg-black rounded-lg text-[15px] cursor-pointer" onClick={handleClickEdit} role="button" aria-hidden>
						Edit Message
					</li>
				)}
				<li className="p-2 hover:bg-black rounded-lg text-[15px] cursor-pointer" onClick={handleClickReply} role="button" aria-hidden>
					Reply
				</li>
				<li
					className="p-2 hover:bg-black rounded-lg text-[15px] cursor-pointer"
					onClick={() => {
						handleClickForward();
					}}
					role="button"
					aria-hidden
				>
					Forward message
				</li>
				<CopyToClipboard text={message.content.t || ''}>
					<li className="p-2 hover:bg-black rounded-lg text-[15px] cursor-pointer" onClick={handleClickCopy} role="button" aria-hidden>
						Copy Text
					</li>
				</CopyToClipboard>

				{checkUser && (
					<li
						className="p-2 hover:bg-black rounded-lg text-[15px] cursor-pointer text-[#ff0000]"
						onClick={handleClickDelete}
						role="button"
						aria-hidden
					>
						Delete Message
					</li>
				)}
			</ul>
		</div>
	);
}
