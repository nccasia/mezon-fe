import { useFilteredContent } from '@mezon/core';
import {
	messagesActions,
	selectChannelById,
	selectCurrentClanId,
	selectCurrentUserId,
	selectDirectById,
	selectNewIdMessageResponse,
	useAppDispatch,
} from '@mezon/store';
import { handleUrlInput, useMezon } from '@mezon/transport';
import { ETypeLinkMedia, IMentionOnMessage, IMessageSendPayload } from '@mezon/utils';
import { ApiMessageAttachment, ApiMessageMention, ApiMessageRef } from 'mezon-js/api.gen';
import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useAppParams } from '../../app/hooks/useAppParams';

export type UseChatSendingOptions = {
	channelId: string;
	mode: number;
	directMessageId?: string;
};

// TODO: separate this hook into 2 hooks for send and edit message
export function useChatSending({ channelId, mode, directMessageId }: UseChatSendingOptions) {
	const { directId } = useAppParams();
	const currentClanId = useSelector(selectCurrentClanId);
	const currentUserId = useSelector(selectCurrentUserId);
	const idNewMessageResponse = useSelector(selectNewIdMessageResponse);

	const dispatch = useAppDispatch();
	// TODO: if direct is the same as channel use one slice
	// If not, using 2 hooks for direct and channel
	const direct = useSelector(selectDirectById(directMessageId || directId || ''));
	const { clientRef, sessionRef, socketRef } = useMezon();
	const channel = useSelector(selectChannelById(channelId));
	let channelID = channelId;
	let clanID = currentClanId;
	if (direct) {
		channelID = direct.id;
		clanID = '0';
	}
	const [filteredContentMap, setFilteredContentMap] = useState<Record<string, IMessageSendPayload>>({});
	const [filteredMentionMap, setFilteredMentionMap] = useState<Record<string, IMentionOnMessage[]>>({});
	const [filteredLinkResults, setFilteredLinkResults] = React.useState<ApiMessageAttachment[]>([]);
	const [filteredContent, setFilterContent] = useState<IMessageSendPayload>({});
	const [filteredMention, setFilterMention] = useState<IMentionOnMessage[]>([]);
	const [ids, setIds] = useState<string[]>([]);
	const [idToLinksMap, setIdToLinksMap] = useState<Record<string, ApiMessageAttachment[]>>({});

	useEffect(() => {
		if (idNewMessageResponse) {
			setIds((prevIds) => {
				const newIds = [...prevIds, idNewMessageResponse];
				return [...new Set(newIds)]; // Remove duplicates
			});
		}
	}, [idNewMessageResponse]);

	console.log(ids);

	const sendMessage = React.useCallback(
		async (
			content: IMessageSendPayload,
			mentions?: Array<ApiMessageMention>,
			attachments?: Array<ApiMessageAttachment>,
			references?: Array<ApiMessageRef>,
			anonymous?: boolean,
			mentionEveryone?: boolean,
		) => {
			const filteredContent = useFilteredContent(content);
			setFilterContent(filteredContent ?? {});
			setFilterMention(mentions ?? []);
			return dispatch(
				messagesActions.sendMessage({
					channelId: channelID,
					clanId: clanID || '',
					mode,
					content: filteredContent ?? {},
					mentions,
					attachments,
					references,
					anonymous,
					mentionEveryone,
					senderId: currentUserId,
				}),
			);
		},
		[dispatch, channelID, clanID, mode, currentUserId, idNewMessageResponse],
	);
	const processUrls = async (filteredContentMap: Record<string, IMessageSendPayload>, ids: string[]) => {
		const idMap: Record<string, ApiMessageAttachment[]> = {};
		const resultPromises = ids.map(async (id) => {
			const content = filteredContentMap[id];
			if (content?.lk) {
				const urlPromises = (content.lk ?? []).map(async (item) => {
					try {
						// Ensure item.lk is a valid URL
						if (typeof item.lk !== 'string') {
							console.warn(`Invalid URL: ${item.lk}`);
							return null;
						}

						const result = await handleUrlInput(item.lk);

						if (result.filetype && result.filetype.startsWith(ETypeLinkMedia.IMAGE_PREFIX)) {
							return result as ApiMessageAttachment;
						}

						return null;
					} catch (error) {
						console.error(`Error processing URL ${item.lk}:`, error);
						return null;
					}
				});

				const results = await Promise.all(urlPromises);
				const filteredLinkProcess = results.filter((result): result is ApiMessageAttachment => result !== null);

				console.log(`ID: ${id} - Processed Links:`, filteredLinkProcess);
				idMap[id] = filteredLinkProcess;
			} else {
				console.warn(`No links to process for ID: ${id}`);
			}
		});

		await Promise.all(resultPromises);
		console.log('ID to Links Map:', idMap);
		return idMap;
	};

	// Usage in useEffect
	useEffect(() => {
		if (!filteredContentMap || ids.length === 0) return;

		const fetchAndProcessUrls = async () => {
			const processedIdMap = await processUrls(filteredContentMap, ids);
			setIdToLinksMap(processedIdMap);
		};

		fetchAndProcessUrls();
	}, [filteredContentMap, ids]);

	useEffect(() => {
		console.log('d');
		console.log('ids.length: ', ids.length);
		console.log('Object.keys(idToLinksMap).length: ', Object.keys(idToLinksMap).length);
		if (ids.length === 0 || Object.keys(idToLinksMap).length === 0) return;
		const sendAllMessages = async () => {
			for (const id of ids) {
				const content = filteredContentMap[id] || {};
				const mentions = filteredMentionMap[id] || [];
				const links = idToLinksMap[id] || [];
				const result = checkContentContainsOnlyUrls(content.t ?? '', links);
				console.log(content, id, mentions, links);
				await editSendMessage(result ? {} : content, id, mentions, links);
			}
			setFilteredContentMap({});
			setFilteredMentionMap({});
			setIdToLinksMap({});
		};
		sendAllMessages();
	}, [ids, idToLinksMap, filteredContentMap, filteredMentionMap, idNewMessageResponse]);

	function checkContentContainsOnlyUrls(content: string, urls: ApiMessageAttachment[]) {
		const urlsToCheck = urls.map((item) => item.url);
		const lines = content.split('\n').filter((line) => line.trim() !== '');
		const urlsInContent = lines.filter((line) => urlsToCheck.includes(line.trim()));
		return urlsInContent.length === 1 && urlsInContent[0] === urlsToCheck[0];
	}

	const sendMessageTyping = React.useCallback(async () => {
		dispatch(messagesActions.sendTypingUser({ clanId: clanID || '', channelId, mode }));
	}, [channelId, clanID, dispatch, mode]);

	// Move this function to to a new action of messages slice
	const editSendMessage = React.useCallback(
		async (content: IMessageSendPayload, messageId: string, mentions: ApiMessageMention[], attachments?: ApiMessageAttachment[]) => {
			console.log('attachments: ', attachments);
			console.log('mentions: ', mentions);
			console.log('messageId: ', messageId);
			console.log('content: ', content);

			const session = sessionRef.current;
			const client = clientRef.current;
			const socket = socketRef.current;

			if (!client || !session || !socket || (!channel && !direct)) {
				throw new Error('Client is not initialized');
			}

			const filteredContent = useFilteredContent(content);

			await socket.updateChatMessage(clanID || '', channelId, mode, messageId, filteredContent, mentions, attachments);
		},
		[sessionRef, clientRef, socketRef, channel, direct, clanID, channelId, mode],
	);

	return useMemo(
		() => ({
			sendMessage,
			sendMessageTyping,
			editSendMessage,
		}),
		[sendMessage, sendMessageTyping, editSendMessage],
	);
}
