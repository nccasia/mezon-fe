import { friendsActions, requestAddFriendParam, selectAllFriends, useAppDispatch } from '@mezon/store';
import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';

export function useFriends() {
	const friends = useSelector(selectAllFriends);
	const dispatch = useAppDispatch();

	const quantityPendingRequest = useMemo(() => {
		return friends.filter((obj) => obj.state === 2).length || 0;
	}, [friends]);

	const addFriend = useCallback(
		async (requestAddFriend: requestAddFriendParam) => {
			await dispatch(friendsActions.sendRequestAddFriend(requestAddFriend));
		},
		[dispatch],
	);

	const acceptFriend = useCallback(
		(userName: string, id: string) => {
			const body = {
				usernames: [userName],
				ids: [id],
			};
			dispatch(friendsActions.sendRequestAddFriend(body));
		},
		[dispatch],
	);

	const deleteFriend = useCallback(
		(userName: string, id: string) => {
			const body = {
				usernames: [userName],
				ids: [id],
			};
			dispatch(friendsActions.sendRequestDeleteFriend(body));
		},
		[dispatch],
	);

	const blockFriend = useCallback(
		(userName: string, id: string) => {
			const body = {
				usernames: [userName],
				ids: [id],
			};
			dispatch(friendsActions.sendRequestBlockFriend(body));
		},
		[dispatch],
	);

	const unBlockFriend = useCallback(
		(userName: string, id: string) => {
			const body = {
				usernames: [userName],
				ids: [id],
			};
			dispatch(friendsActions.sendRequestDeleteFriend(body));
		},
		[dispatch],
	);

	const filteredFriends = useCallback(
		(searchTerm: string) => {
			return friends.filter(
				(friend) =>
					friend.user?.display_name?.toUpperCase().includes(searchTerm) || friend.user?.username?.toUpperCase().includes(searchTerm),
			);
		},
		[friends],
	);

	return useMemo(
		() => ({
			friends,
			quantityPendingRequest,
			addFriend,
			acceptFriend,
			deleteFriend,
			blockFriend,
			unBlockFriend,
			filteredFriends,
		}),
		[friends, quantityPendingRequest, addFriend, acceptFriend, deleteFriend, blockFriend, unBlockFriend, filteredFriends],
	);
}
