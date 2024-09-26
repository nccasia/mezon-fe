import { useMemo, useState } from 'react';

import { useAppParams, useAuth, useClanRestriction, useReference, useThreads } from '@mezon/core';
import {
	MessagesEntity,
	directActions,
	gifsStickerEmojiActions,
	giveCoffeeActions,
	messagesActions,
	pinMessageActions,
	reactionActions,
	referencesActions,
	selectAllDirectMessages,
	selectChannelById,
	selectCurrentChannel,
	selectCurrentClanId,
	selectDmGroupCurrent,
	selectDmGroupCurrentId,
	selectIsMessageHasReaction,
	selectMessageByMessageId,
	selectMessageEntitiesByChannelId,
	selectModeResponsive,
	selectPinMessageByChannelId,
	selectTheme,
	setIsForwardAll,
	setSelectedMessage,
	threadsActions,
	toggleIsShowPopupForwardTrue,
	useAppDispatch,
	useAppSelector
} from '@mezon/store';
import { Icons } from '@mezon/ui';
import {
	ContextMenuItem,
	EPermission,
	MenuBuilder,
	ModeResponsive,
	SHOW_POSITION,
	SubPanelName,
	handleCopyImage,
	handleCopyLink,
	handleOpenLink,
	handleSaveImage
} from '@mezon/utils';
import { ChannelStreamMode, ChannelType } from 'mezon-js';
import 'react-contexify/ReactContexify.css';
import { useSelector } from 'react-redux';
import ModalDeleteMess from '../DeleteMessageModal/ModalDeleteMess';
import { ModalAddPinMess } from '../PinMessModal';
import DynamicContextMenu from './DynamicContextMenu';
import { useMessageContextMenu } from './MessageContextMenuContext';

type MessageContextMenuProps = {
	id: string;
	messageId: string;
	elementTarget?: boolean | HTMLElement | null;
	activeMode: number | undefined;
};

function MessageContextMenu({ id, elementTarget, messageId, activeMode }: MessageContextMenuProps) {
	const { setOpenThreadMessageState } = useReference();
	const dmGroupChatList = useSelector(selectAllDirectMessages);
	const currentChannel = useSelector(selectCurrentChannel);
	const parrent = useSelector(selectChannelById(currentChannel?.parrent_id ?? ''));
	const currentClanId = useSelector(selectCurrentClanId);
	const listPinMessages = useSelector(selectPinMessageByChannelId(currentChannel?.id));
	const message = useSelector(selectMessageByMessageId(messageId));
	const currentDmId = useSelector(selectDmGroupCurrentId);
	const currentDm = useSelector(selectDmGroupCurrent(currentDmId || ''));
	const modeResponsive = useSelector(selectModeResponsive);
	const allMessagesEntities = useAppSelector((state) =>
		selectMessageEntitiesByChannelId(state, (modeResponsive === ModeResponsive.MODE_CLAN ? currentChannel?.channel_id : currentDm?.id) || '')
	);
	const currentMessage = useAppSelector(selectMessageByMessageId(messageId));
	const convertedAllMessagesEntities = allMessagesEntities ? Object.values(allMessagesEntities) : [];
	const messagePosition = convertedAllMessagesEntities.findIndex((message: MessagesEntity) => message.id === messageId);
	const dispatch = useAppDispatch();
	const { userId } = useAuth();
	const { posShowMenu, imageSrc } = useMessageContextMenu();
	const [checkAdmintrator, { isClanOwner, isOwnerGroupDM }] = useClanRestriction([EPermission.administrator]);
	const checkSenderMessage = useMemo(() => {
		return message?.sender_id === userId;
	}, [message?.sender_id, userId]);
	const mode = useMemo(() => {
		if (modeResponsive === ModeResponsive.MODE_CLAN) {
			return ChannelStreamMode.STREAM_MODE_CHANNEL;
		}

		if (currentDm?.type === ChannelType.CHANNEL_TYPE_DM) {
			return ChannelStreamMode.STREAM_MODE_DM;
		}

		return ChannelStreamMode.STREAM_MODE_GROUP;
	}, [modeResponsive, currentDm?.type]);

	const checkMessageHasText = useMemo(() => {
		return message?.content.t !== '';
	}, [message?.content.t]);

	const checkMessageInPinnedList = listPinMessages.some((pinMessage) => pinMessage.message_id === messageId);
	const [pinMessage] = useClanRestriction([EPermission.manageChannel]);
	const [delMessage] = useClanRestriction([EPermission.manageChannel]);
	const [removeReaction] = useClanRestriction([EPermission.manageChannel]);
	const [canViewChannelAndSendMessage] = useClanRestriction([EPermission.viewChannel, EPermission.sendMessage]);
	const { type } = useAppParams();

	const [createThread] = useClanRestriction([EPermission.manageChannel]);
	const [isAllowDelMessage] = useClanRestriction([EPermission.deleteMessage]);
	const [isAllowCreateThread] = useClanRestriction([EPermission.manageThread]);
	const [enableCopyLinkItem, setEnableCopyLinkItem] = useState<boolean>(false);
	const [enableOpenLinkItem, setEnableOpenLinkItem] = useState<boolean>(false);
	const [enableCopyImageItem, setEnableCopyImageItem] = useState<boolean>(false);
	const [enableSaveImageItem, setEnableSaveImageItem] = useState<boolean>(false);
	const [isOPenDeleteMessageModal, setIsOPenDeleteMessageModal] = useState<boolean>(false);
	const appearanceTheme = useSelector(selectTheme);

	const isShowForwardAll = () => {
		if (messagePosition === -1) return false;
		return (
			message.isStartedMessageGroup &&
			messagePosition < convertedAllMessagesEntities.length - 1 &&
			!convertedAllMessagesEntities[messagePosition + 1].isStartedMessageGroup
		);
	};

	const handleReplyMessage = () => {
		dispatch(
			referencesActions.setDataReferences({
				channelId: message.channel_id,
				dataReferences: {
					message_ref_id: message.id,
					ref_type: 0,
					message_sender_id: message.sender_id,
					content: JSON.stringify(message.content),
					message_sender_username: message.username,
					mesages_sender_avatar: message.clan_avatar ? message.clan_avatar : message.avatar,
					message_sender_clan_nick: message.clan_nick,
					message_sender_display_name: message.display_name,
					has_attachment: (message.attachments && message.attachments?.length > 0) ?? false,
					channel_id: message.channel_id ?? '',
					mode: message.mode ?? 0,
					channel_label: message.channel_label
				}
			})
		);
		dispatch(messagesActions.setIdMessageToJump(''));
		dispatch(gifsStickerEmojiActions.setSubPanelActive(SubPanelName.NONE));
	};

	const handleEditMessage = () => {
		dispatch(reactionActions.setReactionRightState(false));
		dispatch(referencesActions.setOpenEditMessageState(true));
		dispatch(referencesActions.setIdReferenceMessageEdit(message.id));
		dispatch(
			messagesActions.setChannelDraftMessage({
				channelId: message.channel_id,
				channelDraftMessage: {
					message_id: message.id,
					draftContent: message.content,
					draftMention: message.mentions ?? [],
					draftAttachment: message.attachments ?? []
				}
			})
		);
		dispatch(messagesActions.setIdMessageToJump(''));
	};

	const handleForwardMessage = () => {
		if (dmGroupChatList.length === 0) {
			dispatch(directActions.fetchDirectMessage({}));
		}
		dispatch(toggleIsShowPopupForwardTrue());
		dispatch(setSelectedMessage(message));
		dispatch(setIsForwardAll(false));
	};

	const handleForwardAllMessage = () => {
		if (dmGroupChatList.length === 0) {
			dispatch(directActions.fetchDirectMessage({}));
		}
		dispatch(toggleIsShowPopupForwardTrue());
		dispatch(setSelectedMessage(message));
		dispatch(setIsForwardAll(true));
	};

	const [openModalAddPin, setOpenModalAddPin] = useState(false);
	const handlePinMessage = async () => {
		dispatch(pinMessageActions.setChannelPinMessage({ channel_id: message?.channel_id, message_id: message?.id }));
		dispatch(
			pinMessageActions.joinPinMessage({
				clanId: activeMode !== ChannelStreamMode.STREAM_MODE_CHANNEL ? '' : (currentClanId ?? ''),
				parentId: currentChannel?.parrent_id ?? '',
				channelId: activeMode !== ChannelStreamMode.STREAM_MODE_CHANNEL ? currentDmId || '' : (currentChannel?.channel_id ?? ''),
				messageId: message?.id,
				isPublic: activeMode !== ChannelStreamMode.STREAM_MODE_CHANNEL ? false : currentChannel ? !currentChannel.channel_private : false,
				isParentPublic: parrent ? !parrent.channel_private : false,
				mode: activeMode as number
			})
		);
	};

	const handleUnPinMessage = () => {
		dispatch(pinMessageActions.deleteChannelPinMessage({ channel_id: message?.channel_id, message_id: message?.id }));
	};

	const { setIsShowCreateThread, setValueThread } = useThreads();

	const handleCreateThread = () => {
		setIsShowCreateThread(true);
		setOpenThreadMessageState(true);
		dispatch(threadsActions.setOpenThreadMessageState(true));
		setValueThread(message);
	};

	const checkPos = useMemo(() => {
		if (posShowMenu === SHOW_POSITION.NONE || posShowMenu === SHOW_POSITION.IN_STICKER || posShowMenu === SHOW_POSITION.IN_EMOJI) {
			return true;
		}
		{
			return false;
		}
	}, [posShowMenu]);

	const isClickedSticker = useMemo(() => {
		return posShowMenu === SHOW_POSITION.IN_STICKER;
	}, [posShowMenu]);

	const isClickedEmoji = useMemo(() => {
		return posShowMenu === SHOW_POSITION.IN_EMOJI;
	}, [posShowMenu]);

	const reactionStatus = useSelector(selectIsMessageHasReaction(messageId));
	const enableViewReactionItem = useMemo(() => {
		if (!checkPos) return false;
		return reactionStatus;
	}, [reactionStatus, checkPos]);

	const [enableEditMessageItem, enableReportMessageItem] = useMemo(() => {
		if (!checkPos) return [false, false];
		const enableEdit = checkSenderMessage;
		const enableReport = !checkSenderMessage;

		return [enableEdit, enableReport];
	}, [checkSenderMessage, checkPos]);

	const pinMessageStatus = useMemo(() => {
		if (!checkPos) return undefined;

		if (!checkMessageInPinnedList) {
			if (pinMessage || isClanOwner || checkAdmintrator) {
				return true;
			}
		} else if (checkMessageInPinnedList) {
			if (pinMessage || isClanOwner || checkAdmintrator) {
				return false;
			}
		} else {
			return undefined;
		}
	}, [pinMessage, isClanOwner, checkAdmintrator, checkMessageInPinnedList, message, checkPos]);

	const enableSpeakMessageItem = useMemo(() => {
		if (!checkPos) return false;
		return checkMessageHasText;
	}, [checkMessageHasText, checkPos]);

	const [enableRemoveOneReactionItem, enableRemoveAllReactionsItem] = useMemo(() => {
		if (!checkPos) return [false, false];
		const enableOne = (isClanOwner || checkAdmintrator || removeReaction) && enableViewReactionItem;
		const enableAll = (isClanOwner || checkAdmintrator || removeReaction) && enableViewReactionItem;
		return [enableOne, enableAll];
	}, [isClanOwner, checkAdmintrator, enableViewReactionItem, removeReaction]);

	const enableCreateThreadItem = useMemo(() => {
		if (!checkPos) return false;
		if (activeMode === ChannelStreamMode.STREAM_MODE_DM || activeMode === ChannelStreamMode.STREAM_MODE_GROUP) {
			return false;
		} else {
			return createThread || isAllowCreateThread || isClanOwner || checkAdmintrator;
		}
	}, [createThread, isAllowCreateThread, isClanOwner, checkAdmintrator, activeMode, checkPos]);

	const enableDelMessageItem = useMemo(() => {
		if (!checkPos) return false;
		if (Number(type) === ChannelType.CHANNEL_TYPE_GROUP) {
			return checkSenderMessage || isOwnerGroupDM;
		}
		if (activeMode === ChannelStreamMode.STREAM_MODE_CHANNEL) {
			return delMessage || isAllowDelMessage || checkSenderMessage || isClanOwner || checkAdmintrator;
		}
		return checkSenderMessage;
	}, [delMessage, isAllowDelMessage, checkSenderMessage, isClanOwner, checkAdmintrator, checkPos, isOwnerGroupDM]);

	const checkElementIsImage = elementTarget instanceof HTMLImageElement;

	const urlImage = useMemo(() => {
		if (imageSrc) {
			return imageSrc;
		} else return '';
	}, [checkElementIsImage, elementTarget, imageSrc]);

	useMemo(() => {
		if (isClickedEmoji) {
			setEnableCopyLinkItem(true);
			setEnableOpenLinkItem(true);
			setEnableCopyImageItem(false);
			setEnableSaveImageItem(false);
			return;
		}
		if (isClickedSticker) {
			setEnableCopyLinkItem(false);
			setEnableOpenLinkItem(false);
			setEnableCopyImageItem(false);
			setEnableSaveImageItem(false);
			return;
		}
		if (checkElementIsImage) {
			setEnableCopyLinkItem(true);
			setEnableOpenLinkItem(true);
			setEnableCopyImageItem(true);
			setEnableSaveImageItem(true);
			return;
		} else {
			setEnableCopyLinkItem(false);
			setEnableOpenLinkItem(false);
			setEnableCopyImageItem(false);
			setEnableSaveImageItem(false);
		}
	}, [checkElementIsImage, elementTarget, isClickedSticker]);

	const items = useMemo<ContextMenuItem[]>(() => {
		const builder = new MenuBuilder();

		builder.when(checkPos, (builder) => {
			builder.addMenuItem(
				'addReaction', // id
				'Add Reaction', // lable
				() => console.log('add reaction'),
				<Icons.RightArrowRightClick />
			);
		});

		builder.when(checkPos, (builder) => {
			builder.addMenuItem(
				'giveAcoffee', // id
				'Give A Coffee', // lable

				async () => {
					try {
						if (userId !== message.sender_id) {
							dispatch(
								giveCoffeeActions.updateGiveCoffee({
									channel_id: message.channel_id,
									clan_id: message.clan_id,
									message_ref_id: message.id,
									receiver_id: message.sender_id,
									sender_id: userId,
									token_count: 1
								})
							);
						}
					} catch (error) {
						console.error('Failed to give cofffee message', error);
					}
				},
				<Icons.DollarIcon className="w-5 h-5" fill={`${appearanceTheme === 'dark' ? '#B5BAC1' : '#060607'}`} />
			);
		});

		builder.when(enableViewReactionItem, (builder) => {
			builder.addMenuItem(
				'viewReaction',
				'View Reaction',
				() => console.log('view reaction'),
				<Icons.ViewReactionRightClick defaultSize="w-4 h-4" />
			);
		});

		builder.when(enableEditMessageItem, (builder) => {
			builder.addMenuItem(
				'editMessage',
				'Edit Message',
				async () => {
					try {
						await handleEditMessage();
					} catch (error) {
						console.error('Failed to edit message', error);
					}
				},

				<Icons.EditMessageRightClick defaultSize="w-4 h-4" />
			);
		});

		builder.when(pinMessageStatus === true, (builder) => {
			builder.addMenuItem('pinMessage', 'Pin Message', () => setOpenModalAddPin(true), <Icons.PinMessageRightClick defaultSize="w-4 h-4" />);
		});
		builder.when(pinMessageStatus === false, (builder) => {
			builder.addMenuItem('unPinMessage', 'Unpin Message', () => handleUnPinMessage(), <Icons.PinMessageRightClick defaultSize="w-4 h-4" />);
		});

		builder.when(checkPos && !canViewChannelAndSendMessage, (builder) => {
			builder.addMenuItem(
				'reply',
				'Reply',
				() => handleReplyMessage(),

				<Icons.ReplyRightClick defaultSize="w-4 h-4" />
			);
		});

		builder.when(enableCreateThreadItem, (builder) => {
			builder.addMenuItem('createThread', 'Create Thread', () => handleCreateThread(), <Icons.ThreadIconRightClick defaultSize="w-4 h-4" />);
		});

		builder.when(checkPos, (builder) => {
			builder.addMenuItem(
				'copyText',
				'Copy Text',
				async () => {
					try {
						await handleCopyLink(message?.content?.t ?? '');
					} catch (error) {
						console.error('Failed to copy text', error);
					}
				},
				<Icons.CopyTextRightClick />
			);
		});

		builder.when(checkPos, (builder) => {
			builder.addMenuItem('apps', 'Apps', () => console.log('apps'), <Icons.RightArrowRightClick defaultSize="w-4 h-4" />);
		});

		builder.when(checkPos, (builder) => {
			builder.addMenuItem('markUnread', 'Mark Unread', () => console.log('markUnread'), <Icons.UnreadRightClick defaultSize="w-4 h-4" />);
		});

		builder.when(checkPos, (builder) => {
			builder.addMenuItem(
				'copyMessageLink',
				'Copy Message Link',
				() => console.log('copyMessageLink'),
				<Icons.CopyMessageLinkRightClick defaultSize="w-4 h-4" />
			);
		});

		builder.when(checkPos, (builder) => {
			builder.addMenuItem('forwardMessage', 'Forward Message', () => handleForwardMessage(), <Icons.ForwardRightClick defaultSize="w-4 h-4" />);
		});

		{
			isShowForwardAll() &&
				builder.when(checkPos, (builder) => {
					builder.addMenuItem(
						'forwardAll',
						'Forward All Message',
						() => handleForwardAllMessage(),
						<Icons.ForwardRightClick defaultSize="w-4 h-4" />
					);
				});
		}

		builder.when(enableSpeakMessageItem, (builder) => {
			builder.addMenuItem(
				'speakMessage',
				'Speak Message',
				() => {
					console.log('speak Message');
				},
				<Icons.SpeakMessageRightClick defaultSize="w-4 h-4" />
			);
		});

		builder.when(enableRemoveOneReactionItem, (builder) => {
			builder.addMenuItem(
				'removeReactions',
				'Remove Reactions',
				() => {
					console.log('remove reaction');
				},
				<Icons.RightArrowRightClick defaultSize="w-4 h-4" />
			);
		});
		builder.when(enableRemoveAllReactionsItem, (builder) => {
			builder.addMenuItem('removeAllReactions', 'Remove All Reactions', () => {
				console.log('remove all reaction');
			});
		});

		builder.when(enableDelMessageItem, (builder) => {
			builder.addMenuItem(
				'deleteMessage',
				'Delete Message',
				() => setIsOPenDeleteMessageModal(true),
				<Icons.DeleteMessageRightClick defaultSize="w-4 h-4" />
			);
		});

		builder.when(enableReportMessageItem, (builder) => {
			builder.addMenuItem(
				'reportMessage',
				'Report Message',
				() => {
					console.log('report message');
				},
				<Icons.ReportMessageRightClick defaultSize="w-4 h-4" />
			);
		});

		builder.when(enableCopyLinkItem, (builder) => {
			builder.addMenuItem('copyLink', 'Copy Link', async () => {
				try {
					await handleCopyLink(urlImage);
				} catch (error) {
					console.error('Failed to copy link:', error);
				}
			});
		});

		builder.when(enableOpenLinkItem, (builder) => {
			builder.addMenuItem('openLink', 'Open Link', async () => {
				try {
					await handleOpenLink(urlImage);
				} catch (error) {
					console.error('Failed to copy image:', error);
				}
			});
		});

		builder.when(enableCopyImageItem, (builder) => {
			builder.addMenuItem('copyImage', 'Copy Image', async () => {
				try {
					await handleCopyImage(urlImage);
				} catch (error) {
					console.error('Failed to copy image:', error);
				}
			});
		});

		builder.when(enableSaveImageItem, (builder) => {
			builder.addMenuItem('saveImage', 'Save Image', async () => {
				try {
					await handleSaveImage(urlImage);
				} catch (error) {
					console.error('Failed to save image:', error);
				}
			});
		});

		return builder.build();
	}, [
		dispatch,
		messageId,
		message,
		enableViewReactionItem,
		enableEditMessageItem,
		enableCreateThreadItem,
		enableSpeakMessageItem,
		enableRemoveOneReactionItem,
		enableRemoveAllReactionsItem,
		enableDelMessageItem,
		enableReportMessageItem,
		enableCopyLinkItem,
		enableOpenLinkItem,
		enableCopyImageItem,
		enableSaveImageItem,
		pinMessageStatus,
		checkPos,
		urlImage,
		posShowMenu
	]);

	return (
		<>
			<DynamicContextMenu menuId={id} items={items} messageId={messageId} mode={activeMode} />
			{openModalAddPin && (
				<ModalAddPinMess
					mess={message}
					closeModal={() => setOpenModalAddPin(false)}
					handlePinMessage={handlePinMessage}
					mode={activeMode || 0}
					channelLabel={currentChannel?.channel_label || ''}
				/>
			)}
			{isOPenDeleteMessageModal && (
				<ModalDeleteMess
					mess={currentMessage}
					closeModal={() => {
						setIsOPenDeleteMessageModal(false);
					}}
					mode={mode}
				/>
			)}
		</>
	);
}

export default MessageContextMenu;
