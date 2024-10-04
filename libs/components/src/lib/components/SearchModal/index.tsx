import { useAppNavigation, useAuth, useDirect } from '@mezon/core';
import {
	DirectEntity,
	categoriesActions,
	channelsActions,
	directActions,
	messagesActions,
	selectAllChannelsByUser,
	selectAllDirectMessages,
	selectAllUsesInAllClansEntities,
	selectEntitesUserClans,
	selectPreviousChannels,
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
import { memo, useCallback, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import ListSearchModal, { ListSearchModalRef } from './ListSearchModal';

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
	const allClanUsersEntities = useSelector(selectEntitesUserClans);
	const dmGroupChatList = useSelector(selectAllDirectMessages);
	const listChannels = useSelector(selectAllChannelsByUser);
	const allUsesInAllClansEntities = useSelector(selectAllUsesInAllClansEntities);
	const previousChannels = useSelector(selectPreviousChannels);
	const listGroup = dmGroupChatList.filter((groupChat) => groupChat.type === ChannelType.CHANNEL_TYPE_GROUP && groupChat.active === 1);
	const listDM = dmGroupChatList.filter(
		(groupChat) => groupChat.type === ChannelType.CHANNEL_TYPE_DM && groupChat.channel_avatar && groupChat.active === 1
	);

	const dispatch = useAppDispatch();
	const [idActive, setIdActive] = useState('');
	const boxRef = useRef<HTMLDivElement | null>(null);
	const listItemWithoutPreviousRef = useRef<ListSearchModalRef | null>(null);
	const listPreviousRef = useRef<ListSearchModalRef | null>(null);
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
						type: ChannelType.CHANNEL_TYPE_DM
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
						typeChat: TypeSearch.Dm_Type
					};
				})
			: [];
		const listSearch = [...listDMSearch, ...listGroupSearch];
		const removeDuplicate = removeDuplicatesById(listSearch.filter((item) => item?.id !== accountId));
		const addPropsIntoSearchList = addAttributesSearchList(removeDuplicate, Object.values(allUsesInAllClansEntities) as any);
		return addPropsIntoSearchList;
	}, [accountId, listDM, listGroup, allUsesInAllClansEntities]);

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
				meeting_code: item.meeting_code
			};
		});
		return list;
	}, [listChannels]);

	const listMemberSearch = useMemo(() => {
		const list: SearchItemProps[] = [];
		for (const userId in allUsesInAllClansEntities) {
			const user = allUsesInAllClansEntities[userId];
			list.push({
				id: user?.id ?? '',
				prioritizeName: allClanUsersEntities[user?.id]?.clan_nick ?? user?.display_name ?? '',
				name: user?.username ?? '',
				avatarUser: user?.avatar_url ?? '',
				displayName: user?.display_name ?? '',
				lastSentTimeStamp: '0',
				idDM: undefined,
				typeChat: TypeSearch.Dm_Type,
				type: ChannelType.CHANNEL_TYPE_DM
			});
		}
		return list as SearchItemProps[];
	}, [allClanUsersEntities, allUsesInAllClansEntities]);

	const normalizeSearchText = useMemo(() => {
		return normalizeString(searchText);
	}, [searchText]);

	const isSearchByUsername = useMemo(() => {
		return searchText.startsWith('@');
	}, [searchText]);

	const totalLists = useMemo(() => {
		const list = listMemberSearch.concat(listChannelSearch);
		listDirectSearch.forEach((dm) => {
			if (
				dm.type === ChannelType.CHANNEL_TYPE_DM ||
				(dm.type === ChannelType.CHANNEL_TYPE_GROUP && !allUsesInAllClansEntities[dm?.id || '0'])
			) {
				list.push(dm);
			}
		});
		const removeDuplicateList = removeDuplicatesById(list.filter((item) => item?.id !== accountId));
		const sortedList = removeDuplicateList.slice().sort((a: any, b: any) => b.lastSentTimeStamp - a.lastSentTimeStamp);
		return sortedList;
	}, [listMemberSearch, listChannelSearch, listDirectSearch, allUsesInAllClansEntities, accountId]);

	const totalListsFiltered = useMemo(() => {
		return filterListByName(totalLists, normalizeSearchText, isSearchByUsername);
	}, [totalLists, normalizeSearchText, isSearchByUsername]);

	const totalListsSorted = useMemo(() => {
		return sortFilteredList(totalListsFiltered, normalizeSearchText, isSearchByUsername);
	}, [totalListsFiltered, normalizeSearchText, isSearchByUsername]);

	const totalListSortedWithoutPreviousList = useMemo(() => {
		return [...totalListsSorted];
	}, [totalListsSorted]);

	const channelSearchSorted = useMemo(() => {
		return totalListsSorted.filter((item) => item.typeChat === TypeSearch.Channel_Type);
	}, [totalListsSorted]);

	const totalListsMemberFiltered = useMemo(() => {
		return filterListByName(listMemberSearch, normalizeSearchText, isSearchByUsername);
	}, [listMemberSearch, normalizeSearchText, isSearchByUsername]);

	const totalListMembersSorted = useMemo(() => {
		return sortFilteredList(totalListsMemberFiltered, normalizeSearchText, isSearchByUsername);
	}, [totalListsMemberFiltered, normalizeSearchText, isSearchByUsername]);

	const listRecent = useMemo(() => {
		const previous: SearchItemProps[] = [];

		if (totalListSortedWithoutPreviousList.length > 0) {
			for (let i = totalListSortedWithoutPreviousList.length - 1; i >= 0; i--) {
				if (previousChannels.includes(totalListSortedWithoutPreviousList[i]?.channelId || totalListSortedWithoutPreviousList[i]?.id || '')) {
					previous.unshift(totalListSortedWithoutPreviousList[i]);
					totalListSortedWithoutPreviousList.splice(i, 1);
				}
			}
		}

		if (listDirectSearch.length > 0) {
			for (let i = listDirectSearch.length - 1; i >= 0; i--) {
				const itemDMId = listDirectSearch[i]?.idDM || '';
				const existsInPrevious = previous.some((item) => item?.id === listDirectSearch[i]?.idDM);
				if (previousChannels.includes(itemDMId) && !existsInPrevious) {
					previous.unshift(listDirectSearch[i]);
					listDirectSearch.splice(i, 1);
				}
			}
		}

		return previous;
	}, [listDirectSearch, previousChannels, totalListSortedWithoutPreviousList]);

	const listItemWithoutRecent = useMemo(() => {
		if (normalizeSearchText.startsWith('@')) {
			return totalListMembersSorted.slice(0, 50);
		}
		if (normalizeSearchText.startsWith('#')) {
			return channelSearchSorted.slice(0, 50);
		}

		if (normalizeSearchText) {
			return totalListsSorted.slice(0, 50);
		}
		return totalListSortedWithoutPreviousList.slice(0, 50);
	}, [channelSearchSorted, normalizeSearchText, totalListMembersSorted, totalListSortedWithoutPreviousList, totalListsSorted]);

	const listItemDisplay = useMemo(() => {
		return normalizeSearchText.length ? listItemWithoutRecent : [...listRecent, ...listItemWithoutRecent];
	}, [normalizeSearchText, listItemWithoutRecent, listRecent]);

	const isNoResult = useMemo(() => {
		return !listItemDisplay?.length;
	}, [listItemDisplay]);

	const handleSelectMem = useCallback(
		async (user: any) => {
			const foundDirect = listDirectSearch.find((item) => item.id === user.id);
			if (foundDirect !== undefined) {
				dispatch(channelsActions.setPreviousChannels({ channelId: foundDirect.idDM || '' }));
				dispatch(directActions.openDirectMessage({ channelId: foundDirect.idDM || '', clanId: '0' }));
				const result = await dispatch(
					directActions.joinDirectMessage({
						directMessageId: foundDirect.idDM ?? '',
						channelName: '',
						type: foundDirect?.type ?? ChannelType.CHANNEL_TYPE_DM
					})
				);
				if (result) {
					navigate(toDmGroupPageFromMainApp(foundDirect.idDM ?? '', user?.type ?? ChannelType.CHANNEL_TYPE_DM));
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
		[createDirectMessageWithUser, dispatch, listDirectSearch, navigate, onClose, toDmGroupPageFromMainApp]
	);

	const handleSelectChannel = useCallback(
		async (channel: SearchItemProps) => {
			if (channel.id && channel.type === ChannelType.CHANNEL_TYPE_TEXT) {
				dispatch(categoriesActions.setCtrlKSelectedChannelId(channel.id));
				const channelUrl = toChannelPage(channel.id, channel.clanId ?? '');
				navigate(channelUrl, { state: { focusChannel: { id: channel?.id, parentId: channel?.parrent_id ?? '' } } });
			} else {
				const urlVoice = `https://meet.google.com/${channel.meeting_code}`;
				window.open(urlVoice, '_blank', 'noreferrer');
			}
			onClose();
		},
		[dispatch, navigate, onClose, toChannelPage]
	);

	const handleSelect = useCallback(
		async (isChannel: boolean, item: SearchItemProps) => {
			if (isChannel) {
				await handleSelectChannel(item);
			} else {
				await handleSelectMem(item);
			}
		},
		[handleSelectMem, handleSelectChannel]
	);

	const handleInputKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter') {
			e.preventDefault();
			e.stopPropagation();
			travelItemByKeyBoard(e);
		}
	};

	const handleEnter = useCallback(
		(selectedItem: SearchItemProps) => {
			if (!selectedItem) return;

			if (selectedItem.subText) {
				handleSelectChannel(selectedItem);
				dispatch(messagesActions.setIsFocused(true));
			} else {
				handleSelectMem(selectedItem);
			}
		},
		[dispatch, handleSelectChannel, handleSelectMem]
	);

	const scrollToTop = useCallback(() => {
		boxRef.current?.scroll({ top: 0, behavior: 'smooth' });
	}, []);

	const scrollToItem = useCallback((id: string) => {
		listPreviousRef.current?.scrollIntoItem(id);
		listItemWithoutPreviousRef.current?.scrollIntoItem(id);
	}, []);

	const travelItemByKeyBoard = useCallback(
		(event: React.KeyboardEvent) => {
			event.preventDefault();
			console.log('keydown event');
			const index = listItemDisplay.findIndex((item) => item.id === idActive);
			if (index === -1) {
				scrollToTop();
				setIdActive(listItemDisplay[0]?.id ?? '');
				return;
			}
			const lastIndex = listItemDisplay.length - 1;
			let newIndex;
			switch (event.key) {
				case 'ArrowDown': {
					newIndex = index >= lastIndex ? 0 : index + 1;
					break;
				}
				case 'ArrowUp': {
					newIndex = index <= 0 ? lastIndex : index - 1;
					break;
				}
				case 'Enter': {
					handleEnter(listItemDisplay[index]);
					return;
				}
			}
			const focusItemId = listItemDisplay[newIndex ?? 0]?.id ?? '';
			if (newIndex === 0) {
				scrollToTop();
			} else {
				scrollToItem(focusItemId);
			}
			setIdActive(focusItemId);
		},
		[listItemDisplay, idActive, handleEnter, scrollToTop, scrollToItem]
	);

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
						onChange={(e) => {
							setSearchText(e.target.value);
							setIdActive('');
							boxRef.current?.scroll({ top: 0, behavior: 'smooth' });
						}}
						onKeyUp={(e) => handleInputKeyUp(e)}
					/>
				</div>
				<div
					ref={boxRef}
					onKeyUp={travelItemByKeyBoard}
					className={`w-full max-h-[250px] overflow-x-hidden overflow-y-auto flex flex-col gap-[3px] pr-[5px]  ${appearanceTheme === 'light' ? 'customScrollLightMode' : ''}`}
				>
					{!normalizeSearchText && listRecent.length > 0 && (
						<>
							<div className="text-xs dark:text-white text-textLightTheme font-semibold uppercase py-2 ">Previous channels</div>
							<ListSearchModal
								ref={listPreviousRef}
								listSearch={listRecent}
								handleSelect={handleSelect}
								searchText={normalizeSearchText}
								idActive={idActive}
								setIdActive={setIdActive}
							/>
						</>
					)}
					{!normalizeSearchText && (
						<div className="text-xs dark:text-white text-textLightTheme font-semibold uppercase py-2">Unread channels</div>
					)}
					<ListSearchModal
						ref={listItemWithoutPreviousRef}
						listSearch={listItemWithoutRecent}
						handleSelect={handleSelect}
						searchText={normalizeSearchText.startsWith('#') ? normalizeSearchText.slice(1) : normalizeSearchText}
						idActive={idActive}
						setIdActive={setIdActive}
						isSearchByUsername={isSearchByUsername}
					/>
					{isNoResult && (
						<span className=" flex flex-row justify-center dark:text-white text-colorTextLightMode">
							Can't seem to find what you're looking for?
						</span>
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
