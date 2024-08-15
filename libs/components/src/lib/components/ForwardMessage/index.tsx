import { useAuth, useChannels, useSendForwardMessage } from '@mezon/core';
import {
	DirectEntity,
	RootState,
	channelsActions,
	selectAllChannelMembers,
	selectAllDirectMessages,
	selectAllUsesClan,
	selectTheme,
	useAppDispatch,
	getIsFowardAll,
	selectCurrentChannelId, selectMessageByChannelId, MessagesEntity,
} from '@mezon/store';
import {
	ChannelThreads,
	TypeSearch,
	UsersClanEntity,
	addAttributesSearchList,
	getAvatarForPrioritize,
	normalizeString,
	removeDuplicatesById,
	IMessageWithUser
} from '@mezon/utils';
import { Button, Label, Modal } from 'flowbite-react';
import { getSelectedMessage, toggleIsShowPopupForwardFalse } from 'libs/store/src/lib/forwardMessage/forwardMessage.slice';
import { ChannelStreamMode, ChannelType } from 'mezon-js';
import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import MessageContent from '../MessageWithUser/MessageContent';
import ListSearchForwardMessage from './ListSearchForwardMessage';
type ModalParam = {
	openModal: boolean;
};
type OpjectSend = {
	id: string;
	type: number;
	clanId?: string;
	channel_label?: string;
};
const ForwardMessageModal = ({ openModal }: ModalParam) => {
	const appearanceTheme = useSelector(selectTheme);
	const dispatch = useAppDispatch();
	const dmGroupChatList = useSelector(selectAllDirectMessages);
	const { listChannels } = useChannels();
	const isLoading = useSelector((state: RootState) => state.channels.loadingStatus);
	const listGroup = dmGroupChatList.filter((groupChat) => groupChat.type === 2);
	const listDM = dmGroupChatList.filter((groupChat) => groupChat.type === 3);
	const { sendForwardMessage } = useSendForwardMessage();
	const { userProfile } = useAuth();
	const selectedMessage = useSelector(getSelectedMessage);
	const accountId = userProfile?.user?.id ?? '';
	const currentChannelId = useSelector(selectCurrentChannelId)
	const membersInClan = useSelector(selectAllChannelMembers);
	const isForwardAll = useSelector(getIsFowardAll);
	const allMessages = useSelector(selectMessageByChannelId(currentChannelId));
	const allMessagesBySenderId = Object.values(allMessages[1]).filter((message: any) => {
		return message.sender_id === selectedMessage?.user?.id
	}) as MessagesEntity[];
	const startIndex = useMemo(() => {
		return allMessagesBySenderId.findIndex(message => message.id === selectedMessage.id)
	}, [allMessages, selectedMessage]);
	
	const [selectedObjectIdSends, setSelectedObjectIdSends] = useState<OpjectSend[]>([]);
	const [searchText, setSearchText] = useState('');

	useEffect(() => {
		if (isLoading === 'loaded') {
			dispatch(channelsActions.openCreateNewModalChannel(false));
		}
	}, [dispatch, isLoading]);

	const handleCloseModal = () => {
		dispatch(toggleIsShowPopupForwardFalse());
	};
	const handleToggle = (id: string, type: number, clanId?: string, channel_label?: string) => {
		const existingIndex = selectedObjectIdSends.findIndex((item) => item.id === id && item.type === type);
		if (existingIndex !== -1) {
			setSelectedObjectIdSends((prevItems) => [...prevItems.slice(0, existingIndex), ...prevItems.slice(existingIndex + 1)]);
		} else {
			setSelectedObjectIdSends((prevItems) => [...prevItems, { id, type, clanId, channel_label }]);
		}
	};
	
	const handleForward = () => {
		return isForwardAll ? handleForwardAllMessage() : sentToMessage();
	};
	
	const handleForwardAllMessage = async () => {
		const combineMessages: MessagesEntity[] = [];
		combineMessages.push(selectedMessage);
		
		let index = startIndex + 1;
		while (index < allMessagesBySenderId.length && !allMessagesBySenderId[index].isStartedMessageGroup && allMessagesBySenderId[index].sender_id === selectedMessage?.user?.id) {
			combineMessages.push(allMessagesBySenderId[index]);
			index++
		}
		
		for (const selectedObjectIdSend of selectedObjectIdSends) {
			if (selectedObjectIdSend.type === ChannelType.CHANNEL_TYPE_DM) {
				combineMessages.forEach(message => {
					sendForwardMessage('', selectedObjectIdSend.id, ChannelStreamMode.STREAM_MODE_DM, message);
				})
			} else if (selectedObjectIdSend.type === ChannelType.CHANNEL_TYPE_GROUP) {
				combineMessages.forEach(message => {
					sendForwardMessage('', selectedObjectIdSend.id, ChannelStreamMode.STREAM_MODE_DM, message);
				})
			} else if (selectedObjectIdSend.type === ChannelType.CHANNEL_TYPE_TEXT) {
				combineMessages.forEach(message => {
					sendForwardMessage(selectedObjectIdSend.clanId || '', selectedObjectIdSend.id, ChannelStreamMode.STREAM_MODE_CHANNEL, message);
				})
			}
		}
		dispatch(toggleIsShowPopupForwardFalse());
	}

	const sentToMessage = async () => {
		for (const selectedObjectIdSend of selectedObjectIdSends) {
			if (selectedObjectIdSend.type === ChannelType.CHANNEL_TYPE_DM) {
				sendForwardMessage('', selectedObjectIdSend.id, ChannelStreamMode.STREAM_MODE_DM, selectedMessage);
			} else if (selectedObjectIdSend.type === ChannelType.CHANNEL_TYPE_GROUP) {
				sendForwardMessage('', selectedObjectIdSend.id, ChannelStreamMode.STREAM_MODE_GROUP, selectedMessage);
			} else if (selectedObjectIdSend.type === ChannelType.CHANNEL_TYPE_TEXT) {
				sendForwardMessage(
					selectedObjectIdSend.clanId || '',
					selectedObjectIdSend.id,
					ChannelStreamMode.STREAM_MODE_CHANNEL,
					selectedMessage,
				);
			}
		}
		dispatch(toggleIsShowPopupForwardFalse());
	};

	const usersClan = useSelector(selectAllUsesClan);
	const listMemSearch = useMemo(() => {
		const listDMSearch = listDM.length
			? listDM.map((itemDM: DirectEntity) => {
					return {
						id: itemDM?.user_id?.[0] ?? '',
						name: itemDM?.usernames ?? '',
						avatarUser: itemDM?.channel_avatar?.[0] ?? '',
						idDM: itemDM?.id ?? '',
						typeChat: ChannelType.CHANNEL_TYPE_DM,
						userName: itemDM?.usernames,
						displayName: itemDM.channel_label,
						lastSentTimeStamp: itemDM.last_sent_message?.timestamp,
						typeSearch: TypeSearch.Dm_Type,
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
						typeChat: ChannelType.CHANNEL_TYPE_GROUP,
						userName: itemGr?.usernames,
						displayName: itemGr.channel_label,
						lastSentTimeStamp: itemGr.last_sent_message?.timestamp,
						typeSearch: TypeSearch.Dm_Type,
					};
				})
			: [];
		
		const listUserClanSearch = usersClan.length
			? usersClan.map((itemUserClan: UsersClanEntity) => {
					return {
						id: itemUserClan?.id ?? '',
						name: itemUserClan?.user?.username ?? '',
						avatarUser: getAvatarForPrioritize(itemUserClan.clan_avatar, itemUserClan?.user?.avatar_url),
						displayName: itemUserClan?.user?.display_name ?? '',
						clanNick: itemUserClan?.clan_nick ?? '',
						lastSentTimeStamp: '0',
						idDM: '',
						type: TypeSearch.Dm_Type,
					};
				})
			: [];

		const usersClanMap = new Map(listUserClanSearch.map((user) => [user.id, user]));
		const listSearch = [
			...listDMSearch.map((itemDM) => {
				const user = usersClanMap.get(itemDM.id);
				return user ? { ...itemDM, clanNick: user.clanNick || '', displayName: user.displayName || itemDM.displayName, avatarUser: user.avatarUser || '' } : itemDM;
			}),
			...listGroupSearch
		];
		return removeDuplicatesById(listSearch.filter((item) => item.id !== accountId));
	}, [accountId, listDM, listGroup, membersInClan, usersClan]);

	const listChannelSearch = useMemo(() => {
		const listChannelForward = listChannels.filter((channel) => channel.type !== ChannelType.CHANNEL_TYPE_VOICE);
		const list = listChannelForward.map((item: ChannelThreads) => {
			return {
				id: item?.id ?? '',
				name: item?.channel_label ?? '',
				subText: item?.category_name ?? '',
				icon: '#',
				type: item?.type ?? '',
				clanId: item?.clan_id ?? '',
				channel_label: item?.channel_label ?? '',
				lastSentTimeStamp: item.last_sent_message?.timestamp,
				typeSearch: TypeSearch.Channel_Type,
				prioritizeName: item?.channel_label ?? '',
			};
		});
		return list;
	}, [listChannels]);

	const addPropsIntoListMember = useMemo(() => addAttributesSearchList(listMemSearch, membersInClan), [listMemSearch, membersInClan]);
	const totalsSearch = [...addPropsIntoListMember, ...listChannelSearch];

	const normalizedSearchText = normalizeString(searchText);

	const isNoResult = useMemo(() => {
		const memberResults = addPropsIntoListMember.some(
			(item) =>
				(item.prioritizeName && item.prioritizeName.toUpperCase().includes(normalizedSearchText)) ||
				(item.name && item.name.toUpperCase().includes(normalizedSearchText)),
		);
		const channelResults = listChannelSearch.some(
			(item) => item.prioritizeName && item.prioritizeName.toUpperCase().includes(normalizedSearchText),
		);
		return !memberResults && !channelResults;
	}, [addPropsIntoListMember, listChannelSearch, normalizedSearchText]);

	const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
			e.preventDefault();
		}
	};

	return (
		<Modal className="bg-bgModalDark" theme={{ content: { base: 'w-[550px]' } }} show={openModal} dismissible={true} onClose={handleCloseModal}>
			<div className="dark:bg-bgSecondary bg-bgLightMode pt-4 rounded">
				<div>
					<h1 className="dark:text-white text-textLightTheme text-xl font-semibold text-center">Forward Message</h1>
				</div>
				<div className="px-4 pt-4">
					<input
						type="text"
						className="dark:text-[#B5BAC1] text-textLightTheme outline-none w-full h-10 p-[10px] dark:bg-bgTertiary bg-bgModifierHoverLight text-base rounded placeholder:text-sm"
						placeholder="Search"
						onChange={(e) => setSearchText(e.target.value)}
						onKeyDown={(e) => handleInputKeyDown(e)}
					/>
					<div className={`mt-4 mb-2 overflow-y-auto h-[300px] ${appearanceTheme === 'light' ? 'customScrollLightMode' : 'thread-scroll'}`}>
						{!normalizedSearchText.startsWith('@') && !normalizedSearchText.startsWith('#') ? (
							<>
								<ListSearchForwardMessage
									listSearch={totalsSearch}
									searchText={normalizedSearchText}
									selectedObjectIdSends={selectedObjectIdSends}
									handleToggle={handleToggle}
								/>
								{isNoResult && (
									<span className=" flex flex-row justify-center dark:text-white text-colorTextLightMode">
										Can't seem to find what you're looking for?
									</span>
								)}
							</>
						) : (
							<>
								{normalizedSearchText.startsWith('@') && (
									<>
										<span className="text-textPrimary text-left opacity-60 text-[11px] pb-1 uppercase">
											Search friend and users
										</span>
										<ListSearchForwardMessage
											listSearch={listMemSearch}
											searchText={searchText.slice(1)}
											selectedObjectIdSends={selectedObjectIdSends}
											handleToggle={handleToggle}
										/>
									</>
								)}
								{normalizedSearchText.startsWith('#') && (
									<>
										<span className="text-left opacity-60 text-[11px] pb-1 uppercase">Searching channel</span>
										<ListSearchForwardMessage
											listSearch={listChannelSearch}
											searchText={normalizedSearchText.slice(1)}
											selectedObjectIdSends={selectedObjectIdSends}
											handleToggle={handleToggle}
										/>
									</>
								)}
							</>
						)}
					</div>
				</div>
				<div className="px-4">
					<div className="mb-2 block">
						<Label htmlFor="clearAfter" value="Shared content" className="dark:text-[#B5BAC1] text-xs uppercase font-semibold" />
					</div>
					<div
						className={`h-20 overflow-y-auto dark:bg-bgProfileBody bg-bgLightModeThird p-[5px] rounded ${appearanceTheme === 'light' ? 'customScrollLightMode' : 'thread-scroll'}`}
					>
						<MessageContent message={selectedMessage} />
					</div>
					<FooterButtonsModal onClose={handleCloseModal} sentToMessage={handleForward} />
				</div>
			</div>
		</Modal>
	);
};
export default ForwardMessageModal;

type FooterButtonsModalProps = {
	onClose: () => void;
	sentToMessage: () => Promise<void>;
};

const FooterButtonsModal = (props: FooterButtonsModalProps) => {
	const { onClose, sentToMessage } = props;
	return (
		<div className="flex justify-end p-4 rounded-b gap-4">
			<Button
				className="h-10 px-4 rounded dark:bg-slate-500 bg-slate-500 hover:!underline focus:ring-transparent"
				type="button"
				onClick={onClose}
			>
				Cancel
			</Button>
			<Button
				onClick={sentToMessage}
				className="h-10 px-4 rounded dark:bg-bgSelectItem bg-bgSelectItem hover:!bg-bgSelectItemHover focus:ring-transparent"
			>
				Send
			</Button>
		</div>
	);
};
