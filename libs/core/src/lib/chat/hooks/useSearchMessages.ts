import {
	searchMessagesActions,
	selectAllMessageSearch,
	selectCurrentPage,
	selectIsSearchMessage,
	selectTotalResultSearchMessage,
	useAppDispatch,
} from '@mezon/store';
import { ApiSearchMessageRequest } from 'mezon-js/api.gen';
import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';

export function useSearchMessages() {
	const dispatch = useAppDispatch()
	const isSearchMessage = useSelector(selectIsSearchMessage)
	const searchMessages = useSelector(selectAllMessageSearch)
	const totalResult = useSelector(selectTotalResultSearchMessage)
	const currentPage =  useSelector(selectCurrentPage)

	const fetchSearchMessages = useCallback(
		async ({ filters, from, size, sorts }: ApiSearchMessageRequest) => {
			await dispatch(searchMessagesActions.fetchListSearchMessage({ filters, from, size, sorts }));
		},
		[dispatch],
	);
	return useMemo(
		() => ({
			isSearchMessage,
			fetchSearchMessages,
			searchMessages,
			totalResult,
			currentPage
		}),
		[isSearchMessage, fetchSearchMessages, searchMessages,totalResult,currentPage],
	);
}
