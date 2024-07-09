import { useAppNavigation, useAuth, useChannels, useDirect, useFriends } from '@mezon/core';
import { directActions, messagesActions, selectAllDirectMessages, selectAllUsesClan, selectTheme, useAppDispatch } from '@mezon/store';
import { InputField } from '@mezon/ui';
import { removeDuplicatesById } from '@mezon/utils';
import { Modal } from 'flowbite-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import SuggestItem from '../MessageBox/ReactionMentionInput/SuggestItem';
import { ChannelType } from 'mezon-js';
import ListMemberSearch from './listMemberSearch';
export type SearchModalProps = {
	readonly open: boolean;
	onClose: () => void;
};

function SearchModal({ open, onClose }: SearchModalProps) {
	const { userProfile } = useAuth();
	const [searchText, setSearchText] = useState('');
	const accountId = userProfile?.user?.id ?? '';
	const { toDmGroupPageFromMainApp, toChannelPage, navigate } = useAppNavigation();
	const { createDirectMessageWithUser } = useDirect();
	const dmGroupChatList = useSelector(selectAllDirectMessages);
	const { listChannels } = useChannels();
	const listGroup = dmGroupChatList.filter((groupChat) => groupChat.type === 2);
	const listDM = dmGroupChatList.filter((groupChat) => groupChat.type === 3 && groupChat.channel_avatar);
	const usersClan = useSelector(selectAllUsesClan);
	const { friends } = useFriends();
	const dispatch = useAppDispatch();
	const [idActive, setIdActive] = useState('');
	const boxRef = useRef<HTMLDivElement | null>(null);
	const itemRef = useRef<HTMLDivElement | null>(null);

	const appearanceTheme = useSelector(selectTheme);

	const listMemSearch = useMemo(() => {
		const listDMSearch = listDM?.length
			? listDM.map((itemDM: any) => {
					return {
						id: itemDM?.user_id?.[0] ?? '',
						name: itemDM?.channel_label ?? '',
						avatarUser: itemDM?.channel_avatar?.[0] ?? '',
						idDM: itemDM?.id ?? '',
						displayName:'',
						typeChat: 3,
					};
				})
			: [];
		const listGroupSearch = listGroup.length
			? listGroup.map((itemGr: any) => {
					return {
						id: itemGr?.channel_id ?? '',
						name: itemGr?.channel_label ?? '',
						avatarUser: 'assets/images/avatar-group.png' ?? '',
						idDM: itemGr?.id ?? '',
						typeChat: 2,
					};
				})
			: [];
		const listFriendsSearch = friends.length
			? friends.map((itemFriend: any) => {
					return {
						id: itemFriend?.id ?? '',
						name: itemFriend?.user.username ?? '',
						avatarUser: itemFriend?.user.avatar_url ?? '',
						displayName: itemFriend?.user.display_name ?? '',
						idDM: '',
					};
				})
			: [];
		const listUserClanSearch = usersClan.length
			? usersClan.map((itemUserClan: any) => {
					return {
						id: itemUserClan?.id ?? '',
						name: itemUserClan?.user?.username ?? '',
						avatarUser: itemUserClan?.user?.avatar_url ?? '',
						idDM: '',
					};
				})
			: [];
		const friendsMap = new Map(listFriendsSearch.map(friend => [friend.id, friend]));
		const listSearch = [ 
			...listDMSearch.map(itemDM => {
				const friend = friendsMap.get(itemDM.id);
				return friend ? { ...itemDM, displayName: friend.displayName || itemDM.displayName } : itemDM;
		  	}),
			...listGroupSearch,
			...listUserClanSearch
		];
		return removeDuplicatesById(listSearch.filter((item) => item.id !== accountId));
	}, [accountId, friends, listDM, listGroup, usersClan]);

	const listChannelSearch = useMemo(() => {
		const list = listChannels.map((item) => {
			return {
				id: item?.channel_id ?? '',
				name: item?.channel_label ?? '',
				subText: item?.category_name ?? '',
				icon: '#',
				clanId: item?.clan_id ?? '',
			};
		});
		return list;
	}, [listChannels]);

	const handleSelectMem = useCallback(
		async (user: any) => {
			if (user?.idDM) {
				dispatch(directActions.openDirectMessage({ channel_id: user.idDM || '' }));
				const result = await dispatch(
					directActions.joinDirectMessage({
					  directMessageId: user.idDM,
					  channelName: '',
					  type: user?.typeChat ?? ChannelType.CHANNEL_TYPE_DM,
					}),
				  );
				  if (result) {
					navigate(toDmGroupPageFromMainApp(user.idDM, user?.typeChat ?? ChannelType.CHANNEL_TYPE_DM));
				  }
			} else {
				const response = await createDirectMessageWithUser(user.id);
				if (response.channel_id) {
					const directChat = toDmGroupPageFromMainApp(response.channel_id, Number(response.type));
					navigate(directChat);
				}
			}
			onClose();
		},
		[createDirectMessageWithUser, navigate, onClose, toDmGroupPageFromMainApp],
	);

	const handleSelectChannel = useCallback(
		async (channel: any) => {
			const directChannel = toChannelPage(channel.id, channel.clanId);
			navigate(directChannel);
			onClose();
		},
		[navigate, onClose, toChannelPage],
	);

	const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
			e.preventDefault();
		}
	};

	const isNoResult =
		!listChannelSearch.filter((item) => item.name.indexOf(searchText) > -1).length &&
		!listMemSearch.filter((item: any) => item.name.indexOf(searchText) > -1).length;

	useEffect(() => {
		const memSearchs = listMemSearch
			.filter((item: any) => item.name.indexOf(searchText.startsWith('@') ? searchText.substring(1) : searchText) > -1)
			.slice(0, searchText.startsWith('@') ? 25 : 7);
		const channelSearchs = listChannelSearch
			.filter((item) => item.name.indexOf(searchText.startsWith('#') ? searchText.substring(1) : searchText) > -1)
			.slice(0, searchText.startsWith('#') ? 25 : 8);
		const totalLists = memSearchs.concat(channelSearchs);

		if (idActive === '') {
			setIdActive(totalLists[0]?.id);
		}

		let maxHight = itemRef.current?.clientHeight ?? 0;

		const boxHight = boxRef.current?.clientHeight ?? 0;
		const handleKeyDown = (event: KeyboardEvent) => {
			const nextIndex = (currentIndex: number, length: number) => (currentIndex === length - 1 ? 0 : currentIndex + 1);
			const prevIndex = (currentIndex: number) => (currentIndex === 0 ? totalLists.length - 1 : currentIndex - 1);
			const itemSelect = totalLists.find((item: any) => item.id === idActive);

			switch (event.key) {
				case 'ArrowDown':
					if (itemRef && itemRef.current) {
						maxHight =
							itemRef.current.clientHeight *
							(nextIndex(
								totalLists.findIndex((item: any) => item.id === idActive),
								totalLists.length,
							) +
								1);

						if (maxHight > boxHight) {
							boxRef.current?.scroll({
								top: maxHight - boxHight + 46,
								behavior: 'smooth',
							});
						}
						if (maxHight === itemRef.current?.clientHeight) {
							boxRef.current?.scroll({
								top: 0,
								behavior: 'smooth',
							});
						}
					}
					setIdActive(
						totalLists[
							nextIndex(
								totalLists.findIndex((item: any) => item.id === idActive),
								totalLists.length,
							)
						]?.id,
					);
					break;
				case 'ArrowUp':
					if (itemRef && itemRef.current) {
						maxHight = itemRef.current.clientHeight * (prevIndex(totalLists.findIndex((item: any) => item.id === idActive)) + 1);

						if (maxHight > boxHight) {
							boxRef.current?.scroll({
								top: maxHight - boxHight + 46,
								behavior: 'smooth',
							});
						}
						if (maxHight === itemRef.current?.clientHeight) {
							boxRef.current?.scroll({
								top: 0,
								behavior: 'smooth',
							});
						}
					}
					setIdActive(totalLists[prevIndex(totalLists.findIndex((item: any) => item.id === idActive))]?.id);
					break;
				case 'Enter':
					if (itemSelect.subText) {
						event.preventDefault();
						handleSelectChannel(totalLists.find((item: any) => item.id === idActive));
						dispatch(messagesActions.setIsFocused(true));
					} else {
						handleSelectMem(totalLists.find((item: any) => item.id === idActive));
					}
					break;

				default:
					break;
			}
		};

		document.addEventListener('keydown', handleKeyDown);

		return () => {
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [handleSelectChannel, handleSelectMem, idActive, listChannelSearch, listMemSearch, searchText]);

	return (
		<Modal
			show={open}
			dismissible={true}
			onClose={onClose}
			className="bg-[#111111] text-contentPrimary bg-opacity-90 focus-visible:[&>*]:outline-none"
		>
			<Modal.Body className="dark:bg-[#36393e] bg-bgLightMode px-6 py-4 rounded-[6px] h-[200px] w-full">
				<div className="flex flex-col">
					<InputField
						type="text"
						placeholder="Where would you like to go?"
						className="py-[18px] dark:bg-bgTertiary bg-bgLightModeThird dark:text-textDarkTheme text-textLightTheme text-[16px] mt-2 mb-[15px]"
						value={searchText}
						onChange={(e) => setSearchText(e.target.value)}
						onKeyDown={(e) => handleInputKeyDown(e)}
					/>
				</div>
				<div
					ref={boxRef}
					className={`w-full max-h-[250px] overflow-x-hidden overflow-y-auto flex flex-col gap-[3px] pr-[5px] py-[10px] ${appearanceTheme === 'light' ? 'customScrollLightMode' : ''}`}
				>
					{!searchText.startsWith('@') && !searchText.startsWith('#') ? (
						<>
							<ListMemberSearch listMemSearch={listMemSearch} itemRef={itemRef} handleSelectMem={handleSelectMem} searchText={searchText} idActive={idActive} setIdActive={setIdActive}/>
							{listChannelSearch.length
								? listChannelSearch
										.filter((item) => item.name.toUpperCase().indexOf(searchText.toUpperCase()) > -1)
										.slice(0, 8)
										.map((item: any) => {
											return (
												<div
													ref={itemRef}
													key={item.id}
													onClick={() => handleSelectChannel(item)}
													onMouseEnter={() => setIdActive(item.id)}
													onMouseLeave={() => setIdActive(item.id)}
													className={`${idActive === item.id ? 'dark:bg-bgModifierHover bg-bgLightModeThird' : ''} dark:hover:bg-[#424549] hover:bg-bgLightModeButton w-full px-[10px] py-[4px] rounded-[6px] cursor-pointer`}
												>
													<SuggestItem name={item.name ?? ''} symbol={item.icon} subText={item.subText} />
												</div>
											);
										})
								: null}
							{isNoResult && <span className=" flex flex-row justify-center">Can't seem to find what you're looking for?</span>}
						</>
					) : (
						<>
							{searchText.startsWith('@') && (
								<>
									<span className="text-left opacity-60 text-[11px] pb-1 uppercase">Search friend and users</span>
									{listMemSearch.length ? (
										listMemSearch
											.filter((item: any) => item.name.toUpperCase().indexOf(searchText.toUpperCase().substring(1)) > -1)
											.slice(0, 25)
											.map((item: any) => {
												return (
													<div
														ref={itemRef}
														key={item.id}
														onClick={() => handleSelectMem(item)}
														className={`${idActive === item.id ? 'bg-bgModifierHover' : ''} hover:bg-[#424549] w-full px-[10px] py-[4px] rounded-[6px] cursor-pointer`}
														onMouseEnter={() => setIdActive(item.id)}
														onMouseLeave={() => setIdActive(item.id)}
													>
														<SuggestItem name={item?.name} avatarUrl={item.avatarUser} />
													</div>
												);
											})
									) : (
										<></>
									)}
								</>
							)}
							{searchText.startsWith('#') && (
								<>
									<span className="text-left opacity-60 text-[11px] pb-1 uppercase">Searching channel</span>
									{listChannelSearch.length ? (
										listChannelSearch
											.filter((item) => item.name.toUpperCase().indexOf(searchText.toUpperCase().substring(1)) > -1)
											.slice(0, 25)
											.map((item: any) => {
												return (
													<div
														ref={itemRef}
														key={item.id}
														onClick={() => handleSelectChannel(item)}
														className={`${idActive === item.id ? 'bg-bgModifierHover' : ''} hover:bg-[#424549] w-full px-[10px] py-[4px] rounded-[6px] cursor-pointer`}
														onMouseEnter={() => setIdActive(item.id)}
														onMouseLeave={() => setIdActive(item.id)}
													>
														<SuggestItem name={item.name ?? ''} symbol={item.icon} subText={item.subText} />
													</div>
												);
											})
									) : (
										<></>
									)}
								</>
							)}
						</>
					)}
				</div>
				<div className="pt-2">
					<span className="text-[13px] font-medium dark:text-contentTertiary text-textLightTheme">
						<span className="text-[#2DC770] opacity-100 font-bold">PROTIP: </span>Start searches with @, # to narrow down results.
					</span>
				</div>
			</Modal.Body>
		</Modal>
	);
}

export default SearchModal;
