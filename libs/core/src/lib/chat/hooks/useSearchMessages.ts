import { messagesActions, selectCurrentClan, selectIsSearchMessage, selectSearchMessagesChannel, useAppDispatch } from '@mezon/store';
import { ApiSearchMessageRequest } from 'mezon-js/api.gen';
import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';

export function useSearchMessages() {
	const dispatch = useAppDispatch();
	const isSearchMessage = useSelector(selectIsSearchMessage);
	const searchMessagesChannelRaw = useSelector(selectSearchMessagesChannel);
	const currentClan = useSelector(selectCurrentClan);

	const searchMessages = useCallback(
		async ({ filters, from, size, sorts }: ApiSearchMessageRequest) => {
			await dispatch(messagesActions.searchChannelMessages({ filters, from, size, sorts }));
		},
		[dispatch],
	);

	const searchMessagesChannel = useMemo(() => {
		const searchChannelMessages = searchMessagesChannelRaw?.messages?.filter((message) => message.clan_id === currentClan?.clan_id);

		const channelLabels = [...new Set(searchChannelMessages?.map((message) => message.channel_label) ?? [])];

		const data = channelLabels.map((channelLabel) => {
			const messagesByChannelLabel = searchChannelMessages?.filter((message) => message.channel_label === channelLabel);

			return {
				channel_label: channelLabel,
				messages: messagesByChannelLabel?.map((message) => ({
					...message,
					id: message.message_id?.toString(),
				})),
			};
		});

		return {
			messageChannels: data.length > 0 ? [data] : [],
			total: searchMessagesChannelRaw?.total ?? 0,
		};
	}, [currentClan?.clan_id, searchMessagesChannelRaw?.messages, searchMessagesChannelRaw?.total]);

	return useMemo(
		() => ({
			isSearchMessage,
			searchMessagesChannel,
			searchMessages,
		}),
		[isSearchMessage, searchMessagesChannel, searchMessages],
	);
}
