import {
	useApp,
	useChannelMembers,
	useChannels,
	useChatMessages,
	useChatReaction,
	useClans,
	useClickUpToEdit,
	useEmojiSuggestion,
	useMenu,
	useMessageValue,
	useReference,
	useThreads,
} from '@mezon/core';
import {
	ChannelsEntity,
	channelUsersActions,
	referencesActions,
	selectCurrentChannel,
	selectCurrentChannelId,
	selectMessageByMessageId,
	threadsActions,
	useAppDispatch,
} from '@mezon/store';
import {
	ChannelMembersEntity,
	ILineMention,
	IMessageSendPayload,
	MIN_THRESHOLD_CHARS,
	MentionDataProps,
	ThreadValue,
	UserMentionsOpt,
	UsersClanEntity,
	focusToElement,
	regexToDetectGifLink,
	threadError,
	uniqueUsers,
} from '@mezon/utils';
import { ApiMessageAttachment, ApiMessageMention, ApiMessageRef } from 'mezon-js/api.gen';
import { KeyboardEvent, ReactElement, useCallback, useEffect, useRef, useState } from 'react';
import { Mention, MentionsInput, OnChangeHandlerFunc } from 'react-mentions';
import { useSelector } from 'react-redux';
import textFieldEdit from 'text-field-edit';
import { ThreadNameTextField } from '../../../components';
import PrivateThread from '../../ChannelTopbar/TopBarComponents/Threads/CreateThread/PrivateThread';
import { useMessageLine } from '../../MessageWithUser/useMessageLine';
import ChannelMessageThread from './ChannelMessageThread';
import darkMentionsInputStyle from './RmentionInputStyle';
import lightMentionsInputStyle from './LightRmentionInputStyle';
import mentionStyle from './RmentionStyle';
import SuggestItem from './SuggestItem';

type Emoji = {
	emoji: string;
	name: string;
	shortname: string;
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

export type MentionReactInputProps = {
	readonly onSend: (
		content: IMessageSendPayload,
		mentions?: Array<ApiMessageMention>,
		attachments?: Array<ApiMessageAttachment>,
		references?: Array<ApiMessageRef>,
		value?: ThreadValue,
		anonymousMessage?: boolean,
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
	const { dataReferences, setReferenceMessage, setDataReferences, openThreadMessageState, setOpenThreadMessageState, idMessageRefReply } =
		useReference();

	const getRefMessageReply = useSelector(selectMessageByMessageId(idMessageRefReply));

	const [mentionData, setMentionData] = useState<ApiMessageMention[]>([]);
	const { members } = useChannelMembers({ channelId: currentChannelId });
	const { attachmentDataRef, setAttachmentData } = useReference();
	const [content, setContent] = useState('');
	const { threadCurrentChannel, messageThreadError, isPrivate, nameValueThread, valueThread } = useThreads();
	const currentChannel = useSelector(selectCurrentChannel);
	const { mentions } = useMessageLine(content);
	const { usersClan } = useClans();
	const { rawMembers } = useChannelMembers({ channelId: currentChannel?.channel_id as string });
	const { emojis } = useEmojiSuggestion();
	const { lastMessageByUserId } = useChatMessages({ channelId: currentChannel?.channel_id as string });
	const { emojiPicked } = useEmojiSuggestion();
	const { reactionRightState } = useChatReaction();
	const { valueTextInput, setValueTextInput } = useMessageValue(
		props.isThread ? currentChannelId + String(props.isThread) : (currentChannelId as string),
	);

	const queryEmojis = (query: string, callback: (data: EmojiData[]) => void) => {
		if (query.length === 0) return;
		const matches = emojis
			.filter((emoji) => emoji.shortname && emoji.shortname.indexOf(query.toLowerCase()) > -1)
			.slice(0, 20)
			.map((emojiDisplay) => ({ id: emojiDisplay?.emoji, emoji: emojiDisplay?.emoji, display: emojiDisplay?.shortname }));
		callback(matches);
	};

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

			if (getRefMessageReply !== null && dataReferences?.length > 0 && openReplyMessageState) {
				props.onSend(
					{ t: content },
					mentionData,
					attachmentDataRef,
					dataReferences,
					{ nameValueThread: nameValueThread, isPrivate },
					anonymousMessage,
				);
				addMemberToChannel(currentChannel, mentions, usersClan, rawMembers);
				setValueTextInput('', props.isThread);

				setAttachmentData([]);
				setReferenceMessage(null);
				setDataReferences([]);
				dispatch(threadsActions.setNameValueThread({ channelId: currentChannelId as string, nameValue: '' }));
				setContent('');
				setMentionData([]);
				dispatch(threadsActions.setIsPrivate(0));
				setReferenceMessage(null);
				dispatch(referencesActions.setOpenReplyMessageState(false));
			} else {
				if (openThreadMessageState) {
					props.onSend(
						{ t: valueThread?.content.t || '', contentThread: content },
						valueThread?.mentions,
						valueThread?.attachments,
						valueThread?.references,
						{ nameValueThread: nameValueThread ?? valueThread?.content.t, isPrivate },
						anonymousMessage,
					);
					setOpenThreadMessageState(false);
				} else {
					props.onSend(
						{ t: content },
						mentionData,
						attachmentDataRef,
						undefined,
						{ nameValueThread: nameValueThread, isPrivate },
						anonymousMessage,
					);
				}
				addMemberToChannel(currentChannel, mentions, usersClan, rawMembers);
				setValueTextInput('', props.isThread);

				setAttachmentData([]);
				dispatch(threadsActions.setNameValueThread({ channelId: currentChannelId as string, nameValue: '' }));
				setContent('');
				setMentionData([]);
				dispatch(threadsActions.setIsPrivate(0));
				setReferenceMessage(null);
				dispatch(referencesActions.setOpenReplyMessageState(false));
			}
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
				mentionedUsers.splice(0, mentionedUsers.length);
				convertedMentions.forEach((item) => {
					mentionedUsers.push(item);
				});
			} else {
				for (const mention of mentions) {
					if (mention.display.startsWith('@')) {
						mentionedUsers.push({
							user_id: mention.id.toString() ?? '',
							username: mention.display ?? '',
						});
					}
				}
			}
			setMentionData(mentionedUsers);
		}
		if (props.handleConvertToFile !== undefined && convertedHashtag.length > MIN_THRESHOLD_CHARS) {
			props.handleConvertToFile(convertedHashtag);
			setContent('');
		}
	};
	const editorRef = useRef<HTMLInputElement | null>(null);
	const { openReplyMessageState, openEditMessageState } = useReference();
	const { closeMenu, statusMenu } = useMenu();
	useEffect(() => {
		if (closeMenu && statusMenu) {
			return;
		}
		if ((getRefMessageReply !== null && openReplyMessageState) || !openEditMessageState || (emojiPicked !== '' && !reactionRightState)) {
			return focusToElement(editorRef);
		}
	}, [getRefMessageReply, openReplyMessageState, openEditMessageState, emojiPicked]);

	const handleChangeNameThread = (nameThread: string) => {
		dispatch(threadsActions.setNameValueThread({ channelId: currentChannelId as string, nameValue: nameThread }));
	};

	const convertToPlainTextHashtag = (text: string) => {
		const regex = /([@#])\[(.*?)\]\((.*?)\)/g;
		const result = text.replace(regex, (match, symbol, p1, p2) => {
			return symbol === '#' ? `#${p2}` : `@${p1}`;
		});
		return result;
	};
	useEffect(() => {
		handleEventAfterEmojiPicked();
	}, [emojiPicked]);

	const input = document.querySelector('#editorReactMention') as HTMLElement;
	function handleEventAfterEmojiPicked() {
		if (!emojiPicked || !input) {
			return;
		}
		const syntaxEmoji = findSyntaxEmoji(content) ?? '';
		if (syntaxEmoji === '') {
			textFieldEdit.insert(input, emojiPicked);
		} else {
			const replaceSyntaxByEmoji = content.replace(syntaxEmoji, emojiPicked);
			setValueTextInput(replaceSyntaxByEmoji, props.isThread);
			setContent(replaceSyntaxByEmoji);
			focusToElement(editorRef);
		}
	}

	function findSyntaxEmoji(contentText: string): string | null {
		const regexEmoji = /:[^\s]+(?=$|[\p{Emoji}])/gu;
		const emojiArray = Array.from(contentText.matchAll(regexEmoji), (match) => match[0]);
		if (emojiArray.length > 0) {
			return emojiArray[0];
		}
		return null;
	}

	const clickUpToEditMessage = () => {
		const idRefMessage = lastMessageByUserId?.id;
		if (idRefMessage && !valueTextInput) {
			dispatch(referencesActions.setIdMessageToJump(idRefMessage));
			dispatch(referencesActions.setOpenEditMessageState(true));
			dispatch(referencesActions.setOpenReplyMessageState(false));
			dispatch(referencesActions.setReferenceMessage(lastMessageByUserId));
		}
	};

	useEffect(() => {
		if (currentChannelId && valueTextInput) {
			const convertedHashtag = convertToPlainTextHashtag(valueTextInput);
			setContent(convertedHashtag);
			focusToElement(editorRef);
		}
	}, [currentChannelId, valueTextInput]);

	useClickUpToEdit(editorRef, valueTextInput, clickUpToEditMessage);
	const { appearanceTheme } = useApp();
	return (
		<div className="relative">
			{props.isThread && !threadCurrentChannel && (
				<div>
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
				style={appearanceTheme === "light" ? lightMentionsInputStyle : darkMentionsInputStyle}
				className="dark:bg-channelTextarea bg-bgLightMode dark:text-white text-colorTextLightMode"
				allowSpaceInQuery={true}
				onKeyDown={onKeyDown}
				forceSuggestionsAboveCursor={true}
			>
				<Mention
					appendSpaceOnAdd={true}
					data={props.listMentions ?? []}
					trigger="@"
					displayTransform={(id: any, display: any) => {
						return `@${display}`;
					}}
					renderSuggestion={(suggestion) => (
						<SuggestItem name={suggestion.display ?? ''} avatarUrl={(suggestion as any).avatarUrl} subText="" />
					)}
					style={mentionStyle}
					className="dark:bg-[#3B416B] bg-bgLightModeButton"
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
						<SuggestItem name={suggestion.display ?? ''} symbol="#" subText={(suggestion as ChannelsMentionProps).subText} />
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
				/>
			</MentionsInput>
		</div>
	);
}

export default MentionReactInput;
