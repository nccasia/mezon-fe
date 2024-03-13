import { Icons, MemberProfile } from '@mezon/components';
import { useAppNavigation, useDirect, useFriends, useMemberStatus } from '@mezon/core';
import { FriendsEntity } from '@mezon/store';
import { Dropdown } from 'flowbite-react';

type FriendProps = {
	friend: FriendsEntity;
};
const FriendsListItem = ({ friend }: FriendProps) => {
	const { createDirectMessageWithUser } = useDirect();
	const { toDmGroupPageFromFriendPage, navigate } = useAppNavigation();
	const { acceptFriend, blockFriend, deleteFriend, unBlockFriend } = useFriends();
	const userStatus = useMemberStatus(friend.user?.id || '');

	const directMessageWithUser = async (userId: string) => {
		const response = await createDirectMessageWithUser(userId);
		if (response.channel_id) {
			const directChat = toDmGroupPageFromFriendPage(response.channel_id, Number(response.type));
			navigate(directChat);
		}
	};

	const handleAcceptFriend = (userName: string, id: string) => {
		acceptFriend(userName, id);
	};

	const handleDeleteFriend = (userName: string, id: string) => {
		deleteFriend(userName, id);
	};

	const handleBlockFriend = (userName: string, id: string) => {
		blockFriend(userName, id);
	};

	const handleUnBlockFriend = (userName: string, id: string) => {
		unBlockFriend(userName, id);
	};
	return (
		<div
			key={friend.user?.id}
			className="border-t-[1px] border-borderDefault py-3 flex justify-between items-center px-[12px] cursor-pointer hover:bg-gray-800 rounded-lg"
		>
			<div key={friend.user?.id}>
				<MemberProfile
					avatar={friend?.user?.avatar_url ?? ''}
					name={friend?.user?.username ?? ''}
					status={userStatus}
					isHideStatus={friend.state !== 0 ? true : false}
					isHideIconStatus={friend.state !== 0 ? true : false}
					key={friend.user?.id}
					numberCharacterCollapse={100}
					classParent="friendList"
				/>
			</div>
			<div>
				{friend.state === 0 && (
					<div className="flex gap-3 items-center">
						<button onClick={() => directMessageWithUser(friend.user?.id ?? '')} className="bg-bgTertiary rounded-full p-2 iconHover">
							<Icons.IconChat />
						</button>
						<Dropdown
							label=""
							className="bg-bgPrimary border-borderDefault text-contentSecondary p-2 w-[150px] text-[14px]"
							dismissOnClick={true}
							placement="right-start"
							renderTrigger={() => (
								<button className="bg-bgTertiary rounded-full p-2 iconHover">
									<Icons.IconEditThreeDot />
								</button>
							)}
						>
							<Dropdown.Item
								theme={{
									base: 'hover:bg-hoverPrimary p-2 rounded-[5px] w-full flex',
								}}
							>
								Start Video Call
							</Dropdown.Item>
							<Dropdown.Item
								theme={{
									base: 'hover:bg-hoverPrimary p-2 rounded-[5px] w-full flex',
								}}
							>
								Start Voice Call
							</Dropdown.Item>
							<Dropdown.Item
								theme={{
									base: 'hover:bg-colorDanger hover:text-contentSecondary p-2 rounded-[5px] w-full text-colorDanger flex',
								}}
								onClick={() => handleDeleteFriend(friend?.user?.username as string, friend.user?.id as string)}
							>
								Remove Friend
							</Dropdown.Item>
							<Dropdown.Item
								theme={{
									base: 'hover:bg-colorDanger hover:text-contentSecondary p-2 rounded-[5px] w-full text-colorDanger flex',
								}}
								onClick={() => handleBlockFriend(friend?.user?.username as string, friend.user?.id as string)}
							>
								Block
							</Dropdown.Item>
						</Dropdown>
					</div>
				)}
				{friend.state === 1 && (
					<div className="flex gap-3 items-center">
						<button
							className="bg-bgTertiary text-contentSecondary rounded-full w-8 h-8 flex items-center justify-center"
							onClick={() => handleDeleteFriend(friend?.user?.username as string, friend.user?.id as string)}
						>
							✕
						</button>
					</div>
				)}
				{friend.state === 2 && (
					<div className="flex gap-3 items-center">
						<button
							className="bg-bgTertiary text-contentSecondary rounded-full w-8 h-8 flex items-center justify-center"
							onClick={() => handleAcceptFriend(friend?.user?.username as string, friend.user?.id as string)}
						>
							✓
						</button>
						<button
							className="bg-bgTertiary text-contentSecondary rounded-full w-8 h-8 flex items-center justify-center"
							onClick={() => handleDeleteFriend(friend?.user?.username as string, friend.user?.id as string)}
						>
							✕
						</button>
					</div>
				)}
				{friend.state === 3 && (
					<div className="flex gap-3 items-center">
						<button
							className="bg-bgTertiary text-contentSecondary rounded-[6px] text-[14px] p-2 flex items-center justify-center hover:bg-bgPrimary"
							onClick={() => handleUnBlockFriend(friend?.user?.username as string, friend.user?.id as string)}
						>
							UnBlock
						</button>
					</div>
				)}
			</div>
		</div>
	);
};

export default FriendsListItem;
