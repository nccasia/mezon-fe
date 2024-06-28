import {
	useChannelMembers,
	useChannels,
	useChatMessages,
	useClickUpToEdit,
	useEmojiSuggestion,
	useGifsStickersEmoji,
	useMessageValue,
	useReference,
	useThreads,
} from '@mezon/core';
import {
	ChannelsEntity,
	channelUsersActions,
	messagesActions,
	reactionActions,
	referencesActions,
	selectAllUsesClan,
	selectAttachmentData,
	selectCloseMenu,
	selectCurrentChannel,
	selectCurrentChannelId,
	selectDataReferences,
	selectIdMessageRefReply,
	selectIsFocused,
	selectMessageByMessageId,
	selectOpenEditMessageState,
	selectOpenReplyMessageState,
	selectOpenThreadMessageState,
	selectReactionRightState,
	selectStatusMenu,
	selectTheme,
	threadsActions,
	useAppDispatch,
} from '@mezon/store';
import {
	ChannelMembersEntity,
	EmojiPlaces,
	ILineMention,
	IMessageSendPayload,
	MIN_THRESHOLD_CHARS,
	MentionDataProps,
	RightClickPos,
	SubPanelName,
	ThreadValue,
	UserMentionsOpt,
	UsersClanEntity,
	focusToElement,
	regexToDetectGifLink,
	searchMentionsHashtag,
	threadError,
	uniqueUsers,
} from '@mezon/utils';
import { ApiMessageAttachment, ApiMessageMention, ApiMessageRef } from 'mezon-js/api.gen';
import { KeyboardEvent, ReactElement, useCallback, useEffect, useRef, useState } from 'react';
import { Mention, MentionsInput, OnChangeHandlerFunc } from 'react-mentions';
import { useSelector } from 'react-redux';
import textFieldEdit from 'text-field-edit';
import { Icons, ThreadNameTextField } from '../../../components';
import PrivateThread from '../../ChannelTopbar/TopBarComponents/Threads/CreateThread/PrivateThread';
import { useMessageLine } from '../../MessageWithUser/useMessageLine';
import ChannelMessageThread from './ChannelMessageThread';
import lightMentionsInputStyle from './LightRmentionInputStyle';
import darkMentionsInputStyle from './RmentionInputStyle';
import mentionStyle from './RmentionStyle';
import SuggestItem from './SuggestItem';

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

export type MentionReactInputProps = {
	readonly onSend: (
		content: IMessageSendPayload,
		mentions?: Array<ApiMessageMention>,
		attachments?: Array<ApiMessageAttachment>,
		references?: Array<ApiMessageRef>,
		value?: ThreadValue,
		anonymousMessage?: boolean,
		mentionEveryone?: boolean,
	) => void;
	readonly onTyping?: () => void;
	readonly listMentions?: MentionDataProps[] | undefined;
	readonly isThread?: boolean;
	readonly handlePaste?: any;
	readonly handleConvertToFile?: (valueContent: string) => void | undefined;
	readonly currentClanId?: string;
	readonly currentChannelId?: string;
};

const neverMatchingRegex = /($a)/;

function MentionReactInput(props: MentionReactInputProps): ReactElement {
	const { listChannels } = useChannels();
	const currentChannelId = useSelector(selectCurrentChannelId);
	const dispatch = useAppDispatch();
	const { setDataReferences, setOpenThreadMessageState, setAttachmentData } = useReference();
	const dataReferences = useSelector(selectDataReferences);
	const openThreadMessageState = useSelector(selectOpenThreadMessageState);
	const idMessageRefReply = useSelector(selectIdMessageRefReply);
	const { setSubPanelActive } = useGifsStickersEmoji();

	const getRefMessageReply = useSelector(selectMessageByMessageId(idMessageRefReply));
	const [mentionData, setMentionData] = useState<ApiMessageMention[]>([]);
	const [mentionEveryone, setMentionEveryone] = useState(false);
	const { members } = useChannelMembers({ channelId: currentChannelId });
	const attachmentDataRef = useSelector(selectAttachmentData);
	const [content, setContent] = useState('');
	const { threadCurrentChannel, messageThreadError, isPrivate, nameValueThread, valueThread } = useThreads();
	const currentChannel = useSelector(selectCurrentChannel);
	const { mentions } = useMessageLine(content);
	const usersClan = useSelector(selectAllUsesClan);
	const { rawMembers } = useChannelMembers({ channelId: currentChannel?.channel_id as string });
	const { emojiListPNG } = useEmojiSuggestion();
	const { lastMessageByUserId } = useChatMessages({ channelId: currentChannel?.channel_id as string });
	const { emojiPicked, addEmojiState } = useEmojiSuggestion();
	const reactionRightState = useSelector(selectReactionRightState);
	const isFocused = useSelector(selectIsFocused);

	const { valueTextInput, setValueTextInput } = useMessageValue(
		props.isThread ? currentChannelId + String(props.isThread) : (currentChannelId as string),
	);
	const [valueHighlight, setValueHightlight] = useState<string>('');
	const queryEmojis = (query: string, callback: (data: any[]) => void) => {
		if (query.length === 0) return;
		const matches = emojiListPNG
			.filter((emoji) => emoji.shortname && emoji.shortname.indexOf(query.toLowerCase()) > -1)
			.slice(0, 20)
			.map((emojiDisplay) => ({ id: emojiDisplay?.shortname, display: emojiDisplay?.shortname }));
		callback(matches);
	};

	const onKeyDown = async (event: KeyboardEvent<HTMLTextAreaElement> | KeyboardEvent<HTMLInputElement>): Promise<void> => {
		const { key, ctrlKey, shiftKey } = event;
		const isEnterKey = key === 'Enter';

		if (isEnterKey && ctrlKey && shiftKey) {
			event.preventDefault();
			if (valueTextInput !== '' || openThreadMessageState) {
				if (props.currentClanId) {
					handleSend(true);
				}
				return;
			}
		}

		switch (key) {
			case 'Enter': {
				if (shiftKey) {
					return;
				} else {
					event.preventDefault();
					handleSend(false);
					return;
				}
			}
			default: {
				return;
			}
		}
	};

	const handleSend = useCallback(
		(anonymousMessage?: boolean) => {
			if ((!valueTextInput && attachmentDataRef?.length === 0) || ((valueTextInput || '').trim() === '' && attachmentDataRef?.length === 0)) {
				return;
			}
			if (
				valueTextInput &&
				typeof valueTextInput === 'string' &&
				!(valueTextInput || '').trim() &&
				attachmentDataRef?.length === 0 &&
				mentionData?.length === 0
			) {
				if (!nameValueThread?.trim() && props.isThread && !threadCurrentChannel) {
					dispatch(threadsActions.setMessageThreadError(threadError.message));
					dispatch(threadsActions.setNameThreadError(threadError.name));
					return;
				}
				if (props.isThread && !threadCurrentChannel) {
					dispatch(threadsActions.setMessageThreadError(threadError.message));
				}
				return;
			}

			if (!nameValueThread?.trim() && props.isThread && !threadCurrentChannel && !openThreadMessageState) {
				dispatch(threadsActions.setNameThreadError(threadError.name));
				return;
			}

			if (getRefMessageReply !== null && dataReferences && dataReferences.length > 0 && openReplyMessageState) {
				props.onSend(
					{ t: content },
					mentionData,
					attachmentDataRef,
					dataReferences,
					{ nameValueThread: nameValueThread, isPrivate },
					anonymousMessage,
					mentionEveryone,
				);
				addMemberToChannel(currentChannel, mentions, usersClan, rawMembers);
				setValueTextInput('', props.isThread);
				setAttachmentData([]);
				dispatch(referencesActions.setIdReferenceMessageReply(''));
				dispatch(referencesActions.setOpenReplyMessageState(false));
				setMentionEveryone(false);
				setDataReferences([]);
				dispatch(threadsActions.setNameValueThread({ channelId: currentChannelId as string, nameValue: '' }));
				setContent('');
				setMentionData([]);
				dispatch(threadsActions.setIsPrivate(0));
			} else {
				if (openThreadMessageState) {
					props.onSend(
						{ t: valueThread?.content.t || '', contentThread: content },
						valueThread?.mentions,
						valueThread?.attachments,
						valueThread?.references,
						{ nameValueThread: nameValueThread ?? valueThread?.content.t, isPrivate },
						anonymousMessage,
						mentionEveryone,
					);
					setOpenThreadMessageState(false);
				} else {
					props.onSend(
						{ t: content.trim() },
						mentionData,
						attachmentDataRef,
						undefined,
						{ nameValueThread: nameValueThread, isPrivate },
						anonymousMessage,
						mentionEveryone,
					);
				}
				addMemberToChannel(currentChannel, mentions, usersClan, rawMembers);
				setValueTextInput('', props.isThread);
				setMentionEveryone(false);
				setAttachmentData([]);
				dispatch(threadsActions.setNameValueThread({ channelId: currentChannelId as string, nameValue: '' }));
				setContent('');
				setMentionData([]);
				dispatch(threadsActions.setIsPrivate(0));
			}
			dispatch(referencesActions.setOpenReplyMessageState(false));
			dispatch(reactionActions.setReactionPlaceActive(EmojiPlaces.EMOJI_REACTION_NONE));
			setSubPanelActive(SubPanelName.NONE);
		},
		[
			valueTextInput,
			attachmentDataRef,
			mentionData,
			nameValueThread,
			currentChannel,
			threadCurrentChannel,
			mentions,
			isPrivate,
			content,
			getRefMessageReply,
			dataReferences,
			openThreadMessageState,
		],
	);

	const addMemberToChannel = async (
		currentChannel: ChannelsEntity | null,
		mentions: ILineMention[],
		userClans: UsersClanEntity[],
		members: ChannelMembersEntity[],
	) => {
		const userIds = uniqueUsers(mentions, userClans, members);
		const body = {
			channelId: currentChannel?.channel_id as string,
			channelType: currentChannel?.type,
			userIds: userIds,
		};
		if (userIds.length > 0) {
			await dispatch(channelUsersActions.addChannelUsers(body));
		}
	};

	const mentionedUsers: UserMentionsOpt[] = [];

	const listChannelsMention = listChannels.map((item) => {
		return {
			id: item?.channel_id ?? '',
			display: item?.channel_label ?? '',
			subText: item?.category_name ?? '',
		};
	}) as ChannelsMentionProps[];

	const onChangeMentionInput: OnChangeHandlerFunc = (event, newValue, newPlainTextValue, mentions) => {
		const mentionList =
			members[0].users?.map((item: ChannelMembersEntity) => ({
				id: item?.user?.id ?? '',
				display: item?.user?.username ?? '',
				avatarUrl: item?.user?.avatar_url ?? '',
			})) ?? [];
		const convertedMentions: UserMentionsOpt[] = mentionList
			? mentionList.map((mention) => ({
					user_id: mention.id.toString() ?? '',
					username: mention.display ?? '',
				}))
			: [];
		const linkGifDirect = newValue?.match(regexToDetectGifLink);

		if (linkGifDirect && linkGifDirect?.length > 0) {
			const newAttachmentDataRef = linkGifDirect
				.filter((item) => item !== null)
				.map((item: string) => ({
					filetype: 'image/gif',
					url: item,
				}));
			setAttachmentData(newAttachmentDataRef);
		}

		dispatch(threadsActions.setMessageThreadError(''));
		setValueTextInput(newValue, props.isThread);

		if (typeof props.onTyping === 'function') {
			props.onTyping();
		}

		const convertedHashtag = convertToPlainTextHashtag(newValue);
		setContent(convertedHashtag);

		if (mentions.length > 0) {
			if (mentions.some((mention) => mention.display === '@here')) {
				setMentionEveryone(true);
			}
			for (const mention of mentions) {
				if (mention.display.startsWith('@')) {
					mentionedUsers.push({
						user_id: mention.id.toString() ?? '',
						username: mention.display ?? '',
					});
				}
			}
			setMentionData(mentionedUsers);
		}
		if (props.handleConvertToFile !== undefined && convertedHashtag.length > MIN_THRESHOLD_CHARS) {
			props.handleConvertToFile(convertedHashtag);
			setContent('');
			setValueTextInput('');
		}
	};
	const editorRef = useRef<HTMLInputElement | null>(null);
	const openReplyMessageState = useSelector(selectOpenReplyMessageState);
	const openEditMessageState = useSelector(selectOpenEditMessageState);
	const closeMenu = useSelector(selectCloseMenu);
	const statusMenu = useSelector(selectStatusMenu);

	const handleChangeNameThread = (nameThread: string) => {
		dispatch(threadsActions.setNameValueThread({ channelId: currentChannelId as string, nameValue: nameThread }));
	};

	const convertToPlainTextHashtag = (text: string) => {
		const regex = /([@#])\[(.*?)\]\((.*?)\)/g;
		const result = text.replace(regex, (match, symbol, p1, p2) => {
			return symbol === '#' ? `<#${p2}>` : `@${p1}`;
		});
		return result;
	};

	const input = document.querySelector('#editorReactMention') as HTMLElement;
	function handleEventAfterEmojiPicked() {
		if (!emojiPicked || !input) {
			return;
		}
		textFieldEdit.insert(input, emojiPicked);
	}

	const clickUpToEditMessage = () => {
		const idRefMessage = lastMessageByUserId?.id;
		if (idRefMessage && !valueTextInput) {
			dispatch(referencesActions.setIdMessageToJump(idRefMessage));
			dispatch(referencesActions.setOpenEditMessageState(true));
			dispatch(referencesActions.setOpenReplyMessageState(false));
			dispatch(referencesActions.setIdReferenceMessageEdit(lastMessageByUserId));
			dispatch(referencesActions.setIdReferenceMessageEdit(idRefMessage));

		}
	};

	const appearanceTheme = useSelector(selectTheme);

	const handleSearchUserMention = (search: any, callback: any) => {
		setValueHightlight(search);
		callback(searchMentionsHashtag(search, props.listMentions ?? []));
	};

	const handleSearchHashtag = (search: any, callback: any) => {
		setValueHightlight(search);
		callback(searchMentionsHashtag(search, listChannelsMention ?? []));
	};

	useClickUpToEdit(editorRef, valueTextInput, clickUpToEditMessage);

	useEffect(() => {
		if (closeMenu && statusMenu) {
			return;
		}
		if ((getRefMessageReply !== null && openReplyMessageState) || !openEditMessageState || (emojiPicked !== '' && !reactionRightState)) {
			return focusToElement(editorRef);
		}
	}, [getRefMessageReply, openReplyMessageState, openEditMessageState, emojiPicked]);

	useEffect(() => {
		handleEventAfterEmojiPicked();
	}, [emojiPicked, addEmojiState]);

	useEffect(() => {
		if (getRefMessageReply && getRefMessageReply.attachments) {
			dispatch(
				referencesActions.setDataReferences([
					{
						message_id: '',
						message_ref_id: getRefMessageReply.id,
						ref_type: 0,
						message_sender_id: getRefMessageReply.sender_id,
						content: JSON.stringify(getRefMessageReply.content),
						has_attachment: getRefMessageReply.attachments?.length > 0,
					},
				]),
			);
		}
	}, [getRefMessageReply]);

	useEffect(() => {
		if (currentChannelId && valueTextInput) {
			const convertedHashtag = convertToPlainTextHashtag(valueTextInput);
			setContent(convertedHashtag);
			focusToElement(editorRef);
		}
	}, [currentChannelId, valueTextInput]);

	useEffect(() => {
		if (isFocused) {
			editorRef.current?.focus();
			dispatch(messagesActions.setIsFocused(false));
		}
	}, [dispatch, isFocused]);

	return (
		<div className="relative">
			{props.isThread && !threadCurrentChannel && (
				<div
					className={`flex flex-col overflow-y-auto h-heightMessageViewChatThread ${appearanceTheme === 'light' ? 'customScrollLightMode' : ''}`}
				>
					<div className="flex flex-col justify-end flex-grow">
						{!threadCurrentChannel && (
							<div className="relative flex items-center justify-center mx-4 w-16 h-16 dark:bg-[#26262B] bg-bgLightModeButton rounded-full pointer-events-none">
								<Icons.ThreadIcon defaultSize="w-7 h-7" />
								{isPrivate === 1 && (
									<div className="absolute right-4 bottom-4">
										<Icons.Locked />
									</div>
								)}
							</div>
						)}
						<ThreadNameTextField
							onChange={handleChangeNameThread}
							onKeyDown={onKeyDown}
							value={nameValueThread ?? ''}
							label="Thread Name"
							placeholder={openThreadMessageState && valueThread?.content.t !== '' ? valueThread?.content.t : 'Enter Thread Name'}
							className="h-10 p-[10px] dark:bg-bgTertiary bg-white dark:text-white text-colorTextLightMode text-base outline-none rounded-md placeholder:text-sm"
						/>
						{!openThreadMessageState && <PrivateThread title="Private Thread" label="Only people you invite and moderators can see" />}
						{valueThread && openThreadMessageState && <ChannelMessageThread message={valueThread} />}
					</div>
				</div>
			)}
			{props.isThread && messageThreadError && !threadCurrentChannel && (
				<span className="text-xs text-[#B91C1C] mt-1 ml-1">{messageThreadError}</span>
			)}
			<MentionsInput
				onPaste={props.handlePaste}
				id="editorReactMention"
				inputRef={editorRef}
				placeholder="Write your thoughs here..."
				value={valueTextInput ?? ''}
				onChange={onChangeMentionInput}
				style={appearanceTheme === 'light' ? lightMentionsInputStyle : darkMentionsInputStyle}
				className={`dark:bg-channelTextarea bg-channelTextareaLight dark:text-white text-colorTextLightMode rounded-md ${appearanceTheme === 'light' ? 'lightMode lightModeScrollBarMention' : 'darkMode'}`}
				allowSpaceInQuery={true}
				onKeyDown={onKeyDown}
				forceSuggestionsAboveCursor={true}
			>
				<Mention
					appendSpaceOnAdd={true}
					data={handleSearchUserMention}
					trigger="@"
					displayTransform={(id: any, display: any) => {
						return `@${display}`;
					}}
					renderSuggestion={(suggestion) => (
						<SuggestItem
							valueHightLight={valueHighlight}
							name={suggestion.display ?? ''}
							avatarUrl={(suggestion as any).avatarUrl}
							subText=""
						/>
					)}
					style={mentionStyle}
					className="dark:bg-[#3B416B] bg-bgLightModeButton"
				/>
				<Mention
					markup="#[__display__](__id__)"
					appendSpaceOnAdd={true}
					data={handleSearchHashtag}
					trigger="#"
					displayTransform={(id: any, display: any) => {
						return `#${display}`;
					}}
					style={mentionStyle}
					renderSuggestion={(suggestion) => (
						<SuggestItem
							valueHightLight={valueHighlight}
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
					renderSuggestion={(suggestion) => <SuggestItem name={suggestion.display ?? ''} symbol={(suggestion as EmojiData).emoji} />}
					className="dark:bg-[#3B416B] bg-bgLightModeButton"
					appendSpaceOnAdd={true}
				/>
			</MentionsInput>
		</div>
	);
}

export default MentionReactInput;
