import { ChannelMessageOpt, MessageReaction, MessageWithUser, UnreadMessageBreak, UserMentionList } from '@mezon/components';
import {
	useApp,
	useChannels,
	useChatMessage,
	useChatReaction,
	useChatSending,
	useDeleteMessage,
	useDirect,
	useEmojiSuggestion,
	useEscapeKey,
	useReference,
} from '@mezon/core';
import {
	directActions,
	messagesActions,
	pinMessageActions,
	referencesActions,
	selectCurrentChannel,
	selectMemberByUserId,
	selectPinMessageByChannelId,
	useAppDispatch,
} from '@mezon/store';
import { EmojiPlaces, IMessageWithUser } from '@mezon/utils';
import SuggestItem from 'libs/components/src/lib/components/MessageBox/ReactionMentionInput/SuggestItem';
import { setSelectedMessage, toggleIsShowPopupForwardTrue } from 'libs/store/src/lib/forwardMessage/forwardMessage.slice';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Mention, MentionsInput } from 'react-mentions';
import { useSelector } from 'react-redux';
import lightMentionsInputStyle from './LightRmentionInputStyle';
import ModalDeleteMess from './ModalDeleteMess';
import darkMentionsInputStyle from './RmentionInputStyle';
import mentionStyle from './RmentionStyle';

type MessageProps = {
	message: IMessageWithUser;
	preMessage?: IMessageWithUser;
	lastSeen?: boolean;
	mode: number;
	channelId: string;
	channelLabel: string;
};

type ChannelsMentionProps = {
	id: string;
	display: string;
	subText: string;
};

type EmojiData = {
	id: string;
	emoji: string;
	display: string;
};

const neverMatchingRegex = /($a)/;

export function ChannelMessage(props: Readonly<MessageProps>) {
	const { message, lastSeen, preMessage, mode, channelId, channelLabel } = props;
	const [deleteMessage, setDeleteMessage] = useState(false);
	const { markMessageAsSeen } = useChatMessage(message.id);
	const user = useSelector(selectMemberByUserId(message.sender_id));
	const { EditSendMessage } = useChatSending({ channelId: channelId || '', channelLabel: channelLabel || '', mode });
	const { DeleteSendMessage } = useDeleteMessage({ channelId: channelId || '', channelLabel: channelLabel || '', mode });
	const dispatch = useAppDispatch();
	const { reactionRightState, reactionBottomState } = useChatReaction();
	const { openEditMessageState, openOptionMessageState, idMessageRefEdit } = useReference();

	useEffect(() => {
		markMessageAsSeen(message);
	}, [markMessageAsSeen, message]);

	const mess = useMemo(() => {
		if (typeof message.content === 'object' && typeof (message.content as any).id === 'string') {
			return message.content;
		}
		return message;
	}, [message]);

	const convertToPlainTextHashtag = (text: string) => {
		const regex = /([@#])\[(.*?)\]\((.*?)\)/g;
		const result = text.replace(regex, (match, symbol, p1, p2) => {
			return symbol === '#' ? `#${p2}` : `@${p1}`;
		});
		return result;
	};
	const [newMessage, setNewMessage] = useState('');
	const [editMessage, setEditMessage] = useState(mess.content.t);
	const [content, setContent] = useState(editMessage);

	const replaceChannelIdsWithDisplay = (text: string, listInput: ChannelsMentionProps[]) => {
		const regex = /#[0-9]{19}\b/g;
		const replacedText = text.replace(regex, (match) => {
			const channelId = match.substring(1);
			const channel = listInput.find((item) => item.id === channelId);
			return channel ? `#[${channel.display}](${channelId})` : match;
		});

		return replacedText;
	};

	useEffect(() => {
		if (editMessage) {
			const convertedHashtag = convertToPlainTextHashtag(editMessage);
			const replacedText = replaceChannelIdsWithDisplay(convertedHashtag, listChannelsMention);
			setEditMessage(replacedText);
			setContent(convertedHashtag);
		}
	}, [editMessage]);

	const messPre = useMemo(() => {
		if (preMessage && typeof preMessage.content === 'object' && typeof (preMessage.content as any).id === 'string') {
			return preMessage.content;
		}
		return preMessage;
	}, [preMessage]);

	const handleCancelEdit = () => {
		dispatch(referencesActions.setOpenEditMessageState(false));
		dispatch(referencesActions.setIdReferenceMessageEdit(''));
	};

	const onSend = (e: React.KeyboardEvent<Element>) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			e.stopPropagation();
			if (editMessage?.trim() === '') {
				if (editMessage?.length === 0) {
					setDeleteMessage(true);
				}
				setEditMessage(message.content.t);
				handleCancelEdit();
				return;
			}
			if (content) {
				handleSend(content, message.id);
				setNewMessage(content);
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
		if (content) {
			handleSend(content, message.id);
			setNewMessage(content);
			handleCancelEdit();
		}
	};

	const handleSend = useCallback(
		(editMessage: string, messageId: string) => {
			const content = editMessage.trim();
			EditSendMessage(content, messageId);
			setEditMessage(content);
		},
		[EditSendMessage],
	);

	const textareaRef = useRef<any>(null);
	useEffect(() => {
		if (openEditMessageState && mess.id === idMessageRefEdit) {
			textareaRef.current?.focus();
		}
	}, [openEditMessageState, mess, idMessageRefEdit]);
	const handleFocus = () => {
		if (textareaRef.current) {
			const length = textareaRef.current.value.length;
			textareaRef.current.setSelectionRange(length, length);
		}
	};

	const { emojis } = useEmojiSuggestion();
	const queryEmojis = (query: string, callback: (data: EmojiData[]) => void) => {
		if (query.length === 0) return;
		const matches = emojis
			.filter((emoji) => emoji.shortname && emoji.shortname.indexOf(query.toLowerCase()) > -1)
			.slice(0, 20)
			.map((emojiDisplay) => ({ id: emojiDisplay?.emoji, emoji: emojiDisplay?.emoji, display: emojiDisplay?.shortname }));
		callback(matches);
	};

	const mentionList = UserMentionList(channelId);
	const { listChannels } = useChannels();
	const listChannelsMention = listChannels.map((item) => {
		return {
			id: item?.channel_id ?? '',
			display: item?.channel_label ?? '',
			subText: item?.category_name ?? '',
		};
	}) as ChannelsMentionProps[];

	useEscapeKey(handleCancelEdit);

	const { appearanceTheme } = useApp();

	return (
		<>
			<div className="fullBoxText relative group">
				<MessageWithUser
					message={mess as IMessageWithUser}
					preMessage={messPre as IMessageWithUser}
					user={user}
					mode={mode}
					newMessage={newMessage}
					child={
						<>
							<PopupMessage
								reactionRightState={reactionRightState}
								mess={mess as IMessageWithUser}
								reactionBottomState={reactionBottomState}
								openEditMessageState={openEditMessageState}
								openOptionMessageState={openOptionMessageState}
								mode={mode}
								deleteSendMessage={DeleteSendMessage}
							/>
							{openEditMessageState && mess.id === idMessageRefEdit && (
								<div className="inputEdit relative top-[-25px]">
									<MentionsInput
										onFocus={handleFocus}
										inputRef={textareaRef}
										value={editMessage}
										className={`w-[83%] dark:bg-black bg-white rounded p-[10px] dark:text-white text-black customScrollLightMode ${appearanceTheme === 'light' && 'lightModeScrollBarMention'}`}
										onKeyDown={onSend}
										onChange={(e, newValue) => {
											setEditMessage(newValue);
										}}
										rows={editMessage?.split('\n').length}
										forceSuggestionsAboveCursor={true}
										style={appearanceTheme === 'light' ? lightMentionsInputStyle : darkMentionsInputStyle}
									>
										<Mention
											appendSpaceOnAdd={true}
											data={mentionList ?? []}
											trigger="@"
											displayTransform={(id: any, display: any) => {
												return `@${display}`;
											}}
											renderSuggestion={(suggestion) => (
												<SuggestItem name={suggestion.display ?? ''} avatarUrl={(suggestion as any).avatarUrl} subText="" />
											)}
											className="dark:bg-[#3B416B] bg-bgLightModeButton"
											style={mentionStyle}
										/>
										<Mention
											markup="#[__display__](__id__)"
											appendSpaceOnAdd={true}
											data={listChannelsMention ?? []}
											trigger="#"
											displayTransform={(id: any, display: any) => {
												return `#${display}`;
											}}
											style={mentionStyle}
											renderSuggestion={(suggestion) => (
												<SuggestItem
													name={suggestion.display ?? ''}
													symbol="#"
													subText={(suggestion as ChannelsMentionProps).subText}
												/>
											)}
											className="dark:bg-[#3B416B] bg-bgLightModeButton"
										/>
										<Mention
											trigger=":"
											markup="__id__"
											regex={neverMatchingRegex}
											data={queryEmojis}
											renderSuggestion={(suggestion) => (
												<SuggestItem name={suggestion.display ?? ''} symbol={(suggestion as EmojiData).emoji} />
											)}
											className="dark:bg-[#3B416B] bg-bgLightModeButton"
										/>
									</MentionsInput>
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
						</>
					}
				/>
				{lastSeen && <UnreadMessageBreak />}
				{deleteMessage && <ModalDeleteMess mode={mode} closeModal={() => setDeleteMessage(false)} mess={message} />}
			</div>
			<MessageReaction currentChannelId={channelId || ''} message={message} mode={mode} />
		</>
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
	reactionBottomState,
	openEditMessageState,
	openOptionMessageState,
	mode,
	isCombine,
	deleteSendMessage,
}: PopupMessageProps) {
	const currentChannel = useSelector(selectCurrentChannel);
	const { idMessageRefOpt } = useReference();
	const { reactionPlaceActive } = useChatReaction();
	const channelMessageOptRef = useRef<HTMLDivElement>(null);
	const [pickerPosition, setPickerPosition] = useState({ top: 0, left: 0, bottom: 0 });
	const getDivHeightToTop = () => {
		const channelMessageDiv = channelMessageOptRef.current;
		if (channelMessageDiv) {
			const rect = channelMessageDiv.getBoundingClientRect();
			setPickerPosition({ top: rect.top, left: rect.left, bottom: rect.bottom });
		}
		return 0;
	};

	useEffect(() => {
		if (reactionRightState && idMessageRefOpt === mess.id) {
			getDivHeightToTop();
		}
	}, [reactionRightState]);

	return (
		<>
			{reactionPlaceActive !== EmojiPlaces.EMOJI_REACTION_BOTTOM && (
				<div
					className={`chooseForText z-[1] absolute h-8 p-0.5 rounded block -top-4 right-5 ${Number(currentChannel?.parrent_id) === 0 ? 'w-32' : 'w-24'}
				${
					(reactionRightState && mess.id === idMessageRefOpt) ||
					(reactionBottomState && mess.id === idMessageRefOpt) ||
					(openEditMessageState && mess.id === idMessageRefOpt) ||
					(openOptionMessageState && mess.id === idMessageRefOpt)
						? ''
						: 'hidden group-hover:block'
				} `}
				>
					<div className="relative">
						<ChannelMessageOpt message={mess} ref={channelMessageOptRef} />
					</div>

					{openOptionMessageState && mess.id === idMessageRefOpt && <PopupOption message={mess} deleteSendMessage={deleteSendMessage} />}
				</div>
			)}
		</>
	);
}

function PopupOption({ message, deleteSendMessage }: PopupOptionProps) {
	const dispatch = useAppDispatch();
	const { userId } = useChatReaction();
	const listPinMessages = useSelector(selectPinMessageByChannelId(message.channel_id));
	const messageExists = listPinMessages.some((pinMessage) => pinMessage.message_id === message.id);
	const handleClickEdit = (event: React.MouseEvent<HTMLLIElement>) => {
		dispatch(referencesActions.setOpenReplyMessageState(false));
		dispatch(referencesActions.setOpenEditMessageState(true));
		dispatch(messagesActions.setOpenOptionMessageState(false));
		dispatch(referencesActions.setIdReferenceMessageEdit(message.id));
		event.stopPropagation();
	};

	const handleClickReply = (event: React.MouseEvent<HTMLLIElement>) => {
		dispatch(referencesActions.setIdReferenceMessageReply(message.id));
		dispatch(referencesActions.setOpenReplyMessageState(true));
		dispatch(referencesActions.setOpenEditMessageState(false));
		dispatch(messagesActions.setOpenOptionMessageState(false));
		dispatch(referencesActions.setIdReferenceMessageReply(message.id));
		event.stopPropagation();
	};

	const handleClickCopy = () => {
		dispatch(referencesActions.setOpenEditMessageState(false));
		dispatch(messagesActions.setOpenOptionMessageState(false));
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

	const handlePinMessage = () => {
		dispatch(pinMessageActions.setChannelPinMessage({ channel_id: message.channel_id, message_id: message.id }));
	};
	const handleUnPinMessage = () => {
		dispatch(pinMessageActions.deleteChannelPinMessage({ channel_id: message.channel_id, message_id: message.id }));
	};
	const checkUser = userId === message.sender_id;
	return (
		<div
			className={`dark:bg-[#151515] bg-bgLightMode rounded-[10px] p-2 absolute right-8 w-[180px] z-10 ${checkUser ? '-top-[150px]' : 'top-[-66px]'}`}
		>
			<ul className="flex flex-col gap-1">
				{checkUser && (
					<li
						className="p-2 dark:hover:bg-black hover:bg-bgLightModeThird dark:text-textDarkTheme text-textLightTheme rounded-lg text-[15px] cursor-pointer"
						onClick={handleClickEdit}
						role="button"
						aria-hidden
					>
						Edit Message
					</li>
				)}
				<li
					className="p-2 dark:hover:bg-black hover:bg-bgLightModeThird dark:text-textDarkTheme text-textLightTheme rounded-lg text-[15px] cursor-pointer"
					onClick={handleClickReply}
					role="button"
					aria-hidden
				>
					Reply
				</li>
				<li
					className="p-2 dark:hover:bg-black hover:bg-bgLightModeThird dark:text-textDarkTheme text-textLightTheme rounded-lg text-[15px] cursor-pointer"
					onClick={() => {
						handleClickForward();
					}}
					role="button"
					aria-hidden
				>
					Forward message
				</li>
				{messageExists ? (
					<li
						className="p-2 dark:hover:bg-black hover:bg-bgLightModeThird dark:text-textDarkTheme text-textLightTheme rounded-lg text-[15px] cursor-pointer"
						onClick={() => {
							handleUnPinMessage();
						}}
						role="button"
						aria-hidden
					>
						Unpin message
					</li>
				) : (
					<li
						className="p-2 dark:hover:bg-black hover:bg-bgLightModeThird dark:text-textDarkTheme text-textLightTheme rounded-lg text-[15px] cursor-pointer"
						onClick={() => {
							handlePinMessage();
						}}
						role="button"
						aria-hidden
					>
						Pin message
					</li>
				)}
				<CopyToClipboard text={message.content.t || ''}>
					<li
						className="p-2 dark:hover:bg-black hover:bg-bgLightModeThird dark:text-textDarkTheme text-textLightTheme rounded-lg text-[15px] cursor-pointer"
						onClick={handleClickCopy}
						role="button"
						aria-hidden
					>
						Copy Text
					</li>
				</CopyToClipboard>

				{checkUser && (
					<li
						className="p-2 dark:hover:bg-black hover:bg-bgLightModeThird rounded-lg text-[15px] cursor-pointer text-[#ff0000]"
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
