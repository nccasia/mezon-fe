import { IconChat, IconEditThreeDot, IconFriends, MemberProfile, Search } from '@mezon/components';
import { useAppNavigation, useDirect, useFriends } from '@mezon/core';
import { FriendsEntity, RootState, friendsActions, requestAddFriendParam, useAppDispatch } from '@mezon/store';
import { Button, InputField } from '@mezon/ui';
import { Dropdown } from 'flowbite-react';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { Friend } from 'vendors/mezon-js/packages/mezon-js/dist';

const tabData = [
	{ title: 'All', value: 'all' },
	{ title: 'Online', value: 'online' },
	{ title: 'Pending', value: 'pending' },
	{ title: 'Block', value: 'block' },
];

export default function FriendsPage() {
	const dispatch = useAppDispatch();
	const { createDirectMessageWithUser } = useDirect();
	const { friends, quantityPendingRequest, addFriend, acceptFriend, blockFriend, deleteFriend, unBlockFriend } = useFriends();
	const [openModalAddFriend, setOpenModalAddFriend] = useState(false);
	const [textSearch, setTextSearch] = useState('');
	const currentTabStatus = useSelector((state: RootState) => state.friends.currentTabStatus);

	const handleChangeTab = (valueTab: string) => {
		dispatch(friendsActions.changeCurrentStatusTab(valueTab));
		setOpenModalAddFriend(false);
	};

	const handleOpenRequestFriend = () => {
		setOpenModalAddFriend(true);
	};

	const [requestAddFriend, setRequestAddFriend] = useState<requestAddFriendParam>({
		usernames: [],
		ids: [],
	});

	const handleChange = (key: string, value: string) => {
		switch (key) {
			case 'username':
				if (value.trim()) {
					setRequestAddFriend({ ...requestAddFriend, usernames: [value] });
				} else {
					setRequestAddFriend({ ...requestAddFriend, usernames: [] });
				}
				break;
			case 'id':
				setRequestAddFriend({ ...requestAddFriend, ids: [value] });
				break;
			default:
				return;
		}
	};

	const resetField = () => {
		setRequestAddFriend({
			usernames: [],
			ids: [],
		});
	};
	const handleAddFriend = async () => {
		await addFriend(requestAddFriend);
		resetField();
	};

	const filterStatus = (listFriends: FriendsEntity[]) => {
		switch (currentTabStatus) {
			case 'online':
				return listFriends.filter((item) => item.state === 0 && item.user?.online);
			case 'all':
				return listFriends.filter((item) => item.state === 0);
			case 'pending':
				return listFriends.filter((item) => item.state === 1 || item.state === 2);
			case 'block':
				return listFriends.filter((item) => item.state === 3);
			default:
				return listFriends;
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

	const listFriendFilter = filterStatus(friends).filter((obj) => obj.user?.username?.includes(textSearch));

	const { toDmGroupPageFromFriendPage } = useAppNavigation();
	const navigate = useNavigate();

	// TODO: move to useDirect hook
	const directMessageWithUser = async (userId: string) => {
		const response = await createDirectMessageWithUser(userId);
		if (response.channel_id) {
			const directChat = toDmGroupPageFromFriendPage(response.channel_id, Number(response.type));
			navigate(directChat);
		}
	};

	return (
		<div className="flex flex-col flex-1 shrink min-w-0 bg-bgSecondary h-[100%]">
			<div className="flex min-w-0 gap-7 items-center bg-bgSecondary border-b-[#000] border-b-[1px] px-6 py-3 justify-start h-[72px]">
				<div className="flex flex-row gap-2">
					<IconFriends />
					Friend
				</div>
				<div className="flex flex-row gap-4 border-l-[1px] pl-6 border-borderDefault">
					{tabData.map((tab, index) => (
						<div key={index} className="relative">
							<button
								className={`px-3 py-[6px] rounded-[4px] ${currentTabStatus === tab.value && !openModalAddFriend ? 'bg-[#151C2B]' : ''} ${tab.value === 'pending' && quantityPendingRequest !== 0 ? 'pr-[30px]' : ''}`}
								tabIndex={index}
								onClick={() => handleChangeTab(tab.value)}
							>
								{tab.title}
							</button>
							{tab.value === 'pending' && quantityPendingRequest !== 0 && (
								<div className="absolute w-[16px] h-[16px] rounded-full bg-colorDanger text-[#fff] font-bold text-[9px] flex items-center justify-center top-3 right-[5px]">
									{quantityPendingRequest}
								</div>
							)}
						</div>
					))}
				</div>
				<button
					className={`px-3 py-[6px] rounded-[4px]  ${openModalAddFriend ? 'text-primary font-bold' : 'bg-primary'} `}
					onClick={handleOpenRequestFriend}
					style={{ whiteSpace: 'nowrap' }}
				>
					Add Friend
				</button>
			</div>
			<div className="flex-1 flex w-full">
				<div className="px-8 py-6 flex-1">
					{!openModalAddFriend && (
						<div className="flex flex-col text-[#AEAEAE]">
							<div className="relative">
								<InputField
									type="text"
									onChange={(e) => setTextSearch(e.target.value)}
									placeholder="Search"
									className="mb-6 py-[10px] text-[14px] h-[44px] placeholder-gray-600"
								/>
								<div className="absolute top-3 right-5">
									<Search />
								</div>
							</div>
							<span className="text-[14px] text-contentSecondary mb-4 font-bold px-[14px]">
								{currentTabStatus.toUpperCase()} - {listFriendFilter.length}
							</span>
							{listFriendFilter.map((friend: Friend) => (
								<div
									key={friend.user?.id}
									className="border-t-[1px] border-borderDefault py-3 flex justify-between items-center px-[12px]"
								>
									<div key={friend.user?.id}>
										<MemberProfile
											avatar={friend?.user?.avatar_url ?? ''}
											name={friend?.user?.username ?? ''}
											status={friend.user?.online}
											isHideStatus={friend.state !== 0 ? true : false}
											key={friend.user?.id}
											numberCharacterCollapse={100}
										/>
									</div>
									<div>
										{friend.state === 0 && (
											<div className="flex gap-3 items-center">
												<button
													onClick={() => directMessageWithUser(friend.user?.id ?? '')}
													className="bg-bgTertiary rounded-full p-2"
												>
													<IconChat />
												</button>
												<Dropdown
													label=""
													className="bg-bgPrimary border-borderDefault text-contentSecondary p-2 w-[150px] text-[14px]"
													dismissOnClick={true}
													placement="right-start"
													renderTrigger={() => (
														<button className="bg-bgTertiary rounded-full p-2">
															<IconEditThreeDot />
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
														onClick={() =>
															handleDeleteFriend(friend?.user?.username as string, friend.user?.id as string)
														}
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
							))}
						</div>
					)}
					{openModalAddFriend && (
						<div className="w-full min-w-[500px] flex flex-col gap-3">
							<span className="font-[700]">ADD FRIEND</span>
							<span className="font-[400] text-[14px] text-contentTertiary">You can add friends with their Mezon usernames</span>

							<div className="relative">
								<InputField
									onChange={(e) => handleChange('username', e.target.value)}
									type="text"
									className="bg-bgSurface mb-2 mt-1"
									value={requestAddFriend.usernames}
									placeholder="Usernames"
								/>
								<Button
									label={'Send Friend Request'}
									className="absolute top-3 right-2 text-[14px] py-[5px]"
									disable={!requestAddFriend.usernames?.length}
									onClick={handleAddFriend}
									aria-placeholder="SSSSS "
								/>
							</div>
						</div>
					)}
				</div>
				<div className="w-[416px] max-w-2/5 bg-bgTertiary lg:flex hidden"></div>
			</div>
		</div>
	);
}
