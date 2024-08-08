import { CustomModalMentions, SuggestItem, UserMentionList } from '@mezon/components';
import { useChannels, useEmojiSuggestion, useEscapeKey } from '@mezon/core';
import { selectAllDirectChannelVoids, selectAllRolesClan, selectChannelDraftMessage, selectTheme, useAppSelector } from '@mezon/store';
import {
	IMessageSendPayload,
	IMessageWithUser,
	MentionDataProps,
	ThemeApp,
	createFormattedString,
	getRoleList,
	processText,
	searchMentionsHashtag,
} from '@mezon/utils';
import useProcessMention from 'libs/components/src/lib/components/MessageBox/ReactionMentionInput/useProcessMention';
import { ChannelStreamMode } from 'mezon-js';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Mention, MentionsInput, OnChangeHandlerFunc } from 'react-mentions';
import { useSelector } from 'react-redux';
import lightMentionsInputStyle from './LightRmentionInputStyle';
import ModalDeleteMess from './ModalDeleteMess';
import darkMentionsInputStyle from './RmentionInputStyle';
import mentionStyle from './RmentionStyle';
import { useEditMessage } from './useEditMessage';

type MessageInputProps = {
	messageId: string;
	channelId: string;
	mode: number;
	channelLabel: string;
	message: IMessageWithUser;
};

type ChannelsMentionProps = {
	id: string;
	display: string;
	subText: string;
};

const MessageInput: React.FC<MessageInputProps> = ({ messageId, channelId, mode, channelLabel, message }) => {
	const { openEditMessageState, idMessageRefEdit, handleCancelEdit, handleSend, setChannelDraftMessage } = useEditMessage(
		channelId,
		channelLabel,
		mode,
		message,
	);
	const { emojis } = useEmojiSuggestion();
	const textareaRef = useRef<HTMLTextAreaElement | null>(null);
	const appearanceTheme = useSelector(selectTheme);
	const mentionListData = UserMentionList({ channelID: channelId, channelMode: mode });

	const [openModalDelMess, setOpenModalDelMess] = useState(false);

	const { listChannels } = useChannels();

	const listChannelsMention = useMemo(() => {
		if (mode !== 3 && mode !== 4) {
			return listChannels.map((item) => {
				return {
					id: item?.channel_id ?? '',
					display: item?.channel_label ?? '',
					subText: item?.category_name ?? '',
				};
			});
		} else {
			return [];
		}
	}, [mode, listChannels]);
	useEffect(() => {
		if (openEditMessageState && message.id === idMessageRefEdit) {
			textareaRef.current?.focus();
		}
	}, [openEditMessageState, message.id, idMessageRefEdit]);

	const channelDraftMessage = useAppSelector((state) => selectChannelDraftMessage(state, channelId));
	const rolesInClan = useSelector(selectAllRolesClan);
	const roleList = getRoleList(rolesInClan);
	const processedContentDraft: IMessageSendPayload = useMemo(() => {
		return {
			t: channelDraftMessage.draftContent?.t,
			mentions: channelDraftMessage.draftContent?.mentions,
			hashtags: channelDraftMessage.draftContent?.hashtags,
			emojis: channelDraftMessage.draftContent?.emojis,
			links: channelDraftMessage.draftContent?.links,
			markdowns: channelDraftMessage.draftContent?.markdowns,
			voicelinks: channelDraftMessage.draftContent?.voicelinks,
		};
	}, [channelDraftMessage.draftContent, messageId]);

	const formatContentDraft = createFormattedString(processedContentDraft);

	const handleFocus = () => {
		if (textareaRef.current) {
			const length = textareaRef.current.value.length;
			textareaRef.current.setSelectionRange(length, length);
		}
	};

	const queryEmojis = (query: string, callback: (data: any[]) => void) => {
		if (query.length === 0) return;
		const matches = emojis
			.filter((emoji) => emoji.shortname && emoji.shortname.indexOf(query.toLowerCase()) > -1)
			.slice(0, 20)
			.map((emojiDisplay) => ({ id: emojiDisplay?.shortname, display: emojiDisplay?.shortname }));
		callback(matches);
	};

	useEscapeKey(handleCancelEdit);

	const draftContent = useMemo(() => {
		return channelDraftMessage.draftContent?.t;
	}, [channelDraftMessage.draftContent?.t]);

	const originalContent = useMemo(() => {
		return message.content.t;
	}, [message.content.t]);

	const onSend = (e: React.KeyboardEvent<Element>) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			e.stopPropagation();

			if (draftContent === '') {
				setOpenModalDelMess(true);
			} else if (draftContent === originalContent) {
				handleCancelEdit();
			} else {
				handleSend(processedContentDraft, message.id);
				handleCancelEdit();
			}
		}
		if (e.key === 'Escape') {
			e.preventDefault();
			e.stopPropagation();
			handleCancelEdit();
		}
	};

	const handleSave = () => {
		if (draftContent === '') {
			return setOpenModalDelMess(true);
		} else if (draftContent !== '' && draftContent === originalContent) {
			return handleCancelEdit();
		} else {
			handleSend(processedContentDraft, message.id);
		}
		handleCancelEdit();
	};

	const [titleMention, setTitleMention] = useState('');

	const handleChange: OnChangeHandlerFunc = (event, newValue, newPlainTextValue, mentions) => {
		const { mentionList, hashtagList, emojiList } = useProcessMention(newPlainTextValue, mentions, roleList);
		const { links, markdowns, voiceRooms } = processText(newPlainTextValue);

		setChannelDraftMessage(channelId, messageId, {
			t: newPlainTextValue,
			mentions: mentionList,
			hashtags: hashtagList,
			emojis: emojiList,
			links: links,
			markdowns: markdowns,
			voicelinks: voiceRooms,
		});

		if (newPlainTextValue.endsWith('@')) {
			setTitleMention('Members');
		} else if (newPlainTextValue.endsWith('#')) {
			setTitleMention('Text channels');
		} else if (newPlainTextValue.endsWith(':')) {
			setTitleMention('Emoji matching');
		}
	};

	const commonChannelVoids = useSelector(selectAllDirectChannelVoids);

	const [valueHighlight, setValueHightlight] = useState<string>('');
	const listChannelVoidsMention: ChannelsMentionProps[] = useMemo(() => {
		if (mode === ChannelStreamMode.STREAM_MODE_DM) {
			return commonChannelVoids.map((item) => {
				return {
					id: item?.channel_id ?? '',
					display: item?.channel_label ?? '',
					subText: item?.clan_name ?? '',
				};
			}) as ChannelsMentionProps[];
		}
		return [];
	}, [mode, commonChannelVoids]);

	const handleSearchUserMention = (search: any, callback: any) => {
		setValueHightlight(search);
		callback(searchMentionsHashtag(search, mentionListData ?? []));
	};

	const handleSearchHashtag = (search: any, callback: any) => {
		setValueHightlight(search);
		if (mode === ChannelStreamMode.STREAM_MODE_DM) {
			callback(searchMentionsHashtag(search, listChannelVoidsMention ?? []));
		} else {
			callback(searchMentionsHashtag(search, listChannelsMention ?? []));
		}
	};

	return (
		<div className="inputEdit w-full flex ">
			<div className="w-full">
				<MentionsInput
					onFocus={handleFocus}
					inputRef={textareaRef}
					value={formatContentDraft ?? '{}'}
					className={`w-full dark:bg-black bg-white border border-[#bebebe] dark:border-none rounded p-[10px] dark:text-white text-black customScrollLightMode mt-[5px] ${appearanceTheme === ThemeApp.Light && 'lightModeScrollBarMention'}`}
					onKeyDown={onSend}
					onChange={handleChange}
					rows={channelDraftMessage.draftContent?.t?.split('\n').length}
					forceSuggestionsAboveCursor={true}
					style={appearanceTheme === ThemeApp.Light ? lightMentionsInputStyle : darkMentionsInputStyle}
					customSuggestionsContainer={(children: React.ReactNode) => {
						return <CustomModalMentions children={children} titleModalMention={titleMention} />;
					}}
				>
					<Mention
						appendSpaceOnAdd={true}
						data={handleSearchUserMention}
						trigger="@"
						displayTransform={(id: any, display: any) => {
							return display === '@here' ? `${display}` : `@${display}`;
						}}
						renderSuggestion={(suggestion: MentionDataProps) => {
							return (
								<SuggestItem
									valueHightLight={valueHighlight}
									avatarUrl={suggestion.avatarUrl}
									subText={
										suggestion.display === '@here'
											? 'Notify everyone who has permission to see this channel'
											: suggestion.username ?? ''
									}
									subTextStyle={(suggestion.display === '@here' ? 'normal-case' : 'lowercase') + ' text-xs'}
									showAvatar={suggestion.display !== '@here'}
									emojiId={suggestion.id as string}
									display={suggestion.display}
								/>
							);
						}}
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
								display={suggestion.display ?? ''}
								symbol="#"
								subText={(suggestion as ChannelsMentionProps).subText}
								channelId={suggestion.id}
								emojiId=""
							/>
						)}
						className="dark:bg-[#3B416B] bg-bgLightModeButton"
					/>
					<Mention
						trigger=":"
						markup="[:__display__]"
						data={queryEmojis}
						displayTransform={(id: any, display: any) => {
							return `${display}`;
						}}
						renderSuggestion={(suggestion) => (
							<SuggestItem display={suggestion.display ?? ''} symbol={(suggestion as any).emoji} emojiId="" />
						)}
						className="dark:bg-[#3B416B] bg-bgLightModeButton"
						appendSpaceOnAdd={true}
					/>
				</MentionsInput>
				<div className="text-xs flex text-textLightTheme dark:text-textDarkTheme">
					<p className="pr-[3px]">escape to</p>
					<p
						className="pr-[3px] text-[#3297ff]"
						style={{ cursor: 'pointer' }}
						onClick={() => {
							handleCancelEdit();
						}}
					>
						cancel
					</p>
					<p className="pr-[3px]">• enter to</p>
					<p className="text-[#3297ff]" style={{ cursor: 'pointer' }} onClick={handleSave}>
						save
					</p>
				</div>
			</div>
			{openModalDelMess && (
				<ModalDeleteMess
					channelId={channelId}
					channelLable={channelLabel}
					mess={message}
					closeModal={() => setOpenModalDelMess(false)}
					mode={mode}
				/>
			)}
		</div>
	);
};

export default React.memo(MessageInput);
