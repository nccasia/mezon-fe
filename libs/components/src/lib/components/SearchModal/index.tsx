import { useAppNavigation, useAuth, useDirect } from '@mezon/core';
import {
	DirectEntity,
	directActions,
	messagesActions,
	selectAllChannelsByUser,
	selectAllDirectMessages,
	selectAllUsersByUser,
	selectTheme,
	useAppDispatch
} from '@mezon/store';
import { InputField } from '@mezon/ui';
import {
	SearchItemProps,
	TypeSearch,
	addAttributesSearchList,
	filterListByName,
	normalizeString,
	removeDuplicatesById,
	sortFilteredList
} from '@mezon/utils';
import { Modal } from 'flowbite-react';
import { ChannelType } from 'mezon-js';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import ListSearchModal from './ListSearchModal';
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
	const listChannels = useSelector(selectAllChannelsByUser);
	const listUserInClan = useSelector(selectAllUsersByUser)
	const listGroup = dmGroupChatList.filter((groupChat) => groupChat.type === ChannelType.CHANNEL_TYPE_GROUP && groupChat.active === 1);
	const listDM = dmGroupChatList.filter((groupChat) => groupChat.type === ChannelType.CHANNEL_TYPE_DM && groupChat.channel_avatar && groupChat.active === 1);

	const dispatch = useAppDispatch();
	const [idActive, setIdActive] = useState('');
	const boxRef = useRef<HTMLDivElement | null>(null);
	const itemRef = useRef<HTMLDivElement | null>(null);
	const ITEM_HEIGHT = 32;
	const appearanceTheme = useSelector(selectTheme);

	const listDirectSearch = useMemo(() => {
		const listDMSearch = listDM?.length
			? listDM.map((itemDM: DirectEntity) => {
					return {
						id: itemDM?.user_id?.[0] ?? '',
						name: itemDM?.usernames ?? '',
						avatarUser: itemDM?.channel_avatar?.[0] ?? '',
						idDM: itemDM?.id ?? '',
						displayName: itemDM.channel_label,
						lastSentTimeStamp: itemDM.last_sent_message?.timestamp_seconds,
						typeChat: TypeSearch.Dm_Type,
						type: ChannelType.CHANNEL_TYPE_DM,
					};
				})
			: [];
		const listGroupSearch = listGroup.length
			? listGroup.map((itemGr: DirectEntity) => {
					return {
						id: itemGr?.channel_id ?? '',
						name: itemGr?.channel_label ?? '',
						avatarUser: 'assets/images/avatar-group.png' ?? '',
						idDM: itemGr?.id ?? '',
						lastSentTimeStamp: itemGr.last_sent_message?.timestamp_seconds,
						type: ChannelType.CHANNEL_TYPE_GROUP,
						typeChat: TypeSearch.Dm_Type,
					};
				})
			: [];
		const listSearch = [
			...listDMSearch,
			...listGroupSearch,
		];
		const removeDuplicate = removeDuplicatesById(listSearch.filter((item) => item?.id !== accountId));
		const addPropsIntoSearchList = addAttributesSearchList(removeDuplicate, listUserInClan);
		return addPropsIntoSearchList;
	}, [accountId, listDM, listGroup, listUserInClan]);

	const listChannelSearch = useMemo(() => {
		const list = listChannels.map((item) => {
			return {
				id: item?.channel_id ?? '',
				name: item?.channel_label ?? '',
				subText: item?.clan_name ?? '',
				icon: '#',
				clanId: item?.clan_id ?? '',
				channelId: item?.channel_id ?? '',
				lastSentTimeStamp: Number(item?.last_sent_message?.timestamp_seconds || 0),
				typeChat: TypeSearch.Channel_Type,
				prioritizeName: item?.channel_label ?? '',
				channel_private: item.channel_private,
				type: item.type,
				parrent_id: item.parrent_id,
				meeting_code: item.meeting_code,
			};
		});
		return list;
	}, [listChannels]);

	const listMemberSearch = useMemo(() => {
		const list = listUserInClan.map((item) => {
			return {
				id: item?.id ?? '',
				prioritizeName: item?.display_name ??  "",
				name: item?.username ?? '',
				avatarUser: item?.avatar_url ?? '',
				displayName: item?.display_name ?? '',
				lastSentTimeStamp: '0',
				idDM: '',
				typeChat: TypeSearch.Dm_Type,
				type: ChannelType.CHANNEL_TYPE_DM
			};
		});
		return list;
	}, [listUserInClan]);

	const handleSelectMem = useCallback(
		async (user: any) => {
			if (user?.idDM) {
				dispatch(directActions.openDirectMessage({ channelId: user.idDM || '', clanId: '0' }));
				const result = await dispatch(
					directActions.joinDirectMessage({
						directMessageId: user.idDM,
						channelName: '',
						type: user?.type ?? ChannelType.CHANNEL_TYPE_DM,
					}),
				);
				if (result) {
					navigate(toDmGroupPageFromMainApp(user.idDM, user?.type ?? ChannelType.CHANNEL_TYPE_DM));
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
			if (channel.type === ChannelType.CHANNEL_TYPE_TEXT) {
				const directChannel = toChannelPage(channel.id, channel.clanId);
				navigate(directChannel);
			} else {
				const urlVoice = `https://meet.google.com/${channel.meeting_code}`;
				window.open(urlVoice, '_blank', 'noreferrer');
			}
			onClose();
		},
		[navigate, onClose, toChannelPage],
	);

	const handleSelect = useCallback(
		async (isChannel: boolean, item: any) => {
			if (isChannel) {
				await handleSelectChannel(item);
			} else {
				await handleSelectMem(item);
			}
		},
		[handleSelectMem, handleSelectChannel],
	);

	const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
			e.preventDefault();
		}
	};

	const normalizeSearchText = useMemo(() => {
		return normalizeString(searchText);
	}, [searchText]);

	const isSearchByUsername = useMemo(() => {
		return searchText.startsWith('@');
	}, [searchText]);

	const isNoResult =
		!listChannelSearch.filter((item) => item.prioritizeName.indexOf(normalizeSearchText) > -1 || item.name.indexOf(normalizeSearchText) > -1)
			.length &&
		!listDirectSearch.filter((item: SearchItemProps) => item.prioritizeName && item.prioritizeName.indexOf(normalizeSearchText) > -1).length;

	const totalLists = useMemo(() => {
		const list = listDirectSearch.concat(listChannelSearch);
		const sortedList = list.slice().sort((a, b) => b.lastSentTimeStamp - a.lastSentTimeStamp);
		return sortedList;
	}, [listDirectSearch, listChannelSearch]);

	const totalListsFiltered = useMemo(() => {
		return filterListByName(totalLists, normalizeSearchText, isSearchByUsername);
	}, [totalLists, normalizeSearchText, isSearchByUsername]);

	const totalListsSorted = useMemo(() => {
		return sortFilteredList(totalListsFiltered, normalizeSearchText, isSearchByUsername);
	}, [totalListsFiltered, normalizeSearchText, isSearchByUsername]);

	const channelSearchSorted = useMemo(() => {
		return totalListsSorted.filter((item) => item.typeChat === TypeSearch.Channel_Type);
	}, [totalListsSorted]);

	const totalListsMemberFiltered = useMemo(() => {
		return filterListByName(listMemberSearch, normalizeSearchText, isSearchByUsername);
	}, [listMemberSearch, normalizeSearchText, isSearchByUsername]);
	const totalListMembersSorted = useMemo(() => {
		return sortFilteredList(totalListsMemberFiltered, normalizeSearchText, isSearchByUsername);
	}, [totalListsMemberFiltered, normalizeSearchText, isSearchByUsername]);
	const [listToUse, setListToUse] = useState<SearchItemProps[]>([]);

	// Define a function to get the list to use based on the search text
	const getListToUse = (
		normalizeSearchText: string,
		channelSearchSorted: SearchItemProps[],
		totalListsSorted: SearchItemProps[],
	) => {
		if (normalizeSearchText.startsWith('#')) {
			return channelSearchSorted;
		}
		return totalListsSorted;
	};

	useEffect(() => {
		const listToUseChecked = getListToUse(normalizeSearchText, channelSearchSorted, totalListsSorted);
		setListToUse(listToUseChecked);
		setIdActive('');
	}, [normalizeSearchText]);

	useEffect(() => {
		if (idActive === '' && listToUse.length > 0) {
			setIdActive(listToUse[0]?.id ?? '');
		}

		const handleKeyDown = (event: KeyboardEvent) => {
			const currentIndex = listToUse.findIndex((item) => item?.id === idActive);
			if (currentIndex === -1) return;

			switch (event.key) {
				case 'ArrowDown':
					handleArrowDown(listToUse, currentIndex);
					break;

				case 'ArrowUp':
					handleArrowUp(listToUse, currentIndex);
					break;

				case 'Enter':
					event.preventDefault();
					handleEnter(listToUse, idActive);
					break;

				default:
					break;
			}
		};

		document.addEventListener('keydown', handleKeyDown);

		return () => {
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [idActive, listToUse]);

	const handleArrowDown = (listToUse: SearchItemProps[], currentIndex: number) => {
		const nextIndex = currentIndex === listToUse.length - 1 ? 0 : currentIndex + 1;
		const newItem = listToUse[nextIndex];

		if (!boxRef.current || !newItem) return;
		const boxHeight = boxRef.current.clientHeight;
		const newItemOffset = (ITEM_HEIGHT + 4) * nextIndex;
		const newScrollTop = newItemOffset + ITEM_HEIGHT - boxHeight;
		const totalItemsHeight = listToUse.length * ITEM_HEIGHT;
		const maxScrollTop = Math.max(totalItemsHeight - boxHeight, 0);

		boxRef.current.scroll({
			top: Math.min(newScrollTop, maxScrollTop),
			behavior: 'smooth',
		});

		setIdActive(newItem.id ?? '');
	};

	const handleArrowUp = (listToUse: SearchItemProps[], currentIndex: number) => {
		const prevIndex = currentIndex === 0 ? listToUse.length - 1 : currentIndex - 1;
		const newItem = listToUse[prevIndex];

		if (!boxRef.current || !newItem) return;

		const boxHeight = boxRef.current.clientHeight;
		const newItemOffset = (ITEM_HEIGHT + 4) * prevIndex;
		const newScrollTop = newItemOffset - boxHeight + ITEM_HEIGHT;
		const totalItemsHeight = listToUse.length * ITEM_HEIGHT;
		const maxScrollTop = Math.max(totalItemsHeight - boxHeight, 0);

		boxRef.current.scroll({
			top: Math.min(Math.max(newScrollTop, 0), maxScrollTop),
			behavior: 'smooth',
		});

		setIdActive(newItem.id ?? '');
	};

	const handleEnter = (listToUse: SearchItemProps[], idActive: string) => {
		const selectedItem = listToUse.find((item) => item.id === idActive);
		if (!selectedItem) return;

		if (selectedItem.subText) {
			handleSelectChannel(selectedItem);
			dispatch(messagesActions.setIsFocused(true));
		} else {
			handleSelectMem(selectedItem);
		}
	};

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
					className={`w-full max-h-[250px]  overflow-x-hidden overflow-y-auto flex flex-col gap-[3px] pr-[5px]  ${appearanceTheme === 'light' ? 'customScrollLightMode' : ''}`}
				>
					{!normalizeSearchText.startsWith('@') && !normalizeSearchText.startsWith('#') ? (
						<>
							<ListSearchModal
								listSearch={totalListsSorted.slice(0, 50)}
								itemRef={itemRef}
								handleSelect={handleSelect}
								searchText={normalizeSearchText}
								idActive={idActive}
								setIdActive={setIdActive}
							/>
							{isNoResult && (
								<span className=" flex flex-row justify-center dark:text-white text-colorTextLightMode">
									Can't seem to find what you're looking for?
								</span>
							)}
						</>
					) : (
						<>
							{normalizeSearchText.startsWith('@') && (
								<>
									<span className="text-left opacity-60 text-[11px] pb-1 uppercase">Search friend and users</span>
									<ListSearchModal
										listSearch={totalListMembersSorted.slice(0,50)}
										itemRef={itemRef}
										handleSelect={handleSelect}
										searchText={normalizeSearchText}
										idActive={idActive}
										setIdActive={setIdActive}
										isSearchByUsername={isSearchByUsername}
									/>
								</>
							)}
							{normalizeSearchText.startsWith('#') && (
								<>
									<span className="text-left opacity-60 text-[11px] pb-1 uppercase">Searching channel</span>
									<ListSearchModal
										listSearch={channelSearchSorted.slice(0, 50)}
										itemRef={itemRef}
										handleSelect={handleSelect}
										searchText={normalizeSearchText.slice(1)}
										idActive={idActive}
										setIdActive={setIdActive}
									/>
								</>
							)}
						</>
					)}
				</div>
				<FooterNoteModal />
			</Modal.Body>
		</Modal>
	);
}

export default memo(SearchModal);

const FooterNoteModal = memo(() => {
	return (
		<div className="pt-2">
			<span className="text-[13px] font-medium dark:text-contentTertiary text-textLightTheme">
				<span className="text-[#2DC770] opacity-100 font-bold">PROTIP: </span>Start searches with @, # to narrow down results.
			</span>
		</div>
	);
});
