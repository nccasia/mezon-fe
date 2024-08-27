import { FriendsEntity, selectTheme } from '@mezon/store';
import { useSelector } from 'react-redux';
import FriendsListItem from './FriendsListItem';

type ListFriendsProps = {
	listFriendFilter: FriendsEntity[];
};
const FriendList = ({ listFriendFilter }: ListFriendsProps) => {
	const appearanceTheme = useSelector(selectTheme);
	return (
		<div className={`flex h-full flex-col pr-8 overflow-y-auto w-full ${appearanceTheme === 'light' && `customScrollLightMode`}`}>
			{listFriendFilter.map((friend: FriendsEntity) => (
				<FriendsListItem friend={friend} key={friend.id} />
			))}
		</div>
	);
};

export default FriendList;
