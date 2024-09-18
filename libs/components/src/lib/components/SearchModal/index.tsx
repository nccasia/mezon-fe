import { useAppNavigation, useAuth, useDirect } from '@mezon/core';
import {
	DirectEntity,
	directActions,
	messagesActions,
	selectAllChannelsByUser,
	selectAllDirectMessages,
	selectAllUsesInAllClansEntities,
	selectEntitesUserClans,
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
	const allClanUsersEntities = useSelector(selectEntitesUserClans);
	const dmGroupChatList = useSelector(selectAllDirectMessages);
	const listChannels = useSelector(selectAllChannelsByUser);
	const allUsesInAllClansEntities = useSelector(selectAllUsesInAllClansEntities);
	const listGroup = dmGroupChatList.filter((groupChat) => groupChat.type === ChannelType.CHANNEL_TYPE_GROUP && groupChat.active === 1);
	const listDM = dmGroupChatList.filter(
		(groupChat) => groupChat.type === ChannelType.CHANNEL_TYPE_DM && groupChat.channel_avatar && groupChat.active === 1
	);

	const channel = [
		{
			clan_id: '1782623378570481664',
			channel_id: '1782623378604036096',
			type: 1,
			channel_label: 'general',
			channel_private: 0,
			meeting_code: '',
			clan_name: '123123',
			parrent_id: '0',
			id: '1782623378604036096',
			status: 0
		}
	];

	const gr = [
		{
			clan_id: '0',
			parrent_id: '0',
			channel_id: '1816730137756962816',
			category_id: '0',
			type: 2,
			creator_id: '1775731911755304960',
			channel_label: 'hahhaha',
			channel_private: 1,
			channel_avatar: [
				'https://cdn.mezon.vn/0/0/1775731911755305000/21download.jfifJPEG',
				'https://cdn.mezon.vn/1783358414991134720/0/1775732201627848700/916273854_Van_hoa_Cham_02_21_11_09.WEBP',
				'https://cdn.mezon.vn/1775732550744936448/1813895345772433408/1788103935005823000/32Comment_Why_8_hours_of_sleep_is_important_for_uoft_students_Sin_Hang_Sophia_Leung_WEB.JPEG',
				'https://lh3.googleusercontent.com/a/ACg8ocLw3GJyJ7auq2qQea_XBFn3bULlFqc5VoHVipB0jDEYOwPDBA=s96-c',
				'https://cdn.mezon.vn/1775731152322039808/1820659489792069632/mezon_logo.png',
				'https://cdn.mezon.vn/1775732550744936448/0/1827918839833170000/194_undefinedScreenshot_2023_04_06_132903.WEBP',
				'https://lh3.googleusercontent.com/a/ACg8ocJKv5mNvV7aiu3HNyuaG5KQ94xYib1l55f4jvUgXsy6FwU1fiFl=s96-c',
				'https://cdn.mezon.vn/1816398792639909888/0/1808345368379789300/23createOrder.JPEG'
			],
			user_id: [
				'1775731911755304960',
				'1775732201627848704',
				'1788103935005822976',
				'1813067151733428224',
				'1775731111020728320',
				'1827918839833169920',
				'1831588699511459840',
				'1808345368379789312'
			],
			last_sent_message: {
				id: '1834075854313885696',
				timestamp_seconds: 1726112733,
				sender_id: '1775732201627848704',
				content: '{"t":"123123"}',
				attachment: '[]',
				referece: '[]',
				mention: '[]'
			},
			last_seen_message: {
				id: '1834075854313885696',
				timestamp_seconds: 1726299201
			},
			is_online: [false, false, false, false, false, false, false, false],
			active: 1,
			usernames: 'thuy.nguyenthithu1,an.buihoang,nga.nguyenthi,thanh.tranhuy,thai.phamquoc,thanh.levan,buihoanghiepkk0609,thang.tranhuy,',
			creator_name: 'dis',
			create_time_seconds: 1721977192,
			update_time_seconds: 1723635585,
			metadata: [
				'{"status": "vssss"}',
				'{"status": "Hi"}',
				"{\"status\": \"What's cookin', Nga DisplayName?What's cookin', Nga DisplayName?What's cookin', Nga DisplayName?What's cookin'ame\"}",
				'{"status": "hello world!!!"}',
				'{"status": "hello world!!!!123456"}',
				'{"status": "hehehehe"}',
				'{}',
				'{"status": "hello world!!!"}'
			],
			about_me: [
				'',
				'123',
				'gggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg',
				'',
				'sfasdfafadfadfdfs123eeq',
				'ttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttt',
				'',
				''
			],
			id: '1816730137756962816'
		}
	];

	const dm = [
		{
			clan_id: '0',
			parrent_id: '0',
			channel_id: '1816395726142312448',
			category_id: '0',
			type: 3,
			creator_id: '1813062275754364928',
			channel_label: 'when adding members and roles',
			channel_private: 1,
			channel_avatar: ['https://lh3.googleusercontent.com/a/ACg8ocLJZ6if8GTXnk8nTWKM4uBLzqTi2yREu65fCszAtuZ44WfOPIx2=s96-c'],
			user_id: ['1813062275754364928'],
			last_sent_message: {
				id: '1820019021488066560',
				sender_id: '1775730015049093120',
				content:
					'{"t":"@phong.nguyennam <#1805078997189529600>","links":[],"emojis":[],"hashtags":[{"endIndex":39,"channelId":"1805078997189529600","startIndex":17,"channelLable":"#anbui"}],"mentions":[{"userId":"1775730015049093120","endIndex":16,"username":"@phong.nguyennam","startIndex":0}],"markdowns":[],"plainText":"@phong.nguyennam #anbui "}',
				attachment: '[]',
				referece: '[]',
				mention: '[{"user_id":"1775730015049093120","username":"@phong.nguyennam"}]',
				reaction: '[]'
			},
			last_seen_message: {
				id: '1820019021488066560'
			},
			is_online: [false],
			active: 1,
			usernames: 'huyetlinh1901,',
			creator_name: 'when adding members and roles',
			create_time_seconds: 1721897462,
			update_time_seconds: 1721897462,
			metadata: ['{"status": ""}'],
			about_me: [''],
			id: '1816395726142312448'
		}
	];
	console.log('listChannels', listChannels);
	console.log('dmGroupChatList :', dmGroupChatList);
	console.log('listDM :', listDM);

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
				idDM: '',
				typeChat: TypeSearch.Dm_Type,
				type: ChannelType.CHANNEL_TYPE_DM
			});
		}
		return list as SearchItemProps[];
	}, [allUsesInAllClansEntities]);

	const handleSelectMem = useCallback(
		async (user: any) => {
			if (user?.idDM) {
				dispatch(directActions.openDirectMessage({ channelId: user.idDM || '', clanId: '0' }));
				const result = await dispatch(
					directActions.joinDirectMessage({
						directMessageId: user.idDM,
						channelName: '',
						type: user?.type ?? ChannelType.CHANNEL_TYPE_DM
					})
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
		[createDirectMessageWithUser, navigate, onClose, toDmGroupPageFromMainApp]
	);

	const handleSelectChannel = useCallback(
		async (channel: any) => {
			if (channel.type === ChannelType.CHANNEL_TYPE_TEXT) {
				const channelUrl = toChannelPage(channel.id, channel.clanId);
				navigate(channelUrl, { state: { focusChannel: { id: channel?.id, parentId: channel?.parrent_id } } });
			} else {
				const urlVoice = `https://meet.google.com/${channel.meeting_code}`;
				window.open(urlVoice, '_blank', 'noreferrer');
			}
			onClose();
		},
		[navigate, onClose, toChannelPage]
	);

	const handleSelect = useCallback(
		async (isChannel: boolean, item: any) => {
			if (isChannel) {
				await handleSelectChannel(item);
			} else {
				await handleSelectMem(item);
			}
		},
		[handleSelectMem, handleSelectChannel]
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
		const list = listMemberSearch.concat(listChannelSearch);
		listDirectSearch.forEach((dm) => {
			if (dm.type === ChannelType.CHANNEL_TYPE_DM && !allUsesInAllClansEntities[dm?.id || '0']) {
				list.push(dm);
			}
		});
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
	const getListToUse = (normalizeSearchText: string, channelSearchSorted: SearchItemProps[], totalListsSorted: SearchItemProps[]) => {
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
			behavior: 'smooth'
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
			behavior: 'smooth'
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
										listSearch={totalListMembersSorted.slice(0, 50)}
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
