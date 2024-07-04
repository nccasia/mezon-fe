import { UserMentionList } from '@mezon/components';
import { useChannels, useEmojiSuggestion, useEscapeKey } from '@mezon/core';
import { selectTheme } from '@mezon/store';
import { IMessageWithUser } from '@mezon/utils';
import SuggestItem from 'libs/components/src/lib/components/MessageBox/ReactionMentionInput/SuggestItem';
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

type EmojiData = {
	id: string;
	emoji: string;
	display: string;
};

const convertToPlainTextHashtag = (text: string) => {
	const regex = /(@)\[(.*?)\](?:\(.*?\))?|(#)\[(.*?)\]\((.*?)\)/g;
	const result = text.replace(regex, (match, atSymbol, atUsername, hashSymbol, hashText, hashId) => {
		if (atSymbol) {
			return `@${atUsername}`;
		} else {
			return `<#${hashId}>`;
		}
	});
	return result;
};

const replaceChannelIdsWithDisplay = (text: string, listInput: ChannelsMentionProps[]) => {
	const channelRegex = /<#[0-9]{19}\b>/g;
	const replacedText = text.replace(channelRegex, (match) => {
		const channelId = match.substring(2, match.length - 1);
		const channel = listInput.find((item) => item.id === channelId);
		return channel ? `#[${channel.display}](${channelId})` : match;
	});

	const usernameRegex = /@([\w.]+)/g;
	const finalText = replacedText.replace(usernameRegex, (match, p1) => {
		return `@[${p1}]`;
	});
	return finalText;
};

const MessageInput: React.FC<MessageInputProps> = ({ messageId, channelId, mode, channelLabel, message }) => {
	const { openEditMessageState, idMessageRefEdit, editMessage, setEditMessage, content, setContent, handleCancelEdit, handleSend } = useEditMessage(
		channelId,
		channelLabel,
		mode,
		message,
	);
	const { emojis } = useEmojiSuggestion();
	const textareaRef = useRef<HTMLTextAreaElement | null>(null);
	const appearanceTheme = useSelector(selectTheme);
	const mentionList = UserMentionList({ channelID: channelId, channelMode: mode });

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
		if (editMessage) {
			const convertedHashtag = convertToPlainTextHashtag(editMessage);
			const replacedText = replaceChannelIdsWithDisplay(convertedHashtag, listChannelsMention);
			setEditMessage(replacedText);
			setContent(convertedHashtag);
		}
	}, [editMessage, listChannelsMention]);

	useEffect(() => {
		if (openEditMessageState && message.id === idMessageRefEdit) {
			textareaRef.current?.focus();
		}
	}, [openEditMessageState, message.id, idMessageRefEdit]);

	const handleFocus = () => {
		if (textareaRef.current) {
			const length = textareaRef.current.value.length;
			textareaRef.current.setSelectionRange(length, length);
		}
	};

	const neverMatchingRegex = /($a)/;
	const queryEmojis = (query: string, callback: (data: any[]) => void) => {
		if (query.length === 0) return;
		const matches = emojis
			.filter((emoji) => emoji.shortname && emoji.shortname.indexOf(query.toLowerCase()) > -1)
			.slice(0, 20)
			.map((emojiDisplay) => ({ id: emojiDisplay?.shortname, display: emojiDisplay?.shortname }));
		callback(matches);
	};

	useEscapeKey(handleCancelEdit);

	const onSend = (e: React.KeyboardEvent<Element>) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			e.stopPropagation();
			if (editMessage?.trim() === '') {
				if (editMessage.length !== 0) {
					handleCancelEdit();
				} else {
					setOpenModalDelMess(true);
				}
				return;
			}
			if (content) {
				handleSend(content, message.id);
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
		if (content) {
			handleSend(content, message.id);
			handleCancelEdit();
		}
	};

	const handleChange: OnChangeHandlerFunc = (event, newValue, newPlainTextValue, mentions) => {
		const value = event.target.value;
		setEditMessage(value);
	};

	return (
		<div className="inputEdit w-full flex ">
			<div className="w-full">
				<MentionsInput
					onFocus={handleFocus}
					inputRef={textareaRef}
					value={editMessage}
					className={`w-full dark:bg-black bg-white border border-[#bebebe] dark:border-none rounded p-[10px] dark:text-white text-black customScrollLightMode mt-[5px] ${appearanceTheme === 'light' && 'lightModeScrollBarMention'}`}
					onKeyDown={onSend}
					onChange={handleChange}
					rows={editMessage?.split('\n').length}
					forceSuggestionsAboveCursor={true}
					style={appearanceTheme === 'light' ? lightMentionsInputStyle : darkMentionsInputStyle}
				>
					<Mention
						markup="@[__display__]"
						appendSpaceOnAdd={true}
						data={mentionList ?? []}
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
						data={listChannelsMention}
						trigger="#"
						displayTransform={(id: any, display: any) => `#${display}`}
						style={mentionStyle}
						renderSuggestion={(suggestion) => (
							<SuggestItem name={suggestion.display ?? ''} symbol="#" subText={(suggestion as any).subText} />
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
				<div className="text-xs flex text-textLightTheme dark:text-textDarkTheme">
					<p className="pr-[3px]">escape to</p>
					<p
						className="pr-[3px] text-[#3297ff]"
						style={{ cursor: 'pointer' }}
						onClick={() => {
							handleCancelEdit();
							setEditMessage(message.content.t);
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
			{openModalDelMess && <ModalDeleteMess mess={message} closeModal={() => setOpenModalDelMess(false)} mode={mode} />}
		</div>
	);
};

export default React.memo(MessageInput);
