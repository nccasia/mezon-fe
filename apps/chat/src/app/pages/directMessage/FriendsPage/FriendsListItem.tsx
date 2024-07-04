import { Icons, MemberProfile } from '@mezon/components';
import { useAppNavigation, useDirect, useFriends, useMemberStatus } from '@mezon/core';
import { FriendsEntity } from '@mezon/store';
import { MemberProfileType } from '@mezon/utils';
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
		<div className="border-t-[1px] dark:border-borderDefault border-gray-300">
			<div
				key={friend.user?.id} onClick={() => directMessageWithUser(friend.user?.id ?? '')}
				className=" py-3 flex justify-between items-center px-[12px] cursor-pointer dark:hover:bg-gray-800 hover:bg-white rounded-lg"
			>
				<div key={friend.user?.id} >
					<MemberProfile
						avatar={friend?.user?.avatar_url ?? ''}
						name={friend?.user?.username ?? ''}
						status={userStatus}
						isHideStatus={friend.state !== 0 ? true : false}
						isHideIconStatus={friend.state !== 0 ? true : false}
						isHideAnimation={true}
						key={friend.user?.id}
						numberCharacterCollapse={100}
						classParent={friend.state !== undefined && friend.state >= 1 ? '' : 'friendList h-10'}
						positionType={MemberProfileType.LIST_FRIENDS}
					/>
				</div>
				<div onClick={(e) => e.stopPropagation()}>
					{friend.state === 0 && (
						<div className="flex gap-3 items-center">
							<button
								onClick={() => directMessageWithUser(friend.user?.id ?? '')}
								className="dark:bg-bgTertiary bg-[#E1E1E1] rounded-full p-2"
							>
								<Icons.IconChat className="dark:text-[#AEAEAE] text-[#535353] dark:hover:text-white hover:text-black" />
							</button>
							<Dropdown
								label=""
								className="dark:bg-[#242529] bg-bgLightMode border dark:border-borderDefault text-contentSecondary p-2 w-[150px] text-[14px]"
								dismissOnClick={true}
								placement="right-start"
								renderTrigger={() => (
									<button className="dark:bg-bgTertiary bg-[#E1E1E1] rounded-full p-2">
										<Icons.IconEditThreeDot className="dark:text-[#AEAEAE] text-[#535353] dark:hover:text-white hover:text-black" />
									</button>
								)}
							>
								<Dropdown.Item
									theme={{
										base: 'dark:hover:bg-hoverPrimary hover:bg-bgLightModeThird dark:text-textDarkTheme text-textLightTheme p-2 rounded-[5px] w-full flex font-semibold',
									}}
								>
									Start Video Call
								</Dropdown.Item>
								<Dropdown.Item
									theme={{
										base: 'dark:hover:bg-hoverPrimary hover:bg-bgLightModeThird dark:text-textDarkTheme text-textLightTheme p-2 rounded-[5px] w-full flex font-semibold',
									}}
								>
									Start Voice Call
								</Dropdown.Item>
								<Dropdown.Item
									theme={{
										base: 'dark:hover:bg-colorDanger dark:hover:text-contentSecondary hover:bg-bgLightModeThird p-2 rounded-[5px] w-full text-colorDanger flex font-semibold',
									}}
									onClick={() => handleDeleteFriend(friend?.user?.username as string, friend.user?.id as string)}
								>
									Remove Friend
								</Dropdown.Item>
								<Dropdown.Item
									theme={{
										base: 'dark:hover:bg-colorDanger dark:hover:text-contentSecondary hover:bg-bgLightModeThird p-2 rounded-[5px] w-full text-colorDanger flex font-semibold',
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
								className="dark:bg-bgTertiary bg-bgLightModeButton dark:text-contentSecondary text-textLightTheme rounded-full w-8 h-8 flex items-center justify-center"
								onClick={() => handleDeleteFriend(friend?.user?.username as string, friend.user?.id as string)}
							>
								✕
							</button>
						</div>
					)}
					{friend.state === 2 && (
						<div className="flex gap-3 items-center">
							<button
								className="dark:bg-bgTertiary bg-bgLightModeButton dark:text-contentSecondary text-textLightTheme rounded-full w-8 h-8 flex items-center justify-center"
								onClick={() => handleAcceptFriend(friend?.user?.username as string, friend.user?.id as string)}
							>
								✓
							</button>
							<button
								className="dark:bg-bgTertiary bg-bgLightModeButton dark:text-contentSecondary text-textLightTheme rounded-full w-8 h-8 flex items-center justify-center"
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
		</div>
	);
};

export default FriendsListItem;
